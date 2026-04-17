import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Razorpay from 'razorpay';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Payment, PaymentStatus } from './payment.entity';
import { CartService } from "../cart/cart.service"
import * as crypto from 'crypto';
import { Address } from 'src/address/address.entity';
import { Product } from 'src/product/product.entity';
import { Vendor } from 'src/vendor/vendor.entity';
import { Coupon } from 'src/coupon/coupon.entity';
import { PaymentLogService } from 'src/payment-log/payment-log.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { User } from 'src/users/users.entity';

@Injectable()
export class PaymentService {
    private razorpay: Razorpay;

    constructor(
        @InjectQueue('mail-queue')
        private mailQueue: Queue,
        @InjectRepository(Payment)
        private paymentRepo: Repository<Payment>,
        @InjectRepository(Order)
        private orderRepo: Repository<Order>,
        @InjectRepository(Address)
        private addressRepo: Repository<Address>,
        @InjectRepository(Product)
        private productRepo: Repository<Product>,
        @InjectRepository(Vendor)
        private vendorRepo: Repository<Vendor>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Coupon)
        private couponRepo: Repository<Coupon>,
        private cartService: CartService,
        private paymentLogService: PaymentLogService
    ) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_TEST_APIKEY || "",
            key_secret: process.env.RAZORPAY_TEST_APISECRET || "",
        });
    }

    async createOrder(userId: string, amount: number, cartItems: any, couponCode: string) {
        // Check for existing pending master order for this user (payment retry)

        const address = await this.addressRepo.findOne({ where: { user: { id: userId }, isDefault: true } });

        if(!address){
            return {message: "Address is required", success: false}
        }


        const existingPendingOrder = await this.orderRepo.findOne({
            where: { user: { id: userId }, status: 'pending', parentOrder: null as any },
            relations: ['payments'],
        });

        if (existingPendingOrder) {
            // Delete old sub-orders and payments, recreate fresh
            const oldSubOrders = await this.orderRepo.find({ where: { parentOrder: { id: existingPendingOrder.id } } });
            for (const sub of oldSubOrders) {
                await this.orderRepo.remove(sub);
            }
            for (const payment of existingPendingOrder.payments) {
                await this.paymentRepo.remove(payment);
            }
            await this.orderRepo.remove(existingPendingOrder);
        }
        // Create a new Razorpay order
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const rzpOrder = await this.razorpay.orders.create(options);
        // Group cart items by vendor
        const vendorGroups = new Map();
        for (const item of cartItems) {
            let vendorId;
            if (!item.product.vendor) {
                const dbProduct = await this.productRepo.findOne({
                    where: { id: item.product.id },
                    relations: ['vendor']
                });
                vendorId = dbProduct?.vendor?.id;
            } else {
                vendorId = item.product.vendor.id;
            }
            if (!vendorGroups.has(vendorId)) {
                vendorGroups.set(vendorId, []);
            }
            vendorGroups.get(vendorId).push(item);
        }

        // Fetch coupon info
        let coupon: Coupon | null = null;
        let totalDiscount = 0;
        if (couponCode) {
            coupon = await this.couponRepo.findOne({ where: { code: couponCode.toUpperCase() }, relations: ['vendor'] });
        }

        // Calculate total before discount (sum of all items)
        const totalBeforeDiscount = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
        totalDiscount = totalBeforeDiscount - amount; // difference is the discount applied

        // Create master order
        const masterOrderData: Partial<Order> = {
            user: { id: userId } as any,
            items: cartItems,
            totalAmount: amount,
            status: 'pending',
            couponCode: coupon?.code || undefined,
            discount: totalDiscount,
            couponType: coupon?.creatorType || undefined,
        };
        const masterOrder = await this.orderRepo.save(this.orderRepo.create(masterOrderData));
        // Get delivery address
        
        // Create sub-orders per vendor with proportional coupon splitting
        for (const [vendorId, items] of vendorGroups) {
            const subTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

            // Calculate proportional discount for this vendor's sub-order
            let subDiscount = 0;
            let subCouponCode: string | null = null;
            let subCouponType: 'platform' | 'vendor' | null = null;

            if (coupon && totalDiscount > 0) {
                const proportion = subTotal / totalBeforeDiscount;
                subDiscount = Math.round(totalDiscount * proportion * 100) / 100;
                subCouponCode = coupon.code;
                subCouponType = coupon.creatorType;
            }

            const subOrderEntity = this.orderRepo.create({
                parentOrder: masterOrder,
                vendor: { id: vendorId } as any,
                user: { id: userId } as any,
                items,
                totalAmount: subTotal - subDiscount,
                status: 'pending',
                deliveryAddress: address || null,
                couponCode: subCouponCode,
                discount: subDiscount,
                couponType: subCouponType,
            } as any);
            await this.orderRepo.save(subOrderEntity);
        }
        // Create payment record
        const paymentData: Partial<Payment> = {
            razorpayOrderId: rzpOrder.id,
            status: PaymentStatus.PENDING,
            order: masterOrder as Order,
            amount
        };
        const newPayment = this.paymentRepo.create(paymentData);
        const saevdPayment = await this.paymentRepo.save(newPayment);



        await this.paymentLogService.createLog(saevdPayment.id, PaymentStatus.PENDING)
        return rzpOrder;
    }

    async verifyPayment(payload) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload
        const isVerified = this.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        if (!isVerified) {
            return { success: false, message: "Payment not verified" }
        }

        return { message: "Payment verified successfully", success: true }
    }

    async updatePaymentToDB(payload: any, signature: string) {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(payload));
        const expectedSignature = shasum.digest('hex');

        if (expectedSignature !== signature) {
            throw new BadRequestException('Invalid webhook signature');
        }

        if (payload.event === 'payment.captured') {
            const rzpOrder = payload.payload.payment.entity;
            const rzpOrderId = rzpOrder.order_id;
            const rzpPaymentId = rzpOrder.id;

            const payment = await this.paymentRepo.findOne({ where: { razorpayOrderId: rzpOrderId }, relations: ['order', 'order.user'] })
            if (payment && payment.status !== PaymentStatus.COMPLETED) {
                payment.status = PaymentStatus.COMPLETED
                payment.razorpayPaymentId = rzpPaymentId
                await this.paymentRepo.save(payment)

                // creating a new Payment log for the payment
                await this.paymentLogService.createLog(payment.id, PaymentStatus.COMPLETED)

                // Updating the order status
                await this.orderRepo.update(payment.order.id, { status: "paid" })

                const subOrders = await this.orderRepo.find({ where: { parentOrder: { id: payment.order.id } }, relations: ['vendor'] })

                for (const subOrder of subOrders) {
                    const vendor = subOrder.vendor
                    const commissionRate = subOrder.vendor.commisionRate || 0.10
                    const subTotal = Number(subOrder.totalAmount) + Number(subOrder.discount || 0) // original subtotal before discount

                    // Calculate vendor earning based on coupon ownership
                    let vendorEarning = 0;
                    let platformFee = subTotal * commissionRate;
                    let adminEarning = platformFee

                    if (subOrder.couponType === 'vendor') {
                        // Vendor-created coupon: vendor bears the discount
                        vendorEarning = subTotal - platformFee - Number(subOrder.discount || 0);

                    } else if (subOrder.couponType === 'platform') {
                        // Platform coupon: platform (admin) bears the discount, vendor gets full share minus commission
                        vendorEarning = subTotal - platformFee;
                        adminEarning = platformFee - subOrder.discount
                    } else {
                        vendorEarning = subTotal - platformFee;
                    }

                    vendorEarning = Math.max(0, vendorEarning);

                    await this.vendorRepo.update(vendor.id, { balance: () => `balance + ${vendorEarning}` })
                    await this.userRepo.update({email: 'admin@gmail.com'}, { balance: () => `balance + ${adminEarning}` })

                    await this.orderRepo.update(subOrder.id, { status: 'completed' })
                    await this.mailQueue.add('vendor-mail', { vendorMail: vendor?.email })
                }
                const masterOrder = await this.orderRepo.findOne({ where: { id: payment.order.id }, relations: ['user'] });
                await this.mailQueue.add('admin-mail', { adminMail: "admin@gmail.com", user: { email: masterOrder?.user.email, name: masterOrder?.user.name, id: masterOrder?.user.id } })
                await this.mailQueue.add('user-mail', { user: { email: masterOrder?.user.email }, orderDetails: masterOrder })

                // Increment coupon usage count
                if (payment.order.couponCode) {
                    const coupon = await this.couponRepo.findOne({ where: { code: payment.order.couponCode } });
                    if (coupon) {
                        coupon.usageCount += 1;
                        await this.couponRepo.save(coupon);
                    }
                }

                await this.cartService.clearCart(payment.order.user.id);


            }
        }
    }

    verifySignature(orderId: string, paymentId: string, signature: string): boolean {
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_TEST_APISECRET || '')
            .update(orderId + '|' + paymentId)
            .digest('hex');
        if (generatedSignature !== signature) {
            throw new BadRequestException('Invalid payment signature');
        }

        return true
    }

    async getAllPayments() {
        try {
            const payments = await this.paymentRepo.find({ relations: ['order'], order: { createdAt: 'DESC' } })
            return { payments, success: true }
        } catch (error) {
            console.log("Error while fetching payments data from DB", error)
            return { message: "Internal server error", success: false }
        }
    }

    async getAllOrders() {
        try {
            const orders = await this.orderRepo.find({ where: { status: 'paid' }, order: { createdAt: 'DESC' }, relations: ['payments'] })
            return { orders, success: true }
        } catch (error) {
            console.log("Error while fetching orders data from DB", error)
            return { message: "Internal server error", success: false }
        }
    }
}

import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Razorpay from 'razorpay';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Payment, PaymentStatus } from './payment.entity';
import { CartService } from "../cart/cart.service"
import * as crypto from 'crypto';
import { Address } from 'src/address/address.entity';
import items from 'razorpay/dist/types/items';
import { Product } from 'src/product/product.entity';
import { Vendor } from 'src/vendor/vendor.entity';

@Injectable()
export class PaymentService {
    private razorpay: Razorpay;

    constructor(
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
        private cartService: CartService
    ) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_TEST_APIKEY || "",
            key_secret: process.env.RAZORPAY_TEST_APISECRET || "",
        });
    }

    async createOrder(userID: number, amount: number, cartItems: any) {
        // 1. Create a new Order in Razorpay (always unique)
        const options = {
            amount: Math.round(amount * 100), // Ensure it's an integer
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const rzpOrder = await this.razorpay.orders.create(options);

        const vendorGroups = new Map()

        for (const item of cartItems) {
            let vendorId;
            if (!item.product.vendor) {
                const dbProduct = await this.productRepo.findOne({
                    where: { id: item.product.id },
                    relations: ['vendor']
                });
                vendorId = dbProduct?.vendor.id
            } else {
                vendorId = item.product.vendor.id
            }
            if (!vendorGroups.has(vendorId)) {
                vendorGroups.set(vendorId, [])
            }
            vendorGroups.get(vendorId).push(item)
        }

        const masterOrder = await this.orderRepo.save({ user: { id: userID }, items: cartItems, totalAmount: amount, status: 'pending' })


        for (const [vendorId, items] of vendorGroups) {
            const subTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
            await this.orderRepo.save({
                parentOrder: masterOrder,
                vendor: { id: vendorId },
                user: { id: userID },
                items,
                totalAmount: subTotal,
                status: 'pending',
            });

        }
        const newPayment = this.paymentRepo.create({
            razorpayOrderId: rzpOrder.id,
            status: PaymentStatus.PENDING,
            order: masterOrder,
            amount
        });

        await this.paymentRepo.save(newPayment);

        const address = await this.addressRepo.findOne({ where: { user: { id: userID }, isDefault: true } })

        console.log("Default address", address)

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
        console.log("web hook trigreed")
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
                await this.orderRepo.update(payment.order.id, { status: "paid" })

                const subOrders = await this.orderRepo.find({ where: { parentOrder: { id: payment.order.id } }, relations: ['vendor'] })

                for (const subOrder of subOrders) {
                    const vendor = subOrder.vendor
                    const commissionRate = subOrder.vendor.commisionRate || 0.10
                    const plartformFee = subOrder.totalAmount * commissionRate
                    const vendorEarning = subOrder.totalAmount - plartformFee

                    await this.vendorRepo.update(vendor.id, { balance: () => `balance + ${vendorEarning}` })
                    await this.orderRepo.update(subOrder.id, { status: PaymentStatus.COMPLETED, totalAmount: payment.amount })
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
            const payments = await this.paymentRepo.find()
            return { payments, success: true }
        } catch (error) {
            console.log("Error while fetching payments data from DB", error)
            return { message: "Internal server error", success: false }
        }
    }

    async getAllOrders() {
        try {
            const orders = await this.orderRepo.find()
            return { orders, success: true }
        } catch (error) {
            console.log("Error while fetching orders data from DB", error)
            return { message: "Internal server error", success: false }
        }
    }
}

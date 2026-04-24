import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Razorpay from 'razorpay';
import { In, IsNull, Repository } from 'typeorm';
import { Order } from './order.entity';
import { Payment, PaymentStatus } from './payment.entity';
import { CartService } from '../cart/cart.service';
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
    private paymentLogService: PaymentLogService,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_TEST_APIKEY || '',
      key_secret: process.env.RAZORPAY_TEST_APISECRET || '',
    });
  }

  async createOrder(
    userID: number,
    amount: number,
    cartItems: any,
    couponCode: string,
  ) {
    // Check for existing pending master order for this user (payment retry)

    const address = await this.addressRepo.findOne({
      where: { user: { id: userID }, isDefault: true },
    });

    if (!address) {
      return { message: 'Address is required', success: false };
    }


    const existingPendingOrder = await this.orderRepo.findOne({
      where: {
        user: { id: userID },
        status: In(['payment_failed', 'pending', 'awaiting_payment']),
        parentOrder: {id: IsNull()},
      },
      relations: ['payments'],
    });


    // Create a new Razorpay order
    const options = {
      amount: (amount * 100),
      currency: 'INR',
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
          relations: ['vendor'],
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
      coupon = await this.couponRepo.findOne({
        where: { code: couponCode.toUpperCase() },
        relations: ['vendor', 'product'],
      });
    }

    // Calculate total before discount (sum of all items)
    const totalBeforeDiscount = cartItems.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0,
    );
    totalDiscount = totalBeforeDiscount - amount; // difference is the discount applied

    let masterOrder: Order;
    if (existingPendingOrder) {
      masterOrder = existingPendingOrder;
      console.log("eexsting order id: ", existingPendingOrder.id)
      await this.orderRepo.update(masterOrder.id, {
        status: 'pending',
        items: cartItems,
        totalAmount: amount,
        couponCode: coupon?.code || undefined,
        discount: totalDiscount,
        deliveryAddress: address || null,
      });
      

      // Delete old sub-orders for retry
      await this.orderRepo.delete({ parentOrder: { id: masterOrder.id } });
      
      // Mark old payments as FAILED instead of deleting (to preserve payment logs)
      const oldPayments = await this.paymentRepo.find({
        where: { order: { id: masterOrder.id } },
      });
      
      for (const oldPayment of oldPayments) {
        oldPayment.status = PaymentStatus.FAILED;
        await this.paymentRepo.save(oldPayment);
        
        // Create log for the failed payment
        await this.paymentLogService.createLog(
          oldPayment.id,
          PaymentStatus.FAILED,
        );
      }
    } else {
      console.log('new order')
      const masterOrderData: Partial<Order> = {
        user: { id: userID } as any,
        items: cartItems,
        totalAmount: amount,
        status: 'pending',
        couponCode: coupon?.code || undefined,
        deliveryAddress: address || null,
        discount: totalDiscount,
        couponType: coupon?.creatorType || undefined,
      };
      masterOrder = await this.orderRepo.save(
        this.orderRepo.create(masterOrderData),
      );
      console.log("New order id", masterOrder.id)
    }

    // Create new payment record for the new Razorpay order
    const paymentData: Partial<Payment> = {
      razorpayOrderId: rzpOrder.id,
      status: PaymentStatus.PENDING,
      order: masterOrder as Order,
      amount,
    };
    const newPayment = this.paymentRepo.create(paymentData);
    await this.paymentRepo.save(newPayment);

    await this.paymentLogService.createLog(
      newPayment.id,
      PaymentStatus.PENDING,
    );

    // Create sub-orders per vendor with proportional coupon splitting
    
    // Create sub-orders per vendor with proper coupon splitting
    for (const [vendorId, items] of vendorGroups) {
      const subTotal = items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0,
      );

      // Check if any item in this vendor group has the coupon applied
      let subDiscount = 0;
      let subCouponCode: string | null = null;
      let subCouponType: 'platform' | 'vendor' | null = null;

      if (coupon && totalDiscount > 0) {
        const hasCouponProduct = items.some(
          (itm) => coupon.products.some(product => product.id == itm.product.id),
        );

        if (hasCouponProduct) {
          subDiscount = totalDiscount;
          subCouponCode = coupon.code;
          subCouponType = coupon.creatorType;
        }
      }

      const subOrderEntity = this.orderRepo.create({
        parentOrder: masterOrder,
        vendor: { id: vendorId } as any,
        user: { id: userID } as any,
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

    return rzpOrder;
      
  }

  async verifyPayment(payload) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      payload;
    const isVerified = this.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
    if (!isVerified) {
      return { success: false, message: 'Payment not verified' };
    }

    return { message: 'Payment verified successfully', success: true };
  }

  async updatePaymentToDB(payload: any, signature: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(payload));
    const expectedSignature = shasum.digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (payload.event === 'payment.captured') {
      console.log('Payment captured')
      const rzpOrder = payload.payload.payment.entity;
      const rzpOrderId = rzpOrder.order_id;
      const rzpPaymentId = rzpOrder.id;
      const payment = await this.paymentRepo.findOne({
        where: { razorpayOrderId: rzpOrderId },
        relations: ['order', 'order.user'],
      });


      if (payment) {
        payment.status = PaymentStatus.COMPLETED;
        payment.razorpayPaymentId = rzpPaymentId;
        await this.paymentRepo.save(payment);

        // creating a new Payment log for the payment
        await this.paymentLogService.createLog(
          payment.id,
          PaymentStatus.COMPLETED,
        );
        console.log(payment.order.id)
        await this.orderRepo.update(payment.order.id, { status: 'paid' });

        const subOrders = await this.orderRepo.find({
          where: { parentOrder: { id: payment.order.id } },
          relations: ['vendor'],
        });

        for (const subOrder of subOrders) {
          const vendor = subOrder.vendor;
          const commissionRate = subOrder.vendor.commisionRate || 0.1;
          const subTotal =
            Number(subOrder.totalAmount) + Number(subOrder.discount || 0); // original subtotal before discount

          // Calculate vendor earning based on coupon ownership
          let vendorEarning = 0;
          let platformFee = subTotal * commissionRate;
          let adminEarning = platformFee;

          if (subOrder.couponType === 'vendor') {
            // Vendor-created coupon: vendor bears the discount
            console.log(subTotal, platformFee, subOrder.discount)
            vendorEarning = subTotal - platformFee - Number(subOrder.discount || 0);
          } else if (subOrder.couponType === 'platform') {
            // Platform coupon: platform (admin) bears the discount, vendor gets full share minus commission
            vendorEarning = subTotal - platformFee;
            adminEarning = platformFee - subOrder.discount;
          } else {
            vendorEarning = subTotal - platformFee;
          }

          vendorEarning = Math.max(0, vendorEarning);

          await this.userRepo.update(vendor.id, {
            balance: () => `balance + ${vendorEarning}`,
          });
          await this.userRepo.update(
            { email: 'admin@gmail.com' },
            { balance: () => `balance + ${adminEarning}` },
          );

          await this.orderRepo.update(subOrder.id, { status: 'completed' });
          await this.mailQueue.add('vendor-mail', {
            vendorMail: vendor?.email,
          });
        }
        const masterOrder = await this.orderRepo.findOne({
          where: { id: payment.order.id },
          relations: ['user', 'deliveryAddress'],
        });
        await this.mailQueue.add('admin-mail', {
          adminMail: 'admin@gmail.com',
          user: {
            email: masterOrder?.user.email,
            name: masterOrder?.user.name,
            id: masterOrder?.user.id,
          },
        });
        await this.mailQueue.add('user-mail', {
          user: { email: masterOrder?.user.email, name: masterOrder?.user.name },
          orderDetails: masterOrder,
        });

        // Increment coupon usage count
        if (payment.order.couponCode) {
          const coupon = await this.couponRepo.findOne({
            where: { code: payment.order.couponCode },
          });
          if (coupon) {
            coupon.usageCount += 1;
            await this.couponRepo.save(coupon);
          }
        }

        await this.cartService.clearCart(payment.order.user.id);
      }
    } else if (payload.event === 'payment.failed') {
      const rzpOrder = payload.payload.payment.entity;
      const rzpOrderId = rzpOrder.order_id;
      const rzpPaymentId = rzpOrder.id;

      const payment = await this.paymentRepo.findOne({
        where: { razorpayOrderId: rzpOrderId },
        relations: ['order', 'order.user'],
      });

      if (payment && payment.status) {
        payment.status = PaymentStatus.FAILED;
        payment.razorpayPaymentId = rzpPaymentId;
        await this.paymentRepo.save(payment);

        console.log('payment failed')

        await this.paymentLogService.createLog(
          payment.id,
          PaymentStatus.FAILED,
        );

        await this.orderRepo.update(payment.order.id, { status: 'payment_failed' });
        const subOrders = await this.orderRepo.find({
          where: { parentOrder: { id: payment.order.id } },
          relations: ['vendor'],
        });

        for (const subOrder of subOrders) {
          await this.orderRepo.update(subOrder.id, { status: 'pending' });
        }
      }
    } 
  }

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_TEST_APISECRET || '')
      .update(orderId + '|' + paymentId)
      .digest('hex');
    if (generatedSignature !== signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    return true;
  }

  async getAllPayments() {
    try {
      const payments = await this.paymentRepo.find({
        relations: ['order'],
        order: { createdAt: 'DESC' },
      });
      return { payments, success: true };
    } catch (error) {
      console.log('Error while fetching payments data from DB', error);
      return { message: 'Internal server error', success: false };
    }
  }

  async getAllOrders() {
    try {
      const orders = await this.orderRepo.find({
        where: { parentOrder: IsNull() },
        order: { createdAt: 'DESC' },
        relations: ['payments'],
      });
      return { orders, success: true };
    } catch (error) {
      console.log('Error while fetching orders data from DB', error);
      return { message: 'Internal server error', success: false };
    }
  }
}

import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Razorpay from 'razorpay';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Payment, PaymentStatus } from './payment.entity';
import { CartService } from "../cart/cart.service"
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
    private razorpay: Razorpay;

    constructor(
        @InjectRepository(Payment)
        private paymentRepo: Repository<Payment>,
        @InjectRepository(Order)
        private orderRepo: Repository<Order>,
        private cartService: CartService
    ) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_TEST_APIKEY || "",
            key_secret: process.env.RAZORPAY_TEST_APISECRET || "",
        });
    }

    async createOrder(userID, amount: number, cartItems: any) {
        const options = {
            amount: amount * 100, // Razorpay expects amount in subunits (e.g., paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const rzpOrder = await this.razorpay.orders.create(options);

        const order = this.orderRepo.create({
            user: { id: userID },
            items: cartItems,
            status: "pending",
            totalAmount: amount
        })

        const savedOrder = await this.orderRepo.save(order)

        const payment = await this.paymentRepo.create({
            razorpayOrderId: rzpOrder.id,
            order: savedOrder,
            status: PaymentStatus.PENDING,
            amount
        });
        
        
        await this.paymentRepo.save(payment)


        return rzpOrder
    }

    async verifyPayment(payload) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload
        const isVerified = this.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        if(!isVerified){
            return {success: false, message: "Payment not verified"}
        }

        return { message: "Payment verified successfully", success: true }
    }

    async updatePaymentToDB(payload:any, signature: string){
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

            const payment = await this.paymentRepo.findOne({where: {razorpayOrderId: rzpOrderId}, relations: ['order', 'order.user']})
            if(payment && payment.status !== PaymentStatus.COMPLETED){
                payment.status = PaymentStatus.COMPLETED
                payment.razorpayPaymentId = rzpPaymentId
                await this.paymentRepo.save(payment)
                await this.orderRepo.update(payment.order.id, { status: "paid" })
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

    async getAllPayments(){
        try {
            const payments = await this.paymentRepo.find()
            return {payments, success:true}
        } catch (error) {
            console.log("Error while fetching payments data from DB", error)
            return {message: "Internal server error", success: false}
        }
    }

    async getAllOrders(){
        try {
            const orders = await this.orderRepo.find()
            return {orders, success:true}
        } catch (error) {
            console.log("Error while fetching orders data from DB", error)
            return {message: "Internal server error", success: false}
        }
    }
}

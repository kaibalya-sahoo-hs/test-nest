import { BadRequestException, Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) { }
    @Post('create-order')
    @UseGuards(AuthGuard)
    async createOrder(@Req() req, @Body() body: { amount: number, cartItems: any }) {
        const userID = req.user.id
        return this.paymentService.createOrder(userID, body.amount, body.cartItems);
    }

    @Post('verify')
    async verifyPayment(@Body() body: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string
    }) {
        console.log(body)
        await this.paymentService.verifyPayment(body)
        return { status: 'success' };
    }
    @Post('webhook')
    async updatePaymentStatus(@Body() body: any, @Headers('x-razorpay-signature') sign: string){
        await this.paymentService.updatePaymentToDB(body, sign)
    }
}

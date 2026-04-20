import { BadRequestException, Body, Controller, Get, Headers, Post, Req, Res, UseGuards } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('withdraw')
export class WithdrawController {
    constructor(
        private withdrawService: WithdrawService
    ) { }

    @Post()
    @UseGuards(AuthGuard)
    async createWithdraw(@Req() req, @Body() body) {
        return await this.withdrawService.createWithdrawal(req.user.id, body.amount)
    }

    @Get()
    @UseGuards(AuthGuard)
    async getWithdrawHistory(@Req() req){
        return await this.withdrawService.getWithdrawHistory(req.user.id, req.user.role)
    }

    @Post('update-payout-status')
      async updatePayoutStatus(
        @Headers('x-razorpay-signature') signature: string,
        @Req() req,
        @Res() res,
      ) {
        console.log('web hook trigreed');
        if (!signature) {
          throw new BadRequestException('Missing Razorpay Signature');
        }
    
        await this.withdrawService.processWebhookEvent(req.body);
        return res.status(200).send({ success: true });
      }
}

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
        return await this.withdrawService.createWithdrawal(req.user.id,req.user.role, body.amount)
    }

    @Get()
    @UseGuards(AuthGuard)
    async getWithdrawHistory(@Req() req){
        return await this.withdrawService.getWithdrawHistory(req.user.id, req.user.role)
    }
}

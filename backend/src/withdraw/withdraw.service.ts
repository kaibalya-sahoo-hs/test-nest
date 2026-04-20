import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { Withdraw, WithdrawalStatus } from './withdraw.entity';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { Vendor } from 'src/vendor/vendor.entity';

@Injectable()
export class WithdrawService {
  private rzpX: any;
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,
    @InjectRepository(Withdraw)
    private withdrawRepo: Repository<Withdraw>,
  ) {
    this.rzpX = new Razorpay({
      key_id: process.env.RAZORPAY_PAYOUT_TEST_APIKEY, // Use Test Keys
      key_secret: process.env.RAZORPAY_PAYOUT_TEST_APISECRET,
    });
  }
  async createWithdrawal(userId, amount = 0) {
    let user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const currentBalance = user?.balance;
    if (currentBalance) {
      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient funds in your wallet');
      }
    }

    const contact = await (this.rzpX as any).api.post({
      url: '/contacts',
      data: {
        name: user?.name,
        email: user?.email,
      },
    });

    const fundAccount = await (this.rzpX as any).api.post({
      url: '/fund_accounts',
      data: {
        contact_id: contact.id,
        account_type: 'bank_account',
        bank_account: {
          name: 'Test Vendor',
          ifsc: 'RAZR0000001',
          account_number: '112233445566',
        },
      },
    });

    const payout = await (this.rzpX as any).api.post({
      url: '/payouts',
      data: {
        account_number: '2323230096795693', // YOUR RazorpayX Account (Only here!)
        fund_account_id: fundAccount.id,
        amount: amount * 100,
        currency: 'INR',
        mode: 'IMPS',
        purpose: 'payout',
      },
    });

    user.balance -= amount;
    let withdrawal;

    await this.userRepo.save(user);
    withdrawal = this.withdrawRepo.create({
      user: { id: userId },
      amount,
      status: WithdrawalStatus.PENDING,
      remainingBalance: user.balance,
      payoutId: payout.id,
    });
    await this.withdrawRepo.save(withdrawal);

    return { success: true, message: 'Payout created' };
  }

  verifySignature(rawBody: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret || '')
      .update(rawBody)
      .digest('hex');

    return signature === expectedSignature;
  }

  async processWebhookEvent(payload: any) {
    const { event, payload: data } = payload;

    const payout = data.payout.entity;
    const rzpPayoutId = payout.id;

    // Find the record in your database using the Razorpay Payout ID
    const withdrawal = await this.withdrawRepo.findOne({
      where: { payoutId: rzpPayoutId },
    });

    if (!withdrawal) {
      return { withdrawal, success: false };
    }

    switch (event) {
      case 'payout.processed':
        withdrawal.status = WithdrawalStatus.PROCESSING;
        break;

      case 'payout.reversed':
      case 'payout.rejected':
      case 'payout.failed':
        withdrawal.status = WithdrawalStatus.FAILED;
        break;

      case 'payout.initiated':
        withdrawal.status = WithdrawalStatus.COMPLETED;
        break;
    }

    await this.withdrawRepo.save(withdrawal);
  }

  async getWithdrawHistory(userId, role) {
    const withdraws = await this.withdrawRepo.find({
      where: { user: { id: userId } },
    });
    return { withdraws, success: true };
  }
}

import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from './withdraw.entity';
import { User } from 'src/users/users.entity';
import { WithdrawController } from './withdraw.controller';
import { Vendor } from 'src/vendor/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Withdraw, Vendor])],
  providers: [WithdrawService],
  exports: [WithdrawService],
  controllers: [WithdrawController]
})
export class WithdrawModule {}

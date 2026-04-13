import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/payment/order.entity';
import { CloudinaryModule } from 'src/upload/upload.module';
import { UserController } from './users.controller';
import { User } from './users.entity';
import { UserService } from './users.service';
import { CouponModule } from 'src/coupon/coupon.module';
import { Cart } from 'src/cart/cart.entity';
import { WithdrawService } from 'src/withdraw/withdraw.service';
import { WithdrawModule } from 'src/withdraw/withdraw.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Cart]), 
    CloudinaryModule, 
    CouponModule, 
    WithdrawModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UsersModule {}

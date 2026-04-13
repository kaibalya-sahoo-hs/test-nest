import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/address/address.entity';
import { CartModule } from 'src/cart/cart.module';
import { Order } from './order.entity';
import { PaymentController } from './payment.controller';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';
import { Product } from 'src/product/product.entity';
import { Vendor } from 'src/vendor/vendor.entity';
import { Coupon } from 'src/coupon/coupon.entity';
import { PaymentLogService } from 'src/payment-log/payment-log.service';
import { PaymentLogModule } from 'src/payment-log/payment-log.module';
import { BullModule } from '@nestjs/bull';
import { User } from 'src/users/users.entity';

@Module({
  imports: [
  TypeOrmModule.forFeature([Payment, Order, Address, Product, Vendor, Coupon, User]),
  BullModule.registerQueue({name: "mail-queue"}),
  CartModule, 
  PaymentLogModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule {}

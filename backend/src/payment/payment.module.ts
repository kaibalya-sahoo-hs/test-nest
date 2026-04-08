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

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order, Address, Product, Vendor, Coupon]), CartModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule {}

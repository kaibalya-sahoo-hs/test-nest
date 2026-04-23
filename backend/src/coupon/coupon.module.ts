import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './coupon.entity';
import { CouponsService } from './coupon.service';
import { Cart } from 'src/cart/cart.entity';
import { Product } from 'src/product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, Cart, Product])],
  providers: [CouponsService],
  exports: [CouponsService]
})
export class CouponModule {}

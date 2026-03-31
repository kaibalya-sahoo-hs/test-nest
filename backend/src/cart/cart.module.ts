import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CouponModule } from 'src/coupon/coupon.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), CouponModule],
  providers: [CartService],
  exports: [CartService],
  controllers: [CartController]
})
export class CartModule { }

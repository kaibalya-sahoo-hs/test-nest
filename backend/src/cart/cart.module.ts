import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart_items.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CouponModule } from 'src/coupon/coupon.module';
import { Cart } from './cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Cart]), CouponModule],
  providers: [CartService],
  exports: [CartService],
  controllers: [CartController]
})
export class CartModule { }

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponsService } from 'src/coupon/coupon.service';
import { Repository } from 'typeorm'; // Adjust path
import { CartItem } from './cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    private readonly couponsService: CouponsService,
  ) {}

  /**
   * Get User Cart with Totals and Discounts
   */

  async getMyCart(userId: number, couponCode?: string) {
    const items = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    // Use Number() because decimal columns often return as strings from DB
    const subTotal = items.reduce((acc, item) => {
      const price = Number(item.product.price) || 0;
      return acc + price * item.quantity;
    }, 0);

    let discount = 0;
    let appliedCoupon: string | null = null;

    if (couponCode) {
      try {
        const validation = await this.couponsService.validateCoupon(
          couponCode,
          subTotal,
        );
        discount = validation.discountAmount;
        appliedCoupon = validation.code;
      } catch (e) {
        // If coupon is invalid, we proceed with 0 discount
        console.warn(`Coupon validation failed: ${e.message}`);
      }
    }

    return {
      items,
      subTotal: Number(subTotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number((subTotal - discount).toFixed(2)),
      appliedCoupon,
    };
  }

  /**
   * Add or Increment Item in Cart
   */
  async addToCart(userId: number, productId: string, quantity: number = 1) {
    let item = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });
    if (item) {
      item.quantity += quantity;
    } else {
      item = this.cartRepo.create({
        user: { id: userId },
        product: { id: productId },
        quantity,
      });
    }

    await this.cartRepo.save(item);
    return this.getMyCart(userId);
  }

  /**
   * Update Quantity using Product ID (Frontend Friendly)
   */
  async updateQuantityByProduct(
    userId: number,
    productId: string,
    quantity: number,
    coupon: string,
  ) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const item = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (!item) {
      throw new NotFoundException('Product not found in your cart');
    }

    item.quantity = quantity;
    await this.cartRepo.save(item);

    return this.getMyCart(userId, coupon);
  }

  async removeItemByProduct(userId: number, productId: string) {
    console.log(userId, productId);
    const result = await this.cartRepo.delete({
      user: { id: userId },
      product: { id: productId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Item not found in cart');
    }

    return this.getMyCart(userId);
  }

  async mergeCarts(userId: number, guestItems: any[]) {
    if (!guestItems || guestItems.length === 0) {
      return this.getMyCart(userId);
    }

    for (const guestItem of guestItems) {
      // guestItem.id should be the Product UUID/ID from frontend
      const existingItem = await this.cartRepo.findOne({
        where: {
          user: { id: userId },
          product: { id: guestItem.id },
        },
      });
      if (existingItem) {
        // Merge quantities
        existingItem.quantity += guestItem.quantity;
        const exstingcart = await this.cartRepo.save(existingItem);
        console.log('Increased the count of item');
      } else {
        // Create new entry
        const newItem = this.cartRepo.create({
          user: { id: userId },
          product: { id: guestItem.id },
          quantity: guestItem.quantity,
        });
        const newCart = await this.cartRepo.save(newItem);
      }
    }

    const cratItems = await this.getMyCart(userId);
    return cratItems;
  }
  /**
   * Clear Entire Cart (Used after successful Checkout)
   */
  async clearCart(userId: number) {
    await this.cartRepo.delete({ user: { id: userId } });
    return { message: 'Cart cleared successfully' };
  }
}

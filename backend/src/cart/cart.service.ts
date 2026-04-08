import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponsService } from 'src/coupon/coupon.service';
import { Repository } from 'typeorm'; // Adjust path
import { CartItem } from './cart_items.entity';
import { Cart } from './cart.entity';
import items from 'razorpay/dist/types/items';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepo: Repository<CartItem>,
    private readonly couponsService: CouponsService,
  ) { }

  async getMyCart(userId: number) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems', 'cartItems.product', 'coupon']
    });

    const subTotal = cart?.cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0) || 0;

    let discount = cart?.discount || 0
    let totalAmount = subTotal
    let discountedAmount = subTotal- discount
    if (totalAmount < 0) totalAmount = 0;

    if(cart){
      cart.totalAmount = totalAmount
      cart.discountedAmount = discountedAmount
      
      await this.cartRepo.save(cart)
    }

    return {
      success: true,
      cart: { ...cart, items: cart?.cartItems, subTotal, total: cart?.discountedAmount },
    };
  }

  /**
   * Add or Increment Item in Cart
   */
  async addToCart(userId: number, productId: string, quantity: number = 1) {
    let cart = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
      }
    });
    if (!cart) {
      cart = this.cartRepo.create({ user: { id: userId } })
      await this.cartRepo.save(cart)
    }

    let cartItem = await this.cartItemsRepo.findOne({ where: { cart: { id: cart.id }, product: { id: productId } } })
    if (cartItem) {
      cartItem.quantity += 1
    } else {
      cartItem = this.cartItemsRepo.create({ product: { id: productId }, cart: { id: cart.id }, quantity })
    }


    await this.cartItemsRepo.save(cartItem)
    return this.getMyCart(userId)
  }

  /**
   * Update Quantity using Product ID (Frontend Friendly)
   */
  async updateQuantityByProduct(
    userId: number,
    productId: string,
    quantity: number,
  ) {
    const cart = await this.cartRepo.findOne({ where: { user: { id: userId } }, relations: ['cartItems', 'cartItems.product'] })
    let cartItem = await this.cartItemsRepo.findOne({ where: { cart: { id: cart?.id }, product: { id: productId } } })
    if (!cartItem) {
      return { message: "Cart not found", success: false }
    }
    if (quantity < 1) {
      cartItem.quantity = 1
    }
    cartItem.quantity = quantity

    await this.cartItemsRepo.save(cartItem)

    // return {...cart, items: cart?.cartItems, subTotal: cart?.totalAmount}
    return this.getMyCart(userId)
  }

  async removeItemByProduct(userId: number, productId: string) {
    const cart = await this.cartRepo.findOne({ where: { user: { id: userId } } });
    const result = await this.cartItemsRepo.delete({ product: { id: productId }, cart: { id: cart?.id } })
    if (result.affected === 0) {
      throw new NotFoundException('Item not found in cart');
    }

    return this.getMyCart(userId);
  }

  async mergeCarts(userId: number, guestItems: any[]) {
    if (!guestItems || guestItems.length === 0) {
      return this.getMyCart(userId);
    }

    let cart = await this.cartRepo.findOne({ where: { user: { id: userId } } })

    if(!cart){
      const newcart = await this.cartRepo.create({user: {id: userId}})
      cart = await this.cartRepo.save(newcart)
    }

    for (const guestItem of guestItems) {
      const existingItem = await this.cartItemsRepo.findOne({
        where: {
          cart: { id: cart?.id },
          product: { id: guestItem.id },
        },
      });
      console.log(existingItem)
      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        await this.cartItemsRepo.save(existingItem);
      } else {
        // Create new entry
        const newItem = this.cartItemsRepo.create({
          cart: { id: cart?.id },
          product: { id: guestItem.id },
          quantity: guestItem.quantity,
        });
        await this.cartItemsRepo.save(newItem);
        console.log("Saved cart")
      }
    }

    return this.getMyCart(userId);
  }
  /**
   * Clear Entire Cart (Used after successful Checkout)
   */
  async clearCart(userId: number) {
    await this.cartRepo.delete({ user: { id: userId } });
    return { message: 'Cart cleared successfully' };
  }
}

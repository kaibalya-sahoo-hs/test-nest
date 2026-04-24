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
import { Product } from 'src/product/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CartItem)
    private cartItemsRepo: Repository<CartItem>,
    private readonly couponsService: CouponsService,
  ) { }

  async getMyCart(userId: number) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems', 'cartItems.product', 'coupon'],
    });

    const subTotal =
      cart?.cartItems.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0) || 0;

    let discount = cart?.discount || 0;
    let totalAmount = subTotal;
    let discountedAmount = subTotal - discount;
    if (totalAmount < 0) totalAmount = 0;

    if (cart) {
      cart.totalAmount = totalAmount;
      cart.discountedAmount = discountedAmount;

      await this.cartRepo.save(cart);
    }

    return {
      success: true,
      cart: {
        ...cart,
        items: cart?.cartItems,
        subTotal,
        total: cart?.discountedAmount,
      },
    };
  }

  /**
   * Add or Increment Item in Cart
   */
  async addToCart(userId: number, productId: string, quantity: number = 1) {
    let cart = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (!cart) {
      cart = this.cartRepo.create({ user: { id: userId } });
      await this.cartRepo.save(cart);
    }

    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    const productStock = product?.stock;

    if (!product) return { message: 'Product not found', success: false };
    if (productStock && productStock < 1) {
      return { message: 'Product is out of stock', success: false };
    }

    let cartItem = await this.cartItemsRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cartItem = this.cartItemsRepo.create({
        product: { id: productId },
        cart: { id: cart.id },
        quantity,
      });
    }
    product.stock -= 1;

    await this.productRepo.save(product);

    await this.cartItemsRepo.save(cartItem);
    return this.getMyCart(userId);
  }

  /**
   * Update Quantity using Product ID (Frontend Friendly)
   */
  async updateQuantityByProduct(
    userId: number,
    productId: string,
    quantity: number,
  ) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems', 'cartItems.product', 'coupon', 'coupon.product'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found')
    }

    let cartItem = await this.cartItemsRepo.findOne({
      where: { cart: { id: cart?.id }, product: { id: productId } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      return { message: 'Product not found', success: false };
    }
    const productStock = product?.stock;

    // if(productStock && productStock < 1){
    //   return {message: "Product is out of stock", success: false}
    // }

    if (!cartItem) {
      return { message: 'Cart not found', success: false };
    }
    if (quantity < 1) {
      cartItem.quantity = 1;
    }
    if (cartItem?.quantity > quantity) {
      product.stock = productStock + 1;
    } else {
      product.stock = productStock - 1;
    }

    cartItem.quantity = quantity;

    if (cart.coupon) {
      const coupon = cart.coupon;

      const totalAmount = cart.cartItems.reduce((acc, item) => {
        return acc + item.quantity * item.product.price
      }, 0)

      const validItems = cart.cartItems.filter(item =>
        coupon.products.some(p => p.id === item.product.id)
      );


      if (validItems.length > 0) {
        let discount = 0;

        for (const item of validItems) {
          const itemTotal =
            item.quantity * Number(item.product.price);

          if (coupon.type === 'percentage') {
            discount += (itemTotal * Number(coupon.discountValue)) / 100;
          }
        }

        if (coupon.type === 'fixed') {
          discount = Number(coupon.discountValue);
        }

        cart.discount = discount;
        cart.discountedAmount = cart.totalAmount - discount;

        await this.cartRepo.save(cart)
      }

      await this.productRepo.save(product);
      await this.cartItemsRepo.save(cartItem);
      return this.getMyCart(userId);
    }
  }
  async removeItemByProduct(userId: number, productId: string) {
      const cart = await this.cartRepo.findOne({
        where: { user: { id: userId } }, relations: ['coupon', 'coupon.product'],
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      if (
        cart.coupon &&
        cart.coupon.product &&
        cart.coupon.product.id === productId
      ) {
        cart.coupon = null;
        cart.discount = 0;
        cart.discountedAmount = cart.totalAmount - cart.discount
        await this.cartRepo.save(cart);
      }

      const cartItem = await this.cartItemsRepo.findOne({
        where: { cart: { id: cart?.id }, product: { id: productId } },
      });
      if (!cartItem) {
        throw new NotFoundException('Cartitems not found');
      }

      const product = await this.productRepo.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      let updatedStock = cartItem.quantity + product.stock;
      product.stock = updatedStock;
      await this.productRepo.save(product);

      const result = await this.cartItemsRepo.delete({
        product: productId as any,
        cart: cart?.id as any,
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

      let cart = await this.cartRepo.findOne({ where: { user: { id: userId } } });

      if (!cart) {
        const newcart = await this.cartRepo.create({ user: { id: userId } });
        cart = await this.cartRepo.save(newcart);
      }

      for (const guestItem of guestItems) {
        const existingItem = await this.cartItemsRepo.findOne({
          where: {
            cart: { id: cart?.id },
            product: { id: guestItem.id },
          },
        });
        const product = await this.productRepo.findOne({
          where: { id: guestItem.id },
        });

        if (!product) {
          throw new NotFoundException('Product not found');
        }

        if (product)
          if (existingItem) {
            console.log(existingItem.quantity, guestItem.quantity)
            existingItem.quantity += guestItem.quantity;

            product.stock -= guestItem.quantity;
            await this.productRepo.save(product);
            console.log(existingItem.quantity)
            await this.cartItemsRepo.save(existingItem);
          } else {
            // Create new entry
            if (product.stock < guestItem.quantity) {
              guestItem.quantity = product.stock;
              product.stock = 0;
            } else {
              product.stock -= guestItem.quantity;
            }
            await this.productRepo.save(product);
            const newItem = this.cartItemsRepo.create({
              cart: { id: cart?.id },
              product: { id: guestItem.id },
              quantity: guestItem.quantity,
            });
            await this.cartItemsRepo.save(newItem);
          }
      }

      return this.getMyCart(userId);
    }

  async removeCoupon(userId: number) {
      const cart = await this.cartRepo.findOne({
        where: { user: { id: userId } },
        relations: ['cartItems', 'cartItems.product', 'coupon'],
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      cart.coupon = null;
      cart.discount = 0;

      const subTotal = cart.cartItems.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
      cart.totalAmount = subTotal;
      cart.discountedAmount = subTotal;

      await this.cartRepo.save(cart);

      return this.getMyCart(userId);
    }

  async clearCart(userId: number) {
      await this.cartRepo.delete({ user: { id: userId } });
      return { message: 'Cart cleared successfully' };
    }
  }

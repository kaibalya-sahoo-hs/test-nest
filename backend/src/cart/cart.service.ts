import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CouponsService } from "src/coupon/coupon.service";
import { Repository } from "typeorm";
import { CartItem } from "./cart.entity";

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartItem)
        private cartRepo: Repository<CartItem>,
        private couponsService: CouponsService
    ) { }

    async getMyCart(userId: number, couponCode?: string) {
        console.log("Coupon Code", couponCode)
        const items = await this.cartRepo.find({
            where: { user: { id: userId } },
            relations: ['product'],
        });
    
        const subTotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        let discount = 0;
        let appliedCoupon: string | null = null;
    
        if (couponCode) {
            try {
                const validation = await this.couponsService.validateCoupon(couponCode, subTotal);
                console.log(validation)
                discount = validation.discountAmount;
                appliedCoupon = validation.code;
            } catch (e) {
                // If coupon fails, we just return the cart without discount
            }
        }
    
        return {
            items,
            subTotal,
            discount,
            total: subTotal - discount,
            appliedCoupon
        };
    }

    async addToCart(userId: number, productId: string, quantity: number = 1) {
        // 1. Check if the product is already in this user's cart
        let item = await this.cartRepo.findOne({
            where: { user: { id: userId }, product: { id: productId } }
        });

        if (item) {
            // 2. Update quantity if it exists
            item.quantity += quantity;
        } else {
            // 3. Create new record if it doesn't
            item = this.cartRepo.create({ user: { id: userId }, product: { id: productId }, quantity })
        }

        return this.cartRepo.save(item);
    }

    async updateItemQuantity(userId: number, cartItemId: number, quantity: number) {
        if (quantity < 1) {
            throw new BadRequestException('Quantity must be at least 1');
        }
    
        // 1. Update the item ONLY if it belongs to this user
        const updateResult = await this.cartRepo.update(
            { id: cartItemId, user: { id: userId } }, 
            { quantity: quantity }
        );
    
        // 2. If no rows were affected, the item doesn't exist or doesn't belong to the user
        if (updateResult.affected === 0) {
            throw new NotFoundException('Cart item not found or unauthorized');
        }
    
        // 3. Return the updated cart (or a success message)
        return { message: 'Quantity updated successfully', quantity };
    }

    async removeItem(userId: number, cartItemId: number) {
        return this.cartRepo.delete({ id: cartItemId, user: { id: userId } });
    }
}
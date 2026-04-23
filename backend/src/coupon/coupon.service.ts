// src/coupons/coupons.service.ts
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Coupon } from './coupon.entity';
import { Cart } from 'src/cart/cart.entity';
import { Product } from 'src/product/product.entity';
import { CLIENT_RENEG_LIMIT } from 'node:tls';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private couponRepo: Repository<Coupon>,
        @InjectRepository(Cart)
        private cartRepo: Repository<Cart>,
        @InjectRepository(Product)
        private productRepo: Repository<Product>
    ) { }

    async applyCoupon(couponCode, cartId) {
        try {
            const cart = await this.cartRepo.findOne({ where: { id: cartId }, relations: ['cartItems', 'cartItems.product'] })
            if (!cart) {
                return { message: 'Invalid cart id', success: false }
            }
            const result = await this.validateCoupon(couponCode, cart)

            cart.coupon = result.code
            cart.discount = result.discountAmount
            cart.discountedAmount = cart.totalAmount - result.discountAmount

            const savedCart = await this.cartRepo.save(cart)

            return { success: true, message: 'Coupon applied successfully', savedCart }
        } catch (error) {
            console.log("Error while applying coupon", error)
            const msg = error?.response?.message || error?.message || 'Error while applying coupon';
            return { message: msg, success: false }
        }
    }

    async removeCouponFromCart(userId: number) {
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

        return { success: true, message: 'Coupon removed successfully' };
    }

    async validateCoupon(code: string, cart: any) {
        console.log(code);
        
        const coupon = await this.couponRepo.findOne({ where: { displayName: code.toLowerCase(), isActive: true }, relations: ['vendor', 'product'] });

        console.log(coupon)
        if (!coupon) {
            throw new NotFoundException('Coupon code is not available');
        }

        // Check Expiry
        if (coupon.expiryDate && coupon.expiryDate < new Date()) {
            throw new BadRequestException('This coupon has expired');
        }

        const possibleCoupons = await this.couponRepo.find({
            where: { displayName: coupon.displayName, isActive: true },
            relations: ['product']
        });


        const isValidCoupon = possibleCoupons.find(coupon =>
            cart.cartItems.some(item => item.product.id === coupon.product.id)
        )

        if (!isValidCoupon) {
            throw new BadRequestException('This coupon is not valid for any product in your cart')
        }

        // Check Usage Limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new BadRequestException('This coupon has reached its usage limit');
        }

        // Calculate Discount
        let discountAmount = 0;

        const product = await this.productRepo.findOne({ where: { id: coupon.product.id } })
        const productPrice = product?.price
        
        if (!productPrice) {
            throw new NotFoundException('Product not found')
        }

        if (coupon.type === 'percentage') {
            discountAmount = (productPrice * Number(coupon.discountValue)) / 100;
        } else {
            discountAmount = Number(coupon.discountValue);
        }


        // Ensure discount doesn't exceed total
        return {
            code: coupon,
            discountAmount: Math.min(discountAmount, cart.totalAmount),
            type: coupon.type,
            value: coupon.discountValue,
            creatorType: coupon.creatorType,
            vendorId: coupon.vendor?.id || null
        };
    }

    // Create coupon for a vendor's product
    async create(vendorId, productId, coupon) {
        const uniqueCode = `V-${vendorId}-${coupon.code}`

        const existing = await this.couponRepo.findOne({
            where: { code: uniqueCode.toUpperCase() }
        });

        if (existing) {
            throw new BadRequestException('This coupon code already exists');
        }

        const newCoupon = this.couponRepo.create({
            code: uniqueCode.toUpperCase(),
            product: { id: productId },
            vendor: { id: vendorId },
            displayName: coupon.code.toLowerCase(),
            description: coupon.description,
            discountValue: coupon.discount,
            creatorType: 'vendor',
            expiryDate: coupon?.expiry || null,
            isActive: coupon.isActive ?? true,
            usageLimit: coupon.usageLimit,
            type: coupon.type || 'percentage',
        });

        return await this.couponRepo.save(newCoupon);
    }

    // Update coupon (vendor-scoped)
    async updateCoupon(couponId: number, vendorId: number, updateData: any) {
        const coupon = await this.couponRepo.findOne({
            where: { id: couponId },
            relations: ['vendor'],
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (coupon.vendor?.id !== vendorId) {
            throw new ForbiddenException('You do not own this coupon');
        }

        // Update allowed fields
        if (updateData.description !== undefined) coupon.description = updateData.description;
        if (updateData.discount !== undefined) coupon.discountValue = updateData.discount;
        if (updateData.type !== undefined) coupon.type = updateData.type;
        if (updateData.expiry !== undefined) coupon.expiryDate = updateData.expiry || null;
        if (updateData.usageLimit !== undefined) coupon.usageLimit = updateData.usageLimit;
        if (updateData.productId !== undefined) coupon.product = { id: updateData.productId } as any;
        if (updateData.code !== undefined) {
            const newUniqueCode = `V-${vendorId}-${updateData.code}`;
            coupon.code = newUniqueCode.toUpperCase();
            coupon.displayName = updateData.code;
        }

        return await this.couponRepo.save(coupon);
    }

    // Delete coupon (vendor-scoped)
    async deleteCoupon(couponId: number, vendorId: number) {
        const coupon = await this.couponRepo.findOne({
            where: { id: couponId },
            relations: ['vendor'],
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (coupon.vendor?.id !== vendorId) {
            throw new ForbiddenException('You do not own this coupon');
        }

        await this.couponRepo.remove(coupon);
        return { success: true, message: 'Coupon deleted successfully' };
    }

    // Toggle coupon active state (vendor-scoped)
    async toggleCouponActive(couponId: number, vendorId: number) {
        const coupon = await this.couponRepo.findOne({
            where: { id: couponId },
            relations: ['vendor'],
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (coupon.vendor?.id !== vendorId) {
            throw new ForbiddenException('You do not own this coupon');
        }

        coupon.isActive = !coupon.isActive;
        const saved = await this.couponRepo.save(coupon);
        return { success: true, isActive: saved.isActive, message: `Coupon ${saved.isActive ? 'activated' : 'deactivated'}` };
    }

    // Vendor coupon (created by vendor)
    async createVendorCoupon(coupon, vendorId: string) {
        const existing = await this.couponRepo.findOne({
            where: { code: coupon.code.toUpperCase() }
        });

        if (existing) {
            throw new BadRequestException('A coupon with this code already exists');
        }

        const newCoupon = this.couponRepo.create({
            ...coupon,
            code: coupon.code.toUpperCase(),
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate) : null,
            creatorType: 'vendor',
            vendor: { id: vendorId },
        });

        return await this.couponRepo.save(newCoupon);
    }

    // Get all coupons (for admin)
    async findAllCoupons() {
        return await this.couponRepo.find({ relations: ['vendor', 'product'], order: { id: 'DESC' } });
    }
    
    
    async getCoupons(vendorId: number) {
        const coupons = await this.couponRepo.find({ where: { vendor: {id: vendorId}},relations: ['product'], order: { id: 'DESC' } });
        return {success: true, coupons}
    }

    // Get coupons for a specific product (vendor-scoped)
    async getCouponsByProduct(productId: string, vendorId: number) {
        const coupons = await this.couponRepo.find({
            where: { product: { id: productId }, vendor: { id: vendorId } },
            order: { id: 'DESC' },
        });
        return { success: true, coupons };
    }

    // Increment usage count after successful payment
    async incrementUsage(couponCode: string) {
        const coupon = await this.couponRepo.findOne({ where: { code: couponCode.toUpperCase() } });
        if (coupon) {
            coupon.usageCount += 1;
            await this.couponRepo.save(coupon);
        }
    }
}

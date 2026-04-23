// src/coupons/coupons.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Coupon } from './coupon.entity';
import { Cart } from 'src/cart/cart.entity';
import { Product } from 'src/product/product.entity';

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
                return { message: 'inavlid cart id', success: false }
            }
            const result = await this.validateCoupon(couponCode, cart)

            cart.coupon = result.code
            cart.discount = result.discountAmount
            cart.discountedAmount = cart.totalAmount - result.discountAmount

            const savedCart = await this.cartRepo.save(cart)

            return { succes: true, message: 'Coupon applied successfully', savedCart }
        } catch (error) {
            console.log("Error hwile applying coupon", error)
            return { message: "Error while applying coupon", success: false }
        }
    }

    async validateCoupon(code: string, cart: any) {
        const coupon = await this.couponRepo.findOne({ where: { displayName: code, isActive: true }, relations: ['vendor', 'product'] });

        if (!coupon) {
            throw new NotFoundException('Coupon code is not available');
        }

        // Check Expiry
        if (coupon.expiryDate && coupon.expiryDate < new Date()) {
            throw new BadRequestException('This coupon has expired');
        }

        const possibleCoupons = await this.couponRepo.find({
            where: { displayName: coupon.displayName },
            relations: ['product']
        });


        const isValidCoupon = possibleCoupons.find(coupon =>
            cart.cartItems.some(item => item.product.id === coupon.product.id)
        )

        if (!isValidCoupon) {
            throw new BadRequestException('This is not a valid coupon')
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
            discountAmount = productPrice - Number(coupon.discountValue);
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

    // Platform coupon (created by admin)
    async create(vendorId, productId, coupon) {
        const uniqueCode = `V-${vendorId}-${coupon.code}`

        const existing = await this.couponRepo.findOne({
            where: { code: uniqueCode.toUpperCase() }
        });

        if (existing) {
            throw new BadRequestException('This coupon code is already exists');
        }

        const newCoupon = this.couponRepo.create({
            code: uniqueCode.toUpperCase(),
            product: { id: productId },
            vendor: { id: vendorId },
            displayName: coupon.code,
            description: coupon.description,
            discountValue: coupon.discount,
            creatorType: 'vendor',
            expiryDate: coupon?.expiry,
            isActive: coupon.isActive,
            usageLimit: coupon.usageLimit,
            type: coupon.type
        });

        return await this.couponRepo.save(newCoupon);
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
        return await this.couponRepo.find({ relations: ['vendor'], order: { id: 'DESC' } });
    }
    
    
    async getCoupons(vendorId: number) {
        const coupons = await this.couponRepo.find({ where: { vendor: {id: vendorId}},relations: ['product'], order: { id: 'DESC' } });
        return {success: true, coupons}
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

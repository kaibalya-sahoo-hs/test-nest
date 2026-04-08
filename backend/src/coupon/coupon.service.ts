// src/coupons/coupons.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Coupon } from './coupon.entity';
import { Cart } from 'src/cart/cart.entity';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private couponRepo: Repository<Coupon>,
        @InjectRepository(Cart)
        private cartRepo: Repository<Cart>
    ) {}

    async applyCoupon(couponCode, cartId){
        try {
            const cart = await this.cartRepo.findOne({where: {id:cartId}})
            if(!cart){
                return {message: 'inavlid cart id', success: false}
            }
            const result = await this.validateCoupon(couponCode, cart?.totalAmount || 0)
            
            cart.coupon = result.code
            cart.discount = result.discountAmount
            cart.totalAmount = cart.totalAmount - result.discountAmount
            
            const savedCart = await this.cartRepo.save(cart)
            
            return {succes: true, message: 'Coupon applied successfully', savedCart}
        } catch (error) {
            console.log("Error hwile applying coupon", error)
            return {message: "Error while applying coupon", success: false}
        }
    }

    async validateCoupon(code: string, currentCartTotal: number) {
        const coupon = await this.couponRepo.findOne({ where: { code: code.toUpperCase(), isActive: true }, relations: ['vendor'] });

        if (!coupon) {
            throw new NotFoundException('Invalid or inactive coupon code');
        }

        // Check Expiry
        if (coupon.expiryDate && coupon.expiryDate < new Date()) {
            throw new BadRequestException('This coupon has expired');
        }

        // Check Usage Limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new BadRequestException('This coupon has reached its usage limit');
        }

        // Calculate Discount
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (currentCartTotal * Number(coupon.discountValue)) / 100;
        } else {
            discountAmount = Number(coupon.discountValue);
        }

        // Ensure discount doesn't exceed total
        return {
            code: coupon,
            discountAmount: Math.min(discountAmount, currentCartTotal),
            type: coupon.type,
            value: coupon.discountValue,
            creatorType: coupon.creatorType,
            vendorId: coupon.vendor?.id || null
        };
    }

    // Platform coupon (created by admin)
    async create(coupon) {
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
          creatorType: 'platform',
        });
      
        return await this.couponRepo.save(newCoupon);
    }

    // Vendor coupon (created by vendor)
    async createVendorCoupon(coupon, vendorId: number) {
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

    // Get vendor coupons
    async findVendorCoupons(vendorId: number) {
        return await this.couponRepo.find({ where: { vendor: { id: vendorId } }, order: { id: 'DESC' } });
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
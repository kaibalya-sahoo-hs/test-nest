// src/coupons/coupons.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Coupon } from './coupon.entity';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private couponRepo: Repository<Coupon>,
    ) {}

    async validateCoupon(code: string, currentCartTotal: number) {
        const coupon = await this.couponRepo.findOne({ where: { code: code.toUpperCase(), isActive: true } });

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
            code: coupon.code,
            discountAmount: Math.min(discountAmount, currentCartTotal),
            type: coupon.type,
            value: coupon.discountValue
        };
    }

    async create(coupon) {
        // Check if code already exists
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
        });
      
        return await this.couponRepo.save(newCoupon);
      }
}
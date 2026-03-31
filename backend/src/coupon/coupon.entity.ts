// src/coupons/entities/coupon.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('coupons')
export class Coupon {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string; // e.g., 'SAVE50'

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    discountValue: number;

    @Column({ type: 'enum', enum: ['percentage', 'fixed'], default: 'percentage' })
    type: 'percentage' | 'fixed';

    @Column({ type: 'timestamp', nullable: true })
    expiryDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 1 })
    usageCount: number;

    @Column({ nullable: true })
    usageLimit: number;
}
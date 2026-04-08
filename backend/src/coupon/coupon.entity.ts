// src/coupons/entities/coupon.entity.ts
import { Vendor } from 'src/vendor/vendor.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

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

    @Column({ default: 0 })
    usageCount: number;

    @Column({ nullable: true })
    usageLimit: number;

    @Column({ type: 'enum', enum: ['platform', 'vendor'], default: 'platform' })
    creatorType: 'platform' | 'vendor';

    @ManyToOne(() => Vendor, { nullable: true, onDelete: 'SET NULL' })
    vendor: Vendor;
}
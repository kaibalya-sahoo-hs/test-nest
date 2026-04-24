// src/coupons/entities/coupon.entity.ts
import { Product } from 'src/product/product.entity';
import { User } from 'src/users/users.entity';
import { Vendor } from 'src/vendor/vendor.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // e.g., 'SAVE50'

  @Column()
  displayName: string

  @Column()
  description: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({
    type: 'enum',
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  })
  type: 'percentage' | 'fixed';

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  usageLimit: number;

  @Column({nullable: true})
  minimumAmount: number

  @Column({nullable: true})
  maxDiscountAmount: number

  @Column({ type: 'enum', enum: ['platform', 'vendor'], default: 'platform' })
  creatorType: 'platform' | 'vendor';

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  vendor: User;

  @Column()
  scope: 'global' | 'vendor' | 'product'

  @ManyToOne(() => Product)
  products: Product[]
}

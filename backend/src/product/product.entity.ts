import { User } from 'src/users/users.entity';
import { Vendor } from 'src/vendor/vendor.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Coupon } from 'src/coupon/coupon.entity';
import { Review } from 'src/review/review.entity';
import { ProductVariant } from './productVariant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') // Using UUID is better for security/scaling than simple IDs
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'float', default: 0 })
  rating!: number;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @ManyToOne(() => User, (vendor) => vendor.products, {onDelete: 'CASCADE'})
  vendor!: User;

  @Column({ nullable: true })
  category: string;

  @Column('text', {array: true, nullable: true})
  features: string[]

  @ManyToMany(() => Tag, (tag) => tag.products, {onDelete: "CASCADE"})
  @JoinTable({
    name: 'product_tags',
  })
  tags: Tag[]

  @OneToMany(() => Review, (r) => r.product)
  reviews: Review[]

  @ManyToMany(() => Coupon, (coupon) => coupon.products, {onDelete: 'CASCADE'})
  coupons: Coupon[]

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

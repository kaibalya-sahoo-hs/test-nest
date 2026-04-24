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

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') // Using UUID is better for security/scaling than simple IDs
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  // Use 'decimal' for currency to avoid floating-point math errors
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'float', default: 0 })
  rating!: number;

  // Storing the URL or Cloudinary ID of the image
  @Column({ nullable: true })
  image!: string;

  @Column({ type: 'simple-json', nullable: true, default: '[]' })
  images: string[];

  @Column({ default: 0 })
  stock!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (vendor) => vendor.products)
  vendor!: User;

  @Column({ nullable: true })
  category: string;

  @ManyToMany(() => Tag, (tag) => tag.products, {onDelete: "CASCADE"})
  @JoinTable({
    name: 'product_tags',
  })
  tags: Tag[]

  @OneToMany(() => Coupon, (coupon) => coupon.product, {onDelete: 'CASCADE'})
  coupons: Coupon[]
}

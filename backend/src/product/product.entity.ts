import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') // Using UUID is better for security/scaling than simple IDs
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  // Use 'decimal' for currency to avoid floating-point math errors
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'float', default: 0 })
  rating!: number;

  // Storing the URL or Cloudinary ID of the image
  @Column({ nullable: true })
  image!: string;

  @Column({ default: 0 })
  stock!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.products)
  vendor!: User

}
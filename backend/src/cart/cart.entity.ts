import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity'
import { Product } from '../product/product.entity'

@Entity('cart_items')
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 1 })
    quantity: number;

    @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Product, { eager: true, onDelete: "CASCADE" },) // eager: true loads product details automatically
    product: Product;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
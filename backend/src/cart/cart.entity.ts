import { User } from "src/users/users.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CartItem } from "./cart_items.entity";
import { Coupon } from "src/coupon/coupon.entity";

@Entity('cart')
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.cart, {onDelete: 'CASCADE'})
    @JoinColumn()
    user: User

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
    cartItems: CartItem[]

    @ManyToOne(() => Coupon)
    coupon: Coupon | null

    @Column({default: 0})
    totalAmount: number

    @Column({default: 0})
    discountedAmount: number

    @Column({default: 0})
    discount: number
    
    @Column({default: 'active'})
    status: string
}
import { Product } from "src/product/product.entity";
import { User } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('reviews')
export class Review{
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type: 'text'})
    content: string

    @ManyToOne(() => User, {onDelete: 'CASCADE'})
    user: User

    @ManyToOne(() => Product, {onDelete: 'CASCADE'})
    product: Product

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
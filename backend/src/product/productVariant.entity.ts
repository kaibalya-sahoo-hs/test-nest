import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('product_variants')
export class ProductVariant{
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @ManyToOne(() => Product, product => product.variants, {onDelete: 'CASCADE'})
    product!: Product

    @Column({ nullable: true })
    name!: string

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price!: number

    @Column({nullable: true})
    color: string

    @Column({nullable: true})
    size: string

    @Column({ nullable: true })
    stock: number

    @Column({nullable: true})
    image: string

    @Column({ type: 'simple-json', nullable: true, default: '[]'})
    images: string[]

    @Column({ default: 'completed' })
    imageUploadStatus: string;
}
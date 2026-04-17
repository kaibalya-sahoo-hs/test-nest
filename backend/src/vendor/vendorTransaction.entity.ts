import { Product } from 'src/product/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne } from 'typeorm';
import { Vendor } from './vendor.entity';
import { WithdrawalStatus } from 'src/withdraw/withdraw.entity';

@Entity()
export class VendorTransaction {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @Column({ type: 'decimal' })
    winthdrawAmount!: string;

    @Column({ type: "decimal" })
    remainingBalance!: number

    @Column({ enum: WithdrawalStatus })
    status: string
}
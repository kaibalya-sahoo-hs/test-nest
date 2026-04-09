import { Vendor } from "src/vendor/vendor.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('withdraws')
export class Withdraw {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => Vendor)
    vendor: Vendor

    @Column('int')
    amount: number


    @Column({default: 'pending'})
    status: string

    @CreateDateColumn()
    createdAt: Date
}
import { Vendor } from "src/vendor/vendor.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

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
    
    @Column({nullable:true})
    transactionId: string

    @CreateDateColumn()
    createdAt: Date
}
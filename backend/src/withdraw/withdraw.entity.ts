import { User } from "src/users/users.entity";
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

    @ManyToOne(() => User, {onDelete: 'SET NULL'})
    user: User

    @Column('int')
    amount: number

    @Column('int')
    remainingBalance: number

    @Column({default: 'pending'})
    status: string
    
    @Column({nullable:true})
    transactionId: string

    @Column({nullable: true})
    payoutId: string

    @CreateDateColumn()
    createdAt: Date
}
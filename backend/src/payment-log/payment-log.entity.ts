// payment.entity.ts
import { Payment } from 'src/payment/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity('payment-logs')
export class PaymentLogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Payment, (payment) => payment.statusHisotry)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment

  @Column()
  paymentStatus: string

  @CreateDateColumn()
  createdAt: Date
}
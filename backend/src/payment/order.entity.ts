// order.entity.ts
import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, CreateDateColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User; // Link to your User entity

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'json' })
  items: any;

  @Column({ default: 'awaiting_payment' })
  status: string;

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  payment: Payment[];

  @CreateDateColumn()
  createdAt: Date;
}
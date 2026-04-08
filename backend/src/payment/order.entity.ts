// order.entity.ts
import { Address } from 'src/address/address.entity';
import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, CreateDateColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { Vendor } from 'src/vendor/vendor.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, {nullable: true})
  parentOrder: Order

  @OneToMany(() => Order, (order) => order.parentOrder)
  subOrders: Order[]

  @ManyToOne(() => User)
  user: User; // Link to your User entity

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'json' })
  items: any;

  @Column({ default: 'awaiting_payment' })
  status: string;

  @OneToMany(() => Payment, (payment) => payment.order, { cascade: true })
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Address, { nullable: true, onDelete: 'SET NULL' })
  deliveryAddress: Address

  @ManyToOne(() => Vendor)
  vendor: Vendor
}
import { Address } from 'src/address/address.entity';
import { Cart } from 'src/cart/cart.entity';
import { CartItem } from 'src/cart/cart_items.entity';
import { Product } from 'src/product/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ nullable: true })
  registartionToken!: string;

  @Column({ nullable: true })
  profile!: string;

  @Column({ default: 'guest', enum: ['guest', 'admin', 'member', 'vendor'] })
  role!: string;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart!: Cart;

  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];

  // for admin
  @Column({ default: 0 })
  balance: number;

  // vendor fields
  @Column({ nullable: true })
  storeName!: string;

  @Column({ nullable: true })
  storeDescription!: string;

  @Column({ nullable: true, default: 'pending' })
  vendorStatus!: 'pending' | 'approved' | 'rejected' | 'suspended';

  @Column({ type: 'decimal', nullable: true, default: 0.10 })
  commisionRate!: number;

  @OneToMany(() => Product, (product) => product.vendor)
  products!: Product[];
}

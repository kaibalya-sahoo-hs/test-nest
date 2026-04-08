import { Product } from 'src/product/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class Vendor {
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
  profile!: string

  @Column({nullable: true})
  storeName!: string

  @Column({nullable: true})
  storeDescription!: string

  @Column({nullable: true})
  vendorStatus!: 'pending' | 'approved' | 'rejected' | 'suspended'

  @Column({nullable: true})
  commisionRate!: number

  @OneToMany(() => Product, (product) =>product.vendor)
  products!: Product[]
  
  @Column({default: 0})
  balance: number
}
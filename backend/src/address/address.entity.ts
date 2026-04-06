import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/users.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string; // Recipient name

  @Column()
  phoneNumber: string;

  @Column()
  streetAddress: string; // House No, Building, Street

  @Column({ nullable: true })
  landmark: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column({ default: 'India' })
  country: string;

  @Column({ default: false })
  isDefault: boolean; // Useful if a user has multiple addresses

  @Column({
    type: 'enum',
    enum: ['home', 'work', 'other'],
    default: 'home'
  })
  addressType: string;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
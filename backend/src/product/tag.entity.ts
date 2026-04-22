import { User } from 'src/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid') // Using UUID is better for security/scaling than simple IDs
  id!: string;

  @Column({})
  name!: string;

  @ManyToMany(() => Product, (p) => p.tags)
  products!: Product[]
}

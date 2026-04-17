import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  designation: string;
}
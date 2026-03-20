import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({nullable: true})
  password: string;

  @Column({nullable:true})
  registartionToken: string;

  @Column({nullable: true})
  profile: string
}
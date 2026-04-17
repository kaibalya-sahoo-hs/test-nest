import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ApiLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  payload: string; // Store request body as string

  @CreateDateColumn()
  createdAt: Date;
}
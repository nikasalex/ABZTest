import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Position } from './position';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  phone: string;

  @CreateDateColumn({ nullable: false })
  registration_timestamp: Date;

  @Column({ nullable: false })
  photo: string;

  @ManyToOne(() => Position, (position) => position.user)
  position: Position;
}

import { Column, PrimaryGeneratedColumn, Entity,OneToMany } from 'typeorm';
import { User } from './user';

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(()=> User, (user)=> user.position)
  user: User[]
}

import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IUser } from '../../domain/entities/IUser.js';
import { Spend } from './Spend.js';

@Entity()
@Unique(['email'])
class User implements IUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn()
  registeredAt!: Date;

  // @OneToMany(() => Spend, (_) => _.user)
  // spends!: Promise<Spend[]>; 
}

export { User };

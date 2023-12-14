import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from './User.js';
import { ICategory } from '../../domain/entities/ICategory.js';

@Entity()
export class Category implements ICategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; 

  @JoinTable()
  @ManyToOne(() => User, { nullable: false })
  owner!: User;
}

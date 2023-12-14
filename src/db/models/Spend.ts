import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { ISpend } from '../../domain/entities/ISpend.js';
import { Currency } from '../../utils/currencies.js';
import { User } from './User.js';
import { Category } from './Category.js';

@Entity()
export class Spend implements ISpend {
  @PrimaryGeneratedColumn()
  id!: number;

  @JoinTable({ name: 'spend_to_user' })
  @ManyToOne(() => User, { nullable: false })
  user!: User;

  @Column()
  amount!: number;

  @Column({nullable: true})
  description! : string;

  @Column()
  currency!: Currency;

  @Column()
  date!: Date;

  @JoinTable({ name: 'spend_to_category' })
  @ManyToMany(() => Category, { cascade: true, eager: true })
  categories!: Category[];
}

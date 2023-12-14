import { Currency } from '../../utils/currencies.js';
import { ICategory } from './ICategory.js';
import { IUser } from './IUser.js';

export interface ISpend {
  id: number;
  user: IUser;
  amount: number;
  description: string;
  currency: Currency;
  date: Date;
  categories: ICategory[];
}

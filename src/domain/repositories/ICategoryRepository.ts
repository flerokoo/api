import { ICategory } from '../entities/ICategory.js';
import { IUser } from '../entities/IUser.js';

export interface ICategoryRepository {
  select(where: {}): Promise<ICategory[]>;
}

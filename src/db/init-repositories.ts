import { TypeOrmUserRepository } from './repositories/TypeOrmUserRepository.js';
import { User } from './models/User.js';
import { IUserRepository } from '../domain/repositories/IUserRepository.js';
import { Spend } from './models/Spend.js';
import { Category } from './models/Category.js';
import { TypeOrmSpendRepository } from './repositories/TypeOrmSpendRepository.js';
import { ISpendRepository } from '../domain/repositories/ISpendRepository.js';
import { DataSource } from 'typeorm';
import { ICategoryRepository } from '../domain/repositories/ICategoryRepository.js';
import { TypeOrmCategoryRepository } from './repositories/TypeOrmCategoryRepository.js';

export type ApplicationRepositories = {
  UserRepository: IUserRepository;
  SpendRepository: ISpendRepository;
  CategoryRepository: ICategoryRepository;
};

export async function initRepositories(ds: DataSource): Promise<ApplicationRepositories> {
  return {
    UserRepository: new TypeOrmUserRepository(ds.getRepository(User)),
    SpendRepository: new TypeOrmSpendRepository(ds.getRepository(Spend)),
    CategoryRepository: new TypeOrmCategoryRepository(ds.getRepository(Category))
  };
}

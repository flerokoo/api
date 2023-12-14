import { ApplicationRepositories } from '../db/init-repositories.js';
import { ICategoryRepository } from '../domain/repositories/ICategoryRepository.js';
import { IUser } from '../domain/entities/IUser.js';
import { ICategory } from '../domain/entities/ICategory.js';

export class CategoryService {
  repo: ICategoryRepository;

  constructor({ CategoryRepository }: ApplicationRepositories) {
    this.repo = CategoryRepository;
  }

  async listByUser(user: IUser): Promise<ICategory[]> {
    return await this.repo.select({ owner: user.id });
  }
}

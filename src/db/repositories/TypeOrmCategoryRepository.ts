import { Repository } from 'typeorm';
import { Category } from '../models/Category.js';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository.js';

export class TypeOrmCategoryRepository implements ICategoryRepository {
  constructor(private repo: Repository<Category>) {}

  async select(where: object) {
    return await this.repo.find({
      where
    });
  }
}

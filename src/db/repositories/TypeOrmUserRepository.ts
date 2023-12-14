import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { IUser } from '../../domain/entities/IUser.js';
import { User } from '../models/User.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';

export class TypeOrmUserRepository implements IUserRepository {
  constructor(private repo: Repository<User>) {}

  async insert(email: string, password: string): Promise<number> {
    const result = await this.repo.insert({ email, password });
    return result.identifiers[0].id as number;
  }

  async select(where: {}): Promise<IUser[]> {
    return await this.repo.findBy(where);
  }
}

import { Repository } from 'typeorm';
import { Spend } from '../models/Spend.js';
import { ISpend } from '../../domain/entities/ISpend.js';
import { ISpendRepository } from '../../domain/repositories/ISpendRepository.js';

export class TypeOrmSpendRepository implements ISpendRepository {
  constructor(private repo: Repository<Spend>) {}

  create(): ISpend {
    return this.repo.create();
  }

  async save(entities: ISpend[]): Promise<void> {
    const dbos = entities.map((_) => ({
      amount: _.amount,
      categories: _.categories,
      currency: _.currency,
      date: _.date,
      description: _.description,
      id: _.id,
      user: _.user
    }));

    await this.repo.save(dbos);
  }

  async select(where: object, limit?: number, offset?: number): Promise<ISpend[]> {
    return await this.repo.find({
      where,
      take: limit,
      skip: offset,
      order: {
        date: 'DESC'
      }
    });
  }
}

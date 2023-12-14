import { ISpendRepository } from '../domain/repositories/ISpendRepository.js';
import { Currency } from '../utils/currencies.js';
import { IUser } from '../domain/entities/IUser.js';
import { ICategory } from '../domain/entities/ICategory.js';
import { ApplicationRepositories } from '../db/init-repositories.js';
import { ValidationError } from '../utils/errors.js';

export class SpendService {
  repo: ISpendRepository;

  constructor({ SpendRepository }: ApplicationRepositories) {
    this.repo = SpendRepository;
  }

  async addSpend(description: string, amount: number, currency: Currency, user: IUser, date: Date, categories: ICategory[]) {
    if (amount < 0) {
      throw new ValidationError('Spend amount must be greater than 0');
    }

    if (isNaN(date.getTime())) {
      throw new ValidationError('Date incorrect');
    }

    if (Array.isArray(categories)) categories.forEach((_) => (_.owner = user));

    const spend = this.repo.create();
    spend.amount = amount;
    spend.description = description;
    spend.currency = currency;
    spend.user = user;
    spend.date = date;
    spend.categories = categories;
    await this.repo.save([spend]);
  }

  async listSpends(user: IUser, limit?: number, offset?: number) {
    return await this.repo.select({ user: user.id }, limit, offset);
  }
}

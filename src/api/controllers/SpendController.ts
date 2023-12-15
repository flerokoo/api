import { ApiDependencies } from '../server.js';
import { SpendService } from '../../services/SpendService.js';
import { getCurrentUser } from '../request-context.js';
import { z } from 'zod';
import { CurrencyList } from '../../utils/currencies.js';
import { Delete, Get, Post, Prefix } from '../../utils/Route.decorator.js';
import { IRequest } from '../../utils/Request.js';

const spendCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1)
});

const addSpendSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(CurrencyList),
  date: z.string().datetime(),
  description: z.string().optional(),
  categories: z.array(spendCategorySchema)
});

@Prefix('/v1/spends')
export class SpendController {
  service: SpendService;
  constructor({ SpendService }: ApiDependencies) {
    this.service = SpendService;
  }

  @Post('/add', { checkAuth: true, bodySchema: addSpendSchema })
  async addSpend(request : IRequest) {
    const { amount, currency, date, categories, description } = request.body;
    const user = getCurrentUser();
    await this.service.addSpend(description, amount, currency, user, new Date(date), categories);
    request.reply();
  }

  @Delete('/delete', { checkAuth: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteSpend(request : IRequest) {}

  @Get('/list', { checkAuth: true })
  async listSpends(request : IRequest) {
    const user = getCurrentUser();
    const { limit, offset } = request.body;
    const spends = await this.service.listSpends(user, limit, offset);
    request.reply({ spends });
  }
}

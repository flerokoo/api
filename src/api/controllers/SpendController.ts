import { Request, Response } from 'express';
import { ApiDependencies } from '../server.js';
import { success } from '../../utils/success.js';
import { SpendService } from '../../services/SpendService.js';
import { getCurrentUser } from '../request-context.js';
import { z } from 'zod';
import { CurrencyList } from '../../utils/currencies.js';
import { Delete, Get, Post } from '../../utils/Route.decorator.js';

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

export class SpendController {
  service: SpendService;
  constructor({ SpendService }: ApiDependencies) {
    this.service = SpendService;
  }

  @Post('/add', { checkAuth: true, bodySchema: addSpendSchema })
  async addSpend(req: Request, res: Response) {
    const { amount, currency, date, categories, description } = req.body;
    const user = getCurrentUser();
    await this.service.addSpend(description, amount, currency, user, new Date(date), categories);
    res.json(success());
  }

  @Delete('/delete', { checkAuth: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteSpend(req: Request, res: Response) {}

  @Get('/list', { checkAuth: true })
  async listSpends(req: Request, res: Response) {
    const user = getCurrentUser();
    const { limit, offset } = req.body;
    const spends = await this.service.listSpends(user, limit, offset);
    res.json(success({ spends }));
  }
}

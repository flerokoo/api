import { Request, Response } from 'express';
import { ApiDependencies } from '../server.js';
import { getCurrentUser } from '../request-context.js';
import { CategoryService } from '../../services/CategoryService.js';
import { success } from '../../utils/success.js';
import { Get } from '../../utils/Route.decorator.js';

export class CategoryController {
  service: CategoryService;

  constructor({ CategoryService }: ApiDependencies) {
    this.service = CategoryService;
  }

  @Get('/list', { checkAuth: true })
  async list(req: Request, res: Response) {
    const user = getCurrentUser();
    const categories = await this.service.listByUser(user);
    res.json(success({ categories }));
  }
}

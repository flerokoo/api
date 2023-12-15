import { ApiDependencies } from '../server.js';
import { getCurrentUser } from '../request-context.js';
import { CategoryService } from '../../services/CategoryService.js';
import { Get, Prefix } from '../../utils/Route.decorator.js';
import { IRequest } from '../../utils/Request.js';

@Prefix('/v1/categories')
export class CategoryController{
  service: CategoryService;

  constructor({ CategoryService }: ApiDependencies) {
    this.service = CategoryService;
  }

  @Get('/list', { checkAuth: true })
  async list(request: IRequest) {
    const user = getCurrentUser();
    const categories = await this.service.listByUser(user);
    request.reply({ categories });
  }
}

import { AuthService } from '../../services/AuthService.js';
import { ApiDependencies } from '../server.js';
import { z } from 'zod';
import { Post, Prefix } from '../../utils/Route.decorator.js';
import { IRequest } from '../../utils/Request.js';


const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5)
});

@Prefix('/v1/auth')
export class AuthController {
  service: AuthService;

  constructor({ AuthService }: ApiDependencies) {
    this.service = AuthService;
  }

  @Post('/register', { bodySchema: credentialsSchema })
  async register(request : IRequest) {
    const { email, password } = request.body;
    const token = await this.service.register(email, password);
    request.reply({ token });
  }

  @Post('/login', { bodySchema: credentialsSchema })
  async login(request: IRequest) {
    const { email, password } = request.body;
    const token = await this.service.login(email, password);
    request.reply({ token });
  }

}

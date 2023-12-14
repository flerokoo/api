import { Request, Response } from 'express';
import { AuthService } from '../../services/AuthService.js';
import { ApiDependencies } from '../server.js';
import { success } from '../../utils/success.js';
import { z } from 'zod';
import { Get, Post } from '../../utils/Route.decorator.js';
import { delay } from '../../utils/delay.js';
export const AUTH_COOKIE_NAME = 'TOKEN';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5)
});

export class AuthController {
  service: AuthService;

  constructor({ AuthService }: ApiDependencies) {
    this.service = AuthService;
  }

  @Post('/register', { bodySchema: credentialsSchema })
  async register(req: Request, res: Response) {
    const { email, password } = req.body;
    const token = await this.service.register(email, password);
    res.json(success({ token }));
  }

  @Post('/login', { bodySchema: credentialsSchema })
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const token = await this.service.login(email, password);
    res.json(success({ token }));
  }

  @Get('/timeout')
  async timeout(req: Request, res: Response) {
    await delay(20);
    res.end();
  }
}

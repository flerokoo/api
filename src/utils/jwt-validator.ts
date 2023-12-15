import { IUser } from '../domain/entities/IUser.js';
import { AuthService } from '../services/AuthService.js';

export type JwtTokenValidator = {
  (token: string): IUser;
};

export const createJwtValidator =
  (service: AuthService): JwtTokenValidator =>
  (token: string) => {
    const user = service.verifyJwt(token) as IUser;
    return user;
  };

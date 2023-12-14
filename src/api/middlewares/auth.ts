import { Request, Response } from 'express';
import { IUser } from '../../domain/entities/IUser.js';
import { AuthenticationError, AuthorizationError } from '../../utils/errors.js';
import { ApplicationServices } from '../../services/init-services.js';
import { handleError } from '../server.js';
import { hasCurrentUser, setCurrentUser } from '../request-context.js';

export const createAuthenticator =
  ({ AuthService }: ApplicationServices) =>
  (req: Request, res: Response, next: () => void) => {
    const token = req.header('Authorization');

    if (!token) {
      next();
      return;
    }

    try {
      const user = AuthService.verifyJwt(token) as IUser;
      setCurrentUser(user);
      next();
    } catch (err) {
      handleError(new AuthenticationError('Token is not valid'), res);
    }
  };

export const checkAuth = async (req: Request, res: Response, next: () => void) => {
  if (!hasCurrentUser()) {
    handleError(new AuthorizationError('No access token found, not authorized'), res);
    return;
  }
  next();
};

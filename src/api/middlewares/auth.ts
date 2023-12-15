import { Request, Response } from 'express';
import { IUser } from '../../domain/entities/IUser.js';
import { AuthenticationError, AuthorizationError } from '../../utils/errors.js';
import { ApplicationServices } from '../../services/init-services.js';
import { handleError } from '../server.js';
import { hasCurrentUser, setCurrentUser } from '../request-context.js';
import { JwtTokenValidator } from '../../utils/jwt-validator.js';

export const createAuthenticatorMiddlware =
  (validateToken: JwtTokenValidator) =>
  (req: Request, res: Response, next: () => void) => {
    const token = req.header('Authorization');

    if (!token) {
      next();
      return;
    }

    try {
      const user = validateToken(token);
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

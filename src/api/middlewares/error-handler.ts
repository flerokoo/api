import { Request, Response } from 'express';
import { handleError } from '../server.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, next: () => void) {
  handleError(err, res);
}

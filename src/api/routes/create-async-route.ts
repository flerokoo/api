import { handleError } from '../server.js';
import { Request, Response } from 'express';

// wrapper for async rejections handling within express app
export function createAsyncRoute(handler: (req: Request, res: Response, next: () => void) => Promise<void>) {
  return async (req: Request, res: Response, next: () => void) => {
    try {
      await handler(req, res, next);
    } catch (err: unknown) {
      handleError(err instanceof Error ? err : new Error(JSON.stringify(err)), res);
    }
  };
}

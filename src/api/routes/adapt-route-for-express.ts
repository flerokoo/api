import { ExpressRequest, IRequest } from '../../utils/Request.js';
import { handleError } from '../server.js';
import { Request, Response } from 'express';

// wrapper for async rejections handling within express app
export function adaptRouteForExpress(handler: (req: IRequest) => Promise<void>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (req: Request, res: Response, next: () => void) => {
    try {
      const request = new ExpressRequest(req, res);
      await handler(request);
    } catch (err: unknown) {
      handleError(err instanceof Error ? err : new Error(JSON.stringify(err)), res);
    }
  };
}

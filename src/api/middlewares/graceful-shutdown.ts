import { Request, Response } from 'express';
import { IGracefulShutdownHandler } from '../../utils/graceful-shutdown.js';
import { handleError } from '../server.js';
import { ServiceUnavailableError } from '../../utils/errors.js';
import { delay } from '../../utils/delay.js';
import { logger } from '../../utils/logger.js';

export function createGracefulShutdownMiddleware(handler: IGracefulShutdownHandler) {
  const runningRequests = new Set();

  handler.onShutdown(
    async () => {
      logger.info('waiting for ongoing requests to end...');
      while (runningRequests.size > 0) {
        await delay(1);
        logger.info(`still have ${runningRequests.size} requests to handle`);
      }
      logger.info('all requests ended');
    },
    {
      blocking: true,
      priority: 999
    }
  );

  return (req: Request, res: Response, next: () => void) => {
    // decline all new requests if app is shutting down
    if (handler.isShuttingDown()) {
      handleError(new ServiceUnavailableError('Maintenance'), res);
      return;
    }

    // keep track of running requests and wait for them to finish during shutdown
    runningRequests.add(req);
    const detach = () => runningRequests.delete(req);
    res.on('close', detach);
    res.on('error', detach);

    next();
  };
}

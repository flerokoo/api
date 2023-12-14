import express, { Response } from 'express';
import { ApplicationServices } from '../services/init-services.js';
import { ApplicationError, HTTP_NOT_FOUND } from '../utils/errors.js';
import https from 'node:https';
import http from 'node:http';
import { IGracefulShutdownHandler } from '../utils/graceful-shutdown.js';
import { logger } from '../utils/logger.js';
import { configureExpress } from './configure-express-app.js';
import config from '../config.js';
import { readFileSync } from 'node:fs';

export type ApiDependencies = ApplicationServices;

export async function initServer(services: ApplicationServices, gracefulShutdownHandler: IGracefulShutdownHandler) {
  const port = parseInt(process.env.PORT!);
  const app = express();
  configureExpress(app, services, gracefulShutdownHandler);

  const server = config.https ? createHttpsServer(app) : createHttpServer(app);

  gracefulShutdownHandler.onShutdown(() => {
    logger.info('closing server...');
    return new Promise((resolve) => {
      logger.info('server closed');
      server.close(() => resolve());
    });
  });

  return new Promise((resolve: (a?: unknown) => void) => {
    server.listen(port, () => resolve(server));
  });
}

function createHttpServer(app: express.Application) {
  return http.createServer(app);
}

function createHttpsServer(app: express.Application) {
  return https.createServer(
    {
      cert: readFileSync(config.certPath),
      key: readFileSync(config.keyPath)
    },
    app
  );
}

export function handleError(err: Error, res: Response) {
  const status = err instanceof ApplicationError ? err.status : HTTP_NOT_FOUND;
  const payload = err instanceof ApplicationError ? err.payload : undefined;
  const message = err.message ?? err.name ?? 'Unknown error';
  res.status(status).json({ status: 'error', message, payload });
  logger.error(message);
}

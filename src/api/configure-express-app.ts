import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { errorHandler } from './middlewares/error-handler.js';
import compression from 'compression';
import { createAuthenticator } from './middlewares/auth.js';
import cookieParser from 'cookie-parser';
import { ApplicationServices } from '../services/init-services.js';
import { createRoutes } from './routes/index.js';
import { setRequestContext } from './middlewares/set-request-context.js';
import { IGracefulShutdownHandler } from '../utils/graceful-shutdown.js';
import { createGracefulShutdownMiddleware } from './middlewares/graceful-shutdown.js';
import { logMiddleware } from './middlewares/log.js';

export function configureExpress(
  app: express.Application,
  services: ApplicationServices,
  gracefulShutdownHandler: IGracefulShutdownHandler
) {
  app.use(helmet());
  app.use(createGracefulShutdownMiddleware(gracefulShutdownHandler));
  app.use(compression());
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true, parameterLimit: 50000 }));
  app.use(cookieParser());
  app.use(logMiddleware);
  app.use(setRequestContext);
  app.use(createAuthenticator(services));
  createRoutes(app, services);
  app.use(errorHandler); // handle sync errors
}

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { errorHandler } from './middlewares/error-handler.js';
import compression from 'compression';
import { createAuthenticatorMiddlware } from './middlewares/auth.js';
import cookieParser from 'cookie-parser';
import { createRoutes } from './routes/index.js';
import { setRequestContext } from './middlewares/set-request-context.js';
import { IGracefulShutdownHandler } from '../utils/graceful-shutdown.js';
import { createGracefulShutdownMiddleware } from './middlewares/graceful-shutdown.js';
import { logMiddleware } from './middlewares/log.js';
import { IController } from './controllers/index.js';
import { JwtTokenValidator } from '../utils/jwt-validator.js';
import { createIntrospectRoute } from './routes/create-introspect-route.js';

export function configureExpress(
  app: express.Application,
  controllers: IController[],
  jwtValidator : JwtTokenValidator,
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
  app.use(createAuthenticatorMiddlware(jwtValidator));
  createRoutes(app, controllers);
  app.use(errorHandler); // handle sync errors
  createIntrospectRoute(app, controllers);
}

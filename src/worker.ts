import 'reflect-metadata';
import { initRepositories } from './db/init-repositories.js';
import { initServices } from './services/init-services.js';
import { initServer } from './api/server.js'; 
import { initDataSource } from './db/init-data-source.js';
import { gracefulShutdownHandler as gsHandler } from './utils/graceful-shutdown.js';
import { logger } from './utils/logger.js';
import config from './config.js';
import { initControllers } from './api/controllers/index.js';
import { createJwtValidator } from './utils/jwt-validator.js';


(async () => {
  const ds = await initDataSource(gsHandler);
  const repositories = await initRepositories(ds);
  const services = await initServices(repositories);
  const controllers = await initControllers(services);
  const jwtValidator = createJwtValidator(services.AuthService);
  await initServer(controllers, jwtValidator, gsHandler);
  gsHandler.enable();
  logger.info('ready');
})();

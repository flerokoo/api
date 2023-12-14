import 'reflect-metadata';
import dotenv from 'dotenv-safe';
import { initRepositories } from './db/init-repositories.js';
import { initServices } from './services/init-services.js';
import { initServer } from './api/server.js';
import { initDataSource } from './db/init-data-source.js';
import { gracefulShutdownHandler } from './utils/graceful-shutdown.js';
import { logger } from './utils/logger.js';

dotenv.config();

(async () => {
  const ds = await initDataSource(gracefulShutdownHandler);
  const repositories = await initRepositories(ds);
  const services = await initServices(repositories);
  await initServer(services, gracefulShutdownHandler);
  gracefulShutdownHandler.enable();
  logger.info('ready');
})();

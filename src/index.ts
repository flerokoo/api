import 'reflect-metadata';
import dotenv from 'dotenv-safe';
import config from './config.js';
import { logger } from './utils/logger.js';
dotenv.config();

if (config.useCluster) {
  logger.info('starting in cluster configuration, num workers ' + config.workers);
  import('./cluster.js');
} else {
  logger.info('starting in single threaded configuration');
  import('./worker.js');
}

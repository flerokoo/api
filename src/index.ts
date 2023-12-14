import 'reflect-metadata';
import dotenv from 'dotenv-safe';
import config from './config.js';
import { logger } from './utils/logger.js';
dotenv.config( { allowEmptyValues: true });

if (config.cluster.enabled) {
  logger.info('starting in cluster configuration, num workers ' + config.cluster.workers);
  import('./cluster.js');
} else {
  logger.info('starting in single threaded configuration');
  import('./worker.js');
}

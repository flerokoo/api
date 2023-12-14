import { DataSource } from 'typeorm';
import { isProduction } from '../utils/is-production.js';
import { IGracefulShutdownHandler } from '../utils/graceful-shutdown.js';
import config from '../config.js';
import { logger } from '../utils/logger.js';

export async function initDataSource(gracefulShutdownHandler: IGracefulShutdownHandler): Promise<DataSource> {
  const ds = new DataSource({
    type: config.database.driver as ('sqlite' | 'postgres'),
    database: process.env.DATABASE as string,
    entities: ['./build/db/models/*'],
    synchronize: !isProduction()
  });
  await ds.initialize();
  // await ds.synchronize(true);

  gracefulShutdownHandler.onShutdown(async () => {
    logger.info('destroying data source...');
    await ds.destroy();
    logger.info('data source destroyed');
  });

  return ds;
}

import config from '../config.js';
import { delay } from './delay.js';
import { logger } from './logger.js';

type ShutdownCallback = {
  priority: number;
  blocking: boolean;
  fn: (() => void) | (() => Promise<void>);
};

type ShutdownCallbackOpts = {
  blocking?: boolean;
  priority?: number;
};

let enabled = false;
let shuttingDown = false;
const onShutdownCallbacks: ShutdownCallback[] = [];

function enable() {
  if (enabled || shuttingDown) return;

  const logAndShutdown = (err: Error) => {
    logger.error(err.message);
    shutdown();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('uncaughtException', logAndShutdown);
  process.on('unhandledRejection', logAndShutdown);
  enabled = true;
}

const MIN_SHUTDOWN_TIME = 1;

function onShutdown(fn: () => Promise<void>, params?: ShutdownCallbackOpts): void {
  onShutdownCallbacks.push({
    fn,
    blocking: Boolean(params?.blocking),
    priority: typeof params?.priority === 'number' ? params.priority : 0
  });
}

async function shutdown() {
  if (shuttingDown) return;
  logger.info('shutting down...');
  shuttingDown = true;

  const timeout = Math.max(MIN_SHUTDOWN_TIME, config.maxShutdownTime);
  delay(timeout).then(() => {
    logger.warn('something prevents process from exiting, killing');
    process.exit(1);
  });

  const callbacks = onShutdownCallbacks.sort((a, b) => b.priority - a.priority);
  const nonBlockingPromises: Promise<void>[] = [];
  for (const callback of callbacks) {
    const promise = callback.fn();
    if (promise instanceof Promise && callback.blocking) {
      if (callback.blocking) {
        await promise.catch((err: Error) => {
          logger.error('error when shutting down: ' + err.message);
        });
      } else {
        nonBlockingPromises.push(promise);
      }
    }
  }
  await Promise.allSettled(nonBlockingPromises);
  await delay(MIN_SHUTDOWN_TIME);
  logger.info('everything seems ok, exiting now');
  process.exit(0);
}

function isShuttingDown() {
  return shuttingDown;
}

export interface IGracefulShutdownHandler {
  onShutdown(callback: () => Promise<void>, params?: ShutdownCallbackOpts): void;
  enable(): void;
  isShuttingDown(): boolean;
}

export const gracefulShutdownHandler: IGracefulShutdownHandler = {
  enable,
  onShutdown,
  isShuttingDown
};

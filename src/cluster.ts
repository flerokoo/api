import 'reflect-metadata';
import dotenv from 'dotenv-safe';
import { gracefulShutdownHandler } from './utils/graceful-shutdown.js';
import { logger } from './utils/logger.js';
import cluster, { Worker } from 'cluster';
import config from './config.js';
import { delay } from './utils/delay.js';
import { Readable } from 'node:stream';
import path from 'node:path';

dotenv.config();

cluster.setupPrimary({
  exec: path.join('./build/worker.js'),
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
});

const workers: Worker[] = [];

const onWorkerExit = (id: number) => (code: number) => {
  if (code !== 0) {
    logger.warn(`worker ${id} exited with code ${code}, restarting..`);
    startWorker(id);
  } else {
    workers.splice(id, 1);
  }
};

const attachToStdio = (id: number | string | undefined, readable: Readable, callback: (s: string) => void) => {
  readable.on('data', (chunk: Buffer) => {
    const msg = chunk.toString('utf-8').trimEnd();
    callback(`worker ${id}: ` + msg);
  });
};

const startWorker = (id: number) => {
  const worker = cluster.fork();
  worker.on('exit', onWorkerExit(id));
  attachToStdio(id, worker.process.stdout as Readable, (_) => logger.info(_));
  attachToStdio(id, worker.process.stderr as Readable, (_) => logger.error(_));
  workers[id] = worker;
  logger.info(`started worker ${id}, pid=${worker.process.pid}`);
};

for (let i = 0; i < config.workers; i++) {
  startWorker(i);
}

gracefulShutdownHandler.onShutdown(
  async () => {
    workers.forEach((w) => w.disconnect());
    logger.info('waiting for workers to shut down...');
    while (workers.some((w) => !w.isDead())) {
      await delay(1);
    }
    logger.info('workers are done...');
  },
  { blocking: true }
);

gracefulShutdownHandler.enable();

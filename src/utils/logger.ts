import winston from 'winston';
import { isProduction } from './is-production.js';
import path from 'node:path';
import config from '../config.js';
import cluster from 'cluster';
const format = winston.format;

const logPath = (filename: string) => path.join(config.logDir, filename);

const transports = cluster.isPrimary
  ? [
      new winston.transports.File({ filename: logPath('error.log'), level: 'error' }),
      new winston.transports.File({ filename: logPath('log.log') })
    ]
  : [
      new winston.transports.Stream({
        stream: process.stdout,
        format: format.printf((_) => _.message)
      }),
      new winston.transports.Stream({
        stream: process.stderr,
        level: 'error',
        format: format.printf((_) => _.message)
      })
    ];

const winstonLogger = winston.createLogger({
  level: 'info',
  format: format.combine(format.json(), format.timestamp()),
  defaultMeta: { service: 'api' },
  transports
});

if (!isProduction() && cluster.isPrimary) {
  winstonLogger.add(
    new winston.transports.Console({
      format: format.combine(format.colorize(), format.cli())
    })
  );
}

const logger = {
  info: (msg: string) => winstonLogger.info(msg),
  warn: (msg: string) => winstonLogger.warn(msg),
  error: (msg: string) => winstonLogger.error(msg)
};

export { logger };

import { Request, Response } from 'express';
import { logger } from '../../utils/logger.js';

export function logMiddleware(req: Request, res: Response, next: () => void) {
  const logOnFinish = () => {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${req.ip}`;
    logger.info(message);
  };

  res.on('finish', logOnFinish);

  next();
}

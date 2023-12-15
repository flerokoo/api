import { IController } from '../controllers/index.js';
import { createRouterFromMetadata } from './create-router-from-metadata.js';
import type express from 'express';

export function createRoutes(
  app: express.Application,
  controllers: IController[]
) {
  for (const controller of controllers) {
    const router = createRouterFromMetadata(controller);
    app.use(router);
  }
}

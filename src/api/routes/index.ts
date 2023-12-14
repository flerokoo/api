import { ApiDependencies } from '../server.js';
import { AuthController } from '../controllers/AuthController.js';
import { SpendController } from '../controllers/SpendController.js';
import { CategoryController } from '../controllers/CategoryController.js';
import { createRouterFromMetadata } from './create-router-from-metadata.js';
import type express from 'express';

const controllers = {
  '/v1/auth': AuthController,
  '/v1/spends': SpendController,
  '/v1/categories': CategoryController
};

export function createRoutes(app: express.Application, dependecies: ApiDependencies) {
  for (const [pathPrefix, constr] of Object.entries(controllers)) {
    const controller = new constr(dependecies);
    const router = createRouterFromMetadata(controller);
    app.use(pathPrefix, router);
  }
}

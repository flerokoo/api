import { getControllerMetadata } from '../../utils/Route.decorator.js';
import express from 'express';
import { adaptRouteForExpress } from './adapt-route-for-express.js';
import { checkAuth as checkAuthMiddleware } from '../middlewares/auth.js';
import pathModule from 'node:path';

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export function createRouterFromMetadata(obj: any) {
  const { prefix, routes } = getControllerMetadata(obj.constructor.prototype);
  const router = express.Router();

  for (const { method, path, propertyKey, params } of routes) {
    const fn = obj[propertyKey];

    if (typeof fn !== 'function') {
      throw new Error(`${obj.constructor.name}.${propertyKey} is not a valid controller method`);
    }

    const callbacks = [adaptRouteForExpress(fn.bind(obj))];

    if (params?.checkAuth) {
      callbacks.unshift(checkAuthMiddleware);
    }

    const pathWithPrefix = pathModule.join(prefix, path);
    router[method](pathWithPrefix, ...callbacks);
  }

  return router;
}

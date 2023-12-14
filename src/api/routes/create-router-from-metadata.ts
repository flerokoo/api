import { getControllerMethods } from '../../utils/Route.decorator.js';
import express from 'express';
import { createAsyncRoute } from './create-async-route.js';
import { checkAuth } from '../middlewares/auth.js';

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export function createRouterFromMetadata(obj: any) {
  const routes = getControllerMethods(obj.constructor.prototype);
  const router = express.Router();

  for (const { method, path, propertyKey, params } of routes) {
    const fn = obj[propertyKey];

    if (typeof fn !== 'function') {
      throw new Error(`${obj.constructor.name}.${propertyKey} is not a valid controller method`);
    }

    const callbacks = [createAsyncRoute(fn.bind(obj))];

    if (params?.checkAuth) {
      callbacks.unshift(checkAuth);
    }

    router[method](path, createAsyncRoute(fn.bind(obj)));
  }

  return router;
}

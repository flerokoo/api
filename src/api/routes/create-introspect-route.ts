import express from 'express';
import { IController } from '../controllers/index.js';
import path from 'node:path';
import { getControllerMetadata } from '../../utils/Route.decorator.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { NotFoundError } from '../../utils/errors.js';
import { handleError } from '../server.js';

export function createIntrospectRoute(
  app: express.Application,
  controllers: IController[]
) {
  const schemas: { [key: string]: unknown } = {};

  for (const contr of controllers) {
    const { routes, prefix } = getControllerMetadata(contr.constructor.prototype);
    for (const route of routes) {
      const fullPath = path.join(prefix, route.path);
      const bodySchema = route.params.bodySchema;
      const jsonSchema = bodySchema ? zodToJsonSchema(bodySchema) : '';
      console.log(fullPath)
      schemas[fullPath] = jsonSchema;
    }
  }

  app.get('/introspect', (req, res) => {
    res.json(schemas);
  });

  app.get('/introspect/*', (req, res) => {
    const url = req.url.replace(/^\/introspect/gi, '');
    const schema = schemas[url];
    if (!schema) {
      handleError(new NotFoundError(`No schema: ${url}`), res);
      return;
    }
    res.json(schema);
  });
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from './errors.js';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

const ROUTE_PREFIX_META_KEY = '__routeprefix__';
const ROUTE_META_KEY = '__route__';

export type RouteParams = {
  checkAuth?: boolean;
  bodySchema?: ZodTypeAny;
  // paramsSchema?: ZodTypeAny;
  // querySchema?: ZodTypeAny;
};

export type RouteDefinition = {
  path: string;
  method: HttpMethod;
  propertyKey: string;
  params: RouteParams;
};

export type ControllerMetadata = {
  prefix: string,
  routes: RouteDefinition[]
}

export function Prefix(prefix: string) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function) {
    Reflect.defineMetadata(ROUTE_PREFIX_META_KEY, prefix, target.prototype);
  };
}

function Route(method: HttpMethod, path: string, params?: RouteParams) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  return function (
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    Reflect.defineMetadata(
      ROUTE_META_KEY,
      { method, path, propertyKey, params },
      target,
      propertyKey
    );

    const original: (req: Request, res: Response, next: () => void) => void =
      descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: () => void) {
      const tasks: [keyof Request, ZodTypeAny | undefined][] = [
        ['body', params?.bodySchema],
        // ['params', params?.paramsSchema],
        // ['query', params?.querySchema]
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues: any = {};
      let errorFound = false;

      for (const [name, schema] of tasks) {
        const obj = req[name];
        if (!obj || !schema) continue;
        const result = await schema.safeParseAsync(obj);
        if (!result.success) {
          issues[name] = result.error.issues;
          errorFound = true;
        }
      }

      if (errorFound) {
        throw new ValidationError('Validation Error', issues);
      }

      return original.call(this, req, res, next);
    };
  };
}

export function Post(path: string, params?: RouteParams) {
  return Route('post', path, params);
}

export function Get(path: string, params?: RouteParams) {
  return Route('get', path, params);
}

export function Delete(path: string, params?: RouteParams) {
  return Route('delete', path, params);
}

export function Put(path: string, params?: RouteParams) {
  return Route('put', path, params);
}

export function getControllerMetadata(proto: object): ControllerMetadata {
  const methodsWithMetadata = [];

  for (const propertyName of Object.getOwnPropertyNames(proto)) {
    if (propertyName === 'constructor') {
      continue;
    }

    const meta = Reflect.getMetadata(ROUTE_META_KEY, proto, propertyName);

    if (meta) {
      methodsWithMetadata.push(meta);
    }
  }

  const prefix : string = Reflect.getMetadata(ROUTE_PREFIX_META_KEY, proto) ?? "/";

  return {
    routes: methodsWithMetadata,
    prefix
  }
}

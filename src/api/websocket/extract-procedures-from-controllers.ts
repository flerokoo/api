import { RouteParams, getControllerMetadata } from '../../utils/Route.decorator.js';
import path from 'path';
import { WsRoute } from './create-websocket-server.js';
import { WsMessage, wsError } from './create-websocket-server.js';
import { WebSocket } from 'ws';
import { WebsocketRequest } from '../../utils/Request.js';
import { setCurrentUser } from '../request-context.js';
import { JwtTokenValidator } from '../../utils/jwt-validator.js';
import { IController } from '../controllers/index.js';

export function extractProceduresFromControllers(
  controllers: IController[],
  tokenValidator: JwtTokenValidator
) {
  const output = new Map<string, WsRoute>();
  for (const contr of controllers) {
    const { routes, prefix } = getControllerMetadata(contr.constructor.prototype);
    for (const route of routes) {
      const fullPath = path.join(prefix, route.path);
      const method = createWebsocketProcedure(
        contr,
        route.propertyKey,
        route.params,
        tokenValidator
      );
      output.set(fullPath, method);
    }
  }
  return output;
}

export function createWebsocketProcedure(
  contr: IController,
  methodKey: string,
  { bodySchema, checkAuth }: RouteParams,
  tokenValidator: JwtTokenValidator
) {
  const fn = contr[methodKey];
  if (typeof fn !== 'function') {
    throw new Error(`${methodKey} is not a function, cant create ws method`);
  }

  return async function (msg: WsMessage, ws: WebSocket) {
    if (checkAuth) {
      if (!msg.token) {
        ws.send(wsError('Token is required for this procedure'));
        return;
      }

      try {
        const user = tokenValidator(msg.token);
        console.log(user);
        setCurrentUser(user);
      } catch (err) {
        ws.send(wsError('Invalid token'));
      }
    }

    if (bodySchema) {
      await bodySchema.parseAsync(msg.body);
    }

    const request = new WebsocketRequest(msg.nonce, msg.body, ws);
    await contr[methodKey](request);
  };
}

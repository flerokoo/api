import { RawData, WebSocket, WebSocketServer } from 'ws';
import { AnyServer } from '../server.js';
import z, { ZodError } from 'zod';
import { RouteParams, getControllerMetadata } from '../../utils/Route.decorator.js';
import { JwtTokenValidator } from '../../utils/jwt-validator.js';
import { logger } from '../../utils/logger.js';
import { IController } from '../controllers/index.js';
import path from 'path';
import { WebsocketRequest } from '../../utils/Request.js';
import { runRequestWithinContext, setCurrentUser } from '../request-context.js';
import { AuthenticationError } from '../../utils/errors.js';

type WsMessage = {
  method: string;
  nonce: string;
  body?: any;
  token?: string;
};

type WsRoute = {
  (msg: WsMessage, ws: WebSocket): Promise<void>;
};

const wsProtocolMessageSchema = z.object({
  method: z.string().min(1),
  body: z.any().optional(),
  nonce: z.string().uuid(),
  token: z.string().min(20).optional()
});

const wsError = (message: string, payload?: object) =>
  JSON.stringify({
    status: 'error',
    message,
    payload
  });

export function createWebSocketServer(
  server: AnyServer,
  controllers: IController[],
  jwtValidator: JwtTokenValidator
) {
  const wss = new WebSocketServer({ server });
  const procedures = extractProceduresFromControllers(controllers, jwtValidator);
  wss.on('error', (err) => logger.error(err.message));
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data) => onMessage(ws, data, procedures));
  });

  return wss;
}

async function onMessage(ws: WebSocket, raw: RawData, procedures: Map<string, WsRoute>) {
  try {
    const message = await validateMessage(raw);
    const proc = procedures.get(message.method);

    if (!proc) {
      throw new Error('Procedure not found: ' + message.method);
    }

    runRequestWithinContext({}, () => {
      proc(message, ws);
    });
  } catch (err) {
    if (err instanceof ZodError) {
      ws.send(wsError('Validation Error', err.issues));
    } else {
      ws.send(wsError(err instanceof Error ? err.message : 'Unknown error'));
    }
  }
}

async function validateMessage(raw: RawData): Promise<WsMessage> {
  const obj = JSON.parse(raw.toString());
  const message = await wsProtocolMessageSchema.parseAsync(obj);
  message.body ??= {};
  return message;
}

function extractProceduresFromControllers(
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

function createWebsocketProcedure(
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
        console.log(user)
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

import { RawData, WebSocket, WebSocketServer } from 'ws';
import { AnyServer } from '../server.js';
import z, { ZodError } from 'zod';
import { JwtTokenValidator } from '../../utils/jwt-validator.js';
import { logger } from '../../utils/logger.js';
import { IController } from '../controllers/index.js';
import { runRequestWithinContext } from '../request-context.js';
import { extractProceduresFromControllers } from './extract-procedures-from-controllers.js';

export type WsMessage = {
  method: string;
  nonce: string;
  body?: any;
  token?: string;
};

export type WsRoute = {
  (msg: WsMessage, ws: WebSocket): Promise<void>;
};

const wsProtocolMessageSchema = z.object({
  method: z.string().min(1),
  body: z.any().optional(),
  nonce: z.string().uuid(),
  token: z.string().min(20).optional()
});

export const wsError = (message: string, payload?: object) =>
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



import { Request, Response } from 'express';
import { WebSocket } from 'ws';
import { success } from './success.js';

export interface IRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get body(): any;
  reply: (body?: object) => void;
}

export class ExpressRequest implements IRequest {
  constructor(
    private req: Request,
    private res: Response
  ) {}

  get body() {
    return this.req.body;
  }

  reply(body?: object) {
    this.res.json(success(body));
  }
}

export class WebsocketRequest implements IRequest {
  constructor(
    private nonce: string,
    private messageBody: object,
    private ws: WebSocket
  ) {}

  get body() {
    return this.messageBody;
  }

  reply(body?: object) {
    this.ws.send(JSON.stringify({
      ...success(body),
      nonce: this.nonce
    }));
  }
}

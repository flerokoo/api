import { Request, Response } from "express";
import { runRequestWithinContext } from "../request-context.js";

export function setRequestContext(req: Request, res: Response, next: () => void) {
  runRequestWithinContext({}, next);
}

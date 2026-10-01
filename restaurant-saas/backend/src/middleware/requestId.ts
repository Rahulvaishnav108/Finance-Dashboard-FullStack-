import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { Headers } from '../utils/constants';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const headerValue = req.header(Headers.REQUEST_ID) ?? req.header('x-request-id');
  const id = headerValue && headerValue.trim() ? headerValue : randomUUID();

  req.requestId = id;
  res.setHeader(Headers.REQUEST_ID, id);

  next();
}

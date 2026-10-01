import type { NextFunction, Request, Response } from 'express';

export function sessionGuard(_req: Request, _res: Response, next: NextFunction): void {
  next();
}

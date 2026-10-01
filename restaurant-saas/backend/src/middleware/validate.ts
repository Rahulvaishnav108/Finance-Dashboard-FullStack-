import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

type ValidationSchemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

type ValidationInput = ZodTypeAny | ValidationSchemas;

function isZodSchema(value: ValidationInput): value is ZodTypeAny {
  return typeof (value as ZodTypeAny).safeParse === 'function';
}

export function validate(schemas: ValidationInput) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (isZodSchema(schemas)) {
        const result = await schemas.parseAsync({
          body: req.body,
          params: req.params,
          query: req.query,
        });

        req.body = result.body;
        req.params = result.params;
        req.query = result.query;
        next();
        return;
      }

      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as typeof req.query;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as typeof req.params;
      }

      next();
    } catch (error) {
      next(error as Error);
    }
  };
}

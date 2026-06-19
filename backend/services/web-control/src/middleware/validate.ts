import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const target = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const result = schema.safeParse(target);
    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors;
      res.status(400).json({ success: false, message: 'Validation failed', errors });
      return;
    }
    if (source === 'body') req.body = result.data;
    else if (source === 'query') req.query = result.data as typeof req.query;
    else req.params = result.data as typeof req.params;
    next();
  };
}

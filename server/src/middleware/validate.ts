import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(422).json({
          success: false,
          message: 'Validation failed. Please check your input.',
          data: null,
          errors: messages,
        });
        return;
      }
      next(error);
    }
  };
}

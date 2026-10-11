import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

// Parses and replaces req.body / req.query / req.params with the validated values.
// req.query is a getter in Express 5, so it has to be redefined instead of assigned.
export const validate =
  ({ body, query, params }: Schemas): RequestHandler =>
  (req, _res, next) => {
    if (params) req.params = params.parse(req.params) as typeof req.params;
    if (query) {
      Object.defineProperty(req, 'query', {
        value: query.parse(req.query),
        writable: true,
        enumerable: true,
      });
    }
    if (body) req.body = body.parse(req.body);
    next();
  };

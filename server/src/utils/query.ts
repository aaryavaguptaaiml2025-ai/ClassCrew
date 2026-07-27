import type { Request } from 'express';

export function getQueryString(req: Request, key: string): string | undefined {
  const val = req.query[key];
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

import type { MiddlewareHandler } from 'hono';
import type { AuthContext } from '../context.js';
import { UnauthorizedError } from '../error.js';

export const authenticated: MiddlewareHandler<AuthContext> = async (
  c,
  next
) => {
  await next();
};

export const unauthenticated: MiddlewareHandler<AuthContext> = () => {
  return Promise.reject(new UnauthorizedError());
};

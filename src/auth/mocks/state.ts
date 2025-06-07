import type { MiddlewareHandler } from 'hono';
import type { AuthContext } from '../context.js';

export const createMockAuthState: MiddlewareHandler<AuthContext> = async (
  c,
  next
) => {
  await next();
};

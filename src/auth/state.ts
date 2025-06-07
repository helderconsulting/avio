import type { MiddlewareHandler } from 'hono';
import { createAuth } from '../lib/auth.js';
import type { AuthContext } from './context.js';
import { AuthService } from './service.js';

export const createAuthState: MiddlewareHandler<AuthContext> = async (
  c,
  next
) => {
  const db = c.get('db');
  const auth = createAuth(db);

  const authService = new AuthService(auth);
  c.set('authService', authService);

  await next();
};

export const authGuard: MiddlewareHandler<AuthContext> = async (c, next) => {
  const service = c.get('authService');
  await service.whoAmI(c.req.raw.headers);
  await next();
};

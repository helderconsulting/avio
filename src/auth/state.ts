import type { MiddlewareHandler } from 'hono';
import type { AuthContext } from './context.js';
import { AuthService } from './service.js';

export const createAuthState: MiddlewareHandler<AuthContext> = async (
  c,
  next
) => {
  const auth = c.get('auth');
  const service = new AuthService(auth);
  c.set('authService', service);
  await next();
};

export const authGuard: MiddlewareHandler<AuthContext> = async (c, next) => {
  const service = c.get('authService');
  await service.whoAmI(c.req.raw.headers);
  await next();
};

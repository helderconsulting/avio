import type { MiddlewareHandler } from 'hono';
import type { AuthContext } from './context.js';
import { AuthService } from './service.js';

export const createAuthState: MiddlewareHandler<AuthContext> = async (
  c,
  next
) => {
  const auth = c.get('auth');
  const service = c.get('service');
  if (!service) {
    c.set('service', new AuthService(auth));
  }

  const user = await service.whoAmI(c.req.raw.headers);
  c.set('user', user);
  await next();
};

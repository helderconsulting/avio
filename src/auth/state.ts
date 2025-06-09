import type { Context, MiddlewareHandler } from 'hono';
import { AppError } from '../error.js';
import { createAuth } from '../lib/auth.js';
import type { AuthContext, PartialAuthContext } from './context.js';
import { AuthService } from './service.js';

export const createAuthState: MiddlewareHandler<AuthContext> = async (
  c,
  next
) => {
  const { db, logger } = c.var;
  try {
    const state = c as Context<PartialAuthContext>;
    logger.debug('Creating Auth State');

    if (!state.get('authService')) {
      const auth = createAuth(db);
      const authService = new AuthService(auth, logger);
      logger.debug('Auth service created');
      state.set('authService', authService);
    }

    logger.debug({ state: Object.keys(c.var) }, 'Auth State created');
    await next();
  } catch (error) {
    logger.error(error);
    throw new AppError();
  }
};

export const authGuard: MiddlewareHandler<AuthContext> = async (c, next) => {
  const { authService } = c.var;
  const user = await authService.whoAmI(c.req.raw.headers);
  c.set('user', user);
  await next();
};

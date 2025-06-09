import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import { ValidationError } from '../error.js';
import { handleError } from '../lib/error.js';
import type { AuthContext } from './context.js';
import { credentials, account } from './schema.js';
import { createAuthState } from './state.js';

const validateCredentials = zValidator(
  'json',
  credentials,
  (result, c: Context<AuthContext>) => {
    const { logger } = c.var;
    if (!result.success) {
      logger.warn(
        { payload: result.data, issues: result.error.issues },
        'Invalid credentials'
      );
      throw new ValidationError();
    }
  }
);

const validateAccount = zValidator(
  'json',
  account,
  (result, c: Context<AuthContext>) => {
    const { logger } = c.var;
    if (!result.success) {
      logger.warn(
        { payload: result.data, issues: result.error.issues },
        'Invalid account'
      );
      throw new ValidationError();
    }
  }
);

const createRouter = (authState: MiddlewareHandler<AuthContext>) => {
  const router = new Hono<AuthContext>();
  router.use(authState);
  router.onError(handleError('auth'));

  router.post('/signup', validateAccount, async (c) => {
    const account = c.req.valid('json');

    const service = c.get('authService');
    const user = await service.signup(account);

    return c.json(user, 201);
  });

  router.post('/', validateCredentials, async (c) => {
    const credentials = c.req.valid('json');

    const service = c.get('authService');
    const token = await service.signin(credentials);

    return c.json(token, 200);
  });

  return router;
};

export const auth = createRouter(createAuthState);

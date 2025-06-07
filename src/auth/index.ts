import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { credentials, account } from './schema.js';
import { ValidationError } from '../error.js';
import type { AuthContext } from './context.js';

const validateCredentials = zValidator('json', credentials, (result, c) => {
  if (!result.success) {
    throw new ValidationError();
  }
});

const validateAccount = zValidator('json', account, (result, c) => {
  if (!result.success) {
    throw new ValidationError();
  }
});

const createRouter = () => {
  const router = new Hono<AuthContext>();

  router.post('/signup', validateAccount, async (c) => {
    const account = c.req.valid('json');
    const service = c.get('service');
    const user = await service.signup(account);
    return c.json(user, 201);
  });

  router.post('/', validateCredentials, async (c) => {
    const credentials = c.req.valid('json');
    const service = c.get('service');
    const token = service.signin(credentials);
    return c.json(token, 200);
  });

  return router;
};

export const auth = createRouter();

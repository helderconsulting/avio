import { serveStatic } from '@hono/node-server/serve-static';
import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import type { AuthContext } from './auth/context.js';
import { auth } from './auth/index.js';
import type { AppContext } from './context.js';
import { flights } from './flights/index.js';
import { handleError } from './lib/error.js';
import { logger } from './lib/logger.js';

export const createRouter = (
  appState: MiddlewareHandler<AppContext>,
  authState: MiddlewareHandler<AuthContext>
) => {
  const router = new Hono<AppContext>();

  router.use(cors());
  router.use(requestId());
  router.use(logger);
  router.use(appState);
  router.use(authState);

  router.onError(handleError('root'));
  router.get('/docs', serveStatic({ path: './docs/open-api.yaml' }));
  router.get('/', swaggerUI({ url: '/docs' }));

  router.route('/auth', auth);
  router.route('/flights', flights);
  return router;
};

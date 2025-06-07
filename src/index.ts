import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { logger } from 'hono/logger';
import type { AuthContext } from './auth/context.js';
import { auth } from './auth/index.js';
import { createAuthState } from './auth/state.js';
import type { AppContext } from './context.js';
import { AppError } from './error.js';
import { flights } from './flights/index.js';
import { createAppState } from './state.js';

const createRouter = (
  appState: MiddlewareHandler<AppContext>,
  authState: MiddlewareHandler<AuthContext>
) => {
  const router = new Hono<AppContext>();

  router.use(logger());
  router.use(appState);
  router.use(authState);

  router.onError((err, c) => {
    console.log(err);
    if (err instanceof AppError) {
      return err.toReponse(c);
    }
    return c.text('Unhandled error', 500);
  });

  router.get('/docs', serveStatic({ path: './docs/open-api.yaml' }));
  router.get('/', swaggerUI({ url: '/docs' }));

  router.route('/auth', auth);
  router.route('/flights', flights);
  return router;
};

const app = createRouter(createAppState, createAuthState);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(
      `Server is running on http://localhost:${info.port.toString()}`
    );
  }
);

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { logger } from 'hono/logger';
import { MongoClient } from 'mongodb';
import type { AuthContext } from './auth/context.js';
import { auth } from './auth/index.js';
import { createAuthState } from './auth/state.js';
import type { AppContext } from './context.js';
import { flights } from './flights/index.js';
import { Connection } from './lib/connection.js';
import { handleError } from './lib/error.js';
import { createAppState } from './state.js';

export const createRouter = (
  appState: MiddlewareHandler<AppContext>,
  authState: MiddlewareHandler<AuthContext>
) => {
  const router = new Hono<AppContext>();

  router.use(logger());
  router.use(appState);
  router.use(authState);

  router.onError(handleError('root'));

  router.get('/docs', serveStatic({ path: './docs/open-api.yaml' }));
  router.get('/', swaggerUI({ url: '/docs' }));

  router.route('/auth', auth);
  router.route('/flights', flights);
  return router;
};

const client = new MongoClient(process.env.CONNECTION_URL);
const connection = new Connection(client);
const app = createRouter(createAppState(connection), createAuthState);

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

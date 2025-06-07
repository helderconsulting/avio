import { serve } from '@hono/node-server';
import { createState } from './state.js';
import { Hono, type MiddlewareHandler } from 'hono';
import { flights } from './flights/index.js';
import { logger } from 'hono/logger';
import type { AppContext } from './context.js';
import { auth } from './auth/index.js';
import { swaggerUI } from '@hono/swagger-ui';
import { serveStatic } from '@hono/node-server/serve-static';

const createRouter = (state: MiddlewareHandler<AppContext>) => {
  const router = new Hono<AppContext>();

  router.use(logger());
  router.use(state);

  router.get('/docs', serveStatic({ path: './docs/open-api.yaml' }));
  router.get('/', swaggerUI({ url: '/docs' }));

  router.route('/auth', auth);
  router.route('/flights', flights);
  return router;
};

const app = createRouter(createState);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

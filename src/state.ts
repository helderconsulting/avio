import type { MiddlewareHandler } from 'hono';
import type { AppContext } from './context.js';
import type { ConnectionInterface } from './lib/types.js';

export const createAppState =
  (connection: ConnectionInterface): MiddlewareHandler<AppContext> =>
  async (c, next) => {
    const db = await connection.connect();
    c.set('db', db);
    await next();
  };

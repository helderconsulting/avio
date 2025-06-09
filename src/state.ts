import type { Context, MiddlewareHandler } from 'hono';
import type { AppContext, PartialAppContext } from './context.js';
import { AppError } from './error.js';
import type { ConnectionInterface } from './lib/types.js';

export const createAppState =
  (connection: ConnectionInterface): MiddlewareHandler<AppContext> =>
  async (c, next) => {
    const { logger } = c.var;
    try {
      const state = c as Context<PartialAppContext>;
      logger.debug('Creating App State');

      if (!state.get('db')) {
        const db = await connection.connect();
        logger.debug(
          { databaseName: db.databaseName, options: db.options },
          'Database connected'
        );
        state.set('db', db);
      }

      logger.debug({ state: Object.keys(c.var) }, 'App State created');
      await next();
    } catch (error) {
      logger.error(error);
      throw new AppError();
    }
  };

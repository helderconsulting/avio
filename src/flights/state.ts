import type { Context, MiddlewareHandler } from 'hono';
import type { Db } from 'mongodb';
import type { Logger } from 'pino';
import { AppError } from '../error.js';
import type { FlightsContext, PartialFlightsContext } from './context.js';
import type { FlightEntity } from './schema.js';
import { FlightsService } from './service.js';

export const createFlightsService = (db: Db, logger: Logger) => {
  const collection = db.collection<FlightEntity>('flights');
  return new FlightsService(collection, logger);
};

export const createFlightsState: MiddlewareHandler<FlightsContext> = async (
  c,
  next
) => {
  const { db, logger } = c.var;
  try {
    const state = c as Context<PartialFlightsContext>;
    logger.debug('Creating Flights State');

    if (!state.get('flightsService')) {
      const flightsService = createFlightsService(db, logger);
      logger.debug('Flights service created');
      state.set('flightsService', flightsService);
    }

    logger.debug({ state: Object.keys(c.var) }, 'Flights State created');
    await next();
  } catch (error) {
    logger.error(error);
    throw new AppError();
  }
};

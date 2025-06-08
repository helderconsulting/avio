import type { MiddlewareHandler } from 'hono';
import type { Db } from 'mongodb';
import type { FlightsContext } from './context.js';
import type { FlightEntity } from './schema.js';
import { FlightsService } from './service.js';

export const createFlightsService = (db: Db) => {
  const collection = db.collection<FlightEntity>('flights');
  return new FlightsService(collection);
};

export const createFlightsState: MiddlewareHandler<FlightsContext> = async (
  c,
  next
) => {
  const db = c.get('db');
  const flightsService = createFlightsService(db);
  c.set('flightsService', flightsService);

  await next();
};

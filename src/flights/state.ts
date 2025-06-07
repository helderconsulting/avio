import type { MiddlewareHandler } from 'hono';
import type { FlightsContext } from './context.js';
import type { FlightDocument } from './schema.js';
import { FlightsService } from './service.js';
import type { Db } from 'mongodb';

export const createService = (db: Db) => {
  const collection = db.collection<FlightDocument>('flights');
  return new FlightsService(collection);
};

export const createFlightsState: MiddlewareHandler<FlightsContext> = async (
  c,
  next
) => {
  if (!c.get('service')) {
    const db = c.get('db');
    const service = createService(db);
    c.set('service', service);
  }
  await next();
};

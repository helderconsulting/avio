import type { MiddlewareHandler } from 'hono';
import type { FlightsContext } from '../context.js';
import type { FlightDocument } from '../schema.js';
import type { WithId } from 'mongodb';
import { MockFlightsService } from './service.js';

export const createCollection = (flights: WithId<FlightDocument>[]) => {
  const collection = new Map();
  flights.forEach((flight) => {
    collection.set(flight._id, flight);
  });
  return collection;
};

export const createMockService = (flights: WithId<FlightDocument>[]) => {
  const collection = createCollection(flights);
  return new MockFlightsService(collection);
};

export const createMockFlightsState =
  (flights: WithId<FlightDocument>[]): MiddlewareHandler<FlightsContext> =>
  async (c, next) => {
    const mockService = createMockService(flights);
    c.set('service', mockService);
    await next();
  };

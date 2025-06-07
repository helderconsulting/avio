import type { MiddlewareHandler } from 'hono';
import type { WithId } from 'mongodb';
import type { FlightsContext } from '../context.js';
import type { FlightRequest } from '../schema.js';
import { MockFlightsService } from './service.js';

export const createCollection = (flights: WithId<FlightRequest>[]) => {
  const collection = new Map<string, WithId<FlightRequest>>();
  flights.forEach((flight) => {
    collection.set(flight._id.toHexString(), flight);
  });
  return collection;
};

export const createMockService = (flights: WithId<FlightRequest>[]) => {
  const collection = createCollection(flights);
  return new MockFlightsService(collection);
};

export const createMockFlightsState =
  (flights: WithId<FlightRequest>[]): MiddlewareHandler<FlightsContext> =>
  async (c, next) => {
    const mockService = createMockService(flights);
    c.set('flightsService', mockService);
    await next();
  };

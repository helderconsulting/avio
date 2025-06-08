import type { MiddlewareHandler } from 'hono';
import type { WithId } from 'mongodb';
import { mockUser } from '../../auth/mocks/user.js';
import type { FlightsContext } from '../context.js';
import type { FlightEntity } from '../schema.js';
import { MockFlightsService, toKey } from './service.js';

export const createCollection = (flights: WithId<FlightEntity>[]) => {
  const collection = new Map<string, WithId<FlightEntity>>();
  flights.forEach((flight) => {
    collection.set(toKey(flight._id.toHexString(), flight.userId), flight);
  });
  return collection;
};

export const createMockService = (flights: WithId<FlightEntity>[]) => {
  const collection = createCollection(flights);
  return new MockFlightsService(collection);
};

export const createMockFlightsState =
  (flights: WithId<FlightEntity>[]): MiddlewareHandler<FlightsContext> =>
  async (c, next) => {
    const mockService = createMockService(flights);
    c.set('flightsService', mockService);

    c.set('user', mockUser);
    await next();
  };

export const createFailingMockFlightsState =
  (flights: WithId<FlightEntity>[]): MiddlewareHandler<FlightsContext> =>
  async (c, next) => {
    const mockService = createMockService(flights);
    mockService.failInternally();
    c.set('flightsService', mockService);
    await next();
  };

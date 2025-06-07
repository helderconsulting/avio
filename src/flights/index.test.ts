import type { Hono } from 'hono';
import { ObjectId } from 'mongodb';
import type { WithId } from 'mongodb';
import { createMockAuthState } from '../auth/mocks/state.js';
import type { FlightsContext } from './context.js';
import { createMockFlightsState } from './mocks/state.js';
import type { FlightDocument } from './schema.js';
import { createRouter } from './index.js';

describe('Flights Endpoint', () => {
  describe('GET /flights', () => {
    let flights: Hono<FlightsContext>;
    beforeAll(() => {
      const collection = [
        {
          _id: new ObjectId(),
          aircraft: 'CSTRC',
          flightNumber: 'AVIO205',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        },
      ];
      flights = createRouter(
        createMockFlightsState(collection),
        createMockAuthState
      );
    });

    test('should return a list of flights when authenticated', async () => {
      const result = await flights.request('/');

      const json = (await result.json()) as WithId<FlightDocument>[];

      expect(json.length).toBe(1);
      expect(json.at(0)).toHaveProperty('_id');
      expect(result.status).toBe(200);
    });

    test('should return 401 if not authenticated', async () => {
      // ...
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });

  describe('POST /flights', () => {
    let flights: Hono<FlightsContext>;
    beforeAll(() => {
      const collection: WithId<FlightDocument>[] = [];
      flights = createRouter(
        createMockFlightsState(collection),
        createMockAuthState
      );
    });
    test('should create a flight with valid data', async () => {
      const result = await flights.request('/', {
        method: 'POST',
        body: JSON.stringify({
          aircraft: 'CSTRC',
          flightNumber: 'AVIO205',
          schedule: {
            std: '2025-06-05T22:00:00.000Z',
            sta: '2025-06-05T22:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const json = (await result.json()) as WithId<FlightDocument>;

      expect(json).toHaveProperty('_id');
      expect(json.aircraft).toBe('CSTRC');
      expect(json.flightNumber).toBe('AVIO205');
      expect(json.schedule.std).toBe('2025-06-05T22:00:00.000Z');
      expect(json.schedule.sta).toBe('2025-06-05T22:00:00.000Z');
      expect(json.departure).toBe('LPPD');
      expect(json.destination).toBe('LPLA');
      expect(result.status).toBe(201);
    });

    test('should return 400 for invalid payload', async () => {
      const result = await flights.request('/', {
        method: 'POST',
        body: JSON.stringify({
          aircraft: 'CSTRC',
          flightNumber: 'AVIO205',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'INCORRECT_DEPARTURE_LENGTH',
          destination: 'LPLA',
        }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const text = await result.text();

      expect(text).toBe('Invalid payload');
      expect(result.status).toBe(400);
    });

    test('should return 401 if not authenticated', async () => {
      // ...
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });

  describe('GET /flights/:flightId', () => {
    const flightId = '6841cade4cace03b8f75235b';
    let flights: Hono<FlightsContext>;
    beforeAll(() => {
      const collection = [
        {
          _id: new ObjectId(flightId),
          aircraft: 'CSTRC',
          flightNumber: 'AVIO205',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        },
      ];
      flights = createRouter(
        createMockFlightsState(collection),
        createMockAuthState
      );
    });
    test('should return a flight by id', async () => {
      const result = await flights.request(`/${flightId}`);
      expect(result.status).toBe(200);
    });

    test('should return 401 if not authenticated', async () => {
      // ...
    });

    test('should return 404 if flight is not found', async () => {
      const result = await flights.request('/6841cade4cace03b8f75235d');
      expect(result.status).toBe(200);
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });

  describe('PATCH /flights/:flightId', () => {
    test('should update a flight with valid data', async () => {
      // ...
    });

    test('should return 400 for invalid payload', async () => {
      // ...
    });

    test('should return 401 if not authenticated', async () => {
      // ...
    });

    test('should return 404 if flight is not found', async () => {
      // ...
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });

  describe('DELETE /flights/:flightId', () => {
    test('should delete a flight by id', async () => {
      // ...
    });

    test('should return 401 if not authenticated', async () => {
      // ...
    });

    test('should return 404 if flight is not found', async () => {
      // ...
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });
});

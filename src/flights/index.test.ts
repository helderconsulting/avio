import type { Hono } from 'hono';
import { ObjectId } from 'mongodb';
import type { WithId } from 'mongodb';
import { authenticated, unauthenticated } from '../auth/mocks/state.js';
import type { FlightsContext } from './context.js';
import { createMockFlightsState } from './mocks/state.js';
import type { FlightRequest } from './schema.js';
import { createRouter } from './index.js';

const validPayload = JSON.stringify({
  aircraft: 'CSTRC',
  flightNumber: 'AVIO205',
  schedule: {
    std: '2025-06-05T22:00:00.000Z',
    sta: '2025-06-05T22:00:00.000Z',
  },
  departure: 'LPPD',
  destination: 'LPLA',
});

const invalidPayload = JSON.stringify({
  aircraft: 'CSTRC',
  flightNumber: 'AVIO205',
  schedule: {
    std: '2024-09-30T22:00:00.000Z',
    sta: '2024-09-30T23:00:00.000Z',
  },
  departure: 'INCORRECT_DEPARTURE_LENGTH',
  destination: 'LPLA',
});

describe('Flights Endpoint', () => {
  describe('GET /flights', () => {
    const flightId = '6841cade4cace03b8f75235b';
    let authenticatedRouter: Hono<FlightsContext>;
    let unauthenticatedRouter: Hono<FlightsContext>;
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
      authenticatedRouter = createRouter(
        createMockFlightsState(collection),
        authenticated
      );
      unauthenticatedRouter = createRouter(
        createMockFlightsState(collection),
        unauthenticated
      );
    });

    test('should return a list of flights', async () => {
      const result = await authenticatedRouter.request('/');

      const json = await result.json<WithId<FlightRequest>[]>();

      expect(json).toMatchSnapshot();
      expect(result.status).toBe(200);
    });

    test('should return 401 if not authenticated', async () => {
      const result = await unauthenticatedRouter.request('/');

      expect(result.status).toBe(401);
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });

  describe('POST /flights', () => {
    let authenticatedRouter: Hono<FlightsContext>;
    let unauthenticatedRouter: Hono<FlightsContext>;
    beforeAll(() => {
      const collection: WithId<FlightRequest>[] = [];
      authenticatedRouter = createRouter(
        createMockFlightsState(collection),
        authenticated
      );
      unauthenticatedRouter = createRouter(
        createMockFlightsState(collection),
        unauthenticated
      );
    });
    test('should create a flight with valid data', async () => {
      const result = await authenticatedRouter.request('/', {
        method: 'POST',
        body: validPayload,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const json = await result.json<WithId<FlightRequest>>();

      expect(json).toMatchSnapshot();
      expect(result.status).toBe(201);
    });

    test('should return 400 for invalid payload', async () => {
      const result = await authenticatedRouter.request('/', {
        method: 'POST',
        body: invalidPayload,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const text = await result.text();

      expect(text).toBe('Invalid payload');
      expect(result.status).toBe(400);
    });

    test('should return 401 if not authenticated', async () => {
      const result = await unauthenticatedRouter.request('/', {
        method: 'POST',
        body: validPayload,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      expect(result.status).toBe(401);
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });

  describe('GET /flights/:flightId', () => {
    const flightId = '6841cade4cace03b8f75235b';
    let authenticatedRouter: Hono<FlightsContext>;
    let unauthenticatedRouter: Hono<FlightsContext>;
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
      authenticatedRouter = createRouter(
        createMockFlightsState(collection),
        authenticated
      );
      unauthenticatedRouter = createRouter(
        createMockFlightsState(collection),
        unauthenticated
      );
    });
    test('should return a flight by id', async () => {
      const result = await authenticatedRouter.request(`/${flightId}`);

      const json = await result.json();

      expect(json).toMatchSnapshot();
      expect(result.status).toBe(200);
    });

    test('should return 401 if not authenticated', async () => {
      const result = await unauthenticatedRouter.request(`/${flightId}`);
      expect(result.status).toBe(401);
    });

    test('should return 404 if flight is not found', async () => {
      const result = await authenticatedRouter.request(
        '/6841cade4cace03b8f75235d'
      );
      expect(result.status).toBe(404);
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });

  describe('PATCH /flights/:flightId', () => {
    const flightId = '6841cade4cace03b8f75235b';
    let authenticatedRouter: Hono<FlightsContext>;
    let unauthenticatedRouter: Hono<FlightsContext>;
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
      authenticatedRouter = createRouter(
        createMockFlightsState(collection),
        authenticated
      );
      unauthenticatedRouter = createRouter(
        createMockFlightsState(collection),
        unauthenticated
      );
    });
    test('should update a flight', async () => {
      const result = await authenticatedRouter.request(`/${flightId}`, {
        method: 'PATCH',
        body: validPayload,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const json = await result.json();

      expect(json).toMatchSnapshot();
      expect(result.status).toBe(200);
    });

    test('should return 400 for invalid payload', async () => {
      const result = await authenticatedRouter.request(`/${flightId}`, {
        method: 'PATCH',
        body: invalidPayload,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
      expect(result.status).toBe(400);
    });

    test('should return 401 if not authenticated', async () => {
      const result = await unauthenticatedRouter.request(`/${flightId}`, {
        method: 'PATCH',
        body: validPayload,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
      expect(result.status).toBe(401);
    });

    test('should return 404 if flight is not found', async () => {
      const objectId = new ObjectId();
      const result = await authenticatedRouter.request(
        `/${objectId.toHexString()}`,
        {
          method: 'PATCH',
          body: validPayload,
          headers: new Headers({ 'Content-Type': 'application/json' }),
        }
      );
      expect(result.status).toBe(404);
    });

    test('should return 500 on server error', async () => {
      // ...
    });
  });
});

describe('DELETE /flights/:flightId', () => {
  const flightId = '6841cade4cace03b8f75235b';
  let authenticatedRouter: Hono<FlightsContext>;
  let unauthenticatedRouter: Hono<FlightsContext>;
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
    authenticatedRouter = createRouter(
      createMockFlightsState(collection),
      authenticated
    );
    unauthenticatedRouter = createRouter(
      createMockFlightsState(collection),
      unauthenticated
    );
  });
  test('should delete a flight by id', async () => {
    const result = await authenticatedRouter.request(`/${flightId}`, {
      method: 'DELETE',
    });
    expect(result.status).toBe(204);
  });

  test('should return 401 if not authenticated', async () => {
    const result = await unauthenticatedRouter.request(`/${flightId}`, {
      method: 'DELETE',
    });
    expect(result.status).toBe(401);
  });

  test('should return 404 if flight is not found', async () => {
    const objectId = new ObjectId();
    const result = await authenticatedRouter.request(
      `/${objectId.toHexString()}`,
      {
        method: 'DELETE',
      }
    );
    expect(result.status).toBe(404);
  });

  test('should return 500 on server error', async () => {
    // ...
  });
});

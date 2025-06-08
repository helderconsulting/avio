import { ObjectId } from 'mongodb';
import type { Collection, Db, WithId } from 'mongodb';
import { AppError } from '../error.js';
import { Connection } from '../lib/mocks/connection.js';
import { NotFoundError } from './error.js';
import { MockFlightsService } from './mocks/service.js';
import { createMockService } from './mocks/state.js';
import type { FlightEntity, FlightRequest } from './schema.js';
import { FlightsService } from './service.js';
import { createFlightsService } from './state.js';

describe('FlightsService Contract', () => {
  const connection = new Connection();
  const flightId = '6842ee23feb532c8cd74fddb';
  const userId = 'usr001';
  const flights: WithId<FlightEntity>[] = [
    {
      _id: new ObjectId(flightId),
      userId,
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

  let db: Db;
  let collection: Collection<FlightRequest>;

  beforeAll(async () => {
    db = await connection.connect();
    collection = db.collection('flights');
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  describe('retrieveAllFlights', () => {
    beforeEach(async () => {
      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should retrieve all flights', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const realFlights = await realService.retrieveAllFlights(userId);
      const mockFlights = await mockService.retrieveAllFlights(userId);

      expect(mockFlights).toStrictEqual(realFlights);
    });

    test('should throw an AppError', async () => {
      const realService = new FlightsService(
        undefined as unknown as Collection<FlightEntity>
      );
      const mockService = new MockFlightsService(
        undefined as unknown as Map<string, WithId<FlightEntity>>
      );

      await expect(realService.retrieveAllFlights(userId)).rejects.toThrow(
        AppError
      );
      await expect(mockService.retrieveAllFlights(userId)).rejects.toThrow(
        AppError
      );
    });
  });

  describe('retrieveFlight', () => {
    beforeEach(async () => {
      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should find a flight by id', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const realFlight = await realService.retrieveFlight(flightId, userId);
      const mockFlight = await mockService.retrieveFlight(flightId, userId);

      expect(mockFlight).toStrictEqual(realFlight);
    });

    test('should throw a NotFoundError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const wrongFlightId = '6842ee23feb532c8cd74fdda';

      await expect(
        realService.retrieveFlight(wrongFlightId, userId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        mockService.retrieveFlight(wrongFlightId, userId)
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw an AppError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const nonHexFlightId = '6842ee23feb532c8cd74fzzz';

      await expect(
        realService.retrieveFlight(nonHexFlightId, userId)
      ).rejects.toThrow(AppError);
      await expect(
        mockService.retrieveFlight(nonHexFlightId, userId)
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateFlight', () => {
    const newFlightNumber = 'AVIO999';
    const update = {
      aircraft: 'CSTRC',
      flightNumber: newFlightNumber,
      schedule: {
        std: '2024-09-30T22:00:00.000Z',
        sta: '2024-09-30T23:00:00.000Z',
      },
      departure: 'LPPD',
      destination: 'LPLA',
    };

    beforeEach(async () => {
      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should update the flight', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const realFlight = await realService.updateFlight(
        flightId,
        userId,
        update
      );
      const mockFlight = await mockService.updateFlight(
        flightId,
        userId,
        update
      );

      expect(mockFlight).toStrictEqual(realFlight);
      expect(realFlight.flightNumber).toBe(newFlightNumber);
    });

    test('should throw a NotFoundError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const wrongFlightId = '6842ee23feb532c8cd74fdda';

      await expect(
        realService.updateFlight(wrongFlightId, userId, update)
      ).rejects.toThrow(NotFoundError);
      await expect(
        mockService.updateFlight(wrongFlightId, userId, update)
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw an AppError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const nonHexFlightId = '6842ee23feb532c8cd74fzzz';

      await expect(
        realService.updateFlight(nonHexFlightId, userId, update)
      ).rejects.toThrow(AppError);
      await expect(
        mockService.updateFlight(nonHexFlightId, userId, update)
      ).rejects.toThrow(AppError);
    });
  });
  describe('deleteFlight', () => {
    beforeEach(async () => {
      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should cancel a flight', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      await realService.deleteFlight(flightId, userId);
      await mockService.deleteFlight(flightId, userId);

      await expect(
        realService.retrieveFlight(flightId, userId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        mockService.retrieveFlight(flightId, userId)
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw a NotFoundError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const wrongFlightId = '6842ee23feb532c8cd74fdda';
      const userId = 'usr001';

      await expect(
        realService.deleteFlight(wrongFlightId, userId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        mockService.deleteFlight(wrongFlightId, userId)
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw an AppError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const nonHexFlightId = '6842ee23feb532c8cd74fzzz';
      const userId = 'usr001';

      await expect(
        realService.deleteFlight(nonHexFlightId, userId)
      ).rejects.toThrow(AppError);
      await expect(
        mockService.deleteFlight(nonHexFlightId, userId)
      ).rejects.toThrow(AppError);
    });
  });
  describe('createFlight', () => {
    beforeEach(async () => {
      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should create a new flight', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);
      const flightId = '6841cade4cace03b8f75235b';
      const userId = 'usr001';
      const objectId = new ObjectId(flightId);

      const flight = {
        _id: objectId,
        aircraft: 'CSTRC',
        flightNumber: 'AVIO205',
        schedule: {
          std: '2024-09-30T22:00:00.000Z',
          sta: '2024-09-30T23:00:00.000Z',
        },
        departure: 'LPPD',
        destination: 'LPLA',
      };
      const realFlight = await realService.createFlight(userId, flight);
      const mockFlight = await mockService.createFlight(userId, flight);

      expect(mockFlight).toStrictEqual(realFlight);
    });
  });
});

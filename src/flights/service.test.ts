import { MongoClient, ObjectId } from 'mongodb';
import type { Collection, Db, WithId } from 'mongodb';
import { AppError } from '../error.js';
import { NotFoundError } from './error.js';
import { MockFlightsService } from './mocks/service.js';
import { createMockService } from './mocks/state.js';
import type { FlightRequest } from './schema.js';
import { FlightsService } from './service.js';
import { createFlightsService } from './state.js';

describe('FlightsService Contract', () => {
  const flightId = '6842ee23feb532c8cd74fddb';
  const flights: WithId<FlightRequest>[] = [
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

  let db: Db;
  let collection: Collection<FlightRequest>;

  describe('retrieveAllFlights', () => {
    beforeEach(async () => {
      const client = new MongoClient(process.env.CONNECTION_URL);
      await client.connect();
      db = client.db(process.env.DATABASE);

      collection = db.collection('flights');
      await collection.drop();
      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should retrieve all flights', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const realFlights = await realService.retrieveAllFlights();
      const mockFlights = await mockService.retrieveAllFlights();

      expect(mockFlights).toStrictEqual(realFlights);
    });

    test('should throw an AppError', async () => {
      const realService = new FlightsService(
        undefined as unknown as Collection<FlightRequest>
      );
      const mockService = new MockFlightsService(
        undefined as unknown as Map<string, WithId<FlightRequest>>
      );

      await expect(realService.retrieveAllFlights()).rejects.toThrow(AppError);
      await expect(mockService.retrieveAllFlights()).rejects.toThrow(AppError);
    });
  });

  describe('retrieveFlight', () => {
    beforeEach(async () => {
      const client = new MongoClient(process.env.CONNECTION_URL);
      await client.connect();
      db = client.db(process.env.DATABASE);

      collection = db.collection('flights');

      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should find a flight by id', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const realFlight = await realService.retrieveFlight(flightId);
      const mockFlight = await mockService.retrieveFlight(flightId);

      expect(mockFlight).toStrictEqual(realFlight);
    });

    test('should throw a NotFoundError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const wrongFlightId = '6842ee23feb532c8cd74fdda';

      await expect(realService.retrieveFlight(wrongFlightId)).rejects.toThrow(
        NotFoundError
      );
      await expect(mockService.retrieveFlight(wrongFlightId)).rejects.toThrow(
        NotFoundError
      );
    });

    test('should throw an AppError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const nonHexFlightId = '6842ee23feb532c8cd74fzzz';

      await expect(realService.retrieveFlight(nonHexFlightId)).rejects.toThrow(
        AppError
      );
      await expect(mockService.retrieveFlight(nonHexFlightId)).rejects.toThrow(
        AppError
      );
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
      const client = new MongoClient(process.env.CONNECTION_URL);
      await client.connect();
      db = client.db(process.env.DATABASE);

      collection = db.collection('flights');

      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should update the flight', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const realFlight = await realService.updateFlight(flightId, update);
      const mockFlight = await mockService.updateFlight(flightId, update);

      expect(mockFlight).toStrictEqual(realFlight);
      expect(realFlight.flightNumber).toBe(newFlightNumber);
    });

    test('should throw a NotFoundError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const wrongFlightId = '6842ee23feb532c8cd74fdda';

      await expect(
        realService.updateFlight(wrongFlightId, update)
      ).rejects.toThrow(NotFoundError);
      await expect(
        mockService.updateFlight(wrongFlightId, update)
      ).rejects.toThrow(NotFoundError);
    });

    test('should throw an AppError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const nonHexFlightId = '6842ee23feb532c8cd74fzzz';

      await expect(
        realService.updateFlight(nonHexFlightId, update)
      ).rejects.toThrow(AppError);
      await expect(
        mockService.updateFlight(nonHexFlightId, update)
      ).rejects.toThrow(AppError);
    });
  });
  describe('deleteFlight', () => {
    beforeEach(async () => {
      const client = new MongoClient(process.env.CONNECTION_URL);
      await client.connect();
      db = client.db(process.env.DATABASE);

      collection = db.collection('flights');

      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should cancel a flight', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      await realService.deleteFlight(flightId);
      await mockService.deleteFlight(flightId);

      await expect(realService.retrieveFlight(flightId)).rejects.toThrow(
        NotFoundError
      );
      await expect(mockService.retrieveFlight(flightId)).rejects.toThrow(
        NotFoundError
      );
    });

    test('should throw a NotFoundError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const wrongFlightId = '6842ee23feb532c8cd74fdda';

      await expect(realService.deleteFlight(wrongFlightId)).rejects.toThrow(
        NotFoundError
      );
      await expect(mockService.deleteFlight(wrongFlightId)).rejects.toThrow(
        NotFoundError
      );
    });

    test('should throw an AppError', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);

      const nonHexFlightId = '6842ee23feb532c8cd74fzzz';

      await expect(realService.deleteFlight(nonHexFlightId)).rejects.toThrow(
        AppError
      );
      await expect(mockService.deleteFlight(nonHexFlightId)).rejects.toThrow(
        AppError
      );
    });
  });
  describe('createFlight', () => {
    beforeEach(async () => {
      const client = new MongoClient(process.env.CONNECTION_URL);
      await client.connect();
      db = client.db(process.env.DATABASE);

      collection = db.collection('flights');

      await collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    test('should create a new flight', async () => {
      const realService = createFlightsService(db);
      const mockService = createMockService(flights);
      const flightId = '6841cade4cace03b8f75235b';
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
      const realFlight = await realService.createFlight(flight);
      const mockFlight = await mockService.createFlight(flight);

      expect(mockFlight).toStrictEqual(realFlight);
    });
  });
});

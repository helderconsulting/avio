import { Collection, Db, MongoClient, ObjectId, type WithId } from 'mongodb';
import type { FlightDocument } from './schema.js';
import { createMockService } from './mocks/state.js';
import { createService } from './state.js';
import { AppError } from '../error.js';
import { FlightsService } from './service.js';
import { MockFlightsService } from './mocks/service.js';
import { NotFoundError } from './error.js';

describe('FlightsService Contract', async () => {
  const flightId = '6842ee23feb532c8cd74fddb';
  const flights: WithId<FlightDocument>[] = [
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
  let collection: Collection<FlightDocument>;

  describe('retrieveAllFlights', () => {
    beforeEach(async () => {
      const client = new MongoClient(process.env.CONNECTION_URL);
      await client.connect();
      db = client.db(process.env.DATABASE);

      collection = db.collection('flights');

      collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    it('should retrieve all flights', async () => {
      const realService = createService(db);
      const mockService = createMockService(flights);

      const realFlights = await realService.retrieveAllFlights();
      const mockFlights = await mockService.retrieveAllFlights();

      expect(mockFlights).toStrictEqual(realFlights);
    });

    it('should throw an AppError', async () => {
      const realService = new FlightsService(undefined as any);
      const mockService = new MockFlightsService(undefined as any);

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

      collection.insertMany(flights);
    });

    afterEach(async () => {
      await collection.drop();
    });

    it('should find a flight by id', async () => {
      const realService = createService(db);
      const mockService = createMockService(flights);

      const realFlight = await realService.retrieveFlight(flightId);
      const mockFlight = await mockService.retrieveFlight(flightId);

      expect(mockFlight).toStrictEqual(realFlight);
    });

    it('should throw a NotFoundError', async () => {
      const realService = createService(db);
      const mockService = createMockService(flights);

      const wrongFlightId = '6842ee23feb532c8cd74fdda';

      await expect(realService.retrieveFlight(wrongFlightId)).rejects.toThrow(
        NotFoundError
      );
      await expect(mockService.retrieveFlight(wrongFlightId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw an AppError', async () => {
      const realService = createService(db);
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

  describe('updateFlight');
  describe('deleteFlight');
  describe('createFlight');
});

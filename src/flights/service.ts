import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import type { Logger } from 'pino';
import { AppError } from '../error.js';
import type { FlightsServiceInterface } from './context.js';
import { NotFoundError } from './error.js';
import { toFlightReponse } from './schema.js';
import type { FlightEntity, FlightRequest } from './schema.js';

export class FlightsService implements FlightsServiceInterface {
  constructor(
    private collection: Collection<FlightEntity>,
    private logger: Logger
  ) {}

  async retrieveAllFlights(userId: string) {
    try {
      this.logger.debug({ userId }, 'Retreive all flights');
      const cursor = this.collection.find({
        userId,
      });

      const flights = await cursor.toArray();
      const response = flights.map(toFlightReponse);

      this.logger.info({ flights: response }, 'All flights retreived');

      return response;
    } catch (error) {
      this.logger.error(error);
      throw new AppError();
    }
  }

  async retrieveFlight(flightId: string, userId: string) {
    try {
      this.logger.debug({ flightId, userId }, 'Retreive a flight');
      const found = await this.collection.findOne({
        _id: new ObjectId(flightId),
        userId,
      });

      if (!found) {
        this.logger.warn({ flightId, userId }, 'Flight not found');
        throw new NotFoundError();
      }

      const response = toFlightReponse(found);
      this.logger.info({ flight: response }, 'Flight retreived');

      return response;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(error);
      throw new AppError();
    }
  }

  async updateFlight(flightId: string, userId: string, request: FlightRequest) {
    try {
      this.logger.debug({ flightId, userId, request }, 'Update a flight');
      const update = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(flightId), userId },
        { $set: request },
        { returnDocument: 'after' }
      );

      if (!update) {
        this.logger.warn({ flightId, userId, request }, 'Flight not found');
        throw new NotFoundError();
      }

      const response = toFlightReponse(update);
      this.logger.info({ flight: response }, 'Flight updated');

      return response;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(error);
      throw new AppError();
    }
  }

  async deleteFlight(flightId: string, userId: string) {
    try {
      this.logger.debug({ flightId, userId }, 'Delete a flight');
      const removal = await this.collection.deleteOne({
        _id: new ObjectId(flightId),
        userId,
      });

      if (!removal.acknowledged) {
        this.logger.warn(
          { flightId, userId },
          'Removing flight was not acknowledged'
        );
        throw new AppError();
      }

      if (removal.deletedCount === 0) {
        this.logger.warn({ flightId, userId }, 'No flight was deleted');
        throw new NotFoundError();
      }

      this.logger.info({ flightId, userId }, 'Flight deleted');
      return;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(error);
      throw new AppError();
    }
  }

  async createFlight(userId: string, request: FlightRequest) {
    try {
      this.logger.debug({ userId, request }, 'Create a flight');
      const entity: FlightEntity = { ...request, userId };
      const inserted = await this.collection.insertOne(entity);

      if (!inserted.acknowledged) {
        this.logger.warn(
          { userId, request },
          'Creating flight was not acknowledged'
        );
        throw new AppError();
      }

      const response = toFlightReponse({ ...entity, _id: inserted.insertedId });
      this.logger.info({ flight: response }, 'Flight created');

      return response;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(error);
      throw new AppError();
    }
  }
}

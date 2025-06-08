import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { AppError } from '../error.js';
import type { FlightsServiceInterface } from './context.js';
import { NotFoundError } from './error.js';
import { toFlightReponse } from './schema.js';
import type { FlightEntity, FlightRequest } from './schema.js';

export class FlightsService implements FlightsServiceInterface {
  constructor(private collection: Collection<FlightEntity>) {}

  async retrieveAllFlights(userId: string) {
    try {
      const cursor = this.collection.find({
        userId,
      });

      const flights = await cursor.toArray();

      return flights.map(toFlightReponse);
    } catch (error) {
      console.error(error);
      throw new AppError();
    }
  }

  async retrieveFlight(flightId: string, userId: string) {
    try {
      const found = await this.collection.findOne({
        _id: new ObjectId(flightId),
        userId,
      });

      if (!found) {
        throw new NotFoundError();
      }

      return toFlightReponse(found);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }

  async updateFlight(flightId: string, userId: string, request: FlightRequest) {
    try {
      const update = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(flightId), userId },
        { $set: request },
        { returnDocument: 'after' }
      );

      if (!update) {
        throw new NotFoundError();
      }

      return toFlightReponse(update);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }

  async deleteFlight(flightId: string, userId: string) {
    try {
      const removal = await this.collection.deleteOne({
        _id: new ObjectId(flightId),
        userId,
      });

      if (!removal.acknowledged) {
        throw new AppError();
      }

      if (removal.deletedCount === 0) {
        throw new NotFoundError();
      }

      return;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof AppError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }

  async createFlight(userId: string, request: FlightRequest) {
    try {
      const entity: FlightEntity = { ...request, userId };
      const inserted = await this.collection.insertOne(entity);

      if (!inserted.acknowledged) {
        throw new AppError();
      }

      return toFlightReponse({ ...entity, _id: inserted.insertedId });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }
}

import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { AppError } from '../error.js';
import type { FlightsServiceInterface } from './context.js';
import { NotFoundError } from './error.js';
import { toFlightReponse } from './schema.js';
import type { FlightRequest } from './schema.js';

export class FlightsService implements FlightsServiceInterface {
  constructor(private collection: Collection<FlightRequest>) {}

  async retrieveAllFlights() {
    try {
      const cursor = this.collection.find();

      const flights = await cursor.toArray();

      return flights.map(toFlightReponse);
    } catch (error) {
      console.error(error);
      throw new AppError();
    }
  }

  async retrieveFlight(id: string) {
    try {
      const found = await this.collection.findOne({
        _id: new ObjectId(id),
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

  async updateFlight(id: string, document: FlightRequest) {
    try {
      const update = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: document },
        { returnDocument: 'after', projection: { _id: 0 } }
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

  async deleteFlight(id: string) {
    try {
      const removal = await this.collection.deleteOne({
        _id: new ObjectId(id),
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

  async createFlight(document: FlightRequest) {
    try {
      const inserted = await this.collection.insertOne(document);

      if (!inserted.acknowledged) {
        throw new AppError();
      }

      return { ...document, id: inserted.insertedId.toHexString() };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }
}

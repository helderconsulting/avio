import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import { AppError } from '../error.js';
import type { FlightsServiceInterface } from './context.js';
import { NotFoundError } from './error.js';
import type { FlightDocument } from './schema.js';

export class FlightsService implements FlightsServiceInterface {
  constructor(private collection: Collection<FlightDocument>) {}

  async retrieveAllFlights() {
    try {
      const cursor = this.collection.find();

      const flights = await cursor.toArray();

      return flights;
    } catch (error) {
      console.error(error);
      throw new AppError();
    }
  }

  async retrieveFlight(id: string) {
    try {
      const flight = await this.collection.findOne({
        _id: new ObjectId(id),
      });

      if (!flight) {
        throw new NotFoundError();
      }

      return flight;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }

  async updateFlight(id: string, document: FlightDocument) {
    try {
      const update = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: document },
        { returnDocument: 'after' }
      );

      if (!update) {
        throw new NotFoundError();
      }

      return update;
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

  async createFlight(document: FlightDocument) {
    try {
      const inserted = await this.collection.insertOne(document);

      if (!inserted.acknowledged) {
        throw new AppError();
      }

      return { ...document, _id: inserted.insertedId };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }
}

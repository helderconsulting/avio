import type { FlightDocument } from '../schema.js';
import type { FlightsServiceInterface } from '../context.js';
import { NotFoundError } from '../error.js';
import { AppError } from '../../error.js';
import { ObjectId, type WithId } from 'mongodb';

export class MockFlightsService implements FlightsServiceInterface {
  constructor(private collection: Map<ObjectId, WithId<FlightDocument>>) {}

  async retrieveAllFlights(): Promise<FlightDocument[]> {
    try {
      return Array.from(this.collection.values());
    } catch (error) {
      throw new AppError();
    }
  }

  async retrieveFlight(id: string): Promise<FlightDocument> {
    try {
      const objectId = new ObjectId(id);
      if (!this.collection.has(objectId)) {
        throw new NotFoundError();
      }

      const document = this.collection.get(objectId);
      if (!document) {
        throw new NotFoundError();
      }

      return document;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new AppError();
    }
  }

  async updateFlight(
    id: string,
    document: FlightDocument
  ): Promise<FlightDocument | null> {
    const objectId = new ObjectId(id);

    if (!this.collection.has(objectId)) {
      return null;
    }

    const original = this.collection.get(objectId);
    this.collection.set(objectId, {
      ...original,
      ...document,
      _id: objectId,
    });

    const result = this.collection.get(objectId);
    if (!result) {
      return null;
    }

    return result;
  }

  async deleteFlight(id: string): Promise<void> {
    const objectId = new ObjectId(id);

    if (this.collection.has(objectId)) {
      this.collection.delete(objectId);
    }

    return;
  }

  async createFlight(
    document: FlightDocument
  ): Promise<WithId<FlightDocument>> {
    const objectId = new ObjectId();

    const documentWithId = {
      ...document,
      _id: objectId,
    };

    this.collection.set(objectId, documentWithId);

    return documentWithId;
  }
}

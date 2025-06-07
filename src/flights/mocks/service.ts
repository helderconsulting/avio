import { ObjectId } from 'mongodb';
import type { WithId } from 'mongodb';
import { AppError } from '../../error.js';
import type { FlightsServiceInterface } from '../context.js';
import { NotFoundError } from '../error.js';
import type { FlightDocument } from '../schema.js';

export class MockFlightsService implements FlightsServiceInterface {
  constructor(private collection: Map<ObjectId, WithId<FlightDocument>>) {}

  retrieveAllFlights(): Promise<FlightDocument[]> {
    try {
      const documents = Array.from(this.collection.values());
      return Promise.resolve(documents);
    } catch {
      throw new AppError();
    }
  }

  retrieveFlight(id: string): Promise<FlightDocument> {
    try {
      const objectId = new ObjectId(id);
      if (!this.collection.has(objectId)) {
        throw new NotFoundError();
      }

      const document = this.collection.get(objectId);
      if (!document) {
        throw new NotFoundError();
      }

      return Promise.resolve(document);
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

    return Promise.resolve(result);
  }

  deleteFlight(id: string): Promise<void> {
    const objectId = new ObjectId(id);

    if (this.collection.has(objectId)) {
      this.collection.delete(objectId);
    }

    return Promise.resolve();
  }

  createFlight(document: FlightDocument): Promise<WithId<FlightDocument>> {
    const objectId = new ObjectId();

    const documentWithId = {
      ...document,
      _id: objectId,
    };

    this.collection.set(objectId, documentWithId);

    return Promise.resolve(documentWithId);
  }
}

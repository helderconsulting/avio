import { ObjectId } from 'mongodb';
import type { WithId } from 'mongodb';
import { AppError } from '../../error.js';
import type { FlightsServiceInterface } from '../context.js';
import { NotFoundError } from '../error.js';
import type { FlightRequest, FlightResponse } from '../schema.js';
import { toFlightReponse } from '../schema.js';

export class MockFlightsService implements FlightsServiceInterface {
  private shouldFailInternally = false;
  constructor(private collection: Map<string, WithId<FlightRequest>>) {}

  failInternally() {
    this.shouldFailInternally = true;
  }

  retrieveAllFlights(): Promise<FlightResponse[]> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }
      const documents = Array.from(this.collection.values());
      return Promise.resolve(documents.map(toFlightReponse));
    } catch {
      return Promise.reject(new AppError());
    }
  }

  retrieveFlight(id: string): Promise<FlightResponse> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }

      if (!this.collection.has(id)) {
        throw new NotFoundError();
      }

      const document = this.collection.get(id);
      if (!document) {
        throw new NotFoundError();
      }

      return Promise.resolve(toFlightReponse(document));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return Promise.reject(error);
      }
      return Promise.reject(new AppError());
    }
  }

  updateFlight(id: string, document: FlightRequest): Promise<FlightResponse> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }

      const objectId = new ObjectId(id);

      if (!this.collection.has(id)) {
        throw new NotFoundError();
      }

      const original = this.collection.get(id);
      this.collection.set(id, {
        ...original,
        ...document,
        _id: objectId,
      });

      const result = this.collection.get(id);
      if (!result) {
        throw new NotFoundError();
      }

      return Promise.resolve(toFlightReponse(result));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return Promise.reject(error);
      }
      return Promise.reject(new AppError());
    }
  }

  deleteFlight(id: string): Promise<void> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }

      if (!this.collection.has(id)) {
        throw new NotFoundError();
      }

      this.collection.delete(id);

      return Promise.resolve();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return Promise.reject(error);
      }
      return Promise.reject(new AppError());
    }
  }

  createFlight(document: WithId<FlightRequest>): Promise<FlightResponse> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      document._id ??= new ObjectId('6841cade4cace03b8f75235b');

      this.collection.set(document._id.toString(), document);

      return Promise.resolve(toFlightReponse(document));
    } catch {
      return Promise.reject(new AppError());
    }
  }
}

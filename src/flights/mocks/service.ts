import { ObjectId } from 'mongodb';
import type { WithId } from 'mongodb';
import { AppError } from '../../error.js';
import type { FlightsServiceInterface } from '../context.js';
import { NotFoundError } from '../error.js';
import type { FlightEntity, FlightRequest, FlightResponse } from '../schema.js';
import { toFlightReponse } from '../schema.js';

export const toKey = (flightId: string, userId: string) =>
  `${flightId}-${userId}`;

export class MockFlightsService implements FlightsServiceInterface {
  private shouldFailInternally = false;
  constructor(private collection: Map<string, WithId<FlightEntity>>) {}

  failInternally() {
    this.shouldFailInternally = true;
  }

  retrieveAllFlights(userId: string): Promise<FlightResponse[]> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }
      const documents = Array.from(this.collection.values());
      return Promise.resolve(
        documents
          .filter((entity) => entity.userId === userId)
          .map(toFlightReponse)
      );
    } catch (e) {
      return Promise.reject(new AppError());
    }
  }

  retrieveFlight(flightId: string, userId: string): Promise<FlightResponse> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }

      if (!this.collection.has(toKey(flightId, userId))) {
        throw new NotFoundError();
      }

      const entity = this.collection.get(toKey(flightId, userId));
      if (!entity) {
        throw new NotFoundError();
      }

      return Promise.resolve(toFlightReponse(entity));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return Promise.reject(error);
      }
      return Promise.reject(new AppError());
    }
  }

  updateFlight(
    flightId: string,
    userId: string,
    request: FlightRequest
  ): Promise<FlightResponse> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }

      const key = toKey(flightId, userId);
      const objectId = new ObjectId(flightId);

      if (!this.collection.has(key)) {
        throw new NotFoundError();
      }

      const original = this.collection.get(key);
      this.collection.set(key, {
        ...original,
        ...request,
        userId,
        _id: objectId,
      });

      const result = this.collection.get(key);
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

  deleteFlight(flightId: string, userId: string): Promise<void> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }

      const key = toKey(flightId, userId);

      if (!this.collection.has(key)) {
        throw new NotFoundError();
      }

      this.collection.delete(key);

      return Promise.resolve();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return Promise.reject(error);
      }
      return Promise.reject(new AppError());
    }
  }

  createFlight(
    userId: string,
    request: WithId<FlightRequest>
  ): Promise<FlightResponse> {
    try {
      if (this.shouldFailInternally) {
        throw new Error('Internal failure');
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      request._id ??= new ObjectId('6841cade4cace03b8f75235b');

      const entity = { ...request, userId };
      this.collection.set(toKey(request._id.toString(), userId), entity);

      return Promise.resolve(toFlightReponse(entity));
    } catch {
      return Promise.reject(new AppError());
    }
  }
}

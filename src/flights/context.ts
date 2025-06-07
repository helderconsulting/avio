import type { ObjectId, WithId } from 'mongodb';
import type { AppVariables } from '../context.js';
import type { FlightDocument } from './schema.js';

export interface FlightsServiceInterface {
  retrieveAllFlights(): Promise<FlightDocument[]>;
  retrieveFlight(id: string): Promise<FlightDocument>;
  updateFlight(
    id: string,
    document: FlightDocument
  ): Promise<FlightDocument | null>;
  deleteFlight(id: string): Promise<void>;
  createFlight(document: FlightDocument): Promise<WithId<FlightDocument>>;
}

export interface FlightsVariables extends AppVariables {
  service: FlightsServiceInterface;
}

export type FlightsContext = { Variables: FlightsVariables };

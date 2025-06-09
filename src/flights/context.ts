import type { AppVariables } from '../context.js';
import type { FlightRequest, FlightResponse } from './schema.js';

export interface FlightsServiceInterface {
  retrieveAllFlights(userId: string): Promise<FlightResponse[]>;
  retrieveFlight(id: string, userId: string): Promise<FlightResponse>;
  updateFlight(
    id: string,
    userId: string,
    document: FlightRequest
  ): Promise<FlightResponse>;
  deleteFlight(id: string, userId: string): Promise<void>;
  createFlight(
    userId: string,
    document: FlightRequest
  ): Promise<FlightResponse>;
}

export interface FlightsVariables extends AppVariables {
  flightsService: FlightsServiceInterface;
}

export interface FlightsContext {
  Variables: FlightsVariables;
}

export interface PartialFlightsContext {
  Variables: Partial<FlightsVariables>;
}

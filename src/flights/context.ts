import type { AppVariables } from '../context.js';
import type { FlightRequest, FlightResponse } from './schema.js';

export interface FlightsServiceInterface {
  retrieveAllFlights(): Promise<FlightResponse[]>;
  retrieveFlight(id: string): Promise<FlightResponse>;
  updateFlight(id: string, document: FlightRequest): Promise<FlightResponse>;
  deleteFlight(id: string): Promise<void>;
  createFlight(document: FlightRequest): Promise<FlightResponse>;
}

export interface FlightsVariables extends AppVariables {
  flightsService: FlightsServiceInterface;
}

export interface FlightsContext {
  Variables: FlightsVariables;
}

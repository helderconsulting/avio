import type { WithId } from 'mongodb';
import z from 'zod';

const schedule = z.object({
  std: z
    .string({ description: 'The scheduled time of departure, ISO 8601 format' })
    .datetime(),
  sta: z
    .string({ description: 'The scheduled time of arrival, ISO 8601 format' })
    .datetime(),
});

export const flightRequest = z
  .object({
    aircraft: z
      .string({
        description: 'A code describing the aircraft assigned to the flight',
      })
      .min(1)
      .max(10),
    flightNumber: z
      .string({
        description: 'A code that identifies the flight',
      })
      .min(1)
      .max(10),
    schedule,
    departure: z
      .string({
        description: 'Identifier for the destination airport',
      })
      .min(4)
      .max(4),
    destination: z
      .string({
        description: 'Identifier for the destination airport',
      })
      .min(4)
      .max(4),
  })
  .strict();

export const param = z.object({ flightId: z.string().length(24) });
export const flightResponse = flightRequest.extend({ id: z.string() });

export type FlightRequest = z.infer<typeof flightRequest>;
export type FlightResponse = z.infer<typeof flightResponse>;

export const toFlightReponse = ({
  _id,
  ...flight
}: WithId<FlightRequest>): FlightResponse => ({
  ...flight,
  id: _id.toHexString(),
});

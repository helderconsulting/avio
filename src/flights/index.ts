import { zValidator } from '@hono/zod-validator';
import { flight, param } from './schema.js';
import { createFlightsState } from './state.js';
import { type MiddlewareHandler, Hono } from 'hono';
import type { FlightsContext } from './context.js';
import { AppError, ValidationError } from '../error.js';
import type { AuthContext } from '../auth/context.js';
import { createAuthState } from '../auth/state.js';

const validateParameters = zValidator('param', param, (result) => {
  if (!result.success) {
    throw new ValidationError();
  }
});

const validatePayload = (schema: typeof flight) =>
  zValidator('json', schema, (result) => {
    if (!result.success) {
      throw new ValidationError();
    }
  });

export const createRouter = (
  flightState: MiddlewareHandler<FlightsContext>,
  authState: MiddlewareHandler<AuthContext>
) => {
  const router = new Hono<FlightsContext>();

  router.use(flightState);
  router.use(authState);

  router.onError((err, c) => {
    console.log(err);
    if (err instanceof AppError) {
      return err.toReponse(c);
    }
    return c.text('Unhandled error', 500);
  });

  router
    .get('/', async (c) => {
      const service = c.get('service');
      const flights = await service.retrieveAllFlights();
      return c.json(flights, 200);
    })
    .post(validatePayload(flight), async (c) => {
      const flight = c.req.valid('json');
      const service = c.get('service');
      const inserted = await service.createFlight(flight);
      return c.json(inserted, 201);
    });

  router
    .get('/:flightId', validateParameters, async (c) => {
      const { flightId } = c.req.valid('param');

      const service = c.get('service');

      const flight = await service.retrieveFlight(flightId);

      return c.json(flight);
    })
    .patch(validateParameters, validatePayload(flight), async (c) => {
      const flight = c.req.valid('json');
      const { flightId } = c.req.valid('param');

      const service = c.get('service');
      const update = await service.updateFlight(flightId, flight);

      if (!update) {
        return c.text('Flight not found', 404);
      }

      return c.json(update, 200);
    })
    .delete(validateParameters, async (c) => {
      const { flightId } = c.req.valid('param');

      const service = c.get('service');

      await service.deleteFlight(flightId);

      return c.status(204);
    });

  return router;
};

export const flights = createRouter(createFlightsState, createAuthState);

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import type { AuthContext } from '../auth/context.js';
import { authGuard } from '../auth/state.js';
import { ValidationError } from '../error.js';
import { handleError } from '../lib/error.js';
import type { FlightsContext } from './context.js';
import { flightRequest, param } from './schema.js';
import { createFlightsState } from './state.js';

const validateParameters = zValidator('param', param, (result) => {
  if (!result.success) {
    throw new ValidationError();
  }
});

const validatePayload = (schema: typeof flightRequest) =>
  zValidator('json', schema, (result) => {
    if (!result.success) {
      throw new ValidationError();
    }
  });

export const createRouter = (
  flightState: MiddlewareHandler<FlightsContext>,
  authGuard: MiddlewareHandler<AuthContext>
) => {
  const router = new Hono<FlightsContext>();

  router.use(authGuard);
  router.use(flightState);
  router.onError(handleError('flights'));

  router
    .get('/', async (c) => {
      const service = c.get('flightsService');
      const user = c.get('user');
      const flights = await service.retrieveAllFlights(user.id);

      return c.json(flights, 200);
    })
    .post(validatePayload(flightRequest), async (c) => {
      const flight = c.req.valid('json');

      const service = c.get('flightsService');
      const user = c.get('user');

      const inserted = await service.createFlight(user.id, flight);
      return c.json(inserted, 201);
    });

  router
    .get('/:flightId', validateParameters, async (c) => {
      const { flightId } = c.req.valid('param');

      const service = c.get('flightsService');
      const user = c.get('user');

      const flight = await service.retrieveFlight(flightId, user.id);

      return c.json(flight);
    })
    .patch(validateParameters, validatePayload(flightRequest), async (c) => {
      const flight = c.req.valid('json');
      const { flightId } = c.req.valid('param');

      const service = c.get('flightsService');
      const user = c.get('user');

      const update = await service.updateFlight(flightId, user.id, flight);

      return c.json(update, 200);
    })
    .delete(validateParameters, async (c) => {
      const { flightId } = c.req.valid('param');

      const service = c.get('flightsService');
      const user = c.get('user');

      await service.deleteFlight(flightId, user.id);

      return c.body(null, 204);
    });

  return router;
};

export const flights = createRouter(createFlightsState, authGuard);

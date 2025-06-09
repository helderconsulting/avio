import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import type { AuthContext } from '../auth/context.js';
import { authGuard } from '../auth/state.js';
import { ValidationError } from '../error.js';
import { handleError } from '../lib/error.js';
import type { FlightsContext } from './context.js';
import { flightRequest, param } from './schema.js';
import { createFlightsState } from './state.js';

const validateParameters = zValidator(
  'param',
  param,
  (result, c: Context<FlightsContext>) => {
    const { logger } = c.var;
    if (!result.success) {
      logger.warn(
        { payload: result.data, issues: result.error.issues },
        'Invalid parameters'
      );
      throw new ValidationError();
    }
  }
);

const validatePayload = (schema: typeof flightRequest) =>
  zValidator('json', schema, (result, c: Context<FlightsContext>) => {
    const { logger } = c.var;
    if (!result.success) {
      logger.warn(
        { payload: result.data, issues: result.error.issues },
        'Invalid payload'
      );
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
      const { flightsService, user } = c.var;

      const flights = await flightsService.retrieveAllFlights(user.id);

      return c.json(flights, 200);
    })
    .post(validatePayload(flightRequest), async (c) => {
      const { flightsService, user } = c.var;
      const flight = c.req.valid('json');

      const inserted = await flightsService.createFlight(user.id, flight);

      return c.json(inserted, 201);
    });

  router
    .get('/:flightId', validateParameters, async (c) => {
      const { flightsService, user } = c.var;
      const { flightId } = c.req.valid('param');

      const flight = await flightsService.retrieveFlight(flightId, user.id);

      return c.json(flight);
    })
    .patch(validateParameters, validatePayload(flightRequest), async (c) => {
      const { flightsService, user } = c.var;
      const flight = c.req.valid('json');
      const { flightId } = c.req.valid('param');

      const update = await flightsService.updateFlight(
        flightId,
        user.id,
        flight
      );

      return c.json(update, 200);
    })
    .delete(validateParameters, async (c) => {
      const { flightsService, user } = c.var;
      const { flightId } = c.req.valid('param');

      await flightsService.deleteFlight(flightId, user.id);

      return c.body(null, 204);
    });

  return router;
};

export const flights = createRouter(createFlightsState, authGuard);

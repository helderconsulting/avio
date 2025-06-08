import type { Token } from './auth/context.js';
import { createAuthState } from './auth/state.js';
import type { FlightResponse } from './flights/schema.js';
import { Connection } from './lib/mocks/connection.js';
import { createAppState } from './state.js';
import { createRouter } from './index.js';

const connection = new Connection();
const router = createRouter(createAppState(connection), createAuthState);

describe('App', () => {
  test('Full flow', async () => {
    const username = 'test_user';
    const password = 'thisIsAGoodPassword';

    const signup = await router.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test user',
        email: 'test@mail.com',
        username,
        password,
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    expect(signup.status).toBe(201);

    const signin = await router.request('/auth', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const { token } = await signin.json<Token>();
    expect(token).toBeDefined();

    const inserted = await router.request('/flights', {
      method: 'POST',
      body: JSON.stringify({
        aircraft: 'CSTRC',
        flightNumber: 'AVIO202',
        schedule: {
          std: '2024-09-30T22:00:00.000Z',
          sta: '2024-09-30T23:00:00.000Z',
        },
        departure: 'LPPD',
        destination: 'LPLA',
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    });

    const all = await router.request('/flights', {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    });

    const flights = await all.json<FlightResponse[]>();
    expect(flights.length).toBe(1);

    const { id } = await inserted.json<FlightResponse>();

    const newFlightNumber = 'AVIO100';
    const updated = await router.request(`/flights/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        aircraft: 'CSTRC',
        flightNumber: newFlightNumber,
        schedule: {
          std: '2024-09-30T22:00:00.000Z',
          sta: '2024-09-30T23:00:00.000Z',
        },
        departure: 'LPPD',
        destination: 'LPLA',
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    });

    const { flightNumber } = await updated.json<FlightResponse>();

    expect(flightNumber).toEqual(newFlightNumber);

    const firstResult = await router.request(`/flights/${id}`, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    });

    const first = await firstResult.json();
    expect(first).toBeDefined();

    const removal = await router.request(`/flights/${id}`, {
      method: 'DELETE',
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    });

    expect(removal.status).toBe(204);

    const secondResult = await router.request(`/flights/${id}`, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    });

    expect(secondResult.status).toBe(404);
  });
});

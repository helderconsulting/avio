import type { Token } from './auth/context.js';
import { createAuthState } from './auth/state.js';
import type { FlightRequest, FlightResponse } from './flights/schema.js';
import { Connection } from './lib/mocks/connection.js';
import { createAppState } from './state.js';
import { createRouter } from './index.js';

const connection = new Connection();
const router = createRouter(createAppState(connection), createAuthState);

class Scenario {
  private token = '';

  constructor(private username: string, private password: string) {}

  async signup() {
    const result = await router.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test user',
        email: `${this.username}@mail.com`,
        username: this.username,
        password: this.password,
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    expect(result.status).toBe(201);
    return this;
  }

  async signin() {
    const result = await router.request('/auth', {
      method: 'POST',
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const { token } = await result.json<Token>();
    expect(token).toBeDefined();

    this.token = token;
    return this;
  }

  async createFlight(value: FlightRequest) {
    const result = await router.request('/flights', {
      method: 'POST',
      body: JSON.stringify(value),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    });

    const { id } = await result.json<FlightResponse>();
    return id;
  }

  async updateFlightNumber(id: string, value: string) {
    const result = await router.request(`/flights/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        aircraft: 'CSTRC',
        flightNumber: value,
        schedule: {
          std: '2024-09-30T22:00:00.000Z',
          sta: '2024-09-30T23:00:00.000Z',
        },
        departure: 'LPPD',
        destination: 'LPLA',
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    });

    const { flightNumber } = await result.json<FlightResponse>();

    expect(flightNumber).toEqual(value);
    return this;
  }

  async retreiveFlight(id: string) {
    const result = await router.request(`/flights/${id}`, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    });

    const json = await result.json();
    expect(json).toBeDefined();
  }

  async flightNotFound(id: string) {
    const result = await router.request(`/flights/${id}`, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      }),
    });

    expect(result.status).toBe(404);
    return this;
  }

  async deleteFlight(id: string) {
    const result = await router.request(`/flights/${id}`, {
      method: 'DELETE',
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
    });

    expect(result.status).toBe(204);
  }

  async deleteAllFlight(...ids: string[]) {
    for (const id of ids) {
      const result = await router.request(`/flights/${id}`, {
        method: 'DELETE',
        headers: new Headers({
          Authorization: `Bearer ${this.token}`,
        }),
      });

      expect(result.status).toBe(204);
    }
  }

  async hasNumberOfFlights(value: number) {
    const result = await router.request('/flights', {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${this.token}`,
      }),
    });

    const flights = await result.json<FlightResponse[]>();
    expect(flights.length).toBe(value);
    return this;
  }
}

describe('App', () => {
  describe('An existing user', () => {
    const scenario = new Scenario('test_user', 'thisIsAGoodPassword');
    beforeAll(async () => {
      await scenario.signup();
    });

    describe('Which is authenticated', () => {
      beforeAll(async () => {
        await scenario.signin();
      });

      test('Can create a flight, update the flightnumber and cancel the flight', async () => {
        const flightId = await scenario.createFlight({
          aircraft: 'CSTRC',
          flightNumber: 'AVIO202',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        });
        await scenario.hasNumberOfFlights(1);
        await scenario.updateFlightNumber(flightId, 'AVIO100');
        await scenario.retreiveFlight(flightId);
        await scenario.deleteFlight(flightId);
        await scenario.flightNotFound(flightId);
      });

      test('Can create multiple flights', async () => {
        const firstFlightId = await scenario.createFlight({
          aircraft: 'CSTRC',
          flightNumber: 'AVIO2',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        });

        const secondFlightId = await scenario.createFlight({
          aircraft: 'CSTRC',
          flightNumber: 'AVIO1',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        });

        const thirdFlightId = await scenario.createFlight({
          aircraft: 'CSTRC',
          flightNumber: 'AVIO3',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        });

        await scenario.hasNumberOfFlights(3);

        await scenario.deleteAllFlight(
          firstFlightId,
          secondFlightId,
          thirdFlightId
        );
      });
    });
  });
  describe('Two users', () => {
    const scenarioUserA = new Scenario('test_user_a', 'thisIsAGoodPasswordA');
    const scenarioUserB = new Scenario('test_user_b', 'thisIsAGoodPasswordB');
    beforeAll(async () => {
      await scenarioUserA.signup();
      await scenarioUserB.signup();
    });

    describe('Who are authenticated', () => {
      beforeAll(async () => {
        await scenarioUserA.signin();
        await scenarioUserB.signin();
      });
      test('Can only access their own flights', async () => {
        const flightUserA = await scenarioUserA.createFlight({
          aircraft: 'CSTRC',
          flightNumber: 'AVIO01A',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        });

        const flightUserB = await scenarioUserB.createFlight({
          aircraft: 'CSTRC',
          flightNumber: 'AVIO01B',
          schedule: {
            std: '2024-09-30T22:00:00.000Z',
            sta: '2024-09-30T23:00:00.000Z',
          },
          departure: 'LPPD',
          destination: 'LPLA',
        });

        await scenarioUserA.retreiveFlight(flightUserA);
        await scenarioUserA.flightNotFound(flightUserB);

        await scenarioUserB.retreiveFlight(flightUserB);
        await scenarioUserB.flightNotFound(flightUserA);
      });
    });
  });
});

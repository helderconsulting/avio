import { createAuthState } from './auth/state.js';
import { createAppState } from './state.js';
import { createRouter } from './index.js';

const router = createRouter(createAppState, createAuthState);

describe('App', () => {
  test('signup -> signin -> create flight -> update flight -> delete flight', async () => {
    await router.request('/auth/signup', {
      method: 'POST',
    });

    await router.request('/signin', {
      method: 'POST',
    });

    await router.request('/flights', {
      method: 'POST',
    });

    await router.request('/flights/:id', {
      method: 'PATCH',
    });

    await router.request('/flights/:id', {
      method: 'DELETE',
    });
  });
});

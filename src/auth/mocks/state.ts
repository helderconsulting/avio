import type { MiddlewareHandler } from 'hono';
import type { AuthContext } from '../context.js';
import { UnauthorizedError } from '../error.js';
import { MockAuthService } from './service.js';

export const createMockAuthState: MiddlewareHandler<AuthContext> = async (
  c,
  next
) => {
  const authService = new MockAuthService();
  c.set('authService', authService);
  await next();
};

export const authenticated: MiddlewareHandler<AuthContext> = async (
  c,
  next
) => {
  await next();
};

export const unauthenticated: MiddlewareHandler<AuthContext> = () => {
  return Promise.reject(new UnauthorizedError());
};

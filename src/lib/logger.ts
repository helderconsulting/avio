import type { MiddlewareHandler } from 'hono';
import { pino } from 'pino';
import { randomUUID } from 'node:crypto';
import { AppError } from '../error.js';

export const pinoLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  redact: ['token', 'password', 'headers.authorization'],
  level: process.env.LOG_LEVEL ?? 'info',
});

export const logger: MiddlewareHandler = async (c, next) => {
  const requestId = c.req.header('X-Request-Id') ?? randomUUID();

  const log = pinoLogger.child({
    requestId,
    method: c.req.method,
    path: c.req.path,
  });

  c.set('logger', log);
  c.res.headers.set('X-Request-Id', requestId);

  const start = Date.now();
  try {
    await next();
  } catch (error) {
    log.error(error);
    throw new AppError();
  } finally {
    const duration = Date.now() - start;
    log.info({ status: c.res.status, duration }, 'Request completed');
  }
};

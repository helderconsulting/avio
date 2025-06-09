import type { Context } from 'hono';
import { AppError } from '../error.js';
import { pinoLogger } from './logger.js';

export const handleError = (resource: string) => (err: Error, c: Context) => {
  if (err instanceof AppError) {
    return err.toReponse(c);
  }
  pinoLogger.fatal({ resource, err }, 'A unhandled error occured');
  return c.text(`Unhandled ${resource} error`, 500);
};

import type { Context } from 'hono';
import { AppError } from '../error.js';

export const handleError = (resource: string) => (err: Error, c: Context) => {
  console.error(`${resource}: ${err}`);
  if (err instanceof AppError) {
    return err.toReponse(c);
  }
  return c.text(`Unhandled ${resource} error`, 500);
};

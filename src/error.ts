import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class AppError extends Error {
  constructor(
    public message = 'Something went wrong',
    public statusCode: ContentfulStatusCode = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toReponse(c: Context) {
    return c.text(this.message, this.statusCode);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid payload') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

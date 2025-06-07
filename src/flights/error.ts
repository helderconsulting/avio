import { AppError } from '../error.js';

export class NotFoundError extends AppError {
  constructor(message = 'Flight not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

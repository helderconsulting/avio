import { AppError } from '../error.js';

export class UnauthorizedError extends AppError {
  constructor() {
    super('User is not authenticated', 401, 'UNAUTHORIZED');
  }
}

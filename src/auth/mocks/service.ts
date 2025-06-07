import type { User } from 'better-auth';
import type { AuthServiceInterface, Token } from '../context.js';
import type { Credentials, Account } from '../schema.js';

export class MockAuthService implements AuthServiceInterface {
  signin(credentials: Credentials): Promise<Token> {
    throw new Error('Method not implemented.');
  }
  signup(account: Account): Promise<User> {
    throw new Error('Method not implemented.');
  }
  whoAmI(headers: Headers): Promise<User> {
    throw new Error('Method not implemented.');
  }
}

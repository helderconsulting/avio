import type { User } from 'better-auth';
import type { AppVariables } from '../context.js';
import type { Credentials, Account } from './schema.js';

export interface Token {
  token: string;
}

export interface AuthServiceInterface {
  signin(credentials: Credentials): Promise<Token>;
  signup(account: Account): Promise<User>;
  whoAmI(headers: Headers): Promise<User>;
}

export interface AuthVariables extends AppVariables {
  authService: AuthServiceInterface;
}

export interface AuthContext {
  Variables: AuthVariables;
}

export interface PartialAuthContext {
  Variables: Partial<AuthVariables>;
}

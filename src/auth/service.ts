import type { User } from 'better-auth';
import { AppError } from '../error.js';
import type { Auth } from '../lib/auth.js';
import type { AuthServiceInterface, Token } from './context.js';
import { UnauthorizedError } from './error.js';
import type { Credentials, Account } from './schema.js';

export class AuthService implements AuthServiceInterface {
  constructor(private auth: Auth) {}

  async signup({ name, email, username, password }: Account): Promise<User> {
    try {
      const result = await this.auth.api.signUpEmail({
        body: {
          name,
          email,
          username,
          password,
        },
      });

      return result.user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }

  async signin({ username, password }: Credentials): Promise<Token> {
    try {
      const result = await this.auth.api.signInUsername({
        body: {
          username,
          password,
        },
      });

      if (!result) {
        throw new UnauthorizedError();
      }

      return { token: result.token };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }

  async whoAmI(headers: Headers): Promise<User> {
    try {
      const session = await this.auth.api.getSession({
        headers,
      });

      if (!session?.user) {
        throw new UnauthorizedError();
      }

      return session.user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      console.error(error);
      throw new AppError();
    }
  }
}

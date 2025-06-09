import type { User } from 'better-auth';
import type { Logger } from 'pino';
import { AppError } from '../error.js';
import type { Auth } from '../lib/auth.js';
import type { AuthServiceInterface, Token } from './context.js';
import { UnauthorizedError } from './error.js';
import type { Credentials, Account } from './schema.js';

export class AuthService implements AuthServiceInterface {
  constructor(private auth: Auth, private logger: Logger) {}

  async signup({ name, email, username, password }: Account): Promise<User> {
    try {
      this.logger.debug({ name, email, username, password }, 'Signing up');
      const result = await this.auth.api.signUpEmail({
        body: {
          name,
          email,
          username,
          password,
        },
      });

      const response = result.user;
      this.logger.info({ user: response }, 'User signed up');

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      this.logger.error(error);
      throw new AppError();
    }
  }

  async signin({ username, password }: Credentials): Promise<Token> {
    try {
      this.logger.debug({ username, password }, 'Signing in');
      const result = await this.auth.api.signInUsername({
        body: {
          username,
          password,
        },
      });

      if (!result) {
        this.logger.warn({ username, password }, 'User not found');
        throw new UnauthorizedError();
      }

      const response = { token: result.token };
      this.logger.info({ token: response }, 'User signed in');

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      this.logger.error(error);
      throw new AppError();
    }
  }

  async whoAmI(headers: Headers): Promise<User> {
    try {
      this.logger.debug({ headers }, 'Identifying user');
      const session = await this.auth.api.getSession({
        headers,
      });

      if (!session?.user) {
        this.logger.warn({ headers }, 'User not found');
        throw new UnauthorizedError();
      }

      const response = session.user;
      this.logger.info({ user: response }, 'User identified');

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      this.logger.error(error);
      throw new AppError();
    }
  }
}

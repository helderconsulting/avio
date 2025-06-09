import { betterAuth } from 'better-auth';
import type { Logger as AuthLogger } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer, username } from 'better-auth/plugins';
import type { Db } from 'mongodb';
import type { Logger as PinoLogger } from 'pino';
import { pinoLogger } from './logger.js';

const pinoAdapter = (logger: PinoLogger): AuthLogger => ({
  log: (level) => {
    switch (level) {
      case 'info':
        return logger.info;
      case 'warn':
        return logger.warn;
      case 'error':
        return logger.error;
      case 'debug':
        return logger.debug;
    }
  },
});

export const createAuth = (db: Db) =>
  betterAuth({
    logger: pinoAdapter(pinoLogger),
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
    },
    plugins: [bearer(), username()],
  });

export type Auth = ReturnType<typeof createAuth>;

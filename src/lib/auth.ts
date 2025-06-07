import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer, username } from 'better-auth/plugins';
import type { Db } from 'mongodb';

export const createAuth = (db: Db) =>
  betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
    },
    plugins: [bearer(), username()],
  });

export type Auth = ReturnType<typeof createAuth>;

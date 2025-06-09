import type { User } from 'better-auth';
import type { Db } from 'mongodb';
import type { Logger } from 'pino';

export interface AppVariables {
  db: Db;
  user: User;
  logger: Logger;
}

export interface AppContext {
  Variables: AppVariables;
}

export interface PartialAppContext {
  Variables: Partial<AppVariables>;
}

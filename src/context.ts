import type { User } from 'better-auth';
import type { Db } from 'mongodb';

export interface AppVariables {
  db: Db;
  user: User;
}

export interface AppContext {
  Variables: AppVariables;
}

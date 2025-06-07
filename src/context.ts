import type { Db } from 'mongodb';

export interface AppVariables {
  db: Db;
}

export interface AppContext {
  Variables: AppVariables;
}

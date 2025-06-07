import type { Db } from 'mongodb';
import type { Auth } from './lib/auth.js';

export interface AppVariables {
  db: Db;
  auth: Auth;
}

export interface AppContext {
  Variables: AppVariables;
}

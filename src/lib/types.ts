import type { Db } from 'mongodb';

export interface ConnectionInterface {
  connect(): Promise<Db>;
  disconnect(): Promise<void>;
}

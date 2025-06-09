import type { Db, MongoClient } from 'mongodb';
import type { Logger } from 'pino';
import { AppError } from '../error.js';
import type { ConnectionInterface } from './types.js';

export class Connection implements ConnectionInterface {
  private db: Db | null = null;

  constructor(private client: MongoClient, private logger: Logger) {}

  async connect() {
    try {
      this.logger.debug('Establishing a database connection');
      if (!this.db) {
        this.logger.debug('Database does not exist, creating a new connection');
        await this.client.connect();
        this.db = this.client.db(process.env.DATABASE);
      }

      return this.db;
    } catch (error) {
      this.logger.error(error);
      throw new AppError();
    }
  }

  async disconnect() {
    try {
      this.logger.debug('Disconnecting the database connection');
      await this.client.close();
      this.db = null;
    } catch (error) {
      this.logger.error(error);
      throw new AppError();
    }
  }
}

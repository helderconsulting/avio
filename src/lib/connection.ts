import type { Db, MongoClient } from 'mongodb';
import { AppError } from '../error.js';

export class Connection {
  private db: Db | null = null;

  constructor(private client: MongoClient) {}

  async connect() {
    try {
      if (!this.db) {
        await this.client.connect();
        this.db = this.client.db(process.env.DATABASE);
      }

      return this.db;
    } catch (error) {
      throw new AppError();
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      this.db = null;
    } catch (error) {
      throw new AppError();
    }
  }
}

import { MongoDBContainer } from '@testcontainers/mongodb';
import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import { AppError } from '../../error.js';
import type { ConnectionInterface } from '../types.js';

export class Connection implements ConnectionInterface {
  private db: Db | null = null;
  private client: MongoClient | null = null;

  async connect() {
    try {
      if (!this.client) {
        const container = await new MongoDBContainer('mongo:6.0.1').start();

        this.client = new MongoClient(
          `${container.getConnectionString()}?directConnection=true`
        );
      }

      if (!this.db) {
        await this.client.connect();
        this.db = this.client.db(process.env.DATABASE);
      }

      return this.db;
    } catch (error) {
      console.error(error);
      throw new AppError();
    }
  }

  async disconnect() {
    try {
      await this.client?.close();
      this.db = null;
    } catch (error) {
      console.error(error);
      throw new AppError();
    }
  }
}

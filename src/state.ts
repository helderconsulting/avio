import type { MiddlewareHandler } from 'hono';
import { MongoClient } from 'mongodb';
import type { AppContext } from './context.js';
import { Connection } from './lib/connection.js';

const client = new MongoClient(process.env.CONNECTION_URL);
const connection = new Connection(client);

export const createAppState: MiddlewareHandler<AppContext> = async (
  c,
  next
) => {
  const db = await connection.connect();
  c.set('db', db);

  await next();
};

process.on('SIGINT', () => {
  connection.disconnect().catch(console.error);
});

import { MongoClient } from 'mongodb';
import type { MiddlewareHandler } from 'hono';
import type { AppContext } from './context.js';
import { createAuth } from './lib/auth.js';
import { Connection } from './lib/connection.js';

const client = new MongoClient(process.env.CONNECTION_URL);
const connection = new Connection(client);

export const createState: MiddlewareHandler<AppContext> = async (c, next) => {
  const db = await connection.connect();

  if (!c.get('db')) {
    c.set('db', db);
  }

  if (!c.get('auth')) {
    const auth = createAuth(db);
    c.set('auth', auth);
  }

  await next();
};

process.on('SIGINT', async () => {
  await connection.disconnect();
  process.exit(0);
});

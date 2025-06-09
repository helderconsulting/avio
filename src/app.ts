import { serve } from '@hono/node-server';
import { MongoClient } from 'mongodb';
import { createAuthState } from './auth/state.js';
import { Connection } from './lib/connection.js';
import { pinoLogger } from './lib/logger.js';
import { createAppState } from './state.js';
import { createRouter } from './index.js';

const client = new MongoClient(process.env.CONNECTION_URL);
const connection = new Connection(client, pinoLogger);
const app = createRouter(createAppState(connection), createAuthState);

// randomize port during testing to avoid port collisions
const port = process.env.NODE_ENV === 'test' ? 0 : process.env.PORT ?? 3000;

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    pinoLogger.info(
      `Server is running on http://localhost:${info.port.toString()}`
    );
  }
);

process.on('SIGINT', () => {
  server.close();
});
process.on('SIGTERM', () => {
  server.close();
});
process.on('uncaughtException', (err) => {
  pinoLogger.fatal({ err }, 'A uncaught exception occured');
  server.close();
});
process.on('unhandledRejection', (err) => {
  pinoLogger.fatal({ err }, 'A unhandled rejection occured');
  server.close();
});

server.on('close', () => {
  pinoLogger.info('closing server');
  connection.disconnect().catch(pinoLogger.error);
});

import { z } from 'zod';
import { processEnv } from './schema.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof processEnv> {}
  }
}

export {};

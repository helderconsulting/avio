import type { z } from 'zod';
import type { processEnv } from './schema.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof processEnv> {
      _phantom: null;
    }
  }
}

export {};

import { z } from 'zod';

export const processEnv = z.object({
  DATABASE: z.string(),
  CONNECTION_URL: z
    .string({ description: 'A valid mongo url' })
    .startsWith('mongodb://', { message: 'Must start with mongodb://' }),
});

export type ProcessEnv = z.infer<typeof processEnv>;

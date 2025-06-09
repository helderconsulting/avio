import { z } from 'zod';

export const processEnv = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']),
  DATABASE: z.string(),
  PORT: z.number().optional(),
  CONNECTION_URL: z
    .string({ description: 'A valid mongo url' })
    .startsWith('mongodb://', { message: 'Must start with mongodb://' }),
});

export type EnvironmentVariables = z.infer<typeof processEnv>;

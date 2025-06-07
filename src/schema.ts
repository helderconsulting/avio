import { z } from 'zod';

export const processEnv = z.object({
  DATABASE: z.string(),
  CONNECTION_URL: z
    .string({ description: 'A valid mongo url' })
    .startsWith('mongodb://', { message: 'Must start with mongodb://' }),
});

export type EnvironmentVariables = z.infer<typeof processEnv>;

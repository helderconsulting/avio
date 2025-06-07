import z from 'zod';

export const credentials = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const account = credentials.extend({
  name: z.string(),
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
});

export type Account = z.infer<typeof account>;
export type Credentials = z.infer<typeof credentials>;

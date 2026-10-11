import { z } from 'zod';

export const updateMeSchema = z
  .object({
    name: z.string({ error: 'name must be a string' }),
    email: z.string({ error: 'email must be a string' }),
  })
  .partial();

export const updateUserSchema = z
  .object({
    name: z.string({ error: 'name must be a string' }),
    email: z.string({ error: 'email must be a string' }),
    role: z.enum(['user', 'guide', 'lead-guide', 'admin'], {
      error: 'role must be one of: user, guide, lead-guide, admin',
    }),
  })
  .partial();

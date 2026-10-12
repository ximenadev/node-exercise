import { z } from 'zod';
import { ROLES } from './users.constants';

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
    role: z.enum(ROLES, {
      error: `role must be one of: ${ROLES.join(', ')}`,
    }),
  })
  .partial();

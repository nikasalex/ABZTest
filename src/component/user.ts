import { z } from 'zod';

export const SchemaNewUser = z.object({
  name: z
    .string()
    .min(2, {
      message: 'The name must be at least 2 characters.',
    })
    .max(60, { message: 'The Name must be less than 60 characters' }),
  email: z
    .string()
    .min(2, { message: 'The Email must be more 2 characters' })
    .max(100, { message: 'The Email must be less than 100 characters' }),
  phone: z.string(),
  position_id: z.string().transform(Number),
});

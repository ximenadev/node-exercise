import { z } from 'zod';

const requiredString = (field: string, message: string) =>
  z.string({
    error: issue =>
      issue.input === undefined ? message : `${field} must be a string`,
  });

const requiredNumber = (field: string, message: string) =>
  z.number({
    error: issue =>
      issue.input === undefined ? message : `${field} must be a number`,
  });

export const createTourSchema = z.object({
  name: requiredString('name', 'A tour must have a name'),
  duration: requiredNumber('duration', 'A tour must have a duration'),
  maxGroupSize: requiredNumber('maxGroupSize', 'A tour must have a group size'),
  difficulty: z.enum(['easy', 'medium', 'difficult'], {
    error: 'Difficulty is either: easy, medium, difficult',
  }),
  price: requiredNumber('price', 'A tour must have a price'),
  priceDiscount: z
    .number({ error: 'priceDiscount must be a number' })
    .optional(),
  summary: requiredString('summary', 'A tour must have a summary'),
  description: z.string({ error: 'description must be a string' }).optional(),
  imageCover: requiredString('imageCover', 'A tour must have a cover image'),
  images: z
    .array(z.string(), { error: 'images must be a list of strings' })
    .optional(),
  startDates: z
    .array(z.string(), { error: 'startDates must be a list of dates' })
    .optional(),
  secretTour: z
    .boolean({ error: 'secretTour must be true or false' })
    .optional(),
});

export const updateTourSchema = createTourSchema.partial();

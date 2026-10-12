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

const longitude = z
  .number({ error: 'coordinates must be [longitude, latitude] numbers' })
  .min(-180, 'longitude must be between -180 and 180')
  .max(180, 'longitude must be between -180 and 180');

const latitude = z
  .number({ error: 'coordinates must be [longitude, latitude] numbers' })
  .min(-90, 'latitude must be between -90 and 90')
  .max(90, 'latitude must be between -90 and 90');

const coordinates = z.tuple([longitude, latitude], {
  error: 'coordinates must be [longitude, latitude]',
});

const geoPoint = z.object({
  type: z.literal('Point', { error: "type must be 'Point'" }).default('Point'),
  coordinates,
  address: z.string({ error: 'address must be a string' }).optional(),
  description: z.string({ error: 'description must be a string' }).optional(),
});

const tourLocation = geoPoint.extend({
  day: z
    .number({ error: 'day must be a number' })
    .int('day must be a whole number')
    .positive('day must be at least 1')
    .optional(),
});

const guideId = z
  .string({ error: 'guides must be a list of user ids' })
  .regex(/^[0-9a-fA-F]{24}$/, 'guides must be a list of user ids');

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
  startLocation: geoPoint.optional(),
  locations: z
    .array(tourLocation, { error: 'locations must be a list of places' })
    .optional(),
  guides: z
    .array(guideId, { error: 'guides must be a list of user ids' })
    .refine(ids => new Set(ids).size === ids.length, {
      error: 'guides must not contain duplicates',
    })
    .optional(),
});

export const updateTourSchema = createTourSchema.partial();

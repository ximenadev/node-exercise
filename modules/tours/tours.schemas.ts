import { z } from 'zod';
import {
  COORDINATES_MESSAGE,
  DIFFICULTIES,
  GEOJSON_POINT,
  LATITUDE_RANGE,
  LONGITUDE_RANGE,
} from './tours.constants';

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

const LONGITUDE_MESSAGE = `longitude must be between ${LONGITUDE_RANGE.min} and ${LONGITUDE_RANGE.max}`;
const LATITUDE_MESSAGE = `latitude must be between ${LATITUDE_RANGE.min} and ${LATITUDE_RANGE.max}`;

const longitude = z
  .number({ error: 'coordinates must be [longitude, latitude] numbers' })
  .min(LONGITUDE_RANGE.min, LONGITUDE_MESSAGE)
  .max(LONGITUDE_RANGE.max, LONGITUDE_MESSAGE);

const latitude = z
  .number({ error: 'coordinates must be [longitude, latitude] numbers' })
  .min(LATITUDE_RANGE.min, LATITUDE_MESSAGE)
  .max(LATITUDE_RANGE.max, LATITUDE_MESSAGE);

const coordinates = z.tuple([longitude, latitude], {
  error: COORDINATES_MESSAGE,
});

const geoPoint = z.object({
  type: z
    .literal(GEOJSON_POINT, { error: `type must be '${GEOJSON_POINT}'` })
    .default(GEOJSON_POINT),
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
  difficulty: z.enum(DIFFICULTIES, {
    error: `Difficulty is either: ${DIFFICULTIES.join(', ')}`,
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

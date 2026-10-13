import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils';
import {
  DEFAULT_DISTANCE_UNIT,
  EARTH_RADIUS,
  LATITUDE_RANGE,
  LONGITUDE_RANGE,
  type DistanceUnit,
} from './tours.constants';

const INVALID_UNIT = 'unit must be either mi or km';
const INVALID_CENTER = 'near must be a valid center in the format lat,lng';
const INVALID_RADIUS = 'radius must be a positive number';
const MISSING_NEAR = 'near (lat,lng) is required with radius and unit';

const parseCenter = (value: unknown) => {
  if (typeof value !== 'string') throw new AppError(INVALID_CENTER, 400);

  const parts = value.split(',');
  const [lat, lng] = parts.map(Number);

  const valid =
    parts.length === 2 &&
    parts.every(part => part.trim() !== '') &&
    lat >= LATITUDE_RANGE.min &&
    lat <= LATITUDE_RANGE.max &&
    lng >= LONGITUDE_RANGE.min &&
    lng <= LONGITUDE_RANGE.max;

  if (!valid) throw new AppError(INVALID_CENTER, 400);
  return { lat, lng };
};

const parseUnit = (value: unknown): DistanceUnit => {
  if (value === undefined) return DEFAULT_DISTANCE_UNIT;
  if (typeof value === 'string' && Object.hasOwn(EARTH_RADIUS, value)) {
    return value as DistanceUnit;
  }
  throw new AppError(INVALID_UNIT, 400);
};

const parseRadius = (value: unknown) => {
  const radius =
    typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new AppError(INVALID_RADIUS, 400);
  }
  return radius;
};

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Express 5 re-parses req.query on every access, so mutations are lost
  res.locals.query = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  next();
};

export const filterByLocation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { near, radius, unit } = req.query;

  if (near === undefined && radius === undefined && unit === undefined) {
    return next();
  }
  if (near === undefined) throw new AppError(MISSING_NEAR, 400);

  const { lat, lng } = parseCenter(near);
  const maxDistance = parseRadius(radius);
  const radians = maxDistance / EARTH_RADIUS[parseUnit(unit)];

  res.locals.filter = {
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radians] } },
  };
  next();
};

export const setDistanceOrigin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { near, unit } = req.query;

  if (near === undefined) throw new AppError(MISSING_NEAR, 400);

  res.locals.center = parseCenter(near);
  res.locals.unit = parseUnit(unit);
  next();
};

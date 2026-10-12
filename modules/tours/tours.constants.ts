export const DIFFICULTIES = ['easy', 'medium', 'difficult'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DEFAULT_RATINGS_AVERAGE = 4.5;

export const GEOJSON_POINT = 'Point' as const;
export const LONGITUDE_RANGE = { min: -180, max: 180 } as const;
export const LATITUDE_RANGE = { min: -90, max: 90 } as const;
export const COORDINATES_MESSAGE = 'coordinates must be [longitude, latitude]';

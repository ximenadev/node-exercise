export const ROLES = ['user', 'guide', 'lead-guide', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const GUIDE_ROLES = ['guide', 'lead-guide'] as const;

export const PASSWORD_MIN_LENGTH = 8;

export const USER_PHOTO_FOLDER = 'node-exercise/users';
export const USER_PHOTO_SIZE = 500;
export const DEFAULT_USER_PHOTO_ID = `${USER_PHOTO_FOLDER}/default`;

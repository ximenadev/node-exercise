export const ROLES = ['user', 'guide', 'lead-guide', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const GUIDE_ROLES = ['guide', 'lead-guide'] as const;

export const PASSWORD_MIN_LENGTH = 8;

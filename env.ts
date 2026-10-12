import { existsSync } from 'node:fs';

// Must be imported before any module that reads process.env at load time
if (existsSync('./.env')) process.loadEnvFile('./.env');

const required = [
  'DB_URL',
  'DB_USERNAME',
  'DB_PASSWORD',
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_COOKIE_EXPIRES_IN',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
  'BASE_URL',
] as const;
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const trustProxy = process.env.TRUST_PROXY;
if (trustProxy && !/^\d+$/.test(trustProxy)) {
  console.error(
    'TRUST_PROXY must be the number of proxies in front of the app, e.g. 1',
  );
  process.exit(1);
}

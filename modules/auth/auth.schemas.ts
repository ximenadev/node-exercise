import { z } from 'zod';

const requiredString = (message: string) =>
  z.string({ error: message }).min(1, message);

export const signupSchema = z.object({
  name: requiredString('A user must have a name'),
  email: requiredString('A user must have an email'),
  password: requiredString('A user must have a password'),
  passwordConfirm: requiredString('Please confirm your password'),
});

export const loginSchema = z.object({
  email: requiredString('Please provide email and password'),
  password: requiredString('Please provide email and password'),
});

export const forgotPasswordSchema = z.object({
  email: requiredString('Please provide your email address'),
});

export const resetPasswordSchema = z.object({
  password: requiredString('A user must have a password'),
  passwordConfirm: requiredString('Please confirm your password'),
});

export const updatePasswordSchema = z.object({
  currentPassword: requiredString(
    'Please provide currentPassword and newPassword',
  ),
  newPassword: requiredString('Please provide currentPassword and newPassword'),
  passwordConfirm: requiredString('Please confirm your password'),
});

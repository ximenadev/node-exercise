import mongoose, { HydratedDocument, Model, Query } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { imageUrl } from '../../utils/cloudinary';
import {
  DEFAULT_USER_PHOTO_ID,
  PASSWORD_MIN_LENGTH,
  ROLES,
  type Role,
} from './users.constants';

export interface IUser {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role?: Role;
  photo?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active?: boolean;
}

interface IUserMethods {
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

type UserModel = Model<IUser, object, IUserMethods>;

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const usersSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: [
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    ],
    select: false, // Exclude password field from query results by default
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE
      validator: function (this: unknown, el: string) {
        return el === (this as IUser).password;
      },
      message: 'Passwords are not the same',
    },
  },
  role: {
    type: String,
    enum: ROLES,
    default: 'user',
  },
  photo: {
    type: String,
    default: () => imageUrl(DEFAULT_USER_PHOTO_ID),
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

usersSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

usersSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined as never; // Remove passwordConfirm field from the database
});

usersSchema.pre('save', async function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

usersSchema.pre(
  /^(find|count|distinct)/,
  function (this: Query<unknown, unknown>) {
    this.where({ active: { $ne: false } });
  },
);

usersSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { active: { $ne: false } } });
});

usersSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

usersSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model<IUser, UserModel>('User', usersSchema);
export default User;

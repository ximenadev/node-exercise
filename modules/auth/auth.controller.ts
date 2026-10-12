import crypto from 'node:crypto';
import User from '../users/users.model';
import { clearAuthCookie, createAndSendToken } from './auth.tokens';
import { AppError, catchAsync, sendEmail } from '../../utils';

const RESET_EMAIL_SENT_MESSAGE =
  'If an account with that email exists, a reset link has been sent.';

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createAndSendToken(user, 200, res);
});

export const logout = catchAsync(async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ status: 'success' });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: RESET_EMAIL_SENT_MESSAGE,
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const baseUrl = process.env.BASE_URL!.replace(/\/+$/, '');
  const resetURL = `${baseUrl}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:\n${resetURL}\n\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 min).',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: RESET_EMAIL_SENT_MESSAGE,
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token as string)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createAndSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  const user = await User.findById(req.user!.id).select('+password');

  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Your current password is not correct', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createAndSendToken(user, 200, res);
});

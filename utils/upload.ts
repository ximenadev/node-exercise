import type { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import { AppError } from './appError';

const MAX_IMAGE_SIZE_MB = 2;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 1, fields: 10 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Only JPEG, PNG or WebP images are allowed', 400));
  },
});

const multerMessages: Record<string, string> = {
  LIMIT_FILE_SIZE: `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB`,
  LIMIT_FILE_COUNT: 'Upload only one image',
};

export const uploadSingleImage =
  (field: string) => (req: Request, res: Response, next: NextFunction) => {
    upload.single(field)(req, res, (err: unknown) => {
      if (err instanceof MulterError) {
        const message =
          err.code === 'LIMIT_UNEXPECTED_FILE'
            ? `Send the image in the "${field}" field`
            : (multerMessages[err.code] ?? err.message);
        return next(new AppError(message, 400));
      }
      next(err);
    });
  };

import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary';
import { AppError } from './appError';

export const imageUrl = (publicId: string) =>
  cloudinary.url(publicId, {
    secure: true,
    format: 'jpg',
    force_version: false,
    urlAnalytics: false,
  });

export const uploadImage = (buffer: Buffer, options: UploadApiOptions) =>
  new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: 'image', ...options },
        (error, result) => {
          if (error || !result) {
            return reject(
              error?.http_code === 400
                ? new AppError('The uploaded file is not a valid image', 400)
                : (error ?? new Error('Image upload failed')),
            );
          }
          resolve(result.secure_url);
        },
      )
      .end(buffer);
  });

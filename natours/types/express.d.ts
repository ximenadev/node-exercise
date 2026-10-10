import type { UserDocument } from '../modules/users/users.model';

declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
      user?: UserDocument;
    }
  }
}

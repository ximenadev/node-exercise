export class AppError extends Error {
  public status: string;

  constructor(
    message: string,
    public statusCode: number,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

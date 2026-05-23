export class AppError extends Error {
  public readonly isOperational = true;

  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

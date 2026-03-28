export class CubePathError extends Error {
  public readonly statusCode: number;
  public readonly detail?: string;

  constructor(statusCode: number, message: string, detail?: string) {
    super(message);
    this.name = 'CubePathError';
    this.statusCode = statusCode;
    this.detail = detail;
  }

  static isNotFound(err: unknown): boolean {
    return err instanceof CubePathError && err.statusCode === 404;
  }

  static isConflict(err: unknown): boolean {
    return err instanceof CubePathError && err.statusCode === 409;
  }

  static isRateLimited(err: unknown): boolean {
    return err instanceof CubePathError && err.statusCode === 429;
  }

  static isBadRequest(err: unknown): boolean {
    return err instanceof CubePathError && err.statusCode === 400;
  }

  static isServerError(err: unknown): boolean {
    return err instanceof CubePathError && err.statusCode >= 500;
  }
}

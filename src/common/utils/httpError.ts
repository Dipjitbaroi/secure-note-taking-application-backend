export interface HttpError extends Error {
  statusCode: number;
  details?: unknown;
  isHttpError: true;
}

export function createHttpError(statusCode: number, message: string, details?: unknown): HttpError {
  return Object.assign(new Error(message), { statusCode, details, isHttpError: true as const });
}

export function isHttpError(err: unknown): err is HttpError {
  return err instanceof Error && (err as Partial<HttpError>).isHttpError === true;
}

export const badRequest = (message = 'Bad request', details?: unknown) =>
  createHttpError(400, message, details);
export const unauthorized = (message = 'Unauthorized') => createHttpError(401, message);
export const forbidden = (message = 'Forbidden') => createHttpError(403, message);
export const notFound = (message = 'Not found') => createHttpError(404, message);
export const conflict = (message = 'Conflict') => createHttpError(409, message);
export const tooManyRequests = (message = 'Too many requests') => createHttpError(429, message);

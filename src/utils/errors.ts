export const HTTP_OK = 200;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_CONFLICT = 409;
export const HTTP_NOT_FOUND = 404;
export const HTTP_TOO_MANY_REQUESTS = 429;
export const HTTP_INTERNAL_SERVER_ERROR = 500;
export const HTTP_SERVICE_UNAVAILABLE = 503;

export type HttpStatus =
  | typeof HTTP_OK
  | typeof HTTP_BAD_REQUEST
  | typeof HTTP_UNAUTHORIZED
  | typeof HTTP_FORBIDDEN
  | typeof HTTP_NOT_FOUND
  | typeof HTTP_INTERNAL_SERVER_ERROR
  | typeof HTTP_CONFLICT
  | typeof HTTP_SERVICE_UNAVAILABLE
  | typeof HTTP_TOO_MANY_REQUESTS;

export class ApplicationError extends Error {
  status: number;
  payload: object | undefined;
  constructor(message?: string, payload?: object) {
    super(message);
    this.status = HTTP_NOT_FOUND;
    this.payload = payload;
  }
}

function createErrorClass(httpStatus: HttpStatus) {
  return class extends ApplicationError {
    constructor(message?: string, payload?: object) {
      super(message, payload);
      this.status = httpStatus;
    }
  };
}

export const ValidationError = createErrorClass(HTTP_BAD_REQUEST);
export const AuthenticationError = createErrorClass(HTTP_FORBIDDEN);
export const AuthorizationError = createErrorClass(HTTP_UNAUTHORIZED);
export const NotFoundError = createErrorClass(HTTP_NOT_FOUND);
export const ConflictError = createErrorClass(HTTP_CONFLICT);
export const InternalError = createErrorClass(HTTP_INTERNAL_SERVER_ERROR);
export const ServiceUnavailableError = createErrorClass(HTTP_SERVICE_UNAVAILABLE);

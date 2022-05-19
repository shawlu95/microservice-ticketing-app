import { StatusCodes } from 'http-status-codes';

export class DatabaseConnectionError extends Error {
  reason = 'Error connecting to database';
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor() {
    super();

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}

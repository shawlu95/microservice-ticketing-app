import { StatusCodes } from 'http-status-codes';
import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  reason = 'Error connecting to database';
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor() {
    super('Connection error');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}

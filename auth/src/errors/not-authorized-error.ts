import { StatusCodes } from 'http-status-codes';
import { CustomError } from './custom-error';

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.FORBIDDEN;

  constructor() {
    super('Not authorized');
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not authorized' }];
  }
}

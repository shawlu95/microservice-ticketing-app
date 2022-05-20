import { StatusCodes } from 'http-status-codes';
import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(public message: string) {
    // super is executed before typescript, cannot ref this.message here
    // but can ref anywhere after this line
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

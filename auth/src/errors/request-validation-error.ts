import { StatusCodes } from 'http-status-codes';
import { CustomError } from './custom-error';
import { ValidationError } from 'express-validator';

export class RequestValidationErorr extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  constructor(public errors: ValidationError[]) {
    super('Validation error');

    // Required because error is built into the language
    Object.setPrototypeOf(this, RequestValidationErorr.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}

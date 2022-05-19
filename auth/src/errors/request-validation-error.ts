import { StatusCodes } from 'http-status-codes';
import { ValidationError } from 'express-validator';

interface CustomError {
  statusCode: number;
  serializeErrors(): {
    message: string;
    field?: string; // optional
  }[]; // an array of object
}

export class RequestValidationErorr extends Error implements CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  constructor(public errors: ValidationError[]) {
    super();

    // Required because error is built into the language
    Object.setPrototypeOf(this, RequestValidationErorr.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}

import { ValidationError } from 'express-validator';

export class RequestValidationErorr extends Error {
  constructor(public errors: ValidationError[]) {
    super();

    // Required because error is built into the language
    Object.setPrototypeOf(this, RequestValidationErorr.prototype);
  }
}

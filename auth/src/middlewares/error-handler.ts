import { Request, Response, NextFunction } from 'express';
import { RequestValidationErorr } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

/** @notice Return consistently-formatted error to the caller */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationErorr) {
    console.log('validation err');
  }

  if (err instanceof DatabaseConnectionError) {
    console.log('db connection err');
  }
  res.status(400).send({
    message: err.message,
  });
};

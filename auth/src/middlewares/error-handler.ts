import { StatusCodes } from 'http-status-codes';
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
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  if (err instanceof DatabaseConnectionError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(StatusCodes.BAD_REQUEST).send({
    errors: [{ message: err.message }],
  });
};

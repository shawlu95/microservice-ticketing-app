import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import { RequestValidationErorr } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { CustomError } from '../errors/custom-error';

/** @notice Return consistently-formatted error to the caller */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check against super class, only need to handle once
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(StatusCodes.BAD_REQUEST).send({
    errors: [{ message: err.message }],
  });
};

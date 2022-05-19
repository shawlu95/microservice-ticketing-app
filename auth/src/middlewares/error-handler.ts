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
    const formatted = err.errors.map((error) => {
      return { message: error.msg, field: error.param };
    });
    return res.status(StatusCodes.BAD_REQUEST).send({ errors: formatted });
  }

  if (err instanceof DatabaseConnectionError) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ errors: [{ message: err.reason }] });
  }

  res.status(StatusCodes.BAD_REQUEST).send({
    errors: [{ message: err.message }],
  });
};

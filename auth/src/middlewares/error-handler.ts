import { Request, Response, NextFunction } from 'express';

/** @notice Return consistently-formatted error to the caller */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('Error:', err);
  res.status(400).send({
    message: err.message,
  });
};

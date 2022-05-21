import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationErorr } from '../errors/request-validation-error';

/** @notice Error handling middleware has four args (starting with err) */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationErorr(errors.array());
  }

  next();
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

// modify existing object's interface
// add a 'currentUser' optional property
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Equivalent to (!req.session || !req.session.jwt)
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.jwt!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}
  next();
};

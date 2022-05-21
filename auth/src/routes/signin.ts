import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../model/user';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

const validators = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('Please enter a password'),
];

router.post(
  '/api/users/signin',
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (!existing) {
      // share as little info as possible when login
      throw new BadRequestError('Invalid credential');
    }

    const match = await Password.compare(existing.password, password);
    if (!match) {
      throw new BadRequestError('Invalid credential');
    }

    const userJwt = jwt.sign(
      {
        id: existing.id,
        email: existing.email,
      },
      process.env.jwt! // suppress typescript warning
    );

    // attach jwt to cookie (must be https protocol)
    req.session = { jwt: userJwt };

    return res.status(StatusCodes.OK).json(existing);
  }
);

export { router as signinRouter };

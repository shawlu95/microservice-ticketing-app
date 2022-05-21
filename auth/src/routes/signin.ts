import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationErorr } from '../errors/request-validation-error';

const router = express.Router();

const validators = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('Please enter a password'),
];

router.post(
  '/api/users/signin',
  validators,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationErorr(errors.array());
    }

    return res.send('signin');
  }
);

export { router as signinRouter };

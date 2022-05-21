import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';

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
    return res.send('signin');
  }
);

export { router as signinRouter };

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../model/user';
import { RequestValidationErorr } from '../errors/request-validation-error';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

const validators = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Length must be 4~20'),
];

router.post(
  '/api/users/signup',
  validators,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationErorr(errors.array());
    }

    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      throw new BadRequestError('Email in use');
    }

    const user = User.build({ email, password });
    await user.save();

    // send a cookie/jwt
    return res.status(StatusCodes.CREATED).send(user);
  }
);

export { router as signupRouter };

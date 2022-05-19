import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationErorr } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

const router = express.Router();

const validators = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Length must be 4~20'),
];

router.post('/api/users/signup', validators, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new RequestValidationErorr(errors.array());
  }

  const { email, password } = req.body;
  throw new DatabaseConnectionError();
  return res.send({ email, password });
});

export { router as signupRouter };

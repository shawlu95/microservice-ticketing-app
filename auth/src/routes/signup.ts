import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

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
    throw new Error('Invalid email or password');
  }

  const { email, password } = req.body;
  throw new Error('Cannot connect to database');
  console.log('Creating user', email);
  return res.send({ email, password });
});

export { router as signupRouter };

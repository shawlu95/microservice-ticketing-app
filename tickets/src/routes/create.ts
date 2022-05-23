import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { requireAuth, validateRequest } from '@shawtickets/common';

const router = express.Router();

const validators = [
  body('title').not().isEmpty().withMessage('Title is required!'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than zero!'),
];

router.post(
  '/api/tickets',
  requireAuth,
  validators,
  validateRequest,
  (req: Request, res: Response) => {
    res.sendStatus(StatusCodes.OK);
  }
);

export { router as createTicketRouter };

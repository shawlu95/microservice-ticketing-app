import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { requireAuth, validateRequest } from '@shawtickets/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

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
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    return res.status(StatusCodes.CREATED).send(ticket);
  }
);

export { router as createTicketRouter, validators };

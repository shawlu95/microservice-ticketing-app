import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  NotFoundError,
  requireAuth,
  validateRequest,
  OrderStatus,
  BadRequestError,
} from '@shawtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();
const EXPR_WINDOW_SEC = 15;

const validators = [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be provided'),
];

router.post(
  '/api/orders',
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // find the ticket from the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure the ticket hasn't been reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket has been reserved');
    }

    // calculate expiration date of the order
    const expr = new Date();
    expr.setSeconds(expr.getSeconds() + EXPR_WINDOW_SEC);

    // build the order and save to database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expr,
      ticket,
    });
    await order.save();

    // TODO: publish event

    res.status(StatusCodes.CREATED).send(order);
  }
);

export { router as createOrderRouter };

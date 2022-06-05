import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ orderId: undefined });
  return res.status(StatusCodes.OK).send(tickets);
});

export { router as indexTicketRouter };

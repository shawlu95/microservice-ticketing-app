import { NotFoundError } from '@shawtickets/common';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  }
  return res.status(StatusCodes.OK).send(ticket);
});

export { router as showTicketRouter };

import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { requireAuth } from '@shawtickets/common';

const router = express.Router();

router.post('/api/tickets', requireAuth, (req: Request, res: Response) => {
  res.sendStatus(StatusCodes.OK);
});

export { router as createTicketRouter };

import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.post('/api/tickets', async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).send();
});

export { router as createTicketRouter };

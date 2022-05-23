import express from 'express';
require('express-async-errors');
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@shawtickets/common';
import { createTicketRouter } from './routes/create';

const app = express();
app.set('trust proxy', true); // trust nginx
app.use(json());

// set req.session property here
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

// set req.currentUser
app.use(currentUser);

app.use(createTicketRouter);
app.get('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

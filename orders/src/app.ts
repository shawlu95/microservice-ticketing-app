import express from 'express';
require('express-async-errors');
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@shawtickets/common';
import { createOrderRouter } from './routes/create';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes';
import { deleteOrderRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true); // trust nginx
app.use(json());

// set req.session property here
app.use(
  cookieSession({
    signed: false, // no need to encrypt because jwt is already encrypted
    secure: false, // not require https connection
  })
);

// set req.currentUser
app.use(currentUser);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.get('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

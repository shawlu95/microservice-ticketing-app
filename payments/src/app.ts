import express from 'express';
require('express-async-errors');
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@shawtickets/common';
import { createChargeRouter } from './routes/create';

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

app.use(createChargeRouter);

app.get('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

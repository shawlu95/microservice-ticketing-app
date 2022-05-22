import express from 'express';
require('express-async-errors');
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError } from '@shawtickets/common';

const app = express();
app.set('trust proxy', true); // trust nginx
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.get('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

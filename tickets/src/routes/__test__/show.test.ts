import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

it('returns 404 if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(StatusCodes.NOT_FOUND);
});

it('returns ticket if found', async () => {
  const title = 'event';
  const price = 10;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(StatusCodes.CREATED);

  const ticketRes = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(StatusCodes.OK);
  expect(ticketRes.body.title).toEqual(title);
  expect(ticketRes.body.price).toEqual(price);
});

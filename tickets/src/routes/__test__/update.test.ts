import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns 404 if ticket id is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'foo',
      price: 10,
    })
    .expect(StatusCodes.NOT_FOUND);
});

it('returns 401 if not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'foo',
      price: 10,
    })
    .expect(StatusCodes.UNAUTHORIZED);
});

it('returns 401 if not owner', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'foo', price: 10 });

  // every time global.sign is called, a different user is used
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'bar', price: 20 })
    .expect(StatusCodes.UNAUTHORIZED);
});

it('returns 400 if invalid title', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'foo', price: 10 });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 20 })
    .expect(StatusCodes.BAD_REQUEST);
});

it('returns 400 if invalid price', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'foo', price: 10 });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'foo', price: -10 })
    .expect(StatusCodes.BAD_REQUEST);
});

it('returns 200 if successful update', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'foo', price: 10 });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'bar', price: 20 })
    .expect(StatusCodes.OK);

  const ticket = await request(app).get(`/api/tickets/${res.body.id}`).send();
  expect(ticket.body.title).toEqual('bar');
  expect(ticket.body.price).toEqual(20);
});

it('publishes an event', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'foo', price: 10 });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'bar', price: 20 })
    .expect(StatusCodes.OK);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if ticket is being reserved', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'foo', price: 10 });

  const ticket = await Ticket.findById(res.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'bar', price: 20 })
    .expect(StatusCodes.BAD_REQUEST);
});

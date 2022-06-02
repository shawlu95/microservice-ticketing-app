import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('returns an error if not exists', async () => {
  const ticketId = new mongoose.Types.ObjectId(); // random ID
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(StatusCodes.NOT_FOUND);
});

it('returns an error if reserved', async () => {
  const ticket = Ticket.build({
    title: 'coldplay',
    price: 15,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'foo', // doesn't matter
    status: OrderStatus.Created, // matters
    expiresAt: new Date(), // doesn't matter
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(StatusCodes.BAD_REQUEST);
});

it('returns a ticket if successful', async () => {
  const ticket = Ticket.build({
    title: 'coldplay',
    price: 15,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(StatusCodes.CREATED);
});

it.todo('emit an order created event');

import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an order as cancelled', async () => {
  // create a ticket with Ticket Model
  const ticket = Ticket.build({
    title: 'lunch',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // make a request to create an order
  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(StatusCodes.CREATED);

  // make a requestto cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(StatusCodes.NO_CONTENT);

  // check order status
  const fetchedOrder = await Order.findById(order.id);
  expect(fetchedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits a cancellation event', async () => {
  // create a ticket with Ticket Model
  const ticket = Ticket.build({
    title: 'lunch',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // make a request to create an order
  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(StatusCodes.CREATED);

  // make a requestto cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(StatusCodes.NO_CONTENT);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

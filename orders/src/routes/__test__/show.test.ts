import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'pink',
    price: 1,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // make a request to build an order for the ticket
  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(StatusCodes.CREATED);

  // make a request to fetch the order (as the same user)
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(StatusCodes.OK);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns error if trying to fetch other user's user", async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'pink',
    price: 1,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // make a request to build an order for the ticket
  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(StatusCodes.CREATED);

  // make a request to fetch the order (as the same user)
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(StatusCodes.UNAUTHORIZED);
});

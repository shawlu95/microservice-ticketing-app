import { OrderStatus } from '@shawtickets/common';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';

it('returns 404 when order does not exists', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'foo',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(StatusCodes.NOT_FOUND);
});

it('returns 401 when not owner of order', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'someone',
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'foo',
      orderId: order.id,
    })
    .expect(StatusCodes.UNAUTHORIZED);
});

it('returns 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'foo',
      orderId: order.id,
    })
    .expect(StatusCodes.BAD_REQUEST);
});

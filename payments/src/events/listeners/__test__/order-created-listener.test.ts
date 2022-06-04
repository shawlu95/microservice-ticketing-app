import { OrderCreatedEvent, OrderStatus } from '@shawtickets/common';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'later',
    userId: 'foo',
    status: OrderStatus.Created,
    ticket: {
      id: 'bar',
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('replicates order object', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks message', async () => {
  const { listener, data, msg } = await setup();
  expect(msg.ack).not.toHaveBeenCalled();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

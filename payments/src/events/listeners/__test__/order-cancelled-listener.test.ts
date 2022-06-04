import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@shawtickets/common';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: 'foo',
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1, // increment by 1
    ticket: {
      id: 'bar', // not used
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('update order status to cancelled', async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks message', async () => {
  const { listener, data, msg } = await setup();
  expect(msg.ack).not.toHaveBeenCalled();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

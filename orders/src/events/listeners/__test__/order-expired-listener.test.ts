import mongoose from 'mongoose';
import Message from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderExpiredListener } from '../order-expired-listener';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { OrderExpiredEvent, OrderStatus, Subjects } from '@shawtickets/common';

const setup = async () => {
  const listener = new OrderExpiredListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'dog park',
    price: 5,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'foo',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: OrderExpiredEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, order, data, msg };
};

it('updates order status to cancelled', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits order cancelled event', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // optional: check the publish is called with appropriate args
  const [subject, str] = (natsWrapper.client.publish as jest.Mock).mock
    .calls[0];
  const event = JSON.parse(str);

  expect(subject).toEqual(Subjects.OrderCancelled);
  expect(event.id).toEqual(data.orderId);
});

it('acks the message', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  expect(msg.ack).not.toHaveBeenCalled();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

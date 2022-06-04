import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from '@shawtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Subjects } from '@shawtickets/common';
import mongoose from 'mongoose';

const setup = async () => {
  // create an instance of listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'convert',
    price: 10,
    userId: 'shaw',
  });

  // suppose someone creates an order
  ticket.set({ orderId });
  await ticket.save();

  // create a fake event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // create a fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('updates thhe ticket, publsihes an event, acks message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeUndefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

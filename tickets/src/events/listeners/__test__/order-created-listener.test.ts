import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@shawtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Subjects } from '@shawtickets/common';
import mongoose from 'mongoose';

const setup = async () => {
  // create an instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'convert',
    price: 10,
    userId: 'shaw',
  });
  await ticket.save();

  // create a fake event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'ava',
    expiresAt: 'tonight',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // create a fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('sets userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  const staleTicket = await Ticket.findById(ticket.id);
  expect(staleTicket!.orderId).toBeUndefined();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  expect(msg.ack).not.toHaveBeenCalled();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  expect(natsWrapper.client.publish).not.toHaveBeenCalled();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // optional: check the publish is called with appropriate args
  const [subject, str] = (natsWrapper.client.publish as jest.Mock).mock
    .calls[0];
  const ticketUpdatedEvent = JSON.parse(str);

  expect(subject).toEqual(Subjects.TicketUpdated);
  expect(ticketUpdatedEvent.orderId).toEqual(data.id);
});

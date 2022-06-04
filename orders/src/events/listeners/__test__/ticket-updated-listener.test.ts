import { Message } from 'node-nats-streaming';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { TicketUpdatedEvent } from '@shawtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'getty',
    price: 20,
  });
  await ticket.save();

  // create a fake update object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'lacma',
    price: 99,
    userId: 'foo',
  };

  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, listener };
};

it('finds, updates, and saves ticket', async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  // fetch successful
  // await Ticket.findById({ _id: ticket.id, version: 0 });
  // await Ticket.findById({ _id: ticket.id, version: 1 });
  // await Ticket.findById({ _id: ticket.id, version: 2 });

  const upadtedTicket = await Ticket.findById(ticket.id);

  expect(upadtedTicket!.title).toEqual(data.title);
  expect(upadtedTicket!.price).toEqual(data.price);
  expect(upadtedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not ack out of order event', async () => {
  const { msg, data, listener, ticket } = await setup();

  data.version += 1;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});

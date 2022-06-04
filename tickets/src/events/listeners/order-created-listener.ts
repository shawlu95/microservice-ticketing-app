import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  OrderCreatedEvent,
  NotFoundError,
} from '@shawtickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  /**
   * @notice We use an orderId field to mark the ticket as locked.
   * The field can be used to retrieve user creating the order */
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id, ticket } = data;
    const fetchedTicket = await Ticket.findById(ticket.id);

    if (!fetchedTicket) {
      throw new NotFoundError();
    }

    fetchedTicket.set({ orderId: id });
    await fetchedTicket.save();

    msg.ack();
  }
}

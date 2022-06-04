import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  OrderCreatedEvent,
  NotFoundError,
} from '@shawtickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  /**
   * @notice We use an orderId field to mark the ticket as locked.
   * The field can be used to retrieve user creating the order.
   * The listener also pubishes its own ticket-updated-event
   * when orderId is set (mark the ticker as locked) */
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id: orderId } = data;
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    ticket.set({ orderId });
    await ticket.save();

    new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: orderId,
    });

    msg.ack();
  }
}

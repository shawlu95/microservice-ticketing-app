import { Listener } from './base-listener';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // declare type to enforce "final", can't be reassigned
  // subject: Subjects.TicketCreated = Subjects.TicketCreated;

  // can also use readonly
  readonly subject = Subjects.TicketCreated;

  queueGroupName = 'payment-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('ticket:created', data);
    msg.ack();
  }
}

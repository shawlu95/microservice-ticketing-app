import { Publisher, Subjects, TicketCreatedEvent } from '@shawtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

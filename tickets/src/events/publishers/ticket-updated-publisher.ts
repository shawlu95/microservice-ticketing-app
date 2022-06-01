import { Publisher, Subjects, TicketUpdatedEvent } from '@shawtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}

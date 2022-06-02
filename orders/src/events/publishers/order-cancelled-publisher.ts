import { Subjects, Publisher, OrderCancelledEvent } from '@shawtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}

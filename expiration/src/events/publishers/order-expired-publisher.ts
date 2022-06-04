import { Subjects, Publisher, OrderExpiredEvent } from '@shawtickets/common';

export class OrderExpiredPublisher extends Publisher<OrderExpiredEvent> {
  readonly subject = Subjects.OrderExpired;
}

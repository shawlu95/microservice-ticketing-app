import { Subjects, Publisher, PaymentCreatedEvent } from '@shawtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}

import {
  OrderCancelledEvent,
  Subjects,
  Listener,
  OrderStatus,
} from '@shawtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  /** @notice Don't need version control actually, but we still do for future-proof */
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // can extract as a static method into model, but don't bother here
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error(`Order not found: ${data.id}`);
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}

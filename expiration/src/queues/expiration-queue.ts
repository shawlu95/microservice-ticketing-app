import Queue from 'bull';
import { OrderExpiredPublisher } from '../events/publishers/order-expired-publisher';
import { natsWrapper } from '../nats-wrapper';

// for the job object in Redis
interface Payload {
  orderId: string;
}
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// what to do when receiving a job
expirationQueue.process(async (job) => {
  console.log('order:expired', job.data.orderId);
  new OrderExpiredPublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };

import Queue from 'bull';

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
  console.log('expiration:complete', job.data.orderId);
});

export { expirationQueue };

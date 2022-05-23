import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('Listener is connected to NATS');

  const sub = client.subscribe('ticket:created', 'ticket-queue-group');
  sub.on('message', (msg: Message) => {
    const data = msg.getData() as string;
    const seq = msg.getSequence() as number;
    console.log(`received event ${seq}: ${data}`);
  });
});

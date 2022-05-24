import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('Listener is connected to NATS');

  // graceful shutdown
  client.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });

  const options = client
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable() // process from start
    .setDurableName('ticket-queue'); // ignore acked events

  const sub = client.subscribe('ticket:created', 'ticket-queue-group', options);
  sub.on('message', (msg: Message) => {
    const data = msg.getData() as string;
    const seq = msg.getSequence() as number;
    console.log(`received event ${seq}: ${data}`);
    msg.ack();
  });
});

process.on('SIGINT', () => client.close());
process.on('SIGTERM', () => client.close());

abstract class Listener {
  abstract subject: string;
  abstract queueGroupName: string;
  abstract onMessage(data: any, msg: Message): void;

  private client: Stan;

  // subclass can define it
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDeliverAllAvailable()
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const sub = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    sub.on('message', (msg: Message) => {
      const seq = msg.getSequence() as number;
      console.log(`${this.subject}:${this.queueGroupName} received ${seq}`);

      const parsed = this.parseMessage(msg);
      this.onMessage(parsed, msg);
      msg.ack();
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}

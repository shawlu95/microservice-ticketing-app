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

  const listener = new TicketCreatedListener(client);
  listener.listen();
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
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}

class TicketCreatedListener extends Listener {
  subject = 'ticket:created';
  queueGroupName = 'payment-service';

  onMessage(data: any, msg: Message) {
    console.log('ticket:created', data);
    msg.ack();
  }
}

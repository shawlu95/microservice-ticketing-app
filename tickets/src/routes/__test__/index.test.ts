import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { app } from '../../app';

const createTicket = async (title: string, price: number) => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price });
};

it('can fetch a list of tickets', async () => {
  await createTicket('foo', 10);
  await createTicket('bar', 20);
  await createTicket('baz', 30);

  const res = await request(app).get('/api/tickets').send().expect(200);
  expect(res.body.length).toEqual(3);
});

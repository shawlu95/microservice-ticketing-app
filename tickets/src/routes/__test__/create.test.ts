import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/tickets for post request', async () => {
  const res = await request(app).post('/api/tickets').send({});
  expect(res.status).not.toEqual(StatusCodes.NOT_FOUND);
});

it('returns 401 when not signed in', async () => {
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(StatusCodes.UNAUTHORIZED);
});

it('returns non-401 when signed in', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  expect(res.status).not.toEqual(StatusCodes.UNAUTHORIZED);
});

it('return error if invalid title', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: '', price: 10 })
    .expect(StatusCodes.BAD_REQUEST);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ price: 10 })
    .expect(StatusCodes.BAD_REQUEST);
});

it('return error if invalid price', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'title', price: -10 })
    .expect(StatusCodes.BAD_REQUEST);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'title' })
    .expect(StatusCodes.BAD_REQUEST);
});

it('create a ticket with valid info', async () => {
  const title = 'event';
  const price = 10;
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(price);
  expect(tickets[0].title).toEqual(title);
});

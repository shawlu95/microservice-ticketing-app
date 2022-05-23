import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { app } from '../../app';

it('has a route handler listening to /api/tickets for post request', async () => {
  const res = await request(app).post('/api/tickets').send({});
  expect(res.status).not.toEqual(404);
});

it('returns 401 when not signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns non-401 when signed in', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  expect(res.status).not.toEqual(401);
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

it('create a ticket with valid info', async () => {});
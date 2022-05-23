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
  expect(res.status).toEqual(200);
});

it('return error if invalid title', async () => {});

it('return error if invalid price', async () => {});

it('create a ticket with valid info', async () => {});

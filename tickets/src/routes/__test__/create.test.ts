import request from 'supertest';
import { app } from '../../app';

it('has a route handler listening to /api/tickets for post request', async () => {
  const res = await request(app).post('/api/tickets').send({});
  expect(res.status).not.toEqual(404);
});

it('can only access if signed in', async () => {});

it('return error if invalid title', async () => {});

it('return error if invalid price', async () => {});

it('create a ticket with valid info', async () => {});

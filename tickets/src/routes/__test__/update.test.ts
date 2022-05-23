import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';

it('returns 404 if ticket id is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'foo',
      price: 10,
    })
    .expect(StatusCodes.NOT_FOUND);
});

it('returns 401 if not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'foo',
      price: 10,
    })
    .expect(StatusCodes.UNAUTHORIZED);
});

it('returns 401 if not owner', async () => {});

it('returns 400 if invalid title', async () => {});

it('returns 400 if invalid price', async () => {});

it('returns 200 if successful update', async () => {});

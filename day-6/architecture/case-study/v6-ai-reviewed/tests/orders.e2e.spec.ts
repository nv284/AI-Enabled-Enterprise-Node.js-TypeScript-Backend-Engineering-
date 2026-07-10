import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/main';

describe('POST /orders (e2e)', () => {
  it('creates an order and returns 201', async () => {
    const app = buildApp({ dbFile: ':memory:', seed: true });
    const res = await request(app).post('/orders').send({ customerId: 1, bookId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('returns 400 on missing fields', async () => {
    const app = buildApp({ dbFile: ':memory:', seed: true });
    const res = await request(app).post('/orders').send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for a missing book', async () => {
    const app = buildApp({ dbFile: ':memory:', seed: true });
    const res = await request(app).post('/orders').send({ customerId: 1, bookId: 9999 });
    expect(res.status).toBe(404);
  });
});

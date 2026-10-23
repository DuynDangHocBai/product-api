const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const app = require('../src/app');
const Product = require('../src/models/product.model');

const MONGO_URI = process.env.TEST_MONGO_URI;

describe('Product CRUD with real MongoDB', { skip: !MONGO_URI && 'TEST_MONGO_URI not set' }, () => {
  let server;
  let baseUrl;
  const api = (path, options = {}) =>
    fetch(`${baseUrl}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });

  before(async () => {
    await mongoose.connect(MONGO_URI);
    await Product.init();
    await Product.deleteMany({});
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  test('GET /health returns 200 when MongoDB is connected', async () => {
    const res = await api('/health');
    assert.equal(res.status, 200);
  });

  test('POST /api/products creates a product (201)', async () => {
    const res = await api('/api/products', {
      method: 'POST',
      body: JSON.stringify({ pid: 'T001', pname: 'Test Product', price: 1000, quantity: 5 }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.pid, 'T001');
    assert.equal(body.price, 1000);
  });

  test('POST duplicate pid returns 409', async () => {
    const res = await api('/api/products', {
      method: 'POST',
      body: JSON.stringify({ pid: 'T001', pname: 'Duplicate', price: 1, quantity: 1 }),
    });
    assert.equal(res.status, 409);
  });

  test('POST invalid data returns 400', async () => {
    const res = await api('/api/products', {
      method: 'POST',
      body: JSON.stringify({ pid: 'T002', pname: 'Bad', price: -5, quantity: 1.5 }),
    });
    assert.equal(res.status, 400);
  });

  test('GET /api/products returns list containing T001', async () => {
    const res = await api('/api/products');
    assert.equal(res.status, 200);
    const list = await res.json();
    assert.ok(list.some((p) => p.pid === 'T001'));
  });

  test('GET /api/products/T001 returns the product', async () => {
    const res = await api('/api/products/T001');
    assert.equal(res.status, 200);
    assert.equal((await res.json()).pname, 'Test Product');
  });

  test('PUT /api/products/T001 updates price only', async () => {
    const res = await api('/api/products/T001', { method: 'PUT', body: JSON.stringify({ price: 900 }) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.price, 900);
    assert.equal(body.quantity, 5);
  });

  test('DELETE /api/products/T001 removes it, then GET returns 404', async () => {
    const del = await api('/api/products/T001', { method: 'DELETE' });
    assert.equal(del.status, 200);
    const get = await api('/api/products/T001');
    assert.equal(get.status, 404);
  });
});

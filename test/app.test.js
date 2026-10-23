const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let baseUrl;

before(() => new Promise((resolve) => {
  server = app.listen(0, () => {
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
}));

after(() => new Promise((resolve) => server.close(resolve)));

test('GET /health returns 503 when MongoDB is not connected', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { status: 'error', db: 'disconnected' });
});

test('Unknown route returns 404', async () => {
  const res = await fetch(`${baseUrl}/khong-ton-tai`);
  assert.equal(res.status, 404);
});

test('POST /api/products with invalid JSON returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{sai json',
  });
  assert.equal(res.status, 400);
});

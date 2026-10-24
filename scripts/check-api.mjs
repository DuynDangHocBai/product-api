import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const id = () => "T" + Date.now() + Math.floor(Math.random() * 1000);

// Gửi request và kiểm tra status mong đợi; sai thì báo lỗi, CI dừng
async function check(method, path, body, expected) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(5000)
  });
  const data = await res.json().catch(() => null);
  assert.equal(res.status, expected, `${method} ${path}: mong doi ${expected}, nhan ${res.status}`);
  console.log(`PASS ${method} ${path} -> ${res.status}`);
  return data;
}

// ===== TEST THEO YEU CAU =====
await check("GET", "/api/products", undefined, 200);
// ===== HET =====

console.log("PASS: API test");
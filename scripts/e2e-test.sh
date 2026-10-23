#!/usr/bin/env bash
# E2E test CRUD qua HTTP. Dùng: bash scripts/e2e-test.sh [BASE_URL]
set -euo pipefail
BASE="${1:-http://localhost:3000}"
PID="E2E$(date +%s)"

check() {
  local expected="$1" method="$2" path="$3" data="${4:-}"
  local args=(-s -o /tmp/e2e_body -w '%{http_code}' -X "$method" -H 'Content-Type: application/json')
  if [ -n "$data" ]; then args+=(-d "$data"); fi
  local code
  code=$(curl "${args[@]}" "$BASE$path")
  echo "$method $path -> $code $(cat /tmp/e2e_body)"
  if [ "$code" != "$expected" ]; then
    echo "FAILED: expected $expected"
    exit 1
  fi
}

check 200 GET    /health
check 201 POST   /api/products "{\"pid\":\"$PID\",\"pname\":\"E2E Product\",\"price\":500,\"quantity\":3}"
check 409 POST   /api/products "{\"pid\":\"$PID\",\"pname\":\"Duplicate\",\"price\":1,\"quantity\":1}"
check 400 POST   /api/products '{"pid":"BAD","pname":"Bad","price":-1,"quantity":1}'
check 200 GET    /api/products
check 200 GET    "/api/products/$PID"
check 200 PUT    "/api/products/$PID" '{"price":450}'
grep -q '"price":450' /tmp/e2e_body || { echo "FAILED: price not updated"; exit 1; }
check 200 DELETE "/api/products/$PID"
check 404 GET    "/api/products/$PID"
check 404 GET /api/products/MISSING

echo "ALL E2E TESTS PASSED"

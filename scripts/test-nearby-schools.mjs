import assert from "node:assert/strict";
import { onRequestGet } from "../functions/api/nearby-schools.js";

const secret = "unit-test-great-schools-secret";
const originalFetch = globalThis.fetch;
let requestHeader;

globalThis.fetch = async (_input, init = {}) => {
  requestHeader = new Headers(init.headers).get("X-API-Key");
  return Response.json({
    schools: [{
      name: "Waco Test School",
      type: "public",
      level: "PK-5",
      street: "100 Test Street",
      city: "Waco",
      state: "TX",
      zip: "76701",
      lat: 31.55,
      lon: -97.15,
      distance: 1.2,
      "overview-url": "https://www.greatschools.org/texas/waco/test-school/",
    }],
  });
};

try {
  const response = await onRequestGet({
    request: new Request("https://example.test/api/nearby-schools?lat=31.5493&lon=-97.1467"),
    env: { GREAT_SCHOOLS: secret },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(requestHeader, secret);
  assert.equal(body.schools.length, 1);
  assert.equal(body.schools[0].name, "Waco Test School");
  assert.equal(JSON.stringify(body).includes(secret), false);

  const missingSecretResponse = await onRequestGet({
    request: new Request("https://example.test/api/nearby-schools?lat=31.5493&lon=-97.1467"),
    env: {},
  });
  assert.equal(missingSecretResponse.status, 503);

  console.log("Nearby schools environment binding and response-safety test passed.");
} finally {
  globalThis.fetch = originalFetch;
}

import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/owner-lead.js";

const originalFetch = globalThis.fetch;
let submittedCard;

globalThis.fetch = async (input, init = {}) => {
  const url = input instanceof URL ? input.href : String(input);
  if (url.startsWith("https://geocoding.geo.census.gov/")) {
    return Response.json({
      result: {
        addressMatches: [{
          matchedAddress: "2012 LAKE AIR DR, WACO, TX, 76710",
          addressComponents: { city: "WACO", state: "TX", zip: "76710" },
        }],
      },
    });
  }
  if (url.endsWith("/api/schema/test-board")) {
    return Response.json([
      { key: "old_bedrooms", label: "Bedrooms Requested", type: "text" },
      { key: "rental_address", label: "Rental Property Address", type: "address" },
      { key: "owner", label: "Owner", type: "person" },
      { key: "stage", label: "Stage", type: "select" },
      { key: "source", label: "Source", type: "select" },
      { key: "bed_count", label: "Bed Count", type: "number" },
      { key: "bath_count", label: "Bath Count", type: "decimal" },
      { key: "description", label: "Description", type: "long text" },
    ]);
  }
  if (url.endsWith("/api/board/test-board/configuration")) {
    return Response.json({ data: { fields: [], workflows: [] } });
  }
  if (url.endsWith("/api/contacts")) {
    return Response.json({ data: { uuid: "contact-123" } });
  }
  if (url.endsWith("/api/board/test-board") && init.method === "POST") {
    submittedCard = JSON.parse(init.body);
    return Response.json({ data: { uuid: "card-123" } });
  }
  throw new Error(`Unexpected fetch in owner-lead test: ${url}`);
};

try {
  const request = new Request("https://example.test/api/owner-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://example.test/fallback-page",
    },
    body: JSON.stringify({
      name: "Test Owner",
      email: "owner@example.test",
      phone: "254-555-0100",
      address: "2012 Lake Air Dr, Waco, TX 76710",
      propertyType: "Single-family home",
      bedrooms: "3",
      bathrooms: "2.5",
      goal: "Determine rental value",
      message: "Please contact me next week.",
      formSource: "Homepage Free Property Management Rental Analysis",
      pageTitle: "Waco Property Management | J R Grace Realty",
      pageUrl: "https://example.test/#analysis",
    }),
  });
  const response = await onRequestPost({
    request,
    env: { APTLY_API_TOKEN: "test-token", APTLY_OWNER_LEADS_BOARD_ID: "test-board" },
  });

  assert.equal(response.status, 200);
  assert.equal(submittedCard.bed_count, 3);
  assert.equal(submittedCard.bath_count, 2.5);
  assert.equal(submittedCard.old_bedrooms, undefined);
  assert.match(submittedCard.description, /Homepage Free Property Management Rental Analysis/);
  assert.match(submittedCard.description, /https:\/\/example\.test\/#analysis/);
  assert.match(submittedCard.description, /Bed count: 3/);
  assert.match(submittedCard.description, /Bath count: 2\.5/);
  console.log("Owner lead payload mapping test passed.");
} finally {
  globalThis.fetch = originalFetch;
}

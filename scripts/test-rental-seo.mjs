import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  listingPath,
  rentalMetadata,
  renderRentalHtml,
} from "../functions/_shared/rental-seo.js";
import { onRequestGet as renderCanonicalRental } from "../functions/rentals/[[path]].js";
import { onRequestGet as redirectLegacyRental } from "../functions/rental-detail.js";
import { onRequestGet as renderRentalSitemap } from "../functions/sitemap-rentals.xml.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceHtml = await readFile(resolve(projectRoot, "rental-detail.html"), "utf8");
const listing = {
  _id: "listingABC123",
  publishedForRent: true,
  beds: 3,
  baths: 2.5,
  totalArea: 1450,
  buildingType: "Single Family Home",
  marketRent: { amount: 185000 },
  deposit: { amount: 185000 },
  marketingDescription: "A well-kept Central Texas rental home.",
  marketingName: "Charming Updated Home Near Baylor",
  marketingFiles: ["https://images.example.test/home-1.jpg"],
  address: {
    address: "1017 South 16th Street",
    city: "Waco",
    stateCode: "TX",
    postalCode: "76706",
    formattedAddress: "1017 South 16th Street, Waco, TX 76706",
    geopoint: [-97.1467, 31.5493],
  },
};
const listingsPayload = { data: [listing] };
const expectedPath = "/rentals/waco-tx/1017-south-16th-street/listingABC123";

assert.equal(listingPath(listing), expectedPath);
const metadata = rentalMetadata(listing, "https://example.test");
assert.equal(metadata.canonical, `https://example.test${expectedPath}`);
assert.match(metadata.title, /1017 South 16th Street, Waco, TX for Rent/);
assert.equal(metadata.schema["@graph"].find((item) => item["@type"] === "RealEstateListing").identifier, listing._id);

const rendered = renderRentalHtml(sourceHtml, listing, [], "https://example.test");
assert.match(rendered, new RegExp(`<link rel="canonical" id="canonicalUrl" href="https://example\\.test${expectedPath}">`));
assert.match(rendered, /<h1 id="title">Charming Updated Home Near Baylor<\/h1>/);
assert.match(rendered, /<div id="page" data-server-rendered="true">/);
assert.match(rendered, /"@type":"RealEstateListing"/);
assert.equal((rendered.match(/rel="canonical"/g) || []).length, 1);

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => Response.json(listingsPayload);
try {
  const env = { ASSETS: { fetch: async () => new Response(sourceHtml, { headers: { "Content-Type": "text/html" } }) } };
  const canonicalResponse = await renderCanonicalRental({
    request: new Request(`https://example.test${expectedPath}`),
    env,
  });
  assert.equal(canonicalResponse.status, 200);
  assert.equal(canonicalResponse.headers.get("Link"), `<https://example.test${expectedPath}>; rel="canonical"`);
  assert.match(await canonicalResponse.text(), /1017 South 16th Street, Waco, TX for Rent/);

  const staleSlugResponse = await renderCanonicalRental({
    request: new Request("https://example.test/rentals/waco-tx/old-street-name/listingABC123"),
    env,
  });
  assert.equal(staleSlugResponse.status, 301);
  assert.equal(staleSlugResponse.headers.get("Location"), `https://example.test${expectedPath}`);

  const legacyResponse = await redirectLegacyRental({
    request: new Request("https://example.test/rental-detail?id=listingABC123"),
  });
  assert.equal(legacyResponse.status, 301);
  assert.equal(legacyResponse.headers.get("Location"), `https://example.test${expectedPath}`);

  const sitemapResponse = await renderRentalSitemap({
    request: new Request("https://example.test/sitemap-rentals.xml"),
  });
  assert.equal(sitemapResponse.status, 200);
  assert.match(await sitemapResponse.text(), new RegExp(`<loc>https://example\\.test${expectedPath}<\\/loc>`));
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Rental canonical URL, redirect, metadata, and sitemap tests passed.");

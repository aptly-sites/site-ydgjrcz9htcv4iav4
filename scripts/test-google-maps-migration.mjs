import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = ["index.html", "service-areas.html", "rental-search.html", "rental-detail.html"];
const scripts = ["homepage-audience.js", "service-pages.js", "rental-search.js", "rental-detail.js"];

for (const page of pages) {
  const source = await readFile(new URL(`../${page}`, import.meta.url), "utf8");
  assert.match(source, /google-maps-loader\.js/, `${page} must load the shared Google Maps loader`);
  assert.match(source, /google-maps\.css/, `${page} must load the shared Google Maps styles`);
  assert.doesNotMatch(source, /leaflet|openstreetmap|markercluster/i, `${page} must not load the old map stack`);
}

for (const script of scripts) {
  const source = await readFile(new URL(`../${script}`, import.meta.url), "utf8");
  assert.match(source, /jrGoogleMapsLibraries/, `${script} must use the shared Google Maps libraries`);
  assert.doesNotMatch(source, /\bL\.(?:map|marker|tileLayer|control|divIcon|latLng)|window\.L/, `${script} must not call Leaflet`);
}

console.log("Google Maps page migration test passed.");

// Builds the HTML for a Leaflet L.divIcon representing a single property/area marker — shared
// between the listing-detail map and service-area guide-page maps so both use the same pin.
// Leaflet is loaded via CDN script tags (see BaseLayout's head slot), not an npm dependency, so
// this only builds a plain HTML string — it never imports the `leaflet` package itself.
export function homePinIconHtml(): string {
  return `<div style="width:34px;height:34px;border-radius:50%;background:var(--color-accent,#b7a064);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:16px;">🏠</div>`;
}

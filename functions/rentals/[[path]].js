import {
  fetchListings,
  findListing,
  listingPath,
  renderRentalHtml,
  unavailableResponse,
} from "../_shared/rental-seo.js";

export async function onRequestGet({ request, env }) {
  try {
    const requestUrl = new URL(request.url);
    const listings = await fetchListings();
    const listing = findListing(listings, requestUrl);
    if (!listing) return unavailableResponse(404, "This rental is no longer available.");

    const canonicalPath = listingPath(listing);
    if (requestUrl.pathname.replace(/\/$/, "") !== canonicalPath) {
      return new Response(null, {
        status: 301,
        headers: {
          "Cache-Control": "public, max-age=300",
          Location: new URL(canonicalPath, requestUrl).href,
        },
      });
    }

    const assetResponse = await env.ASSETS.fetch(new URL("/rental-detail.html", requestUrl));
    if (!assetResponse.ok) return unavailableResponse(503, "Rental details are temporarily unavailable.");
    const canonical = new URL(canonicalPath, requestUrl).href;
    const html = renderRentalHtml(await assetResponse.text(), listing, listings, requestUrl.origin);
    return new Response(html, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
        "Content-Language": "en-US",
        "Content-Type": "text/html; charset=utf-8",
        Link: `<${canonical}>; rel="canonical"`,
        "X-Robots-Tag": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
    });
  } catch (error) {
    console.error("Unable to render canonical rental page:", error instanceof Error ? error.message : error);
    return unavailableResponse(503, "Rental details are temporarily unavailable.");
  }
}

export const onRequestHead = onRequestGet;

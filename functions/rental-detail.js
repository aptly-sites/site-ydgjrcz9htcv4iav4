import { fetchListings, findListing, listingPath, unavailableResponse } from "./_shared/rental-seo.js";

export async function onRequestGet({ request }) {
  try {
    const requestUrl = new URL(request.url);
    const listing = findListing(await fetchListings(), requestUrl);
    if (!listing) return unavailableResponse(404, "This rental is no longer available.");
    return new Response(null, {
      status: 301,
      headers: {
        "Cache-Control": "public, max-age=300",
        Location: new URL(listingPath(listing), requestUrl).href,
      },
    });
  } catch (error) {
    console.error("Unable to redirect legacy rental URL:", error instanceof Error ? error.message : error);
    return unavailableResponse(503, "Rental details are temporarily unavailable.");
  }
}

import { fetchListings, listingPath } from "./_shared/rental-seo.js";

function escapeXml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;",
  })[character]);
}

export async function onRequestGet({ request }) {
  try {
    const requestUrl = new URL(request.url);
    const listings = await fetchListings();
    const urls = listings.map((listing) => {
      const location = new URL(listingPath(listing), requestUrl.origin).href;
      const modified = listing.updatedAt || listing.createdAt;
      const lastmod = modified && !Number.isNaN(Date.parse(modified))
        ? `<lastmod>${new Date(modified).toISOString().slice(0, 10)}</lastmod>`
        : "";
      return `<url><loc>${escapeXml(location)}</loc>${lastmod}<changefreq>daily</changefreq><priority>0.8</priority></url>`;
    }).join("");
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Unable to build rental sitemap:", error instanceof Error ? error.message : error);
    return new Response("Rental sitemap is temporarily unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

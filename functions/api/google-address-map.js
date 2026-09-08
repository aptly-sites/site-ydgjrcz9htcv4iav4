function validCoordinate(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

export async function onRequestGet({ request, env }) {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") {
    return new Response("Forbidden", { status: 403 });
  }
  const apiKey = env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return new Response("Google map is not configured.", { status: 503 });

  const requestUrl = new URL(request.url);
  const latitude = validCoordinate(requestUrl.searchParams.get("lat"), 30.7, 32.1);
  const longitude = validCoordinate(requestUrl.searchParams.get("lng"), -98.5, -96.4);
  if (latitude === null || longitude === null) return new Response("Invalid map location.", { status: 400 });

  const mapUrl = new URL("https://maps.googleapis.com/maps/api/staticmap");
  mapUrl.searchParams.set("center", `${latitude},${longitude}`);
  mapUrl.searchParams.set("zoom", "15");
  mapUrl.searchParams.set("size", "640x260");
  mapUrl.searchParams.set("scale", "2");
  mapUrl.searchParams.set("maptype", "roadmap");
  mapUrl.searchParams.set("markers", `color:0x1d467d|${latitude},${longitude}`);
  mapUrl.searchParams.set("key", apiKey);

  try {
    const response = await fetch(mapUrl, { headers: { Accept: "image/png,image/*" } });
    if (!response.ok) throw new Error(`Google Static Maps returned ${response.status}`);
    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("Unable to render Google address map:", error instanceof Error ? error.message : error);
    return new Response("Google map is temporarily unavailable.", { status: 502 });
  }
}

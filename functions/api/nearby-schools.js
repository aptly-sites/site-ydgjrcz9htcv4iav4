const BASE_URL = "https://gs-api.greatschools.org/v2/nearby-schools";

const clean = (value, max = 250) =>
  String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);

export async function onRequestGet({ request, env }) {
  const key = env.GREATSCHOOLS_API_KEY;
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));

  if (!key) {
    return Response.json({ message: "Nearby school information is being connected." }, { status: 503 });
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
    return Response.json({ message: "Invalid listing coordinates." }, { status: 400 });
  }

  const endpoint = new URL(BASE_URL);
  endpoint.searchParams.set("lat", String(lat));
  endpoint.searchParams.set("lon", String(lon));
  endpoint.searchParams.set("distance", "10");
  endpoint.searchParams.set("limit", "12");

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json", "Content-Type": "application/json", "X-API-Key": key },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`GreatSchools returned ${response.status}`);

    const schools = (Array.isArray(data.schools) ? data.schools : [])
      .filter((school) => Number.isFinite(Number(school.lat)) && Number.isFinite(Number(school.lon)))
      .slice(0, 12)
      .map((school) => ({
        name: clean(school.name, 140),
        type: clean(school.type, 30),
        grades: clean(school.level || school["level-codes"], 80),
        address: clean([school.street, school.city, school.state, school.zip].filter(Boolean).join(", "), 220),
        lat: Number(school.lat),
        lon: Number(school.lon),
        distance: Number(school.distance) || 0,
        ratingBand: clean(school.rating_band || school["rating-band"], 40).replace(/^null$/i, ""),
        url: /^https:\/\/www\.greatschools\.org\//.test(String(school["overview-url"] || ""))
          ? String(school["overview-url"])
          : "",
      }));
    return Response.json(
      { schools },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("GreatSchools request failed", error instanceof Error ? error.message : error);
    return Response.json({ message: "Nearby school information is temporarily unavailable." }, { status: 502 });
  }
}

const SERVICE_CITIES = new Set([
  "waco",
  "woodway",
  "hewitt",
  "robinson",
  "china spring",
  "bellmead",
  "lacy lakeview",
]);

function titleCase(value) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function onRequestGet({ request }) {
  const input = new URL(request.url).searchParams.get("address")?.trim().slice(0, 280) || "";
  if (input.length < 10) {
    return Response.json(
      { valid: false, message: "Enter the street, city, state, and ZIP code." },
      { status: 400 },
    );
  }

  const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
  url.searchParams.set("address", input);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Census geocoder returned ${response.status}`);

    const data = await response.json();
    const match = data?.result?.addressMatches?.[0];
    const components = match?.addressComponents;
    const city = components?.city?.toLowerCase();

    if (!match || !components?.zip || components?.state !== "TX") {
      return Response.json(
        { valid: false, message: "We couldn’t verify that address. Include the street number, city, state, and ZIP." },
        { status: 422 },
      );
    }
    if (!SERVICE_CITIES.has(city)) {
      return Response.json(
        { valid: false, message: "That address is outside JR Grace Realty’s current service area." },
        { status: 422 },
      );
    }

    const address = titleCase(match.matchedAddress.replace(/, ([A-Z]{2}), /, ", $1 ")).replace(/, Tx /, ", TX ");
    return Response.json({
      valid: true,
      address,
      components: { city: titleCase(components.city), state: components.state, zip: components.zip },
    });
  } catch (error) {
    console.error("Address validation failed:", error instanceof Error ? error.message : error);
    return Response.json(
      { valid: false, message: "Address verification is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}

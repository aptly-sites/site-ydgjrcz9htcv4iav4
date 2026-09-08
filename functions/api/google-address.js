const SERVICE_CITIES = new Set([
  "waco",
  "woodway",
  "hewitt",
  "robinson",
  "china spring",
  "bellmead",
  "lacy lakeview",
]);

const requestBuckets = new Map();

function clean(value, max = 280) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function normalized(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function rateLimited(request) {
  const key = request.headers.get("CF-Connecting-IP") || "local-preview";
  const now = Date.now();
  const current = requestBuckets.get(key);
  if (!current || now - current.startedAt > 60_000) {
    requestBuckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > 90;
}

function component(components, type, field = "longText") {
  return components.find((item) => item.types?.includes(type))?.[field] || "";
}

function locationIsServed(components) {
  const state = component(components, "administrative_area_level_1", "shortText");
  const cities = [
    component(components, "locality"),
    component(components, "postal_town"),
    component(components, "administrative_area_level_3"),
  ].map(normalized).filter(Boolean);
  return state === "TX" && cities.some((city) => SERVICE_CITIES.has(city));
}

async function googleFetch(url, apiKey, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Google address lookup failed:", response.status, JSON.stringify(data)?.slice(0, 400));
    throw new Error("Google address lookup is temporarily unavailable.");
  }
  return data;
}

async function autocomplete(input, sessionToken, apiKey) {
  const data = await googleFetch("https://places.googleapis.com/v1/places:autocomplete", apiKey, {
    method: "POST",
    headers: {
      "X-Goog-FieldMask": [
        "suggestions.placePrediction.placeId",
        "suggestions.placePrediction.text.text",
        "suggestions.placePrediction.structuredFormat.mainText.text",
        "suggestions.placePrediction.structuredFormat.secondaryText.text",
      ].join(","),
    },
    body: JSON.stringify({
      input,
      includedRegionCodes: ["us"],
      locationBias: {
        rectangle: {
          low: { latitude: 30.7, longitude: -98.5 },
          high: { latitude: 32.1, longitude: -96.4 },
        },
      },
      ...(sessionToken ? { sessionToken } : {}),
    }),
  });

  return (data.suggestions || []).flatMap((suggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction?.placeId || !prediction?.text?.text) return [];
    return [{
      placeId: prediction.placeId,
      text: prediction.text.text,
      mainText: prediction.structuredFormat?.mainText?.text || prediction.text.text,
      secondaryText: prediction.structuredFormat?.secondaryText?.text || "",
    }];
  }).slice(0, 5);
}

async function placeDetails(placeId, sessionToken, apiKey) {
  const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
  if (sessionToken) url.searchParams.set("sessionToken", sessionToken);
  const place = await googleFetch(url, apiKey, {
    headers: {
      "X-Goog-FieldMask": "id,formattedAddress,addressComponents,location,viewport",
    },
  });

  if (!place.formattedAddress || !place.location || !locationIsServed(place.addressComponents || [])) {
    return null;
  }

  const components = place.addressComponents || [];
  const city = component(components, "locality")
    || component(components, "postal_town")
    || component(components, "administrative_area_level_3");
  return {
    valid: true,
    placeId: place.id || placeId,
    address: place.formattedAddress,
    location: {
      latitude: Number(place.location.latitude),
      longitude: Number(place.location.longitude),
    },
    components: {
      city,
      state: component(components, "administrative_area_level_1", "shortText"),
      zip: component(components, "postal_code"),
    },
  };
}

export async function onRequestGet({ request, env }) {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") {
    return Response.json({ message: "This lookup is only available from the JR Grace Realty website." }, { status: 403 });
  }
  if (rateLimited(request)) {
    return Response.json({ message: "Too many address searches. Please wait a moment and try again." }, { status: 429 });
  }

  const apiKey = env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { message: "Google address lookup is being connected.", code: "GOOGLE_MAPS_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "autocomplete";
  const sessionToken = clean(url.searchParams.get("sessionToken"), 64);

  try {
    if (action === "autocomplete") {
      const input = clean(url.searchParams.get("input"));
      if (input.length < 3) return Response.json({ suggestions: [] });
      return Response.json(
        { suggestions: await autocomplete(input, sessionToken, apiKey) },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    if (action === "details") {
      const placeId = clean(url.searchParams.get("placeId"), 220);
      if (!/^[A-Za-z0-9_-]{8,220}$/.test(placeId)) {
        return Response.json({ valid: false, message: "Choose an address from the Google suggestions." }, { status: 400 });
      }
      const place = await placeDetails(placeId, sessionToken, apiKey);
      if (!place) {
        return Response.json(
          { valid: false, message: "Choose a complete property address within JR Grace Realty’s service area." },
          { status: 422 },
        );
      }
      return Response.json(place, { headers: { "Cache-Control": "private, no-store" } });
    }

    return Response.json({ message: "Unsupported address lookup request." }, { status: 400 });
  } catch (error) {
    console.error("Unable to complete Google address lookup:", error instanceof Error ? error.message : error);
    return Response.json({ message: "Google address lookup is temporarily unavailable." }, { status: 502 });
  }
}

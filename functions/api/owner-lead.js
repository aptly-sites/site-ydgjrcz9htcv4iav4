const APTLY_BASE_URL = "https://core-api.getaptly.com";
const DEFAULT_BOARD_ID = "2phWRbsLuL5pNv9af";
const ALLOWED_CITIES = new Set([
  "waco",
  "woodway",
  "hewitt",
  "robinson",
  "china spring",
  "bellmead",
  "lacy lakeview",
]);

function clean(value, max = 180) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function normalized(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function splitName(fullName) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  return parts.length === 1
    ? { firstname: parts[0], lastname: "" }
    : { firstname: parts.slice(0, -1).join(" "), lastname: parts.at(-1) || "" };
}

function fieldName(field) {
  return normalized(field.label || field.name);
}

function fieldKey(field) {
  return field.key || field.uuid || "";
}

function findField(fields, names, types) {
  const wanted = names.map(normalized);
  const eligible = fields.filter((field) => {
    if (field.archived || !fieldKey(field)) return false;
    return !types || types.includes(normalized(field.type));
  });
  for (const candidate of wanted) {
    const exact = eligible.find((field) => fieldName(field) === candidate);
    if (exact) return exact;
  }
  return eligible.find((field) => {
    const name = fieldName(field);
    return wanted.some((candidate) => name.includes(candidate));
  });
}

function pageUrl(value) {
  const candidate = clean(value, 500);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? url.href.slice(0, 500) : "";
  } catch {
    return "";
  }
}

function boardFieldValue(field, value) {
  const type = normalized(field.type);
  if (type.includes("number") || type.includes("numeric") || type.includes("decimal") || type.includes("integer")) {
    if (normalized(value) === "studio") return 0;
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : value;
  }
  return value;
}

function buildDescription(values) {
  return [
    "Website Owner Lead",
    "",
    "LEAD ORIGIN",
    `Form or calculator: ${values.formSource}`,
    `Page: ${values.pageTitle}`,
    `URL: ${values.pageUrl}`,
    "",
    "OWNER CONTACT",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Phone: ${values.phone}`,
    "",
    "PROPERTY",
    `Address: ${values.address}`,
    `Property type: ${values.propertyType || "Not provided"}`,
    `Bed count: ${values.bedrooms || "Not provided"}`,
    `Bath count: ${values.bathrooms || "Not provided"}`,
    "",
    "OWNER REQUEST",
    `Goal: ${values.goal || "Not provided"}`,
    `Message: ${values.message || "Not provided"}`,
  ].join("\n");
}

function addressComponent(components, type, field = "longText") {
  return components.find((item) => item.types?.includes(type))?.[field] || "";
}

async function aptlyFetch(path, token, init = {}) {
  const response = await fetch(`${APTLY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-token": token,
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Aptly ${path} returned ${response.status}: ${JSON.stringify(data)?.slice(0, 500)}`);
  }
  return data;
}

async function verifyGoogleProperty(placeId, apiKey) {
  if (!apiKey || !/^[A-Za-z0-9_-]{8,220}$/.test(placeId)) return null;
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      Accept: "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,formattedAddress,addressComponents,location",
    },
  });
  if (!response.ok) throw new Error(`Google Place Details returned ${response.status}.`);
  const place = await response.json();
  const components = place.addressComponents || [];
  const city = addressComponent(components, "locality")
    || addressComponent(components, "postal_town")
    || addressComponent(components, "administrative_area_level_3");
  const state = addressComponent(components, "administrative_area_level_1", "shortText");
  const zip = addressComponent(components, "postal_code");
  if (!place.formattedAddress || !zip || state !== "TX" || !ALLOWED_CITIES.has(normalized(city))) return null;

  const formattedAddress = place.formattedAddress.replace(/, USA$/, "");
  return {
    formattedAddress,
    street: formattedAddress.split(",")[0],
    city,
    state,
    zip,
    latitude: Number(place.location?.latitude),
    longitude: Number(place.location?.longitude),
    placeId: place.id || placeId,
  };
}

async function verifyPropertyAddress(input, placeId, googleApiKey) {
  if (placeId && googleApiKey) return verifyGoogleProperty(placeId, googleApiKey);
  const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
  url.searchParams.set("address", input);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Address validator returned ${response.status}.`);

  const data = await response.json();
  const match = data?.result?.addressMatches?.[0];
  const components = match?.addressComponents;
  if (!match || !components?.zip || components?.state !== "TX" || !ALLOWED_CITIES.has(normalized(components.city))) {
    return null;
  }

  const titleCase = (value) => value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  const formattedAddress = titleCase(match.matchedAddress.replace(/, ([A-Z]{2}), /, ", $1 ")).replace(/, Tx /, ", TX ");
  const street = formattedAddress.split(",")[0];
  return { formattedAddress, street, city: titleCase(components.city), state: components.state, zip: components.zip };
}

export async function onRequestPost({ request, env }) {
  const token = env.APTLY_API_TOKEN;
  const boardId = env.APTLY_OWNER_LEADS_BOARD_ID || DEFAULT_BOARD_ID;
  if (!token) {
    console.error("Owner lead integration is missing its hosted Aptly API token.");
    return Response.json(
      { message: "We couldn't send your request right now. Please call (254) 400-2863." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Please review the form and try again." }, { status: 400 });
  }

  if (clean(body.website)) return Response.json({ message: "Thank you! Your request has been received." });

  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const phone = clean(body.phone, 40);
  const addressInput = clean(body.address, 280);
  const propertyType = clean(body.propertyType, 80);
  const bedrooms = clean(body.bedrooms || body.bedCount, 20);
  const bathrooms = clean(body.bathrooms || body.bathCount, 20);
  const goal = clean(body.goal, 120);
  const message = clean(body.message, 1200);
  const formSource = clean(body.formSource, 180) || goal || "Website Owner Lead Form";
  const sourcePageTitle = clean(body.pageTitle, 200) || "J R Grace Realty website";
  const sourcePageUrl = pageUrl(body.pageUrl) || pageUrl(request.headers.get("Referer")) || "Not provided";
  if (!name || !email || !phone || !addressInput || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json(
      { message: "Please complete your name, contact details, and full property address." },
      { status: 400 },
    );
  }

  try {
    const verified = await verifyPropertyAddress(
      addressInput,
      clean(body.placeId, 220),
      env.GOOGLE_MAPS_API_KEY,
    );
    if (!verified) {
      return Response.json(
        { message: "Please enter a valid property address in JR Grace Realty's service area." },
        { status: 422 },
      );
    }

    const { formattedAddress, street, city, state, zip } = verified;
    const propertyAddress = { address: street, street, city, state, zip, postalCode: zip, formattedAddress };
    if (Number.isFinite(verified.latitude) && Number.isFinite(verified.longitude)) {
      propertyAddress.latitude = verified.latitude;
      propertyAddress.longitude = verified.longitude;
      propertyAddress.lat = verified.latitude;
      propertyAddress.lng = verified.longitude;
    }
    if (verified.placeId) propertyAddress.googlePlaceId = verified.placeId;
    const [{ firstname, lastname }, schemaResponse, configurationResponse] = await Promise.all([
      Promise.resolve(splitName(name)),
      aptlyFetch(`/api/schema/${encodeURIComponent(boardId)}`, token),
      aptlyFetch(`/api/board/${encodeURIComponent(boardId)}/configuration`, token),
    ]);

    const contactResponse = await aptlyFetch("/api/contacts", token, {
      method: "POST",
      body: JSON.stringify({
        firstname,
        lastname,
        email,
        phone: [{ number: phone, type: "mobile" }],
        contactType: "Owner",
      }),
    });
    const contact = contactResponse?.data || contactResponse;
    const contactId = contact?._id || contact?.uuid;
    if (!contactId) throw new Error("Aptly created the contact without returning a contact ID.");

    const schemaFields = Array.isArray(schemaResponse) ? schemaResponse : schemaResponse?.data || [];
    const config = configurationResponse?.data || configurationResponse || {};
    const configFields = Array.isArray(config.fields) ? config.fields : [];
    const fields = [...schemaFields, ...configFields].filter(
      (field, index, all) => index === all.findIndex((candidate) => fieldKey(candidate) === fieldKey(field)),
    );
    const addressField = findField(fields, ["Rental Property Address"]);
    const contactField = findField(fields, ["Owner", "Owner Contact", "Contact"], ["person", "persons"])
      || fields.find((field) => ["person", "persons"].includes(normalized(field.type)) && !field.archived);
    const stageField = findField(
      fields,
      ["Stage", "Lead Stage", "Status", "Workflow"],
      ["select", "singleselect", "text", "string"],
    );
    const descriptionField = findField(fields, ["Description", "Lead Description", "Card Description", "Inquiry Details"]);
    if (!addressField) throw new Error("The Owner Leads board does not contain a Rental Property Address field.");
    if (!contactField) throw new Error("The Owner Leads board does not contain an owner/contact person field.");
    if (!descriptionField) throw new Error("The Owner Leads board does not contain a Description field.");

    const card = {
      name: `${name} – ${formattedAddress}`,
      Stage: "New Lead",
      Source: "Website",
    };
    const description = buildDescription({
      formSource,
      pageTitle: sourcePageTitle,
      pageUrl: sourcePageUrl,
      name,
      email,
      phone,
      address: formattedAddress,
      propertyType,
      bedrooms,
      bathrooms,
      goal,
      message,
    });
    card[fieldKey(addressField)] = normalized(addressField.type) === "address" ? propertyAddress : formattedAddress;
    card[fieldKey(contactField)] = normalized(contactField.type) === "persons" ? [contactId] : contactId;
    if (stageField) card[fieldKey(stageField)] = "New Lead";
    card[fieldKey(descriptionField)] = description;

    const optionalMappings = [
      [["Property Type"], propertyType],
      [["Bed Count", "Bedroom Count", "Bedrooms", "Beds"], bedrooms],
      [["Bath Count", "Bathroom Count", "Bathrooms", "Baths"], bathrooms],
      [["Owner Goal", "Goal"], goal],
      [["Desired Management Service", "Desired Service", "Service Requested"], goal],
      [["Message", "Notes", "Property Notes"], message],
      [["Email"], email],
      [["Phone", "Mobile Phone"], phone],
      [["Source", "Lead Source"], "Website"],
    ];
    for (const [labels, value] of optionalMappings) {
      if (!value) continue;
      const field = findField(fields, labels);
      if (field && card[fieldKey(field)] === undefined) card[fieldKey(field)] = boardFieldValue(field, value);
    }

    const workflows = Array.isArray(config.workflows) ? config.workflows : [];
    const newLeadsWorkflow = workflows.find((workflow) =>
      [workflow.name, workflow.title, workflow.label]
        .some((value) => ["new lead", "new leads"].includes(normalized(value))),
    );
    if (!stageField && newLeadsWorkflow) {
      const workflowId = newLeadsWorkflow.uuid || newLeadsWorkflow._id || newLeadsWorkflow.id;
      if (workflowId) {
        card.workflow = workflowId;
        card.sequence = workflowId;
      }
    }

    await aptlyFetch(`/api/board/${encodeURIComponent(boardId)}`, token, {
      method: "POST",
      body: JSON.stringify(card),
    });
    return Response.json({ message: "Thank you! Your free rental analysis request has been sent to JR Grace Realty." });
  } catch (error) {
    console.error("Unable to create Aptly owner lead:", error instanceof Error ? error.message : error);
    return Response.json(
      { message: "We couldn't send your request right now. Please call (254) 400-2863." },
      { status: 502 },
    );
  }
}

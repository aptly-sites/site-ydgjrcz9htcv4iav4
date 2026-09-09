export const LISTINGS_API = "https://app.getaptly.com/api/portal/listings/yDgjRcz9hTcv4iav4";

export function listingStreet(listing) {
  return listing?.address?.address
    || listing?.address?.streetName
    || listing?.marketingName
    || listing?.name
    || "Rental home";
}

export function listingMarketingHeading(listing, type) {
  const marketingName = String(listing?.marketingName || "").trim();
  if (marketingName) return marketingName;
  const city = listing?.address?.city || "Central Texas";
  const state = listing?.address?.stateCode || "TX";
  return `${listing?.beds}-Bedroom ${type || "Home"} for Rent in ${city}, ${state}`;
}

export function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function listingPath(listing) {
  const city = slugify(listing?.address?.city || "central-texas");
  const state = slugify(listing?.address?.stateCode || listing?.address?.state || "tx");
  const street = slugify(listingStreet(listing)) || "rental-home";
  const id = encodeURIComponent(String(listing?._id || "").trim());
  return `/rentals/${city}-${state}/${street}/${id}`;
}

export function listingIdFromPath(pathname) {
  const match = String(pathname || "").match(/^\/rentals\/[^/]+\/[^/]+\/([^/]+)\/?$/i);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
}

export function findListing(listings, requestUrl) {
  const url = requestUrl instanceof URL ? requestUrl : new URL(requestUrl);
  const id = url.searchParams.get("id") || listingIdFromPath(url.pathname);
  return (listings || []).find((listing) => String(listing?._id) === id) || null;
}

export async function fetchListings() {
  const response = await fetch(LISTINGS_API, {
    headers: { Accept: "application/json" },
    cf: { cacheEverything: true, cacheTtl: 300 },
  });
  if (!response.ok) throw new Error(`Aptly listings returned ${response.status}.`);
  const payload = await response.json();
  return (payload?.data || []).filter((listing) => listing?.publishedForRent !== false);
}

function money(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format((Number(cents) || 0) / 100);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function firstFeedUrl(...values) {
  return values.map(safeHttpsUrl).find(Boolean) || "";
}

function applyUrl(listing) {
  return firstFeedUrl(listing?.aptlyScreening?.link, listing?.links?.apply, listing?.applyUrl)
    || "https://portal.getaptly.com/search/yDgjRcz9hTcv4iav4/";
}

function listingPhotos(listing) {
  const photos = listing?.marketingFiles?.length ? listing.marketingFiles : listing?.photo || [];
  return photos.map((photo) => typeof photo === "string" ? safeHttpsUrl(photo) : "").filter(Boolean);
}

function coordinates(listing) {
  const point = listing?.address?.geopoint;
  if (!Array.isArray(point) || point.length < 2) return null;
  const longitude = Number(point[0]);
  const latitude = Number(point[1]);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

export function rentalMetadata(listing, origin) {
  const address = listing?.address || {};
  const type = listing?.buildingType || listing?.rentalCategory || "Home";
  const street = listingStreet(listing);
  const formattedAddress = address.formattedAddress || address.standardAddress || street;
  const canonical = new URL(listingPath(listing), origin).href;
  const rent = money(listing?.marketRent?.amount);
  const squareFeet = listing?.totalArea ? Number(listing.totalArea).toLocaleString() : "";
  const title = `${street}, ${address.city}, ${address.stateCode} for Rent | J R Grace Realty`;
  const description = `${formattedAddress} is a ${listing?.beds}-bedroom, ${listing?.baths}-bathroom ${String(type).toLowerCase()} for rent at ${rent} per month${squareFeet ? ` with approximately ${squareFeet} square feet` : ""}. View current photos, property details, nearby schools, tour availability, and application information.`.slice(0, 300);
  const photos = listingPhotos(listing);
  const pets = listing?.petsAllowed
    ? "Pets are allowed; restrictions and pet charges may apply."
    : "Contact J R Grace Realty to confirm the current pet policy.";
  const tourAnswer = listing?.aptlyShowings?.active
    ? "Yes. Available self-tour windows are loaded from Aptly and confirmed during reservation."
    : "Contact J R Grace Realty for the current showing options.";
  const faqs = [
    [`How much is the monthly rent for ${street}?`, `${rent} per month is the current advertised base rent. Final lease terms and conditional fees control.`],
    [`How many bedrooms and bathrooms does ${street} have?`, `${street} has ${listing?.beds} bedroom${Number(listing?.beds) === 1 ? "" : "s"} and ${listing?.baths} bathroom${Number(listing?.baths) === 1 ? "" : "s"}${squareFeet ? `, with approximately ${squareFeet} square feet` : ""}.`],
    [`Can I schedule a tour of ${street}?`, tourAnswer],
    [`Are pets allowed at ${street}?`, pets],
  ];
  const coords = coordinates(listing);
  const residence = {
    "@type": /apartment/i.test(type) ? "Apartment" : "SingleFamilyResidence",
    name: formattedAddress,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.address || street,
      addressLocality: address.city,
      addressRegion: address.stateCode,
      postalCode: address.postalCode,
      addressCountry: "US",
    },
    geo: coords ? { "@type": "GeoCoordinates", ...coords } : undefined,
    numberOfBedrooms: Number(listing?.beds),
    numberOfBathroomsTotal: Number(listing?.baths),
    floorSize: listing?.totalArea ? {
      "@type": "QuantitativeValue",
      value: Number(listing.totalArea),
      unitCode: "FTK",
    } : undefined,
    petsAllowed: Boolean(listing?.petsAllowed),
  };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        primaryImageOfPage: photos[0] ? { "@type": "ImageObject", url: photos[0] } : undefined,
        mainEntity: { "@id": `${canonical}#listing` },
      },
      {
        "@type": "RealEstateListing",
        "@id": `${canonical}#listing`,
        identifier: String(listing?._id || ""),
        name: title,
        url: canonical,
        description,
        datePosted: listing?.createdAt || undefined,
        dateModified: listing?.updatedAt || undefined,
        image: photos.slice(0, 20),
        provider: {
          "@type": "RealEstateAgent",
          name: "J R Grace Realty",
          telephone: "+1-254-400-2863",
          email: "hello@jrgrace.com",
          url: new URL("/", origin).href,
        },
        offers: {
          "@type": "Offer",
          price: Number(listing?.marketRent?.amount || 0) / 100,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: applyUrl(listing),
        },
        mainEntity: residence,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "J R Grace Realty", item: new URL("/", origin).href },
          { "@type": "ListItem", position: 2, name: "Homes for Rent", item: new URL("/rental-search.html", origin).href },
          { "@type": "ListItem", position: 3, name: `${address.city}, ${address.stateCode} Rentals`, item: new URL(`/rental-search.html?city=${encodeURIComponent(address.city || "")}`, origin).href },
          { "@type": "ListItem", position: 4, name: street, item: canonical },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
  return { canonical, description, faqs, formattedAddress, photos, rent, schema, squareFeet, street, title, type };
}

function setMeta(html, id, value) {
  const matcher = new RegExp(`<meta\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i");
  return html.replace(matcher, (tag) => {
    const escaped = escapeHtml(value);
    return /\bcontent=["'][^"']*["']/i.test(tag)
      ? tag.replace(/\bcontent=["'][^"']*["']/i, `content="${escaped}"`)
      : tag.replace(/>$/, ` content="${escaped}">`);
  });
}

function setContents(html, tagName, id, value, raw = false) {
  const matcher = new RegExp(`(<${tagName}\\b[^>]*\\bid=["']${id}["'][^>]*>)[\\s\\S]*?(<\\/${tagName}>)`, "i");
  return html.replace(matcher, (_match, openingTag, closingTag) =>
    `${openingTag}${raw ? value : escapeHtml(value)}${closingTag}`);
}

function setLink(html, id, href) {
  const matcher = new RegExp(`<a\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i");
  return html.replace(matcher, (tag) => {
    const escaped = escapeHtml(href);
    return /\bhref=["'][^"']*["']/i.test(tag)
      ? tag.replace(/\bhref=["'][^"']*["']/i, `href="${escaped}"`)
      : tag.replace(/>$/, ` href="${escaped}">`);
  });
}

export function renderRentalHtml(sourceHtml, listing, allListings, origin) {
  const meta = rentalMetadata(listing, origin);
  const address = listing.address || {};
  const summary = `${meta.street} is an available ${listing.beds}-bedroom, ${listing.baths}-bathroom ${meta.type.toLowerCase()} for rent in ${address.city}, ${address.stateCode} ${address.postalCode}. The advertised rent is ${meta.rent} per month${meta.squareFeet ? ` for approximately ${meta.squareFeet} square feet` : ""}.`;
  const gallery = meta.photos.slice(0, 5).map((source, index) => {
    const remaining = Math.max(0, meta.photos.length - 5);
    const badge = index === 4 && remaining ? `<span class="more-photos">+${remaining} photos</span>` : "";
    return `<button class="gallery-photo gallery-photo-${index + 1}" data-photo="${index}" aria-label="Open photo ${index + 1} of ${meta.photos.length}"><img src="${escapeHtml(source)}" alt="${escapeHtml(meta.formattedAddress)} rental property photo ${index + 1}">${badge}</button>`;
  }).join("");
  const features = [
    ["PROPERTY TYPE", meta.type],
    ["ADDRESS", meta.formattedAddress],
    ["PETS", listing.petsAllowed ? "Pets allowed" : "Contact leasing"],
    ["PARKING", listing.parkingType || "Contact leasing"],
    ["LAUNDRY", listing.laundryType || "Contact leasing"],
    ["DEPOSIT", money(listing.deposit?.amount)],
  ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join("");
  const faq = meta.faqs.map(([question, answer], index) => `<details${index === 0 ? " open" : ""}><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("");
  const similar = (allListings || [])
    .filter((item) => item._id !== listing._id && (item.address?.city === address.city || item.beds === listing.beds))
    .slice(0, 3)
    .map((item) => {
      const image = listingPhotos(item)[0] || "/assets/areas.jpg";
      return `<article class="similar-card"><a href="${escapeHtml(listingPath(item))}"><img src="${escapeHtml(image)}" alt="${escapeHtml(listingStreet(item))}"><div><b>${escapeHtml(money(item.marketRent?.amount))}/mo</b><p>${escapeHtml(item.beds)} bd · ${escapeHtml(item.baths)} ba · ${item.totalArea ? Number(item.totalArea).toLocaleString() : "—"} sq ft</p><h3>${escapeHtml(listingStreet(item))}</h3><span>${escapeHtml(item.address?.city)}, ${escapeHtml(item.address?.stateCode)} ${escapeHtml(item.address?.postalCode)}</span></div></a></article>`;
    }).join("");

  let html = sourceHtml.replace(/<link\b[^>]*\bid=["']canonicalUrl["'][^>]*>/i, "");
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = setMeta(html, "seoDescription", meta.description);
  html = setMeta(html, "ogTitle", meta.title);
  html = setMeta(html, "ogDescription", meta.description);
  html = setMeta(html, "ogUrl", meta.canonical);
  html = setMeta(html, "twitterTitle", meta.title);
  html = setMeta(html, "twitterDescription", meta.description);
  if (meta.photos[0]) html = setMeta(html, "ogImage", meta.photos[0]);
  const structuredData = JSON.stringify(meta.schema).replace(/</g, "\\u003c");
  html = html.replace("</head>", `<link rel="canonical" id="canonicalUrl" href="${escapeHtml(meta.canonical)}"><script type="application/ld+json" id="listingStructuredData">${structuredData}</script><style>#loading{display:none!important}</style></head>`);
  html = html.replace(/<div id=["']page["']\s+hidden>/i, '<div id="page" data-server-rendered="true">');
  html = setContents(html, "span", "crumbCity", `${address.city}, ${address.stateCode}`);
  html = setContents(html, "span", "crumbStreet", meta.street);
  html = setContents(html, "section", "gallery", gallery, true);
  html = setContents(html, "p", "kicker", `AVAILABLE RENTAL IN ${String(address.city || "WACO").toUpperCase()}, ${address.stateCode || "TX"}`);
  html = setContents(html, "h1", "title", listingMarketingHeading(listing, meta.type));
  html = setContents(html, "p", "address", meta.formattedAddress);
  html = setContents(html, "p", "summary", summary);
  html = setContents(html, "strong", "rent", meta.rent);
  html = setContents(html, "strong", "beds", listing.beds ?? "—");
  html = setContents(html, "strong", "baths", listing.baths ?? "—");
  html = setContents(html, "strong", "area", meta.squareFeet || "—");
  html = setContents(html, "div", "features", features, true);
  html = setContents(html, "h2", "aboutHeading", `About this ${address.city} rental`);
  html = setContents(html, "div", "description", listing.marketingDescription || "Contact J R Grace Realty for details about this available home.");
  html = setContents(html, "div", "listingFaq", faq, true);
  html = setContents(html, "strong", "costRent", meta.rent);
  html = setContents(html, "strong", "deposit", money(listing.deposit?.amount));
  html = setContents(html, "div", "similar", similar, true);
  html = setLink(html, "tourSide", `${meta.canonical}#tour-times`);
  html = setLink(html, "tourBottom", `${meta.canonical}#tour-times`);
  html = setLink(html, "applySide", applyUrl(listing));
  html = setLink(html, "applyBottom", applyUrl(listing));
  return html;
}

export function unavailableResponse(status, message) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Rental Not Available | J R Grace Realty</title></head><body><main><h1>${escapeHtml(message)}</h1><p><a href="/rental-search.html">Browse currently available homes</a></p></main></body></html>`, {
    status,
    headers: {
      "Cache-Control": status === 404 ? "public, max-age=60" : "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}

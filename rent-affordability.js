const LISTINGS_API = "https://app.getaptly.com/api/portal/listings/yDgjRcz9hTcv4iav4";
const FALLBACK_IMAGE = "/assets/areas.jpg";

const numberValue = value => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundDown = (value, step = 25) => Math.max(0, Math.floor(value / step) * step);

export function calculateRentBudget({ annualIncome, monthlyExpenses = 0, monthlyDebts = 0, monthlySavings = 0, rentRatio = 30 }) {
  const annual = numberValue(annualIncome);
  const grossMonthly = annual / 12;
  const ratio = Math.min(40, Math.max(20, numberValue(rentRatio) || 30)) / 100;
  const commitments = numberValue(monthlyExpenses) + numberValue(monthlyDebts) + numberValue(monthlySavings);
  const percentageCeiling = grossMonthly * ratio;
  const cashFlowCeiling = commitments > 0 ? Math.max(0, (grossMonthly - commitments) * 0.5) : percentageCeiling;
  const recommended = roundDown(Math.min(percentageCeiling, cashFlowCeiling));
  const comfortable = roundDown(Math.min(recommended, grossMonthly * Math.min(0.25, ratio)));
  return {
    annualIncome: annual,
    grossMonthly,
    rentRatio: ratio * 100,
    commitments,
    percentageCeiling,
    recommended,
    comfortable,
    remainingAfterPlan: Math.max(0, grossMonthly - commitments - recommended),
  };
}

export function matchingListings(listings, city, budget) {
  return (Array.isArray(listings) ? listings : [])
    .filter(listing => String(listing.address?.city || "").localeCompare(String(city || ""), undefined, { sensitivity: "accent" }) === 0)
    .filter(listing => numberValue(listing.marketRent?.amount) / 100 <= budget)
    .sort((a, b) => numberValue(b.marketRent?.amount) - numberValue(a.marketRent?.amount));
}

const slug = value => String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const street = listing => listing.address?.address || [listing.address?.streetNumber, listing.address?.streetName].filter(Boolean).join(" ") || listing.name || "Rental home";
export const listingUrl = listing => `/rentals/${slug(listing.address?.city || "central-texas")}-${slug(listing.address?.stateCode || listing.address?.state || "tx")}/${slug(street(listing)) || "rental-home"}/${encodeURIComponent(listing._id)}`;

const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const listingRent = listing => numberValue(listing.marketRent?.amount) / 100;
const listingPhoto = listing => (Array.isArray(listing.marketingFiles) && listing.marketingFiles.find(Boolean)) || FALLBACK_IMAGE;

function renderRental(listing) {
  const address = listing.address || {};
  const locality = [address.city, address.stateCode].filter(Boolean).join(", ");
  const location = [locality, address.postalCode].filter(Boolean).join(" ");
  const area = numberValue(listing.totalArea);
  return `<article class="affordability-rental">
    <a class="affordability-rental-media" href="${escapeHtml(listingUrl(listing))}"><img loading="lazy" src="${escapeHtml(listingPhoto(listing))}" alt="${escapeHtml(street(listing))} rental home"><span class="affordability-rental-badge">Within your estimate</span></a>
    <div class="affordability-rental-body">
      <div class="affordability-rental-price">${money(listingRent(listing))}<small>/month</small></div>
      <h3>${escapeHtml(street(listing))}</h3><p class="affordability-rental-address">${escapeHtml(location)}</p>
      <div class="affordability-rental-facts"><span>${escapeHtml(listing.beds ?? "—")} beds</span><span>${escapeHtml(listing.baths ?? "—")} baths</span><span>${area ? `${area.toLocaleString()} sq ft` : "Area available on listing"}</span></div>
      <div class="affordability-rental-actions"><a href="${escapeHtml(listingUrl(listing))}">View home</a><a href="/rental-search.html?city=${encodeURIComponent(address.city || "")}">City rentals</a></div>
    </div>
  </article>`;
}

function summaryMarkup(result, city) {
  return `<article><span>Recommended maximum</span><strong>${money(result.recommended)}</strong></article>
    <article><span>Comfortable target</span><strong>${money(result.comfortable)}–${money(result.recommended)}</strong></article>
    <article><span>Gross monthly income</span><strong>${money(result.grossMonthly)}</strong></article>
    <article><span>Selected city</span><strong>${escapeHtml(city)}</strong></article>`;
}

export function initRentAffordability() {
  const root = document.querySelector(".affordability-page");
  const form = document.querySelector("#affordabilityForm");
  if (!root || !form || root.dataset.affordabilityReady === "true") return;
  root.dataset.affordabilityReady = "true";

  const citySelect = form.querySelector("#affordCity");
  const incomeInput = form.querySelector("#annualIncome");
  const ratioInput = form.querySelector("#rentRatio");
  const ratioOutput = form.querySelector("#rentRatioOutput");
  const error = form.querySelector("#affordabilityError");
  const resultsSection = document.querySelector("#affordabilityResults");
  const summary = document.querySelector("#affordabilitySummary");
  const explanation = document.querySelector("#affordabilityExplanation");
  const listingStatus = document.querySelector("#affordabilityListingStatus");
  const listingGrid = document.querySelector("#affordabilityListings");
  const resultTitle = document.querySelector("#affordabilityResultTitle");
  const matchesTitle = document.querySelector("#affordabilityMatchesTitle");
  const browseLink = document.querySelector("#browseCityRentals");
  let listings = [];
  let feedReady = false;
  let lastCalculation = null;

  const requestedCity = new URLSearchParams(location.search).get("city") || "";
  const setError = message => {
    error.textContent = message;
    error.hidden = !message;
  };

  const populateCities = data => {
    const cities = [...new Set(data.map(listing => String(listing.address?.city || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    citySelect.innerHTML = `<option value="">Select a city</option>${cities.map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`).join("")}`;
    citySelect.disabled = cities.length === 0;
    if (requestedCity) {
      const option = cities.find(city => city.toLowerCase() === requestedCity.toLowerCase());
      if (option) citySelect.value = option;
    }
  };

  const renderMatches = () => {
    if (!lastCalculation) return;
    const { city, budget } = lastCalculation;
    browseLink.href = `/rental-search.html?city=${encodeURIComponent(city)}`;
    if (!feedReady) {
      listingStatus.setAttribute("aria-busy", "true");
      listingStatus.textContent = "Checking the current J R Grace Realty listing feed…";
      listingGrid.innerHTML = "";
      return;
    }
    listingStatus.removeAttribute("aria-busy");
    const cityListings = listings.filter(listing => String(listing.address?.city || "").toLowerCase() === city.toLowerCase());
    const matches = matchingListings(listings, city, budget);
    matchesTitle.textContent = `Homes in ${city} that fit your estimate`;
    if (matches.length) {
      listingStatus.textContent = `${matches.length} current ${matches.length === 1 ? "home is" : "homes are"} listed at or below ${money(budget)} per month. Pricing and availability can change.`;
      listingGrid.innerHTML = matches.map(renderRental).join("");
      return;
    }
    const lowest = cityListings.sort((a, b) => listingRent(a) - listingRent(b))[0];
    listingStatus.textContent = "";
    listingGrid.innerHTML = `<div class="affordability-empty"><h3>No current ${escapeHtml(city)} listings fall within this estimate.</h3><p>${lowest ? `The lowest currently advertised rent in ${escapeHtml(city)} is ${money(listingRent(lowest))} per month. ` : ""}Availability changes, so browse all homes or adjust your numbers to explore another range.</p><a href="${escapeHtml(browseLink.href)}">Browse all ${escapeHtml(city)} rentals</a></div>`;
  };

  const calculate = () => {
    const annualIncome = numberValue(incomeInput.value);
    const city = citySelect.value;
    if (!city) return setError(feedReady ? "Choose a city with available J R Grace Realty rentals." : "Please wait while current listing cities load."), null;
    if (annualIncome < 12000) return setError("Enter an annual gross income of at least $12,000."), null;
    if (annualIncome > 10000000) return setError("Please check the annual income amount and try again."), null;
    setError("");
    const budget = calculateRentBudget({
      annualIncome,
      monthlyExpenses: form.elements.monthlyExpenses.value,
      monthlyDebts: form.elements.monthlyDebts.value,
      monthlySavings: form.elements.monthlySavings.value,
      rentRatio: ratioInput.value,
    });
    lastCalculation = { city, budget: budget.recommended };
    resultTitle.textContent = `${money(budget.recommended)} per month is your estimated maximum`;
    summary.innerHTML = summaryMarkup(budget, city);
    const refined = budget.commitments > 0 ? ` Your optional expenses, debt payments, and savings goal total ${money(budget.commitments)} per month, so the estimate also keeps rent to no more than half of the gross income remaining after those commitments.` : " Add your recurring expenses, debts, and savings goal under More options for a more conservative cash-flow check.";
    explanation.innerHTML = `<strong>How this was calculated:</strong> ${money(budget.annualIncome)} per year is about ${money(budget.grossMonthly)} in gross monthly income. A ${Math.round(budget.rentRatio)}% rent target starts at ${money(budget.percentageCeiling)} per month.${refined} This leaves approximately ${money(budget.remainingAfterPlan)} in gross monthly income after the rent estimate and the optional commitments you entered.`;
    resultsSection.hidden = false;
    renderMatches();
    resultsSection.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    return budget;
  };

  ratioInput.addEventListener("input", () => { ratioOutput.value = `${ratioInput.value}%`; });
  [incomeInput, ...form.querySelectorAll(".affordability-money-input input")].forEach(input => input.addEventListener("blur", () => {
    const value = numberValue(input.value);
    if (value) input.value = Math.round(value).toLocaleString("en-US");
  }));
  form.addEventListener("submit", event => { event.preventDefault(); calculate(); });
  document.querySelector("#editAffordability")?.addEventListener("click", () => {
    form.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    incomeInput.focus({ preventScroll: true });
  });

  fetch(LISTINGS_API, { headers: { Accept: "application/json" } })
    .then(response => { if (!response.ok) throw new Error("Listing feed unavailable"); return response.json(); })
    .then(payload => {
      listings = Array.isArray(payload?.data) ? payload.data.filter(listing => listing?.publishedForRent !== false) : [];
      feedReady = true;
      populateCities(listings);
      renderMatches();
    })
    .catch(() => {
      feedReady = true;
      citySelect.innerHTML = '<option value="">Current cities are temporarily unavailable</option>';
      citySelect.disabled = true;
      setError("We could not load current rental cities. Please refresh the page or browse all available homes.");
      renderMatches();
    });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initRentAffordability, { once: true });
  else initRentAffordability();
  document.addEventListener("jr:page-swapped", initRentAffordability);
}

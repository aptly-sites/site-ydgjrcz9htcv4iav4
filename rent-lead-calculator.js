(() => {
  const addStylesheet = (href) => {
    if (document.querySelector(`link[href*="${href.split("?")[0]}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  };
  addStylesheet("global-property-nav.css?v=20260908-1");
  addStylesheet("google-address.css?v=20260908-1");
  if (!document.querySelector('script[src*="global-property-nav"]')) {
    const script = document.createElement("script");
    script.src = "global-property-nav.js?v=20260908-1";
    document.body.append(script);
  }

  const calculator = document.querySelector("#calculator-form");
  const recommendation = document.querySelector(".recommendation");
  if (!calculator || !recommendation) return;

  recommendation.insertAdjacentHTML("afterend", `
    <section class="rent-analysis-cta">
      <p class="eyebrow">Replace assumptions with local insight</p>
      <h3>What could your home actually rent for?</h3>
      <p>Your address changes the story. Share a few property details and the JR Grace team will review your home, nearby rental competition, and current Central Texas market conditions to prepare a personalized rental analysis.</p>
      <button id="open-rent-analysis" type="button">Get My Personalized Rent Estimate <span>→</span></button>
      <small>Free, property-specific, and prepared by a local property management team.</small>
    </section>
  `);

  document.body.insertAdjacentHTML("beforeend", `
    <div class="rent-lead-modal" aria-hidden="true">
      <div class="rent-lead-backdrop"></div>
      <section class="rent-lead-dialog" role="dialog" aria-modal="true" aria-labelledby="rentLeadTitle">
        <button class="rent-lead-close" type="button" aria-label="Close">×</button>
        <p class="eyebrow">Free personalized rental analysis</p>
        <h2 id="rentLeadTitle">See what your property could rent for.</h2>
        <p class="rent-lead-intro">Tell us about the home. JR Grace Realty will review its location, features, and local rental market to prepare a more useful estimate than a generic calculator can provide.</p>
        <form class="rent-lead-form" action="/api/owner-lead" method="post">
          <label class="wide rent-address-field">Rental property address
            <div class="rent-address-control">
              <input required name="address" autocomplete="off" placeholder="Start typing the property address" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="rentAddressSuggestions">
              <ul id="rentAddressSuggestions" class="rent-address-suggestions" role="listbox"></ul>
            </div>
            <img class="rent-google-brand" src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" alt="Powered by Google">
            <small class="rent-address-status">Start typing and choose the matching address from Google.</small>
            <div class="rent-address-map" hidden>
              <img alt="Google map showing the verified rental property address">
              <div><strong>Verified property address</strong><span></span><a target="_blank" rel="noopener">Open in Google Maps →</a></div>
            </div>
          </label>
          <label>Property type<select required name="propertyType"><option value="" selected disabled>Select type</option><option>Single-family home</option><option>Townhome</option><option>Condo</option><option>Duplex</option><option>Multifamily property</option><option>Other</option></select></label>
          <label>Bedrooms<select required name="bedrooms"><option value="" selected disabled>Select</option><option>Studio</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></label>
          <label>Bathrooms<select required name="bathrooms"><option value="" selected disabled>Select</option><option>1</option><option>1.5</option><option>2</option><option>2.5</option><option>3</option><option>3.5</option><option>4+</option></select></label>
          <label>Full name<input required name="name" autocomplete="name" placeholder="Your full name"></label>
          <label>Email address<input required type="email" name="email" autocomplete="email" placeholder="you@example.com"></label>
          <label>Phone number<input required type="tel" name="phone" autocomplete="tel" placeholder="(254) 400-2863"></label>
          <input type="hidden" name="placeId">
          <input type="hidden" name="latitude">
          <input type="hidden" name="longitude">
          <input type="hidden" name="goal" value="Get a personalized rent estimate from the Rent vs. Sell calculator">
          <input type="hidden" name="message">
          <label class="rent-form-trap" aria-hidden="true">Company website<input name="website" tabindex="-1" autocomplete="off"></label>
          <label class="rent-sms wide"><input required type="checkbox" name="smsConsent" value="yes"><span>By providing your phone number, you agree to receive recurring SMS messages from JR Grace Realty. Message and data rates may apply. Reply STOP to opt out.</span></label>
          <button class="rent-lead-submit wide" type="submit">Request My Rental Analysis <span>→</span></button>
          <p class="rent-lead-note wide" role="status" aria-live="polite"></p>
        </form>
        <div class="rent-lead-mask"><img src="assets/jr-grace-loader-logo.png" alt=""><p class="eyebrow">Preparing your request</p><h3>Sending your property details…</h3><p>Please wait while we securely send your information to the JR Grace team.</p></div>
      </section>
    </div>
  `);

  const modal = document.querySelector(".rent-lead-modal");
  const form = modal.querySelector(".rent-lead-form");
  const close = modal.querySelector(".rent-lead-close");
  const address = form.elements.address;
  const placeId = form.elements.placeId;
  const latitude = form.elements.latitude;
  const longitude = form.elements.longitude;
  const status = modal.querySelector(".rent-address-status");
  const mask = modal.querySelector(".rent-lead-mask");
  const suggestionsList = modal.querySelector(".rent-address-suggestions");
  const googleBrand = modal.querySelector(".rent-google-brand");
  const addressMap = modal.querySelector(".rent-address-map");
  const mapImage = addressMap.querySelector("img");
  const mapAddress = addressMap.querySelector("span");
  const mapLink = addressMap.querySelector("a");
  let verified = "";
  let googleAvailable = true;
  let lookupTimer;
  let activeSuggestion = -1;
  let sessionToken = crypto.randomUUID();

  const hideSuggestions = () => {
    suggestionsList.classList.remove("open");
    suggestionsList.innerHTML = "";
    address.setAttribute("aria-expanded", "false");
    activeSuggestion = -1;
  };
  const clearVerifiedAddress = () => {
    verified = "";
    placeId.value = "";
    latitude.value = "";
    longitude.value = "";
    addressMap.hidden = true;
    addressMap.classList.remove("map-unavailable");
    mapImage.removeAttribute("src");
  };
  const open = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => address.focus(), 50);
  };
  const shut = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    hideSuggestions();
  };

  document.querySelector("#open-rent-analysis").addEventListener("click", open);
  close.addEventListener("click", shut);
  modal.querySelector(".rent-lead-backdrop").addEventListener("click", shut);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) shut();
  });

  async function googleRequest(params) {
    const query = new URLSearchParams({ ...params, sessionToken });
    const response = await fetch(`/api/google-address?${query}`, { headers: { Accept: "application/json" } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.message || "Google address lookup is temporarily unavailable.");
      error.code = result.code || "LOOKUP_ERROR";
      throw error;
    }
    return result;
  }

  async function showSuggestions() {
    const input = address.value.trim();
    if (!googleAvailable || input.length < 3 || input === verified) {
      hideSuggestions();
      return;
    }
    try {
      const result = await googleRequest({ action: "autocomplete", input });
      const suggestions = result.suggestions || [];
      suggestionsList.innerHTML = suggestions.map((suggestion, index) => `
        <li role="option" aria-selected="false">
          <button type="button" data-index="${index}" data-place-id="${suggestion.placeId}">
            <strong>${escapeHtml(suggestion.mainText)}</strong>
            <span>${escapeHtml(suggestion.secondaryText)}</span>
          </button>
        </li>
      `).join("");
      googleBrand.classList.toggle("show", suggestions.length > 0);
      suggestionsList.classList.toggle("open", suggestions.length > 0);
      address.setAttribute("aria-expanded", String(suggestions.length > 0));
      if (!suggestions.length) {
        status.className = "rent-address-status";
        status.textContent = "Keep typing the full street address, city, state, and ZIP.";
      }
    } catch (error) {
      hideSuggestions();
      googleBrand.classList.remove("show");
      if (error.code === "GOOGLE_MAPS_NOT_CONFIGURED") {
        googleAvailable = false;
        status.textContent = "Enter the complete address. We’ll verify it before submission.";
      } else {
        status.className = "rent-address-status invalid";
        status.textContent = error.message;
      }
    }
  }

  async function chooseSuggestion(selectedPlaceId) {
    hideSuggestions();
    status.className = "rent-address-status checking";
    status.textContent = "Confirming this address with Google…";
    try {
      const result = await googleRequest({ action: "details", placeId: selectedPlaceId });
      if (!result.valid) throw new Error(result.message || "Choose a complete property address.");
      verified = result.address;
      address.value = result.address;
      placeId.value = result.placeId;
      latitude.value = result.location.latitude;
      longitude.value = result.location.longitude;
      address.setCustomValidity("");
      status.className = "rent-address-status valid";
      status.textContent = `✓ Verified by Google: ${result.address}`;
      mapAddress.textContent = result.address;
      mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.address)}&query_place_id=${encodeURIComponent(result.placeId)}`;
      mapImage.src = `/api/google-address-map?lat=${encodeURIComponent(result.location.latitude)}&lng=${encodeURIComponent(result.location.longitude)}`;
      mapImage.onload = () => addressMap.classList.remove("map-unavailable");
      mapImage.onerror = () => addressMap.classList.add("map-unavailable");
      addressMap.hidden = false;
      sessionToken = crypto.randomUUID();
    } catch (error) {
      clearVerifiedAddress();
      address.setCustomValidity(error.message);
      status.className = "rent-address-status invalid";
      status.textContent = error.message;
      address.reportValidity();
    }
  }

  async function validateFallback() {
    const value = address.value.trim();
    if (!value) return false;
    if (value === verified) return true;
    if (googleAvailable) {
      address.setCustomValidity("Choose the matching property address from the Google suggestions.");
      status.className = "rent-address-status invalid";
      status.textContent = "Choose the matching property address from the Google suggestions.";
      return false;
    }
    status.className = "rent-address-status checking";
    status.textContent = "Verifying this address…";
    try {
      const response = await fetch(`/api/address-validate?address=${encodeURIComponent(value)}`, { headers: { Accept: "application/json" } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.valid) throw new Error(result.message || "Please enter a valid address.");
      address.value = result.address;
      verified = result.address;
      address.setCustomValidity("");
      status.className = "rent-address-status valid";
      status.textContent = `✓ Verified: ${result.address}`;
      return true;
    } catch (error) {
      clearVerifiedAddress();
      address.setCustomValidity(error.message);
      status.className = "rent-address-status invalid";
      status.textContent = error.message;
      return false;
    }
  }

  address.addEventListener("input", () => {
    if (address.value.trim() === verified) return;
    clearTimeout(lookupTimer);
    clearVerifiedAddress();
    address.setCustomValidity("");
    status.className = "rent-address-status";
    status.textContent = googleAvailable
      ? "Start typing and choose the matching address from Google."
      : "Enter the complete address. We’ll verify it before submission.";
    lookupTimer = setTimeout(showSuggestions, 260);
  });
  address.addEventListener("keydown", (event) => {
    const options = [...suggestionsList.querySelectorAll("button")];
    if (!options.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      activeSuggestion = event.key === "ArrowDown"
        ? (activeSuggestion + 1) % options.length
        : (activeSuggestion - 1 + options.length) % options.length;
      options.forEach((option, index) => option.classList.toggle("active", index === activeSuggestion));
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      chooseSuggestion(options[activeSuggestion].dataset.placeId);
    } else if (event.key === "Escape") {
      hideSuggestions();
    }
  });
  suggestionsList.addEventListener("mousedown", (event) => event.preventDefault());
  suggestionsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-place-id]");
    if (button) chooseSuggestion(button.dataset.placeId);
  });
  address.addEventListener("blur", () => setTimeout(() => {
    if (!suggestionsList.matches(":hover")) hideSuggestions();
  }, 120));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (address.value.trim() !== verified && !(await validateFallback())) {
      address.reportValidity();
      return;
    }
    const note = form.querySelector(".rent-lead-note");
    const submitButton = form.querySelector(".rent-lead-submit");
    const payload = Object.fromEntries(new FormData(form));
    payload.message = `Rent vs. Sell calculator inquiry. Calculator assumptions: expected rent $${calculator.elements.monthlyRent.value}/month; current home value $${calculator.elements.homeValue.value}; comparison period ${document.querySelector("#yearsToHold").value} years.`;
    mask.classList.add("show");
    submitButton.disabled = true;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "We could not submit your request.");
      form.reset();
      clearVerifiedAddress();
      mask.classList.add("complete");
      mask.querySelector(".eyebrow").textContent = "Request received";
      mask.querySelector("h3").textContent = "Thank you!";
      mask.querySelector("p:last-child").textContent = "Your rental analysis request has been received. Check your email for a rental analysis from the JR Grace team.";
    } catch (error) {
      mask.classList.remove("show");
      submitButton.disabled = false;
      note.className = "rent-lead-note wide error";
      note.textContent = error.message;
    }
  });

  function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = value || "";
    return element.innerHTML;
  }
})();

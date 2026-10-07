(() => {
  const API = "https://app.getaptly.com/api/portal/listings/yDgjRcz9hTcv4iav4";

  const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  })[character]);
  const slug = value => String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  const money = cents => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format((Number(cents) || 0) / 100);
  const street = listing => listing.address?.address || listing.address?.streetName || listing.marketingName || listing.name || "Available home";
  const detailUrl = listing => `/rentals/${slug(listing.address?.city || "central-texas")}-${slug(listing.address?.stateCode || listing.address?.state || "tx")}/${slug(street(listing)) || "rental-home"}/${encodeURIComponent(listing._id)}`;
  const firstPhoto = listing => {
    const candidates = [...(listing.marketingFiles || []), ...(listing.photo || [])];
    return candidates.find(value => typeof value === "string" && /^https:\/\//.test(value)) || "/assets/areas.jpg";
  };

  const listingCard = listing => {
    const address = [listing.address?.city, listing.address?.stateCode, listing.address?.postalCode].filter(Boolean).join(" ");
    return `<article class="resident-listing-card">
      <a class="resident-listing-media" href="${escapeHtml(detailUrl(listing))}">
        <img loading="lazy" src="${escapeHtml(firstPhoto(listing))}" alt="${escapeHtml(street(listing))}">
        <span>Available home</span>
      </a>
      <div class="resident-listing-body">
        <div class="resident-listing-price">${money(listing.marketRent?.amount)} <small>/ month</small></div>
        <div class="resident-listing-facts"><span>${escapeHtml(listing.beds ?? "—")} bd</span><span>${escapeHtml(listing.baths ?? "—")} ba</span><span>${listing.totalArea ? `${Number(listing.totalArea).toLocaleString()} sq ft` : "Size in details"}</span></div>
        <h4>${escapeHtml(street(listing))}</h4>
        <div class="resident-listing-address">${escapeHtml(address)}</div>
        <a class="resident-listing-link" href="${escapeHtml(detailUrl(listing))}">View home <span aria-hidden="true">→</span></a>
      </div>
    </article>`;
  };

  const loadListings = async root => {
    const grid = root.querySelector("[data-resident-listings]");
    const status = root.querySelector("[data-resident-listing-status]");
    if (!grid || grid.dataset.loaded === "true") return;
    grid.dataset.loaded = "true";
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error(`Listing feed returned ${response.status}`);
      const payload = await response.json();
      const listings = (payload.data || []).filter(listing => listing.publishedForRent !== false).slice(0, 6);
      if (!listings.length) {
        status.innerHTML = '<span>No available properties. <a href="/rental-search.html">Search all our listings.</a></span>';
        return;
      }
      grid.innerHTML = listings.map(listingCard).join("");
      status.hidden = true;
    } catch (error) {
      status.innerHTML = '<span>Current homes are temporarily unavailable. <a href="/rental-search.html">Open rental search.</a></span>';
      console.error(error);
    }
  };

  const init = () => {
    const root = document.querySelector("[data-resident-resources]");
    if (!root || root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";
    const tabs = [...root.querySelectorAll("[data-resident-tab]")];
    const panels = [...root.querySelectorAll("[data-resident-panel]")];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const activate = (name, options = {}) => {
      const selectedTab = tabs.find(tab => tab.dataset.residentTab === name) || tabs[0];
      const selectedName = selectedTab.dataset.residentTab;
      tabs.forEach(tab => {
        const selected = tab === selectedTab;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(panel => {
        panel.hidden = panel.dataset.residentPanel !== selectedName;
      });
      if (options.focus) selectedTab.focus();
      if (options.updateHash) history.replaceState(null, "", selectedName === "current" ? "#current-residents" : "#prospective-renters");
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.residentTab, { updateHash: true }));
      tab.addEventListener("keydown", event => {
        let nextIndex = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[nextIndex].dataset.residentTab, { focus: true, updateHash: true });
      });
    });

    const currentHash = location.hash.slice(1);
    const hashTarget = currentHash ? document.getElementById(currentHash) : null;
    const initialTab = currentHash === "current-residents" || hashTarget?.closest('[data-resident-panel="current"]') ? "current" : "prospective";
    activate(initialTab);
    loadListings(root);

    if (hashTarget) requestAnimationFrame(() => {
      hashTarget.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  init();
  document.addEventListener("jr:page-swapped", init);
})();

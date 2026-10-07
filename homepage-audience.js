(() => {
  const switcher = document.querySelector("[data-audience-switcher]");
  if (!switcher) return;

  const tabs = [...switcher.querySelectorAll("[data-audience-tab]")];
  const panels = [...switcher.querySelectorAll("[data-audience-panel]")];
  const ownerOnlySections = [...document.querySelectorAll("[data-owner-only]")];
  const mapElement = switcher.querySelector("#homepageServiceMap");
  let serviceMap;

  const cities = [
    { name: "Waco", coordinates: [31.5493, -97.1467], href: "property-management-waco-tx.html" },
    { name: "Woodway", coordinates: [31.5052, -97.205], href: "property-management-woodway-tx.html" },
    { name: "Hewitt", coordinates: [31.4624, -97.1958], href: "property-management-hewitt-tx.html" },
    { name: "Robinson", coordinates: [31.4677, -97.1147], href: "property-management-robinson-tx.html" },
    { name: "China Spring", coordinates: [31.6493, -97.3072], href: "property-management-china-spring-tx.html" },
    { name: "Bellmead", coordinates: [31.5941, -97.1089], href: "property-management-bellmead-tx.html" },
    { name: "Lacy Lakeview", coordinates: [31.6293, -97.1028], href: "property-management-lacy-lakeview-tx.html" }
  ];

  const initMap = () => {
    if (serviceMap || !mapElement) {
      serviceMap?.invalidateSize();
      return;
    }
    if (!window.L) {
      mapElement.innerHTML = '<p class="audience-map-note">Use the community cards to explore our Central Texas city guides.</p>';
      return;
    }

    serviceMap = L.map(mapElement, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(serviceMap);

    const bounds = L.latLngBounds();
    cities.forEach(city => {
      bounds.extend(city.coordinates);
      L.marker(city.coordinates, {
        title: `${city.name} city guide`,
        icon: L.divIcon({
          className: "jr-city-marker",
          html: `<span>${city.name}</span>`,
          iconSize: [1, 1],
          iconAnchor: [0, 0]
        })
      }).addTo(serviceMap).bindPopup(`<strong>${city.name}, TX</strong><br><a href="${city.href}">Explore city guide →</a>`);
    });
    serviceMap.fitBounds(bounds.pad(.28), { maxZoom: 10, padding: [42, 42] });
  };

  const activate = (name, options = {}) => {
    const selectedTab = tabs.find(tab => tab.dataset.audienceTab === name) || tabs[0];
    const selectedName = selectedTab.dataset.audienceTab;
    tabs.forEach(tab => {
      const selected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.audiencePanel !== selectedName;
    });
    ownerOnlySections.forEach(section => {
      section.hidden = selectedName !== "owners";
    });
    if (options.focus) selectedTab.focus();
    if (options.updateHash) history.replaceState(null, "", `#${selectedName}`);
    if (selectedName === "renters") requestAnimationFrame(() => {
      initMap();
      setTimeout(() => serviceMap?.invalidateSize(), 80);
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.audienceTab, { updateHash: true }));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      activate(tabs[next].dataset.audienceTab, { focus: true, updateHash: true });
    });
  });

  document.querySelectorAll('a[href="#owners"],a[href="#renters"]').forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const name = link.getAttribute("href").slice(1);
      activate(name, { updateHash: true });
      switcher.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  });

  const requested = location.hash.slice(1);
  activate(requested === "renters" ? "renters" : "owners");
})();

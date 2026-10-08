(() => {
  const switcher = document.querySelector("[data-audience-switcher]");
  if (!switcher) return;

  const tabs = [...switcher.querySelectorAll("[data-audience-tab]")];
  const panels = [...switcher.querySelectorAll("[data-audience-panel]")];
  const ownerOnlySections = [...document.querySelectorAll("[data-owner-only]")];
  const mapElement = switcher.querySelector("#homepageServiceMap");
  let serviceMap;
  let serviceMapPromise;

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
      if (serviceMap && window.google?.maps) google.maps.event.trigger(serviceMap, "resize");
      return;
    }
    if (serviceMapPromise) return serviceMapPromise;
    serviceMapPromise = (async () => {
      try {
        const { Map, InfoWindow, AdvancedMarkerElement } = await window.jrGoogleMapsLibraries();
        serviceMap = new Map(mapElement, {
          center: { lat: 31.55, lng: -97.16 },
          zoom: 10,
          mapId: "DEMO_MAP_ID",
          scrollwheel: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        });
        const bounds = new google.maps.LatLngBounds();
        const info = new InfoWindow();
        cities.forEach(city => {
          const position = { lat: city.coordinates[0], lng: city.coordinates[1] };
          bounds.extend(position);
          const marker = new AdvancedMarkerElement({
            map: serviceMap,
            position,
            title: `${city.name} city guide`,
            content: window.jrMapMarkerContent("jr-map-city-pin", city.name, `${city.name} city guide`)
          });
          marker.addListener("click", () => {
            info.setContent(`<div class="jr-map-info"><strong>${city.name}, TX</strong><a href="${city.href}">Explore city guide →</a></div>`);
            info.open({ map: serviceMap, anchor: marker });
          });
        });
        serviceMap.fitBounds(bounds, 42);
        google.maps.event.addListenerOnce(serviceMap, "idle", () => {
          if (serviceMap.getZoom() > 10) serviceMap.setZoom(10);
        });
      } catch (error) {
        mapElement.innerHTML = '<p class="jr-map-unavailable">Use the community cards to explore our Central Texas city guides.</p>';
        console.error(error);
      }
    })();
    return serviceMapPromise;
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
      setTimeout(() => {
        if (serviceMap && window.google?.maps) google.maps.event.trigger(serviceMap, "resize");
      }, 80);
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

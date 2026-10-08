(() => {
  const cities = [
    { name: "Waco", lat: 31.5493, lng: -97.1467, href: "property-management-waco-tx.html" },
    { name: "Woodway", lat: 31.5052, lng: -97.205, href: "property-management-woodway-tx.html" },
    { name: "Hewitt", lat: 31.4624, lng: -97.1958, href: "property-management-hewitt-tx.html" },
    { name: "Robinson", lat: 31.4677, lng: -97.1147, href: "property-management-robinson-tx.html" },
    { name: "China Spring", lat: 31.6493, lng: -97.3072, href: "property-management-china-spring-tx.html" },
    { name: "Bellmead", lat: 31.5941, lng: -97.1089, href: "property-management-bellmead-tx.html" },
    { name: "Lacy Lakeview", lat: 31.6293, lng: -97.1028, href: "property-management-lacy-lakeview-tx.html" }
  ];

  const instances = new Map();

  async function initialize(element) {
    if (instances.has(element) || element.getBoundingClientRect().width < 10) return;
    instances.set(element, { loading: true });
    element.classList.add("jr-google-map");
    try {
      const { Map, InfoWindow, AdvancedMarkerElement } = await window.jrGoogleMapsLibraries();
      const map = new Map(element, {
        center: { lat: 31.55, lng: -97.16 },
        zoom: 10,
        mapId: "DEMO_MAP_ID",
        scrollwheel: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true
      });
      const info = new InfoWindow({ maxWidth: 260 });
      const bounds = new google.maps.LatLngBounds();
      cities.forEach(city => {
        const position = { lat: city.lat, lng: city.lng };
        bounds.extend(position);
        const marker = new AdvancedMarkerElement({
          map,
          position,
          title: `${city.name} city guide`,
          content: window.jrMapMarkerContent("jr-map-city-pin", city.name, `${city.name} city guide`)
        });
        marker.addListener("click", () => {
          info.setContent(`<div class="jr-map-info"><strong>${city.name}, TX</strong><span>J R Grace service area</span><br><a href="${city.href}">Explore city guide →</a></div>`);
          info.open({ map, anchor: marker });
        });
      });
      const fit = () => {
        map.fitBounds(bounds, 42);
        google.maps.event.addListenerOnce(map, "idle", () => {
          if (map.getZoom() > 10) map.setZoom(10);
        });
      };
      instances.set(element, { map, fit });
      fit();
    } catch (error) {
      instances.delete(element);
      element.innerHTML = '<p class="jr-map-unavailable">The map is temporarily unavailable. Use the city links to explore our Central Texas service areas.</p>';
      console.error(error);
    }
  }

  function refresh() {
    document.querySelectorAll("[data-service-area-map]").forEach(element => {
      const instance = instances.get(element);
      if (!instance) {
        initialize(element);
      } else if (instance.map && element.getBoundingClientRect().width >= 10) {
        google.maps.event.trigger(instance.map, "resize");
      }
    });
  }

  window.jrRefreshServiceAreaMaps = refresh;
  const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
      if (entry.contentRect.width >= 10) initialize(entry.target);
    });
  });
  document.querySelectorAll("[data-service-area-map]").forEach(element => observer.observe(element));
  refresh();
})();

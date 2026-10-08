(() => {
  const apiKey = "AIzaSyDo1MS-oasilW0EWR1v_MRObOkTyG5mM1s";
  let apiPromise;
  let librariesPromise;

  window.jrGoogleMapsReady = () => {
    if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
    if (apiPromise) return apiPromise;

    apiPromise = new Promise((resolve, reject) => {
      const callback = `jrGoogleMapsLoaded_${Date.now()}`;
      const script = document.createElement("script");
      const timeout = window.setTimeout(() => reject(new Error("Google Maps took too long to load.")), 15000);

      window[callback] = () => {
        window.clearTimeout(timeout);
        delete window[callback];
        resolve(window.google.maps);
      };
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&v=weekly&callback=${callback}`;
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeout);
        delete window[callback];
        reject(new Error("Google Maps could not be loaded."));
      };
      document.head.append(script);
    });

    return apiPromise;
  };

  window.jrGoogleMapsLibraries = () => {
    if (librariesPromise) return librariesPromise;
    librariesPromise = window.jrGoogleMapsReady().then(async () => {
      const [{ Map, InfoWindow }, { AdvancedMarkerElement }] = await Promise.all([
        google.maps.importLibrary("maps"),
        google.maps.importLibrary("marker")
      ]);
      return { Map, InfoWindow, AdvancedMarkerElement };
    });
    return librariesPromise;
  };

  window.jrMapMarkerContent = (className, content, label) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = className;
    marker.innerHTML = content;
    if (label) marker.setAttribute("aria-label", label);
    return marker;
  };
})();

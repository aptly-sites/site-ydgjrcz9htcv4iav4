(() => {
  const version = "20260824-7";
  const scriptUrl = document.currentScript?.src || location.href;
  const assetUrl = name => `${new URL(name, scriptUrl).href}?v=${version}`;
  const ensureStylesheet = name => {
    if (document.querySelector(`link[href*="${name}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = assetUrl(name);
    document.head.append(link);
  };

  ensureStylesheet("navigation-scroll-fix.css");
  ensureStylesheet("mobile-site.css");
  ensureStylesheet("info-pages.css");

  const menu = '<div><h3>Property Management Services</h3><div class="global-service-links"><a href="/single-family-property-management.html">Single-Family Management</a><a href="/multi-family-property-management.html">Multi-Family Management</a><a href="/tenant-placement.html">Tenant Placement Only</a><a href="/service-areas.html">Service Areas</a><a href="/owner-faq.html">Rent vs. Sell Calculator</a><a href="/index.html#analysis">Free Rental Analysis</a></div></div><div><h3>Central Texas Markets</h3><div class="global-city-links"><a href="/property-management-waco-tx.html">Waco</a><a href="/property-management-woodway-tx.html">Woodway</a><a href="/property-management-hewitt-tx.html">Hewitt</a><a href="/property-management-robinson-tx.html">Robinson</a><a href="/property-management-china-spring-tx.html">China Spring</a><a href="/property-management-bellmead-tx.html">Bellmead</a><a href="/property-management-lacy-lakeview-tx.html">Lacy Lakeview</a></div></div><div class="global-pm-actions"><a href="/index.html#analysis">Schedule a Call</a><a href="/service-areas.html">Explore Service Areas</a></div>';
  const propertyItem = `<div class="global-pm-nav"><button class="global-pm-trigger" type="button" aria-expanded="false">Property Management</button><div class="global-pm-menu">${menu}</div></div>`;
  const standardLinks = `${propertyItem}<a href="/rental-search.html">Rental Search</a><a href="/owner-faq.html">Owners FAQ</a><a href="/resident-faq.html">Resident FAQ</a><a href="/vendors.html">Vendors</a><a href="/agents.html">Agents</a><a href="/about.html">About</a><a href="/contact.html">Contact</a>`;
  const infoPages = new Set(["resident-faq.html", "vendors.html", "agents.html", "about.html", "contact.html", "privacy-policy.html"]);
  const pageCache = new Map();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let navigationSequence = 0;
  let renderedUrl = location.href;

  const basename = value => new URL(value, location.href).pathname.split("/").pop() || "index.html";
  const normalizedPath = value => {
    const path = new URL(value, location.href).pathname;
    return path === "/index.html" ? "/" : path;
  };
  const positionMenu = header => {
    let queued = false;
    const update = () => {
      queued = false;
      document.documentElement.style.setProperty("--global-menu-top", `${Math.max(0, Math.round(header.getBoundingClientRect().bottom))}px`);
    };
    const requestUpdate = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  };

  let nav = document.querySelector(".nav nav,.nav-inner nav,.primary-nav,header nav");
  let header;
  if (!nav) {
    const city = document.querySelector(".city-nav .wrap");
    if (city) {
      [...city.children].slice(1).forEach(child => child.remove());
      nav = document.createElement("nav");
      city.append(nav);
      header = document.querySelector(".city-nav");
    }
  }
  if (!nav) return;

  nav.classList.add("standard-site-nav");
  nav.setAttribute("aria-label", "Main navigation");
  nav.innerHTML = standardLinks;

  const item = nav.querySelector(".global-pm-nav");
  const trigger = item.querySelector(".global-pm-trigger");
  const closeNavigation = () => {
    nav.classList.remove("open");
    item.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  };
  const setActiveLink = value => {
    const current = basename(value);
    nav.querySelectorAll(":scope > a").forEach(link => link.classList.toggle("active", basename(link.href) === current));
  };

  trigger.addEventListener("click", () => {
    const open = item.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(open));
  });
  setActiveLink(location.href);

  header = header || nav.closest("header,.nav") || document.querySelector("header,.nav");
  if (header) positionMenu(header);

  let toggle = header?.querySelector(".menu,.nav-toggle,.standard-nav-toggle");
  let ownsToggle = document.body.classList.contains("info-page");
  if (!toggle && header) {
    toggle = document.createElement("button");
    toggle.className = "standard-nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Toggle navigation");
    toggle.textContent = "☰";
    nav.parentElement.insertBefore(toggle, nav);
    ownsToggle = true;
  }
  if (ownsToggle) toggle?.addEventListener("click", () => nav.classList.toggle("open"));

  const fetchPage = url => {
    const key = `${url.pathname}${url.search}`;
    if (!pageCache.has(key)) {
      pageCache.set(key, fetch(url, { headers: { "X-JR-Navigation": "partial" } })
        .then(response => {
          if (!response.ok) throw new Error("Navigation failed");
          return response.text();
        })
        .catch(error => {
          pageCache.delete(key);
          throw error;
        }));
    }
    return pageCache.get(key);
  };

  const animateOut = elements => {
    if (reducedMotion) return Promise.resolve();
    return Promise.all(elements.filter(Boolean).map(element => element.animate([
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(4px)" }
    ], { duration: 90, easing: "ease-in", fill: "forwards" }).finished.catch(() => {})));
  };
  const animateIn = elements => {
    if (reducedMotion) return;
    elements.filter(Boolean).forEach(element => element.animate([
      { opacity: 0, transform: "translateY(7px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 210, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" }));
  };

  const swapInfoPage = async (href, historyMode = "push") => {
    const url = new URL(href, location.href);
    if (!infoPages.has(basename(url))) return false;
    if (url.href === renderedUrl) {
      closeNavigation();
      scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      return true;
    }

    const sequence = ++navigationSequence;
    document.documentElement.classList.add("jr-route-loading");
    header?.setAttribute("aria-busy", "true");
    try {
      // Wait for the destination before moving anything visible.
      const nextHtml = await fetchPage(url);
      const nextDoc = new DOMParser().parseFromString(nextHtml, "text/html");
      if (sequence !== navigationSequence) return true;
      const currentMain = document.querySelector("main");
      const currentFooter = document.querySelector("footer");
      const nextMain = nextDoc.querySelector("main");
      const nextFooter = nextDoc.querySelector("footer");
      if (!currentMain || !nextMain) throw new Error("Page content unavailable");

      await animateOut([currentMain, currentFooter]);
      if (sequence !== navigationSequence) return true;

      currentMain.replaceWith(nextMain);
      if (currentFooter && nextFooter) currentFooter.replaceWith(nextFooter);
      document.title = nextDoc.title;
      document.body.className = nextDoc.body.className;
      renderedUrl = url.href;
      closeNavigation();
      setActiveLink(url);
      scrollTo({ top: 0, behavior: "instant" });
      if (historyMode === "push") history.pushState({ infoPage: true }, "", url);
      animateIn([nextMain, nextFooter]);
      return true;
    } catch (error) {
      location.assign(url.href);
      return true;
    } finally {
      document.documentElement.classList.remove("jr-route-loading");
      header?.removeAttribute("aria-busy");
    }
  };

  const eligibleLink = target => {
    const link = target.closest?.("a[href]");
    if (!link || link.target === "_blank" || link.origin !== location.origin || link.hasAttribute("download")) return null;
    return link;
  };
  const preload = link => {
    const url = new URL(link.href);
    if (infoPages.has(basename(url))) {
      fetchPage(url).catch(() => {});
      return;
    }
    if (!url.hash && (/\.html$/.test(url.pathname) || url.pathname === "/")) {
      const key = `link[rel="prefetch"][href="${CSS.escape(url.href)}"]`;
      if (!document.head.querySelector(key)) {
        const hint = document.createElement("link");
        hint.rel = "prefetch";
        hint.href = url.href;
        hint.as = "document";
        document.head.append(hint);
      }
    }
  };

  document.addEventListener("pointerover", event => {
    const link = eligibleLink(event.target);
    if (link) preload(link);
  }, { passive: true });
  document.addEventListener("focusin", event => {
    const link = eligibleLink(event.target);
    if (link) preload(link);
  });
  document.addEventListener("click", event => {
    const link = eligibleLink(event.target);
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.hash && normalizedPath(link.href) === normalizedPath(location.href)) {
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (target) {
        event.preventDefault();
        closeNavigation();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        history.pushState({}, "", link.href);
      }
      return;
    }
    if (infoPages.has(basename(link.href))) {
      event.preventDefault();
      swapInfoPage(link.href);
    }
  });
  addEventListener("popstate", () => {
    if (normalizedPath(location.href) === normalizedPath(renderedUrl)) {
      const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      (target || document.documentElement).scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    } else if (infoPages.has(basename(location.href))) swapInfoPage(location.href, "none");
    else location.reload();
  });
})();

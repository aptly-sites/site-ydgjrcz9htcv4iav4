(() => {
  if (document.documentElement.dataset.jrGlobalNavReady === "true") return;
  document.documentElement.dataset.jrGlobalNavReady = "true";

  const version = "20260909-5";
  const scriptUrl = document.currentScript?.src || location.href;
  const assetUrl = name => `${new URL(name, scriptUrl).href}?v=${version}`;
  const ensureStylesheet = name => {
    if (document.querySelector(`link[href*="${name}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = assetUrl(name);
    document.head.append(link);
  };
  const ensureScript = name => {
    if (document.querySelector(`script[src*="${name}"]`)) return;
    const script = document.createElement("script");
    script.src = assetUrl(name);
    script.defer = true;
    document.head.append(script);
  };

  ensureStylesheet("global-property-nav.css");
  ensureStylesheet("navigation-scroll-fix.css");
  ensureStylesheet("mobile-site.css");
  ensureStylesheet("info-pages.css");
  ensureStylesheet("site-footer.css");

  const footerMarkup = `<div class="jr-footer-shell"><div class="jr-footer-grid"><section class="jr-footer-brand" aria-label="J R Grace Realty"><a href="/index.html"><img class="jr-footer-logo" src="/assets/logo.png" alt="J R Grace Realty"></a><p>Professional property management with local experience, dependable communication, and practical support throughout Waco and Central Texas.</p></section><section><h2><a href="/contact.html">Contact</a></h2><address><a href="tel:2547775577">Phone: 254-777-5577</a><span>2012 Lake Air Dr.<br>Waco, Texas 76710</span></address><div class="jr-footer-legal-links"><a href="https://drive.google.com/file/d/1Egi37g3YcFlPerfmWEvhC5HxJJAF5Eqa/view" target="_blank" rel="noopener">IABS</a><a href="https://drive.google.com/file/d/1eAh302SyErFPp62zVbIiUM9ROOWzOkTS/view?usp=drive_link" target="_blank" rel="noopener">Consumer Protection</a></div></section><section><h2><a href="/sitemap.html">Sitemap</a></h2><nav aria-label="Footer sitemap"><a href="/index.html">Home</a><a href="/single-family-property-management.html">Property Management</a><a href="/rental-search.html">Homes for Rent</a><a href="/owner-faq.html">Owner FAQ</a><a href="/resident-faq.html">Resident FAQ</a><a href="/rent-affordability-calculator">Rent Affordability Calculator</a><a class="jr-footer-all-pages" href="/sitemap.html">View full sitemap →</a></nav></section><section><h2>Quick Links</h2><nav aria-label="Portal links"><a href="https://jrgrace.owa.rentmanager.com/" target="_blank" rel="noopener">Owner Login</a><a href="https://jrgrace.twa.rentmanager.com/" target="_blank" rel="noopener">Tenant Login</a></nav></section></div><div class="jr-footer-bottom"><span>© <b data-footer-year></b> J R Grace Realty</span><span>Equal Housing Opportunity</span><a href="/privacy-policy.html">Privacy Policy</a></div></div>`;
  const renderSiteFooter = () => {
    let footer = document.querySelector("body > footer");
    if (!footer) {
      footer = document.createElement("footer");
      document.body.append(footer);
    }
    footer.id = "site-footer";
    footer.className = "jr-site-footer";
    footer.setAttribute("aria-label", "Website footer");
    footer.innerHTML = footerMarkup;
    footer.querySelector("[data-footer-year]").textContent = new Date().getFullYear();
  };
  renderSiteFooter();

  const menu = '<div><h3>Property Management Services</h3><div class="global-service-links"><a href="/single-family-property-management.html">Single-Family Management</a><a href="/multi-family-property-management.html">Multi-Family Management</a><a href="/tenant-placement.html">Tenant Placement Only</a><a href="/service-areas.html">Service Areas</a><a href="/owner-faq.html">Rent vs. Sell Calculator</a><a href="/index.html#analysis">Free Rental Analysis</a></div></div><div><h3>Central Texas Markets</h3><div class="global-city-links"><a href="/property-management-waco-tx.html">Waco</a><a href="/property-management-woodway-tx.html">Woodway</a><a href="/property-management-hewitt-tx.html">Hewitt</a><a href="/property-management-robinson-tx.html">Robinson</a><a href="/property-management-china-spring-tx.html">China Spring</a><a href="/property-management-bellmead-tx.html">Bellmead</a><a href="/property-management-lacy-lakeview-tx.html">Lacy Lakeview</a></div></div><div class="global-pm-actions"><a href="/index.html#analysis">Schedule a Call</a><a href="/service-areas.html">Explore Service Areas</a></div>';
  const propertyItem = `<div class="global-pm-nav"><button class="global-pm-trigger" type="button" aria-expanded="false">Property Management</button><div class="global-pm-menu">${menu}</div></div>`;
  const standardLinks = `${propertyItem}<a href="/rental-search.html">Rental Search</a><a href="/owner-faq.html">Owners FAQ</a><a href="/resident-faq.html">Resident FAQ</a><a href="/vendors.html">Vendors</a><a href="/agents.html">Agents</a><a href="/about.html">About</a><a href="/contact.html">Contact</a>`;
  const infoPages = new Set(["resident-faq.html", "rent-affordability-calculator.html", "vendors.html", "agents.html", "about.html", "contact.html", "privacy-policy.html", "sitemap.html"]);
  const propertyPages = new Set(["index.html", "single-family-property-management.html", "multi-family-property-management.html", "tenant-placement.html", "service-areas.html"]);
  const pageCache = new Map();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let navigationSequence = 0;
  let renderedUrl = location.href;

  const basename = value => {
    const segment = new URL(value, location.href).pathname.split("/").filter(Boolean).pop() || "index.html";
    return /\.[a-z0-9]+$/i.test(segment) ? segment : `${segment}.html`;
  };
  const normalizedPath = value => {
    const path = new URL(value, location.href).pathname.replace(/\/+$/, "") || "/";
    if (path === "/index.html") return "/";
    return path.endsWith(".html") ? path.slice(0, -5) || "/" : path;
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

  const originalNav = document.querySelector(".nav nav,.nav-inner nav,.primary-nav,header nav");
  const originalHeader = originalNav?.closest("header,.nav,.city-nav") || document.querySelector(".city-nav");
  if (!originalHeader) return;

  const originalChrome = originalHeader.closest(".jr-sticky-chrome");
  const originalTopbar = originalChrome?.querySelector(":scope > .topbar") || (originalHeader.previousElementSibling?.matches(".topbar") ? originalHeader.previousElementSibling : null);
  const insertionPoint = originalChrome || originalTopbar || originalHeader;
  const chrome = document.createElement("div");
  chrome.className = "jr-sticky-chrome jr-global-chrome";
  chrome.innerHTML = `<div class="jr-global-topbar"><div class="jr-global-shell jr-global-topbar-row"><div class="jr-global-contact"><a href="tel:2544002863" aria-label="Call J R Grace Realty at 254-400-2863">☎ <span>(254) 400-2863</span></a><a class="jr-global-email" href="mailto:hello@jrgrace.com">✉ <span>hello@jrgrace.com</span></a></div><details class="jr-global-login"><summary>Login</summary><div class="jr-global-login-options"><a href="https://jrgrace.owa.rentmanager.com/">Owner Login</a><a href="https://jrgrace.twa.rentmanager.com/">Resident Login</a></div></details></div></div><header class="jr-global-header"><div class="jr-global-shell jr-global-header-row"><a class="jr-global-brand" href="/index.html"><img src="/assets/logo.png" alt="J R Grace Realty"></a><button class="standard-nav-toggle" type="button" aria-label="Toggle navigation" aria-controls="jr-site-navigation" aria-expanded="false">☰</button><nav id="jr-site-navigation" class="standard-site-nav" aria-label="Main navigation"></nav></div></header>`;
  insertionPoint.parentElement.insertBefore(chrome, insertionPoint);
  if (originalChrome) originalChrome.remove();
  else {
    originalTopbar?.remove();
    originalHeader.remove();
  }

  let header = chrome.querySelector(".jr-global-header");
  let nav = chrome.querySelector(".standard-site-nav");
  nav.innerHTML = standardLinks;

  const item = nav.querySelector(".global-pm-nav");
  const trigger = item.querySelector(".global-pm-trigger");
  let toggle = chrome.querySelector(".standard-nav-toggle");
  const closeNavigation = () => {
    nav.classList.remove("open");
    item.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-expanded", "false");
  };
  const setActiveLink = value => {
    const current = basename(value);
    const rentalDetail = new URL(value, location.href).pathname.startsWith("/rentals/");
    const linkedPage = current === "rental-detail.html" || rentalDetail
      ? "rental-search.html"
      : current === "rent-affordability-calculator.html" ? "resident-faq.html" : current;
    nav.querySelectorAll(":scope > a").forEach(link => {
      const active = basename(link.href) === linkedPage;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const propertyActive = propertyPages.has(current) || current.startsWith("property-management-") || current === "self-managing-vs-property-manager-waco.html";
    trigger.classList.toggle("active", propertyActive);
    if (propertyActive) trigger.setAttribute("aria-current", "page");
    else trigger.removeAttribute("aria-current");
  };

  trigger.addEventListener("click", () => {
    const open = item.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(open));
  });
  setActiveLink(location.href);

  positionMenu(chrome);
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

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
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 120, easing: "ease-out", fill: "forwards" }).finished.catch(() => {})));
  };
  const animateIn = elements => {
    if (reducedMotion) return;
    elements.filter(Boolean).forEach(element => element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], { duration: 220, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" }));
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
      const currentFooter = document.querySelector("body > footer");
      const nextMain = nextDoc.querySelector("main");
      const nextFooter = nextDoc.querySelector("body > footer");
      if (!currentMain || !nextMain) throw new Error("Page content unavailable");

      const updatePage = () => {
        currentMain.replaceWith(nextMain);
        if (currentFooter && nextFooter) currentFooter.replaceWith(nextFooter);
        renderSiteFooter();
        document.title = nextDoc.title;
        document.body.className = nextDoc.body.className;
        if (basename(url) === "agents.html") {
          ensureStylesheet("agent-referral.css");
          ensureScript("agent-referral.js");
        }
        if (basename(url) === "rent-affordability-calculator.html") {
          ensureStylesheet("rent-affordability.css");
          import(assetUrl("rent-affordability.js")).then(module => module.initRentAffordability()).catch(() => {});
        }
        renderedUrl = url.href;
        closeNavigation();
        setActiveLink(url);
        scrollTo({ top: 0, behavior: "auto" });
        if (historyMode === "push") history.pushState({ infoPage: true }, "", url);
        document.dispatchEvent(new CustomEvent("jr:page-swapped", { detail: { url: url.href } }));
      };

      if (!reducedMotion && document.startViewTransition) {
        const transition = document.startViewTransition(updatePage);
        await transition.finished.catch(() => {});
      } else {
        await animateOut([currentMain, currentFooter]);
        if (sequence !== navigationSequence) return true;
        updatePage();
        animateIn([nextMain, nextFooter]);
      }
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
    const lastSegment = url.pathname.split("/").filter(Boolean).pop() || "";
    if (!url.hash && (/\.html$/.test(url.pathname) || !lastSegment.includes("."))) {
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
  const warmPrimaryNavigation = () => nav.querySelectorAll(":scope > a").forEach(preload);
  if ("requestIdleCallback" in window) requestIdleCallback(warmPrimaryNavigation, { timeout: 1600 });
  else setTimeout(warmPrimaryNavigation, 350);
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

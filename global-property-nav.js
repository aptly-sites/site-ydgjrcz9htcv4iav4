(() => {
  if (document.documentElement.dataset.jrGlobalNavReady === "true") return;
  document.documentElement.dataset.jrGlobalNavReady = "true";

  const version = "20261008-1";
  const analyticsId = "G-S2M075EJ1V";
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

  const ensureAnalytics = () => {
    if (window.jrGraceAnalyticsReady) return;
    window.jrGraceAnalyticsReady = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", analyticsId);

    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${analyticsId}"]`)) return;
    const analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    document.head.append(analyticsScript);
  };

  ensureAnalytics();

  ensureStylesheet("global-property-nav.css");
  ensureStylesheet("navigation-scroll-fix.css");
  ensureStylesheet("mobile-site.css");
  ensureStylesheet("info-pages.css");
  ensureStylesheet("info-cell-refresh.css");
  ensureStylesheet("service-cell-refresh.css");
  ensureStylesheet("brand-positioning.css");
  ensureStylesheet("site-footer.css");
  ensureStylesheet("orbit-navigation.css");
  ensureStylesheet("site-breadcrumbs.css");
  ensureStylesheet("site-modals.css");
  ensureStylesheet("continuous-page-background.css");

  const currentFilename = location.pathname.split("/").filter(Boolean).pop()?.toLowerCase() || "index.html";
  if (["multi-family-property-management.html", "tenant-placement.html", "service-areas.html"].includes(currentFilename)) {
    document.body.classList.add("legacy-service-page");
  }

  let lastLeadTrigger = null;
  const closeLeadModal = modal => {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    lastLeadTrigger?.focus();
  };
  document.addEventListener("click", event => {
    const openControl = event.target.closest?.("[data-open-lead]");
    if (openControl) {
      lastLeadTrigger = openControl;
      document.querySelector(".lead-modal")?.removeAttribute("aria-hidden");
    }
    const closeControl = event.target.closest?.(".lead-close,.lead-backdrop");
    if (!closeControl) return;
    event.preventDefault();
    closeLeadModal(closeControl.closest(".lead-modal"));
  }, true);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLeadModal(document.querySelector(".lead-modal.open"));
  });

  const socialMarkup = `<nav class="jr-footer-social" aria-label="Social media">
    <a href="https://www.facebook.com/JRGraceRealty" target="_blank" rel="noopener noreferrer" aria-label="Facebook (opens in a new tab)" title="Facebook"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.6 1.3 16.4 1 15 1c-3 0-5 1.8-5 5v3H7v4h3v9z"/></svg></a>
    <a href="https://www.instagram.com/jrgracerealty/" target="_blank" rel="noopener noreferrer" aria-label="Instagram (opens in a new tab)" title="Instagram"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2"/></svg></a>
    <a href="https://www.linkedin.com/in/patrick-pendley-j-r-grace-realty/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)" title="LinkedIn"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3 8h4v13H3zM9 8h4v1.8c.7-1.2 1.8-2.1 3.7-2.1 4 0 4.3 2.6 4.3 6V21h-4v-6.5c0-1.6 0-3.6-2.2-3.6S13 12.6 13 14.4V21H9z"/><circle cx="5" cy="4" r="2.2"/></svg></a>
    <a href="https://www.youtube.com/@JRGraceRealty" target="_blank" rel="noopener noreferrer" aria-label="YouTube (opens in a new tab)" title="YouTube"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="M21.6 6.4a3 3 0 0 0-2.1-2.1C17.7 4 12 4 12 4s-5.7 0-7.5.3a3 3 0 0 0-2.1 2.1C2 8.2 2 12 2 12s0 3.8.4 5.6a3 3 0 0 0 2.1 2.1c1.8.3 7.5.3 7.5.3s5.7 0 7.5-.3a3 3 0 0 0 2.1-2.1C22 15.8 22 12 22 12s0-3.8-.4-5.6ZM10 8.5v7l6-3.5z"/></svg></a>
  </nav>`;

  const credentialsMarkup = `<div class="jr-footer-credentials" aria-label="Professional affiliations and certifications">
    <img class="jr-footer-credential jr-footer-credential-narpm" src="/assets/narpm.webp" alt="National Association of Residential Property Managers" loading="lazy">
    <img class="jr-footer-credential jr-footer-credential-waor" src="/assets/waor.png" alt="Waco Association of Realtors" loading="lazy">
    <span class="jr-footer-credential-epa"><img class="jr-footer-credential" src="/assets/epa-lead-safe-transparent.png" alt="EPA Lead-Safe Certified Firm" loading="lazy"><small>NAT-F306933-1</small></span>
  </div>`;

  const footerMarkup = `<div class="jr-footer-shell"><div class="jr-footer-grid"><section class="jr-footer-brand" aria-label="J R Grace Realty"><a href="/index.html"><img class="jr-footer-logo" src="/assets/logo.png" alt="J R Grace Realty"></a><p>Professional property management with local experience, dependable communication, and practical support throughout Waco and Central Texas.</p>${socialMarkup}</section><section><h2><a href="/contact.html">Contact</a></h2><address><a href="tel:2547775577">Phone: 254-777-5577</a><span>2012 Lake Air Dr.<br>Waco, Texas 76710</span></address><div class="jr-footer-legal-links"><a href="https://drive.google.com/file/d/1Egi37g3YcFlPerfmWEvhC5HxJJAF5Eqa/view" target="_blank" rel="noopener">IABS</a><a href="https://drive.google.com/file/d/1eAh302SyErFPp62zVbIiUM9ROOWzOkTS/view?usp=drive_link" target="_blank" rel="noopener">Consumer Protection</a></div></section><section><h2><a href="/sitemap.html">Sitemap</a></h2><nav aria-label="Footer sitemap"><a href="/index.html">Home</a><a href="/single-family-property-management.html">Property Management</a><a href="/rental-search.html">Homes for Rent</a><a href="/owner-faq.html">Owner FAQ</a><a href="/resident-faq.html">Resident FAQ</a><a href="/rent-affordability-calculator">Rent Affordability Calculator</a><a class="jr-footer-all-pages" href="/sitemap.html">View full sitemap →</a></nav></section><section class="jr-footer-quick-links"><h2>Quick Links</h2><nav aria-label="Portal links"><a href="https://jrgrace.owa.rentmanager.com/" target="_blank" rel="noopener">Owner Login</a><a href="https://jrgrace.twa.rentmanager.com/" target="_blank" rel="noopener">Tenant Login</a></nav>${credentialsMarkup}</section></div><div class="jr-footer-bottom"><span>© <b data-footer-year></b> J R Grace Realty</span><span>Equal Housing Opportunity</span><a href="/privacy-policy.html">Privacy Policy</a></div></div>`;
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

  const orbitLinks = [
    ["Home", "/index.html"],
    ["Management", "/single-family-property-management.html"],
    ["Rentals", "/rental-search.html"],
    ["Owners", "/owner-faq.html"],
    ["Residents", "/resident-faq.html"],
    ["About", "/about.html"],
    ["Contact", "/contact.html"]
  ];
  const orbitMarkup = orbitLinks.map(([label, href], index) => `<a class="jr-orbit-ring" href="${href}"><span>${label}</span>${index === orbitLinks.length - 1 ? '<img class="jr-orbit-center-logo" src="/assets/mark.svg?v=20261005-2" alt="J R Grace Realty">' : ""}</a>`).join("");
  const mobileMenuMarkup = orbitLinks.map(([label, href], index) => `<a class="jr-mobile-menu-link" href="${href}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${label}</strong><i aria-hidden="true">→</i></a>`).join("");
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
  const breadcrumbLabels = {
    "single-family-property-management.html": "Property Management",
    "multi-family-property-management.html": "Multi-Family Management",
    "tenant-placement.html": "Tenant Placement",
    "self-managing-vs-property-manager-waco.html": "Self-Managing vs. Professional Management",
    "service-areas.html": "Service Areas",
    "owner-faq.html": "Owner Resources",
    "resident-faq.html": "Resident Resources",
    "rent-affordability-calculator.html": "Rent Affordability Calculator",
    "rental-search.html": "Homes for Rent",
    "rental-detail.html": "Rental Home",
    "about.html": "About",
    "agents.html": "Agent Referrals",
    "vendors.html": "Vendor Partnerships",
    "contact.html": "Contact",
    "privacy-policy.html": "Privacy Policy",
    "sitemap.html": "Sitemap"
  };
  const cityBreadcrumbLabels = {
    "property-management-waco-tx.html": "Waco",
    "property-management-woodway-tx.html": "Woodway",
    "property-management-hewitt-tx.html": "Hewitt",
    "property-management-robinson-tx.html": "Robinson",
    "property-management-china-spring-tx.html": "China Spring",
    "property-management-bellmead-tx.html": "Bellmead",
    "property-management-lacy-lakeview-tx.html": "Lacy Lakeview"
  };
  const breadcrumbTrail = value => {
    const url = new URL(value, location.href);
    const page = basename(url);
    const trail = [{ label: "Home", href: "/index.html" }];
    if (page === "index.html" && !url.pathname.startsWith("/rentals/")) return [];
    if (url.pathname.startsWith("/rentals/") || page === "rental-detail.html") {
      trail.push({ label: "Homes for Rent", href: "/rental-search.html" }, { label: "Rental Home" });
      return trail;
    }
    if (cityBreadcrumbLabels[page]) {
      trail.push({ label: "Service Areas", href: "/service-areas.html" }, { label: cityBreadcrumbLabels[page] });
      return trail;
    }
    if (["multi-family-property-management.html", "tenant-placement.html", "self-managing-vs-property-manager-waco.html", "service-areas.html"].includes(page)) {
      trail.push({ label: "Management", href: "/single-family-property-management.html" }, { label: breadcrumbLabels[page] });
      return trail;
    }
    if (page === "single-family-property-management.html") {
      trail.push({ label: breadcrumbLabels[page] });
      return trail;
    }
    if (page === "rent-affordability-calculator.html") {
      trail.push({ label: "Resident Resources", href: "/resident-faq.html" }, { label: breadcrumbLabels[page] });
      return trail;
    }
    if (["agents.html", "vendors.html"].includes(page)) {
      trail.push({ label: "About", href: "/about.html" }, { label: breadcrumbLabels[page] });
      return trail;
    }
    trail.push({ label: breadcrumbLabels[page] || document.title.split("|")[0].trim() || "Current page" });
    return trail;
  };
  const renderBreadcrumb = value => {
    const trail = breadcrumbTrail(value);
    let breadcrumb = document.querySelector(".jr-breadcrumbs");
    if (!trail.length) {
      breadcrumb?.remove();
      return;
    }
    if (!breadcrumb) {
      breadcrumb = document.createElement("nav");
      breadcrumb.className = "jr-breadcrumbs";
      breadcrumb.setAttribute("aria-label", "Breadcrumb");
      document.querySelector("main")?.before(breadcrumb);
    }
    const list = document.createElement("ol");
    trail.forEach((item, index) => {
      const listItem = document.createElement("li");
      if (item.href && index < trail.length - 1) {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        listItem.append(link);
      } else {
        const current = document.createElement("span");
        current.textContent = item.label;
        current.setAttribute("aria-current", "page");
        listItem.append(current);
      }
      list.append(listItem);
    });
    breadcrumb.replaceChildren(list);
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
  chrome.innerHTML = `<header class="jr-global-header jr-orbit-header"><div class="jr-global-shell jr-orbit-header-row"><div class="jr-orbit-brand-group"><button class="jr-orbit-header-trigger jr-orbit-menu-trigger" type="button" aria-label="Open website navigation" aria-controls="jr-site-navigation" aria-expanded="false"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button><a class="jr-orbit-brand" href="/index.html" aria-label="J R Grace Realty home"><img src="/assets/logo.png" alt="J R Grace Realty"></a></div><div class="jr-orbit-utility" aria-label="Contact and account links"><div class="jr-orbit-utility-stack jr-orbit-contact-stack"><a href="tel:2547775577"><small>Phone</small><strong>254-777-5577</strong></a><a href="mailto:hello@jrgrace.com"><small>Email</small><strong>hello@jrgrace.com</strong></a></div><span class="jr-orbit-utility-divider" aria-hidden="true"></span><div class="jr-orbit-utility-stack jr-orbit-portal-stack"><a href="https://jrgrace.owa.rentmanager.com/"><small>Portal</small><strong>Owner Portal</strong></a><a href="https://jrgrace.twa.rentmanager.com/"><small>Portal</small><strong>Resident Portal</strong></a></div></div></div><nav id="jr-site-navigation" class="jr-orbit-menu" aria-label="Main navigation" aria-hidden="true"><div class="jr-orbit-field">${orbitMarkup}</div><p class="jr-orbit-hint">Select a ring to explore</p><div class="jr-mobile-menu-shell"><img class="jr-mobile-menu-watermark" src="/assets/mark.svg?v=20261005-2" alt=""><section class="jr-mobile-menu-utility" aria-label="Contact and portal links"><p>Contact &amp; portals</p><a href="tel:2547775577"><small>Phone</small><strong>254-777-5577</strong><i aria-hidden="true">→</i></a><a href="mailto:hello@jrgrace.com"><small>Email</small><strong>hello@jrgrace.com</strong><i aria-hidden="true">→</i></a><div class="jr-mobile-portal-links"><a href="https://jrgrace.owa.rentmanager.com/"><small>Portal</small><strong>Owner</strong><i aria-hidden="true">↗</i></a><a href="https://jrgrace.twa.rentmanager.com/"><small>Portal</small><strong>Resident</strong><i aria-hidden="true">↗</i></a></div></section><div class="jr-mobile-menu-divider" aria-hidden="true"></div><section class="jr-mobile-menu-links" aria-label="Website sections"><p>Explore</p>${mobileMenuMarkup}</section></div></nav><button class="jr-orbit-float-trigger jr-orbit-menu-trigger" type="button" aria-label="Open website navigation" aria-controls="jr-site-navigation" aria-expanded="false"><img src="/assets/mark.svg?v=20261005-2" alt=""><span class="jr-orbit-float-label" aria-hidden="true">Menu</span></button></header>`;
  insertionPoint.parentElement.insertBefore(chrome, insertionPoint);
  if (originalChrome) originalChrome.remove();
  else {
    originalTopbar?.remove();
    originalHeader.remove();
  }

  let header = chrome.querySelector(".jr-global-header");
  let nav = chrome.querySelector(".jr-orbit-menu");
  const toggles = [...chrome.querySelectorAll(".jr-orbit-menu-trigger")];
  let lastToggle = toggles[0];
  const setNavigationState = open => {
    nav.classList.toggle("open", open);
    toggles.forEach(toggle => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close website navigation" : "Open website navigation");
    });
    nav.setAttribute("aria-hidden", String(!open));
    document.documentElement.classList.toggle("jr-orbit-lock", open);
  };
  const closeNavigation = () => {
    setNavigationState(false);
  };
  const setActiveLink = value => {
    const current = basename(value);
    const rentalDetail = new URL(value, location.href).pathname.startsWith("/rentals/");
    const linkedPage = current === "rental-detail.html" || rentalDetail
      ? "rental-search.html"
      : current === "rent-affordability-calculator.html" ? "resident-faq.html" : current;
    nav.querySelectorAll("a[href]").forEach(link => {
      const active = basename(link.href) === linkedPage;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const managementLinks = [...nav.querySelectorAll('a[href*="single-family-property-management"]')];
    const propertyActive = propertyPages.has(current) || current.startsWith("property-management-") || current === "self-managing-vs-property-manager-waco.html";
    managementLinks.forEach(managementLink => {
      managementLink.classList.toggle("active", propertyActive);
      if (propertyActive) managementLink.setAttribute("aria-current", "page");
      else managementLink.removeAttribute("aria-current");
    });
  };
  setActiveLink(location.href);
  renderBreadcrumb(location.href);
  toggles.forEach(toggle => toggle.addEventListener("click", () => {
    lastToggle = toggle;
    const willOpen = !nav.classList.contains("open");
    if (willOpen) nav.classList.toggle("from-float", toggle.classList.contains("jr-orbit-float-trigger"));
    setNavigationState(willOpen);
  }));
  nav.addEventListener("click", event => {
    if (event.target === nav && matchMedia("(max-width: 850px)").matches) {
      closeNavigation();
      lastToggle?.focus();
    }
  });
  addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeNavigation();
      lastToggle?.focus();
    }
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
      const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
      (target || document.documentElement).scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
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
        if (basename(url) === "resident-faq.html") {
          ensureStylesheet("resident-resources.css");
          ensureScript("resident-resources.js");
        }
        if (basename(url) === "rent-affordability-calculator.html") {
          ensureStylesheet("rent-affordability.css");
          import(assetUrl("rent-affordability.js")).then(module => module.initRentAffordability()).catch(() => {});
        }
        renderedUrl = url.href;
        closeNavigation();
        setActiveLink(url);
        renderBreadcrumb(url);
        if (historyMode === "push") history.pushState({ infoPage: true }, "", url);
        const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
        (target || document.documentElement).scrollIntoView({ behavior: "auto", block: "start" });
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
  const warmPrimaryNavigation = () => nav.querySelectorAll("a[href]").forEach(preload);
  if ("requestIdleCallback" in window) requestIdleCallback(warmPrimaryNavigation, { timeout: 1600 });
  else setTimeout(warmPrimaryNavigation, 350);
  document.addEventListener("click", event => {
    const link = eligibleLink(event.target);
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (nav.contains(link)) closeNavigation();
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

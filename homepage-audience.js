(() => {
  const switcher = document.querySelector("[data-audience-switcher]");
  if (!switcher) return;

  const tabs = [...switcher.querySelectorAll("[data-audience-tab]")];
  const panels = [...switcher.querySelectorAll("[data-audience-panel]")];
  const ownerOnlySections = [...document.querySelectorAll("[data-owner-only]")];

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
    requestAnimationFrame(() => window.jrRefreshServiceAreaMaps?.());
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

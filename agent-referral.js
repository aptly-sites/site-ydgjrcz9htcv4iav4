(() => {
  if (window.__jrAgentReferralReady) return;
  window.__jrAgentReferralReady = true;

  const modal = () => document.querySelector("#agentReferralModal");
  const closeModal = () => {
    const element = modal();
    if (!element) return;
    element.classList.remove("open");
    element.setAttribute("aria-hidden", "true");
    document.body.classList.remove("agent-referral-open");
  };
  const openModal = () => {
    const element = modal();
    if (!element) return;
    element.classList.add("open");
    element.setAttribute("aria-hidden", "false");
    document.body.classList.add("agent-referral-open");
    setTimeout(() => element.querySelector("input:not([type='checkbox'])")?.focus(), 50);
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-agent-referral]")) {
      event.preventDefault();
      openModal();
      return;
    }
    if (event.target.closest("[data-close-agent-referral]")) {
      event.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal()?.classList.contains("open")) closeModal();
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest("#agentReferralForm");
    if (!form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;

    const element = modal();
    const mask = element?.querySelector(".agent-referral-mask");
    const status = form.querySelector(".agent-referral-status");
    const submit = form.querySelector("button[type='submit']");
    status.textContent = "";
    submit.disabled = true;
    mask?.classList.add("show");
    mask?.classList.remove("complete");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "We couldn't send the referral right now.");

      form.reset();
      mask?.classList.add("complete");
      const kicker = mask?.querySelector(".info-eyebrow");
      const heading = mask?.querySelector("h3");
      const message = mask?.querySelector("p:last-of-type");
      if (kicker) kicker.textContent = "Referral received";
      if (heading) heading.textContent = "Thank you for the introduction.";
      if (message) message.textContent = "The owner and referring agent have been added to the J R Grace Realty Owner Leads board. Our team will follow up soon.";
    } catch (error) {
      mask?.classList.remove("show");
      status.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
})();

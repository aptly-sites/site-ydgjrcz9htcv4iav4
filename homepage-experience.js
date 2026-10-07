(() => {
  const video = document.querySelector(".hero video");
  const playHeroVideo = () => {
    if (!video || document.hidden) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const attempt = video.play();
    if (attempt?.catch) attempt.catch(() => {});
  };
  if (video) {
    video.addEventListener("loadeddata", playHeroVideo);
    video.addEventListener("canplay", playHeroVideo);
    addEventListener("pageshow", playHeroVideo);
    addEventListener("focus", playHeroVideo);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) playHeroVideo();
    });
    document.addEventListener("pointerdown", playHeroVideo, { once: true, passive: true });
    playHeroVideo();
  }

  const rotator = document.querySelector("[data-hero-rotator]");
  const controls = [...document.querySelectorAll(".hero-rotator-controls button")];
  const messages = rotator ? [...rotator.querySelectorAll(".hero-message")] : [];
  const hero = rotator?.closest(".hero");
  if (!hero || messages.length < 2 || controls.length !== messages.length) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = 0;
  let timer = 0;
  let deadline = 0;
  let cycleMs = 4933;
  let remaining = cycleMs;

  const updateCycleDuration = () => {
    if (Number.isFinite(video?.duration) && video.duration > 0) {
      cycleMs = Math.round((video.duration * 1000) / messages.length);
    }
    remaining = cycleMs;
    hero.style.setProperty("--hero-message-duration", `${cycleMs}ms`);
  };

  const show = index => {
    active = (index + messages.length) % messages.length;
    messages.forEach((message, messageIndex) => {
      const selected = messageIndex === active;
      message.classList.toggle("is-active", selected);
      message.setAttribute("aria-hidden", String(!selected));
    });

    controls.forEach((control, controlIndex) => {
      control.classList.remove("is-active");
      control.setAttribute("aria-pressed", String(controlIndex === active));
    });
    const selectedControl = controls[active];
    void selectedControl.offsetWidth;
    selectedControl.classList.add("is-active");
    remaining = cycleMs;
  };

  const clearTimer = () => {
    if (!timer) return;
    clearTimeout(timer);
    timer = 0;
  };

  const schedule = (delay = cycleMs) => {
    clearTimer();
    if (reducedMotion || document.hidden) return;
    remaining = Math.max(50, delay);
    deadline = performance.now() + remaining;
    timer = setTimeout(() => {
      timer = 0;
      show(active + 1);
      schedule(cycleMs);
    }, remaining);
  };

  const restart = () => {
    remaining = cycleMs;
    schedule(cycleMs);
  };

  controls.forEach((control, index) => {
    control.addEventListener("click", () => {
      show(index);
      restart();
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (timer) remaining = Math.max(50, deadline - performance.now());
      clearTimer();
      hero.classList.add("is-paused");
      return;
    }
    hero.classList.remove("is-paused");
    schedule(remaining);
  });

  const resyncDuration = () => {
    const previousDuration = cycleMs;
    updateCycleDuration();
    if (cycleMs !== previousDuration) {
      show(active);
      restart();
    }
  };
  video?.addEventListener("loadedmetadata", resyncDuration);
  video?.addEventListener("durationchange", resyncDuration);

  updateCycleDuration();
  show(0);
  schedule(cycleMs);
})();

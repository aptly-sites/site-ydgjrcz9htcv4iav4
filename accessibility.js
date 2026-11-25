(() => {
  if (window.jrAccessibilityReady) return;
  window.jrAccessibilityReady = true;
  const defaults = { size: 0, mode: '', underline: false, readable: false };
  const modes = [['grayscale', 'Grayscale'], ['high', 'High contrast'], ['negative', 'Negative contrast'], ['light', 'Light background']];
  let settings = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem('jr-grace-accessibility') || '{}');
    settings = { size: Math.max(-1, Math.min(3, Math.round(Number(saved.size) || 0))), mode: modes.some(([id]) => id === saved.mode) ? saved.mode : '', underline: saved.underline === true, readable: saved.readable === true };
  } catch {}
  const dialog = document.createElement('dialog');
  dialog.id = 'jr-accessibility-panel';
  dialog.className = 'jr-accessibility-panel';
  dialog.setAttribute('aria-labelledby', 'jr-accessibility-title');
  dialog.innerHTML = `<div class="jr-accessibility-heading"><div><p>MAKE YOURSELF COMFORTABLE</p><h2 id="jr-accessibility-title">Accessibility tools</h2></div><button type="button" data-action="close" aria-label="Close accessibility tools">×</button></div><p class="jr-accessibility-intro">Adjust how you see and read this website.</p><div class="jr-accessibility-size"><span>Text size</span><div><button type="button" data-action="decrease" aria-label="Decrease text size">−</button><output aria-live="polite">100%</output><button type="button" data-action="increase" aria-label="Increase text size">+</button></div></div><div class="jr-accessibility-options" role="group" aria-label="Display preferences">${modes.map(([id, label]) => `<button type="button" data-mode="${id}" aria-pressed="false">${label}</button>`).join('')}<button type="button" data-setting="underline" aria-pressed="false">Underline links</button><button type="button" data-setting="readable" aria-pressed="false">Readable font</button></div><button type="button" class="jr-accessibility-reset" data-action="reset">Reset settings</button><p class="jr-accessibility-note">Your preferences are saved on this browser.</p>`;
  document.body.append(dialog);
  let returnFocus;
  document.addEventListener('jr:open-accessibility', event => {
    returnFocus = event.detail?.returnFocus;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('[data-action="close"]').focus();
  });
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.action === 'close') return dialog.close();
    if (button.dataset.action === 'reset') settings = { ...defaults };
    if (button.dataset.action === 'increase') settings.size = Math.min(3, settings.size + 1);
    if (button.dataset.action === 'decrease') settings.size = Math.max(-1, settings.size - 1);
    if (button.dataset.mode) settings.mode = settings.mode === button.dataset.mode ? '' : button.dataset.mode;
    if (button.dataset.setting) settings[button.dataset.setting] = !settings[button.dataset.setting];
    apply();
  });
  const originals = new Map();
  const selector = 'h1,h2,h3,h4,h5,h6,p,a,button,label,legend,input,select,textarea,li,dt,dd,span,strong,small,summary';
  const restoreSizes = () => {
    originals.forEach(([value, priority], element) => {
      if (value) element.style.setProperty("font-size", value, priority);
      else element.style.removeProperty("font-size");
    });
    originals.clear();
  };
  const sizeText = () => {
    restoreSizes();
    if (!settings.size) return;
    // Measure all nodes before writing so inherited sizes do not compound.
    const measurements = [...document.querySelectorAll(selector)]
      .filter(element => !element.closest('.jr-accessibility-panel') && element.getClientRects().length)
      .map(element => [element, parseFloat(getComputedStyle(element).fontSize)]);
    measurements.forEach(([element, size]) => {
      originals.set(element, [element.style.fontSize, element.style.getPropertyPriority("font-size")]);
      element.style.setProperty("font-size", `${size * (1 + settings.size * .15)}px`, "important");
    });
  };
  function apply() {
    const root = document.documentElement;
    root.dataset.jrA11yMode = settings.mode;
    root.classList.toggle('jr-a11y-underline', settings.underline);
    root.classList.toggle('jr-a11y-readable', settings.readable);
    dialog.querySelector('output').textContent = `${100 + settings.size * 15}%`;
    dialog.querySelector('[data-action="decrease"]').disabled = settings.size === -1;
    dialog.querySelector('[data-action="increase"]').disabled = settings.size === 3;
    dialog.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(settings.mode === button.dataset.mode)));
    dialog.querySelectorAll('[data-setting]').forEach(button => button.setAttribute('aria-pressed', String(settings[button.dataset.setting])));
    sizeText();
    try { localStorage.setItem('jr-grace-accessibility', JSON.stringify(settings)); } catch {}
  }
  let frame;
  const scheduleSizing = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(sizeText); };
  new MutationObserver(records => {
    if (settings.size && records.some(record => !dialog.contains(record.target))) scheduleSizing();
  }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('jr:page-swapped', scheduleSizing);
  document.addEventListener('jr:navigation-opened', scheduleSizing);
  addEventListener('resize', scheduleSizing);
  apply();
})();

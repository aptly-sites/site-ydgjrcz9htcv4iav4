(function () {
  if (window.__jrGraceLaunchChecklistLoaded) return;
  window.__jrGraceLaunchChecklistLoaded = true;

  var stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/launch-checklist.css?v=20260909-1';
  document.head.appendChild(stylesheet);

  var launcher = document.createElement('button');
  launcher.className = 'launch-checklist-button';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open website launch checklist');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'launchChecklistPanel');
  launcher.innerHTML = '<span class="launch-checklist-glow" aria-hidden="true"></span><img src="/assets/launch.gif" alt=""><span class="launch-checklist-label">Launch checklist</span>';

  var backdrop = document.createElement('div');
  backdrop.className = 'launch-checklist-backdrop';
  backdrop.hidden = true;

  var panel = document.createElement('aside');
  panel.id = 'launchChecklistPanel';
  panel.className = 'launch-checklist-panel';
  panel.setAttribute('aria-label', 'Website launch checklist');
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = [
    '<div class="launch-checklist-toolbar">',
      '<div><span>Website review</span><strong>Launch checklist</strong></div>',
      '<button type="button" class="launch-checklist-close" aria-label="Close launch checklist"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>',
    '</div>',
    '<iframe class="launch-checklist-frame" src="/launch-guide.html" title="J R Grace website launch checklist"></iframe>'
  ].join('');

  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
  document.body.appendChild(launcher);

  var closeButton = panel.querySelector('.launch-checklist-close');
  var frame = panel.querySelector('.launch-checklist-frame');
  var previousFocus = null;

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    panel.setAttribute('aria-hidden', String(!open));
    launcher.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('launch-checklist-open', open);
    if (open) {
      previousFocus = document.activeElement;
      closeButton.focus();
    } else if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  launcher.addEventListener('click', function () { setOpen(true); });
  closeButton.addEventListener('click', function () { setOpen(false); });
  backdrop.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
  });
  frame.addEventListener('load', function () {
    frame.classList.add('is-loaded');
  });
})();

const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); });

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, target = Number(el.dataset.count), start = performance.now();
    const tick = now => { const p = Math.min((now - start) / 1100, 1); el.textContent = Math.floor(target * p); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); counterObserver.unobserve(el);
  });
}, { threshold: .5 });
counters.forEach(el => counterObserver.observe(el));

const analysisForm = document.querySelector('#rentalAnalysisForm');
const formOverlay = document.createElement('div');
formOverlay.className = 'form-confirmation-mask';
formOverlay.setAttribute('aria-live', 'polite');
formOverlay.innerHTML = '<div class="form-confirmation-card"><div class="form-logo-loader"><img src="assets/jr-grace-loader-logo.png" alt=""></div><p class="form-overlay-kicker">Submitting your request</p><h3>Preparing your rental analysis…</h3><p class="form-overlay-message">Please wait while we securely send your property information to the JR Grace team.</p><button class="form-overlay-reset" type="button">Submit another property</button></div>';
analysisForm?.append(formOverlay);
const overlayKicker = formOverlay.querySelector('.form-overlay-kicker');
const overlayTitle = formOverlay.querySelector('h3');
const overlayMessage = formOverlay.querySelector('.form-overlay-message');
const overlayReset = formOverlay.querySelector('.form-overlay-reset');

function setFormOverlay(state) {
  formOverlay.classList.toggle('visible', state !== 'hidden');
  formOverlay.classList.toggle('complete', state === 'success');
  analysisForm?.setAttribute('aria-busy', String(state === 'loading'));
  if (state === 'loading') {
    overlayKicker.textContent = 'Submitting your request';
    overlayTitle.textContent = 'Preparing your rental analysis…';
    overlayMessage.textContent = 'Please wait while we securely send your property information to the JR Grace team.';
  } else if (state === 'success') {
    overlayKicker.textContent = 'Request received';
    overlayTitle.textContent = 'Thank you!';
    overlayMessage.textContent = 'Your rental analysis request has been received. Check your email for a rental analysis from the JR Grace team.';
    overlayReset.focus();
  }
}

overlayReset.addEventListener('click', () => {
  setFormOverlay('hidden');
  propertyAddress?.focus();
});
const propertyAddress = analysisForm?.querySelector('input[name="address"]');
const addressValidation = analysisForm?.querySelector('.address-validation');
let verifiedAddress = '';

async function validatePropertyAddress() {
  const value = propertyAddress?.value.trim();
  if (!value) return false;
  addressValidation.className = 'address-validation checking';
  addressValidation.textContent = 'Verifying this address…';
  try {
    const response = await fetch(`/api/address-validate?address=${encodeURIComponent(value)}`, { headers: { Accept: 'application/json' } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.valid) throw new Error(result.message || 'Please enter a complete, valid street address.');
    propertyAddress.value = result.address;
    verifiedAddress = result.address;
    propertyAddress.setCustomValidity('');
    addressValidation.className = 'address-validation valid';
    addressValidation.textContent = `✓ Verified: ${result.address}`;
    return true;
  } catch (error) {
    verifiedAddress = '';
    propertyAddress.setCustomValidity(error.message);
    addressValidation.className = 'address-validation invalid';
    addressValidation.textContent = error.message;
    return false;
  }
}

propertyAddress?.addEventListener('input', () => {
  if (propertyAddress.value.trim() === verifiedAddress) return;
  verifiedAddress = '';
  propertyAddress.setCustomValidity('');
  addressValidation.className = 'address-validation';
  addressValidation.textContent = 'Enter a complete Central Texas street address. We’ll verify it before you submit.';
});
propertyAddress?.addEventListener('blur', validatePropertyAddress);

analysisForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget, button = form.querySelector('button[type="submit"]');
  const buttonText = button.querySelector('span'), note = form.querySelector('.form-note');
  if (!form.reportValidity()) return;
  if (propertyAddress.value.trim() !== verifiedAddress && !(await validatePropertyAddress())) {
    propertyAddress.reportValidity();
    return;
  }
  const loadingStarted = performance.now();
  setFormOverlay('loading');
  button.disabled = true; form.setAttribute('aria-busy','true');
  buttonText.textContent = 'Preparing your request…'; note.className = 'form-note'; note.textContent = '';
  try {
    const payload = Object.fromEntries(new FormData(form));
    const response = await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});
    const result = await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.message || 'We could not submit your request. Please try again.');
    await new Promise(resolve => setTimeout(resolve, Math.max(0, 650 - (performance.now() - loadingStarted))));
    form.reset(); verifiedAddress = ''; addressValidation.className = 'address-validation'; addressValidation.textContent = 'Enter a complete Central Texas street address. We’ll verify it before you submit.'; note.classList.add('success');
    note.textContent = '';
    setFormOverlay('success');
  } catch(error) {
    setFormOverlay('hidden');
    note.classList.add('error'); note.textContent = error.message;
  } finally {
    button.disabled = false; form.removeAttribute('aria-busy'); buttonText.textContent = 'Request My Free Rental Analysis';
  }
});

(()=>{if(!document.querySelector('link[href*="global-property-nav"]')){const link=document.createElement('link');link.rel='stylesheet';link.href='global-property-nav.css?v=20260824-7';document.head.append(link)}if(!document.querySelector('script[src*="global-property-nav"]')){const script=document.createElement('script');script.src='global-property-nav.js?v=20260824-7';document.body.append(script)}})();

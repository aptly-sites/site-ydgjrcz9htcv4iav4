// Run before static assets and rental functions so every public response shares
// the same host policy and legacy links retain their destination in one hop.
export const legacyRedirects = new Map([
  ['/waco-homes-for-rent', '/rental-search'],
  ['/tenants', '/resident-faq'],
  ['/waco-property-management', '/property-management-waco-tx'],
  ['/tenant-faq', '/resident-faq'],
  ['/maintenance', '/resident-faq'],
  ['/owners', '/'],
  ['/landlord-protection', '/owner-faq'],
  ['/testimonials', '/about'],
  ['/wc3-policy', '/privacy-policy'],
  ['/files/brokerage-services.pdf', '/documents/information-about-brokerage-services.pdf'],
  ['/realtor-referrals', '/agents'],
]);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const destination = legacyRedirects.get(path) ||
    (/^\/(waco-homes-for-rent|_system\/listings)\//.test(path) ? '/rental-search' : null);
  const staging = url.hostname.endsWith('.pages.dev');
  if (destination || staging || url.hostname === 'jrgrace.com' ||
      (url.hostname === 'www.jrgrace.com' && url.protocol !== 'https:')) {
    const target = new URL(destination || url.pathname, 'https://www.jrgrace.com');
    target.search = url.search;
    return new Response(null, { status: 301, headers: {
      Location: target.href, 'Cache-Control': 'public, max-age=300',
      ...(staging ? { 'X-Robots-Tag': 'noindex' } : {}),
    } });
  }
  const response = await next();
  if (response.status === 404) {
    const result = new Response(response.body, response);
    result.headers.set('X-Robots-Tag', 'noindex');
    return result;
  }
  return response;
}

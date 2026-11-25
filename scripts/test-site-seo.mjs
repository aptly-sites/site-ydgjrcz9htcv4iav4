import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { onRequest, legacyRedirects } from '../functions/_middleware.js';
for (const [old, target] of [...legacyRedirects, ['/waco-homes-for-rent/123', '/rental-search'], ['/_system/listings/123', '/rental-search']]) {
  for (const host of ['www.jrgrace.com', 'site-ydgjrcz9htcv4iav4.pages.dev', 'jrgrace.com']) {
    const response = await onRequest({ request: new Request(`https://${host}${old}?utm_source=test`), next: () => { throw Error('Redirect fell through'); } });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), `https://www.jrgrace.com${target}?utm_source=test`);
  }
}
for (const host of ['site-ydgjrcz9htcv4iav4.pages.dev', 'preview.site-ydgjrcz9htcv4iav4.pages.dev', 'jrgrace.com']) {
  const response = await onRequest({ request: new Request(`https://${host}/contact`), next: () => { throw Error('Host fell through'); } });
  assert.equal(response.headers.get('Location'), 'https://www.jrgrace.com/contact');
}
for (const route of ['/this-page-should-not-exist-xyz', '/blog', '/blog/2018/old-post']) {
  const response = await onRequest({ request: new Request(`https://www.jrgrace.com${route}`), next: async () => new Response('Not found', { status: 404 }) });
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
}
for (const file of (await readdir('.')).filter(file => file.endsWith('.html') && file !== '404.html')) {
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, file);
  assert.match(html, /rel="canonical"[^>]+href="https:\/\/www.jrgrace.com\//);
  assert.doesNotMatch(html, /https?:\/\/(?:jrgrace\.com|[^"/]*\.pages\.dev|[^"/]*\.chatgpt\.site)/);
  for (const match of html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) JSON.parse(match[1]);
}
const sitemap = await readFile('sitemap.xml', 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, (sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length);
assert.doesNotMatch(sitemap, /pages\.dev|\.html<\/loc>/);
assert.match(await readFile('404.html', 'utf8'), /name="robots" content="noindex"/);
console.log('Site host, legacy redirect, canonical, schema, sitemap and 404 checks passed.');

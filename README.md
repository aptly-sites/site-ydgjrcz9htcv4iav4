# PM Website Template

A clean, fast property management company website built with Astro + Tailwind CSS. Deploys to Cloudflare Pages in minutes.

## Customizing for a new customer

All content lives in one file: **`src/config.ts`**

Edit company name, colors, phone, services, testimonials, etc. — then push to GitHub and it deploys automatically.

## Rental listings

`src/pages/rentals/index.astro` and `src/pages/rentals/[id].astro` fetch the company's
public Aptly listings feed (`https://app.getaptly.com/api/portal/listings/:companyId`)
**at build time** and generate a real, static HTML page per rental — not a client-side
widget — so search engines can index each listing's address, price, photos, and
structured data (`RealEstateListing` JSON-LD) directly. Set `companyId` in
`src/config.ts` to the company's Aptly ID for these pages to show listings.

Because the pages are static, a redeploy (push to `main`, or re-run the deploy) is
needed to pick up newly listed or removed rentals — they don't update live.

Shared helpers for fetching/formatting listings live in `src/lib/listings.ts`.

## Local development

```bash
npm install
npm run dev
```

## Deploy to Cloudflare Pages

1. Push this repo to your GitHub org
2. In Cloudflare Pages: New project → Connect to Git → select repo
3. Build command: `npm run build`
4. Build output: `dist`
5. Done — auto-deploys on every push to `main`

## Contact form

The form in `src/pages/index.astro` logs to the console by default. Replace the `console.log` with your preferred endpoint:

- **Formspree**: `fetch('https://formspree.io/f/YOUR_ID', { method: 'POST', body: JSON.stringify(data) })`
- **Netlify Forms**: add `netlify` attribute to the `<form>` tag
- **Your own API**: call your backend endpoint

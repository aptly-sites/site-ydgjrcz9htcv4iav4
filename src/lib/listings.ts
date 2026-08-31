// Shared helpers for fetching and rendering rental listings from the public
// Aptly portal feed. Used at BUILD TIME by src/pages/rentals/index.astro and
// src/pages/rentals/[id].astro (via getStaticPaths) so listing pages ship as
// real static HTML — crawlable without executing JS — rather than an iframe
// widget populated client-side.

export interface Listing {
  _id: string;
  name?: string;
  marketingName?: string;
  marketingDescription?: string;
  beds?: number;
  baths?: number;
  totalArea?: number;
  petsAllowed?: boolean;
  buildingType?: string;
  rentalCategory?: string;
  parkingType?: string;
  laundryType?: string;
  publishedForRent?: boolean;
  marketRent?: { amount?: number };
  deposit?: { amount?: number };
  marketingFiles?: string[];
  photo?: string[];
  address?: {
    address?: string;
    formattedAddress?: string;
    standardAddress?: string;
    city?: string;
    stateCode?: string;
    postalCode?: string;
    geopoint?: [number, number];
  };
  aptlyShowings?: { active?: boolean; link?: string; url?: string };
  aptlyScreening?: { link?: string };
  companyId?: string;
}

export async function fetchListings(companyId: string): Promise<Listing[]> {
  if (!companyId) return [];
  try {
    const res = await fetch(
      `https://app.getaptly.com/api/portal/listings/${encodeURIComponent(companyId)}`
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).filter((p: Listing) => p.publishedForRent !== false);
  } catch {
    return [];
  }
}

export const street = (p: Listing): string =>
  p.address?.address || p.marketingName || p.name || 'Available Home';

export const cityStateZip = (p: Listing): string =>
  [p.address?.city, p.address?.stateCode].filter(Boolean).join(', ') +
  (p.address?.postalCode ? ` ${p.address.postalCode}` : '');

export const photos = (p: Listing): string[] =>
  p.marketingFiles?.length ? p.marketingFiles : p.photo?.length ? p.photo : [];

export const money = (cents?: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);

const firstUrl = (...values: Array<string | undefined>) =>
  values.find(v => typeof v === 'string' && /^https:\/\//.test(v));

// Direct links from the Aptly feed win when present; otherwise fall back to
// the company's general portal search page (passed in from site.listingsWidgetUrl).
export const tourUrl = (p: Listing, fallbackSearchUrl: string): string =>
  firstUrl(p.aptlyShowings?.link, p.aptlyShowings?.url) ||
  (p.aptlyShowings?.active && p.companyId && p._id
    ? `https://portal.getaptly.com/search/${encodeURIComponent(p.companyId)}/${encodeURIComponent(p._id)}`
    : fallbackSearchUrl);

export const applyUrl = (p: Listing, fallbackSearchUrl: string): string =>
  firstUrl(p.aptlyScreening?.link) || fallbackSearchUrl;

export const similarListings = (all: Listing[], current: Listing, max = 3): Listing[] => {
  const others = all.filter(p => p._id !== current._id);
  const sameCity = others.filter(p => p.address?.city === current.address?.city);
  const rest = others.filter(p => p.address?.city !== current.address?.city);
  return [...sameCity, ...rest].slice(0, max);
};

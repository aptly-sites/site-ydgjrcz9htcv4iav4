// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIGURATION — edit this file to customize the site for each customer
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  // Company info
  companyName: "Peak Properties",
  tagline: "Property Management You Can Trust",
  description:
    "Professional residential and commercial property management serving the greater Dayton area.",
  phone: "(937) 555-0100",
  email: "hello@peakproperties.com",
  address: "123 Main St, Dayton, OH 45402",

  // Company logo — set to /images/logo.png (or .jpg/.svg) once deployed, or leave empty to show text name
  logoPath: "/images/logo.png",

  // Aptly company ID — used at build time to fetch this company's public listings
  // feed (https://app.getaptly.com/api/portal/listings/:companyId) and generate a
  // real static page per rental. Required for the /rentals pages to show listings.
  companyId: "grWTDBRgQ4gjJXBa3",

  // Aptly portal search page — shown as the tour/apply fallback link whenever a
  // listing's own feed record doesn't include a direct tour or application URL.
  listingsWidgetUrl: "https://portal.getaptly.com/search/grWTDBRgQ4gjJXBa3",

  // Branding — swap these hex codes or use Tailwind color names
  colors: {
    primary: "#2f6df6",     // main brand color (buttons, accents)
    primaryDark: "#1a56db", // hover state
    bg: "#f7f8fb",          // page background
    surface: "#ffffff",     // card background
    ink: "#161b26",         // body text
    muted: "#7a8395",       // secondary text
    accent: "#b7a064",      // secondary accent — kicker labels, listing-page CTAs (tour/apply)
    accentInk: "#142337",   // text color used on top of the accent color
  },

  // Navigation links
  nav: [
    { label: "Services", href: "#services" },
    { label: "Rental Search", href: "/rentals" },
    { label: "About", href: "#about" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ],

  // Hero section
  hero: {
    headline: "Stress-Free Property Management",
    subheadline:
      "We handle everything — leasing, maintenance, accounting, and tenant relations — so you can enjoy your investment.",
    cta: "Get a Free Consultation",
    ctaHref: "#contact",
  },

  // Services section
  services: [
    {
      icon: "🏠",
      title: "Leasing & Marketing",
      description:
        "Professional photography, syndicated listings, and thorough tenant screening to fill vacancies fast.",
    },
    {
      icon: "🔧",
      title: "Maintenance & Repairs",
      description:
        "24/7 emergency response and a trusted vendor network to keep your properties in top condition.",
    },
    {
      icon: "💰",
      title: "Rent Collection",
      description:
        "Automated collection, owner disbursements, and detailed monthly statements.",
    },
    {
      icon: "📊",
      title: "Financial Reporting",
      description:
        "Real-time owner portal with income/expense reports, 1099s, and full transaction history.",
    },
    {
      icon: "⚖️",
      title: "Legal Compliance",
      description:
        "Stay current with local landlord-tenant law, lease enforcement, and eviction management.",
    },
    {
      icon: "🤝",
      title: "Tenant Relations",
      description:
        "Responsive communication and move-in/move-out inspections that protect your investment.",
    },
  ],

  // Stats bar
  stats: [
    { value: "500+", label: "Properties Managed" },
    { value: "12", label: "Years in Business" },
    { value: "98%", label: "Occupancy Rate" },
    { value: "4.9★", label: "Owner Rating" },
  ],

  // About section
  about: {
    headline: "Locally Owned. Owner Focused.",
    body: "Bridgestream was founded in 2012 by experienced investors who were frustrated with the lack of transparent, responsive property management in the Dayton market. We built the company we wished existed — one that treats every property like our own.",
    points: [
      "Licensed in Ohio with full fiduciary responsibility",
      "Dedicated owner portal with real-time reporting",
      "Average 7-day turnaround on maintenance requests",
      "No hidden fees — flat rate management only",
    ],
  },

  // Testimonials
  testimonials: [
    {
      quote:
        "Bridgestream turned my rental from a headache into a hands-off income stream. Best decision I've made as a landlord.",
      author: "Michael T.",
      detail: "Owner of 4 single-family homes",
    },
    {
      quote:
        "They filled my vacancy in 11 days and the tenant has been perfect. Communication is always fast.",
      author: "Sarah K.",
      detail: "Duplex owner since 2019",
    },
    {
      quote:
        "Finally a property manager who actually picks up the phone. My properties have never been better maintained.",
      author: "James R.",
      detail: "Commercial property investor",
    },
  ],

  // Contact / CTA section
  contact: {
    headline: "Ready to Get Started?",
    subheadline: "Get a free rental analysis and management proposal within 24 hours.",
  },

  // SEO
  seo: {
    title: "ACME Property Management",
    description:
      "Professional residential and commercial property management in Dayton, Ohio. Leasing, maintenance, accounting, and 24/7 support.",
    ogImage: "/images/og.jpg",
  },

  // Social links (leave empty string to hide)
  social: {
    facebook: "https://facebook.com/acmepm",
    instagram: "",
    linkedin: "",
  },

  // Service area guide pages — one per city/area you want a dedicated /areas/<slug> page for.
  // Leave empty to skip service area pages entirely (the /areas index and nav link only show
  // up once this has at least one entry). Ask the Designer chat to add one, e.g. "add a
  // service area page for Round Rock" — it knows this shape.
  areas: [] as Array<{
    slug: string;
    name: string;
    lat: number;
    lon: number;
    population?: string;
    district?: string;
    access?: string;
    overview: string;
    neighborhoods: { title: string; description: string }[];
    attractions: { title: string; description: string; url?: string }[];
    tips: string[];
  }>,
};

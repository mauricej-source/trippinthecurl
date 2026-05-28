# TrippinTheCurl

TrippinTheCurl is the personal, artistic, professional, publication, and software-domain web application for Maurice C. Johnson III. The site presents original artwork, active portfolio pieces, publications, professional background, project domains, PayPal-enabled artwork commerce, and private administration tools.

## Stack

- React, TypeScript, Vite, Tailwind CSS
- Node.js and Express
- Data-driven content in `data/content.json`
- Portfolio images and artwork descriptions stored under `client/public/images`
- Resume, certificates, and publication assets stored under `client/public/documents` and `client/public/images`
- PayPal Checkout REST API endpoints in `server.mjs`
- Admin-managed portfolio metadata, artwork sales status, pricing, sequencing, and PayPal settings

## Local Development

Install dependencies:

```bash
npm install
npm install --prefix client
```

Run the Express API and Vite dev server:

```bash
npm run dev
```

The app runs at `http://127.0.0.1:5176/`.
The API runs at `http://127.0.0.1:5177/`.

## Production Build

```bash
npm run build
npm start
```

The production server serves the compiled frontend from `client/dist` and exposes the API endpoints from `server.mjs`.

## Public Pages

- `/` - Home page with hero artwork, featured portfolio, publication callout, and contact band
- `/hireme` - Professional profile, resume, experience, skills, education, and certifications
- `/about` - Artist statement and background
- `/portfolio` - Original artwork gallery with artwork detail overlay and commerce status
- `/publications` - A Fractured I.T. publication page, reviews, press release, and author contact area
- `/domains` - Software domains and related application concepts
- `/new-projects` - Works in progress
- `/contact` - Contact information page
- `/admin` - Private administration console

## Administration

The administration console supports:

- Portfolio refresh from local image and description folders
- Artwork title, medium, description, price, sequence, and image path management
- Artwork sale status flags:
  - Available for sale
  - Commissioned
  - Sold
  - Gift
- PayPal administration for commerce settings
- Short-term PayPal order tracking in `data/orders.json`
- Receipt text-file download and selected-order clearing from the Admin order tracker
- Content persistence to `data/content.json`
- Artwork description synchronization with local text files

The admin route is excluded from indexing through both crawler directives and server response headers.

## PayPal Behavior

- Artwork checkout uses `POST /api/paypal/create-order` and `POST /api/paypal/capture-order`.
- Completed artwork captures mark the artwork as sold and write a short-term order record to `data/orders.json`.
- Artwork purchases ask PayPal to collect shipping information through the PayPal checkout flow.
- PayPal mode is controlled by `PAYPAL_MODE`.
- Sandbox mode is used unless `PAYPAL_MODE=live`.
- If PayPal credentials are missing, local development can use mock payments when enabled.
- Public deployment should use configured PayPal credentials before enabling live artwork sales.

## SEO Behavior

- `client/index.html` includes title, description, keyword, canonical, Open Graph, Twitter, robots, and structured-data metadata.
- Structured data currently includes `WebSite`, `Person`, and `Book` JSON-LD for TrippinTheCurl, Maurice C. Johnson III, and A Fractured I.T.
- The React app updates route-specific title, description, canonical, Open Graph, Twitter, and robots metadata for public routes and `/admin`.
- `/admin` is excluded from indexing with page metadata, `robots.txt`, and the `X-Robots-Tag: noindex, nofollow, noarchive` response header.
- Requests to `www.trippinthecurl.com` redirect to the canonical apex domain, `https://trippinthecurl.com`.
- HTTP requests to `trippinthecurl.com` redirect to `https://trippinthecurl.com`.
- `client/public/robots.txt` and `client/public/sitemap.xml` are included for crawler discovery.
- The current canonical production URL is `https://trippinthecurl.com`.
- Update `client/index.html`, `client/public/robots.txt`, `client/public/sitemap.xml`, `client/src/main.tsx`, and `server.mjs` if the final public URL changes.

Technical SEO improves discoverability, but search placement also depends on content quality, page speed, backlinks, image optimization, domain authority, and ongoing publishing.

## SEO Follow-Up

- Submit `https://trippinthecurl.com/sitemap.xml` in Google Search Console.
- Submit the sitemap in Bing Webmaster Tools.
- Add crawlable artwork detail URLs for individual portfolio pieces.
- Add `VisualArtwork` and `Product` structured data for artwork detail pages once those URLs exist.
- Optimize large portfolio images into thumbnail and detail variants.
- Add long-lived cache headers for optimized images and static build assets.

## Render

Use Render's standard Node build environment.

- Build command: `npm install && npm run build`
- Start command: `node server.mjs`

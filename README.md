# Damitha Cushion Works

TanStack Start site for Damitha Cushion Works, a cushion workshop in Pamburana, Matara, Sri Lanka. The site presents services, gallery work, direct contact actions, and an EmailJS enquiry form.

## Stack

- TanStack Start and TanStack Router
- React 19 and TypeScript
- Vite
- Tailwind CSS
- GSAP animations
- EmailJS contact form
- Cloudflare Workers deployment via Wrangler

## Setup

```bash
npm install
npm run dev
```

The local dev server normally runs at `http://localhost:5173`.

## Environment

Create a local `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required for the contact form:

```bash
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Recommended before production launch:

```bash
VITE_SITE_URL=https://damithacushionworks.com
```

`VITE_SITE_URL` is used for canonical, Open Graph, Twitter, and structured-data URLs. If the production domain changes, also update `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt`.

## Scripts

```bash
npm run dev       # start development server
npm run build     # production build
npm run preview   # preview production build
npm run lint      # run ESLint
npm run format    # run Prettier
```

## SEO And GEO

The site includes:

- Canonical URL metadata
- Robots meta
- Open Graph and Twitter card metadata
- Favicon, Apple touch icon, and web app manifest links
- Local business JSON-LD structured data
- `robots.txt`
- `sitemap.xml`
- `llms.txt` as supplemental AI-readable context

`llms.txt` is an emerging convention. Keep it concise and factual, but rely on crawlable HTML, structured data, accurate metadata, and sitemap submission as the main SEO foundation.

## Launch Checklist

- Set `VITE_SITE_URL` to the final production domain.
- Update `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` if the domain changes.
- Confirm `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/site.webmanifest` return `200`.
- Validate structured data with Google Rich Results Test after deployment.
- Submit the sitemap in Google Search Console and Bing Webmaster Tools.
- Replace placeholder social links in the UI with real Instagram and Facebook profile URLs before adding them to structured data.

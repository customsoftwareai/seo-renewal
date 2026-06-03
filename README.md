# SEO Renewal

Official-style landing page for **SEORenewal.com** — an independent SEO review &
renewal service (not an agency, no retainers). Visitors submit their website for a
free, no-obligation SEO renewal review.

## Stack

Plain static site — no build step, no dependencies.

```
seo-renewal/
├── index.html      # the page
├── styles.css      # all styling
├── script.js       # footer year + form confirmation
├── vercel.json     # static config + security headers
├── DEPLOY.md       # GitHub + Vercel + domain setup, step by step
└── .gitignore
```

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy

See **DEPLOY.md** for the full GitHub → Vercel → domain walkthrough.

## Important content note

This page follows a fixed scope of work for the hero section. **Do not change**
the headline or subheadline text/size, and keep the "concept bridge" line
(*"SEO isn't a one-time setup — it needs to be reviewed and renewed over time."*)
directly below the subheadline and above the trust lines.

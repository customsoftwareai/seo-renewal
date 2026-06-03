# SEO Renewal

Official-style landing page for **SEORenewal.com** — an independent SEO review &
renewal service (not an agency, no retainers). Visitors submit their website for a
free, no-obligation SEO renewal review.

## Stack

Plain static site — no build step, no dependencies.

```
seo-renewal/
├── index.html          # the page (Zoho web-to-lead form, landmarks, skip links)
├── styles.css          # all base styling
├── script.js           # footer year, affiliate link routing, Zoho Last-Name fill
├── a11y.css            # accessibility tokens + menu UI
├── a11y.js             # accessibility menu (vanilla JS, no deps)
├── accessibility.html  # Accessibility Statement page
├── vercel.json         # static config + security headers
├── DEPLOY.md           # GitHub + Vercel + domain setup, step by step
└── .gitignore
```

## Accessibility

The site includes a built-in accessibility toolkit (vanilla JS/CSS, no
dependencies, well under 25KB) plus underlying WCAG 2.2 AA support.

**Accessibility menu** — a floating "Accessibility options" button (bottom-right
on desktop, bottom-center on mobile) opens a focus-trapped dialog with:

- Text size (110%–200%) and line spacing (Normal / +20% / +40%)
- High Contrast, Dark, and Light themes
- Always-underline links / highlight links
- Dyslexia-friendly font (Atkinson Hyperlegible)
- Movable reading guide (mouse or Up/Down arrow keys)
- Big cursor and high-contrast focus ring
- Reduce motion (also respects `prefers-reduced-motion`)

**Persistence** — choices are stored locally under `a11y_prefs_v1` (no cookies,
no tracking) and re-applied on every page load.

**CSS tokens** — classes are applied to `<html>`, e.g. `.a11y-text-125`,
`.a11y-line-140`, `.a11y-contrast-high`, `.a11y-dark`, `.a11y-dyslexia`,
`.a11y-reduce-motion`, `.a11y-big-cursor`, `.a11y-focus-ring`.

**Structure** — skip links ("Skip to main content / navigation / footer") appear
on focus as the first tabbable elements; `header` / `nav#primary-nav` /
`main#main` / `footer#site-footer` landmarks; one descriptive `<h1>` per page.

**Dialog behavior** — keyboard operable, focus-trapped, closes on `Esc`, and
returns focus to the launcher button.

> An accessibility menu aids access but does not by itself make a site compliant.
> See `accessibility.html` (linked in the footer) for the full statement,
> measures, and known limitations.

### Recommended post-launch maintenance

- Add CI checks: `eslint-plugin-jsx-a11y` (if migrated to a framework) and an
  `axe` step (e.g. `@axe-core/cli` or axe-cypress) in CI.
- Run a quarterly mini-audit with axe-core + manual keyboard/screen-reader passes.

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

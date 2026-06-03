# Deploying SEORenewal.com

This site is a plain static site, so deployment is simple. The goal is the setup
you asked for: **code on GitHub → auto-deploys to Vercel**. Once connected, every
change you push to GitHub rebuilds the live site automatically.

---

## Step 1 — Put the code on GitHub

### Easiest (no terminal): GitHub Desktop
1. Install **GitHub Desktop** (https://desktop.github.com) and sign in.
2. **File → Add local repository** → choose this `seo-renewal` folder.
3. If it says it's not a Git repo yet, click **"create a repository"** and confirm.
4. Click **Publish repository**. Name it `seo-renewal`. (Private is fine.)

### Or via terminal
```bash
cd seo-renewal
git init
git add .
git commit -m "Initial SEO Renewal landing page"
git branch -M main
# create an empty repo named seo-renewal on github.com first, then:
git remote add origin https://github.com/<your-username>/seo-renewal.git
git push -u origin main
```

---

## Step 2 — Connect Vercel to the GitHub repo

1. Go to https://vercel.com and sign in (use **Continue with GitHub**).
2. Click **Add New… → Project**.
3. Under **Import Git Repository**, find `seo-renewal` and click **Import**.
   (If you don't see it, click **Adjust GitHub App Permissions** and grant access.)
4. Framework preset: **Other** (it's a static site — no build needed).
   Leave Build Command empty and Output Directory as the root.
5. Click **Deploy**. In ~30 seconds you'll get a live URL like
   `seo-renewal.vercel.app`.

From now on: push to `main` on GitHub → Vercel redeploys automatically.

---

## Step 3 — Add the domain in Vercel (do this BEFORE touching DNS)

1. In Vercel: open the project → **Settings → Domains**.
2. Add `seorenewal.com` and `www.seorenewal.com`.
3. Vercel will display the exact DNS records it wants. Keep this screen open —
   you'll copy these values into Cloudflare in Step 4.
   For a static site the records are normally:
     - `A` record, name `@` → `76.76.21.21`
     - `CNAME` record, name `www` → `cname.vercel-dns.com`
   *(Always use the exact values Vercel shows you — they can change.)*

> Order matters: add the domain in Vercel FIRST. If you point DNS at Vercel
> before the domain is attached to the project, visitors get a Vercel error
> page instead of your site.

---

## Step 4 — Set the DNS records in Cloudflare

Your DNS is hosted at **Cloudflare**, so add the records there (do NOT change
nameservers — leave them on Cloudflare).

1. Log in to Cloudflare → select **seorenewal.com** → **DNS → Records**.
2. If an existing `A` or `CNAME` record for `@`/root or `www` is present and
   conflicts, edit it instead of adding a duplicate.
3. Add / edit to match what Vercel showed:
   - **A** — Name: `@`  Value: `76.76.21.21`
   - **CNAME** — Name: `www`  Value: `cname.vercel-dns.com`
4. **Proxy status: set to "DNS only" (grey cloud), not "Proxied" (orange cloud).**
   Vercel manages the HTTPS certificate; leaving Cloudflare's proxy on can cause
   SSL/redirect loops. You can revisit proxying later if you know you want it.
5. Save. Back in Vercel, the domain will verify automatically (usually minutes,
   sometimes up to a few hours) and Vercel issues HTTPS. Site is live.

*(This is the step where Claude in Chrome can help — once the Chrome extension is
connected and you're logged into Cloudflare. I'll surface each record value and
confirm with you before saving anything.)*

---

## How the form / affiliate flow works

The conversion routes to your **Stan Ventures affiliate offer**. When a visitor
submits the intake form, the page shows a brief "taking you to your free renewal
review…" message and forwards them to:

```
https://my.stanventures.com/r/4JH00?p=/managed-seo-services&utm_source=seo-renewal&utm_campaign=affiliate
```

The link is defined **once** as `AFFILIATE_URL` at the top of `script.js`. If your
tracking link ever changes, edit it there and push — that's the only place to
update it. Affiliate links use `rel="sponsored"` (Google's recommended attribute).

A short **affiliate disclosure** is included in the footer for FTC compliance.

### Optional: also capture the email before forwarding
The form forwards visitors straight to the partner and does **not** store the email
anywhere. If you'd like to keep a copy of the lead first, add a form service such
as **Formspree** (https://formspree.io): point the form's `action` at your Formspree
endpoint, then forward to the affiliate URL on success.

---

## Making future edits
1. Edit the files (e.g. `index.html`).
2. Commit & push (GitHub Desktop: "Commit to main" → "Push origin").
3. Vercel auto-deploys within ~30 seconds. Done.

# Aurora Domain and Google SEO Implementation Plan

> **For Codex:** Execute each task in order, verify evidence before continuing, and do not expose secrets.

**Goal:** Publish Aurora Esports Studio at `https://auroraesportstudio.com/`, connect the existing backend safely, and submit the site for Google indexing.

**Architecture:** Keep the React/Vite frontend on GitHub Pages and the AI/admin backend on Vercel. Configure the apex domain as canonical, route `www` to Pages, update public SEO metadata, and use Google Search Console DNS verification.

**Tech Stack:** React, Vite, Node test runner, GitHub Pages, Vercel, Namecheap DNS, Google Search Console.

---

### Task 1: Lock the public-domain contract with tests

**Files:**
- Create: `test/domain-seo.test.mjs`
- Test: `test/domain-seo.test.mjs`

- [ ] Add tests for the canonical URL, Open Graph URL/image, structured data URL/image, robots sitemap URL, sitemap location, Pages root base path, and CNAME artifact.
- [ ] Run `node --test test/domain-seo.test.mjs` and confirm it fails for the old GitHub Pages URL.

### Task 2: Update SEO metadata and domain artifacts

**Files:**
- Modify: `index.html`
- Modify: `public/robots.txt`
- Modify: `public/sitemap.xml`
- Create: `public/CNAME`
- Modify: `.github/workflows/deploy-pages.yml`

- [ ] Replace old canonical URLs with `https://auroraesportstudio.com/`.
- [ ] Add absolute Open Graph URL and image metadata.
- [ ] Update the title, description and structured data with accurate Hong Kong/Taiwan services.
- [ ] Change the Pages production base path to `/` and preserve the CNAME in the artifact.
- [ ] Run the focused test and confirm it passes.

### Task 3: Run local production verification

**Files:**
- Test: all existing tests and production output

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build` with the production root base.
- [ ] Inspect `dist/index.html`, `dist/robots.txt`, `dist/sitemap.xml`, `dist/CNAME`, and asset URLs.
- [ ] Start a local preview and verify the homepage responds successfully.

### Task 4: Publish the verified frontend

**Files:**
- Commit the scoped changes on `codex/domain-google-seo`.

- [ ] Review the diff for unrelated changes or secrets.
- [ ] Commit the domain and SEO changes.
- [ ] Integrate the verified commit into `main` and push it to GitHub.
- [ ] Monitor the GitHub Pages deployment until it succeeds.

### Task 5: Configure GitHub Pages and Namecheap DNS

**External systems:** GitHub repository settings and Namecheap Advanced DNS.

- [ ] Set the Pages custom domain to `auroraesportstudio.com` before DNS changes.
- [ ] Add the four official GitHub Pages A records for the apex domain.
- [ ] Add `www` CNAME pointing to `ken0517.github.io`.
- [ ] Preserve unrelated TXT/email records and remove only confirmed conflicting parking records.
- [ ] Verify DNS resolution and enable HTTPS when GitHub makes the option available.

### Task 6: Allow the new frontend origin in Vercel

**External system:** Vercel production environment.

- [ ] Update `AI_ALLOWED_ORIGINS` to include the apex and `www` production URLs without displaying secret values.
- [ ] Redeploy the backend if required.
- [ ] Verify the health/status endpoint and a safe frontend-to-backend request from the new domain.

### Task 7: Register the site with Google Search Console

**External systems:** Google Search Console and Namecheap DNS.

- [ ] Create the Domain property for `auroraesportstudio.com`.
- [ ] Add the Google-provided TXT verification record without altering unrelated DNS records.
- [ ] Verify ownership, submit `/sitemap.xml`, and request homepage indexing.
- [ ] Record any Google propagation delay as pending rather than claiming immediate ranking.

### Task 8: Final end-to-end verification and handoff

**Checks:** production domain, redirects, SSL, frontend, backend, SEO, mobile.

- [ ] Verify apex and `www` behavior over HTTPS.
- [ ] Verify homepage visuals, manual quote, AI status, WhatsApp/LINE, admin redirect, robots and sitemap.
- [ ] Confirm no personal information or secrets are exposed.
- [ ] Report completed items separately from DNS, certificate, or Google indexing items still propagating.

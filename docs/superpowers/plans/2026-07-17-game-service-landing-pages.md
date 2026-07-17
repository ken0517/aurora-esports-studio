# Game Service Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three indexable Aurora game-service pages that share the existing service and quotation systems and publish safely on GitHub Pages.

**Architecture:** A small pure route/data layer maps clean paths to game IDs and SEO copy. A lazy-loaded React landing-page component renders the shared layout, while a post-build generator creates physical `dist/<slug>/index.html` files with unique metadata so direct visits and crawlers never depend on a fallback route. Homepage quote query parameters reuse the existing deferred quote assistant and central pricing flow.

**Tech Stack:** React, Vite, Node.js build scripts, existing CSS system, Node test runner.

## Global Constraints

- Keep the current homepage visual design, pricing rules, Gemini configuration, admin system, and customer data unchanged.
- Use formal Traditional Chinese with Hong Kong as the primary market and Taiwan as a secondary market.
- Use only existing game/service facts; do not invent prices, delivery times, rankings, reviews, or guarantees.
- Reuse the existing central game configuration, editorial service catalogue, and quotation assistant.
- Every clean landing-page URL must work after a direct refresh on GitHub Pages.

---

### Task 1: Define and test public landing-page routes

**Files:**
- Create: `src/data/gameLandingPages.js`
- Create: `src/lib/publicRoutes.js`
- Create: `test/game-landing-pages.test.mjs`

**Interfaces:**
- Produces: `gameLandingPages`, `getGameLandingPageById(gameId)`, `getGameLandingPageBySlug(slug)`.
- Produces: `resolvePublicRoute(pathname)` returning `{ type: "home" | "admin" | "game", gameId?: string }`.
- Produces: `buildQuoteEntryUrl(gameId, pane)` returning the homepage quote URL.

- [ ] **Step 1: Write failing route and content tests**

Test the three exact slugs, unique canonical URLs, formal Traditional Chinese titles, matching game IDs, valid manual/support quote URLs, and unknown-path fallback.

- [ ] **Step 2: Run the focused test and confirm it fails because the new modules do not exist**

Run: `node --test test/game-landing-pages.test.mjs`

- [ ] **Step 3: Implement the minimal route and landing-page data modules**

The data module will define the following immutable entries:

```js
[
  { gameId: "aov", slug: "arena-of-valor-boosting" },
  { gameId: "hok-cn", slug: "honor-of-kings-cn-boosting" },
  { gameId: "hok-global", slug: "honor-of-kings-global-boosting" },
]
```

Each entry includes its unique title, description, hero copy, rank/role summary, FAQ copy, image, and canonical URL. `resolvePublicRoute()` strips trailing slashes and matches only `/admin` or one of the three declared slugs.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `node --test test/game-landing-pages.test.mjs`

---

### Task 2: Render the shared game landing-page experience

**Files:**
- Create: `src/GameLandingPage.jsx`
- Create: `src/styles/game-landing.css`
- Modify: `src/RootApp.jsx`
- Modify: `src/main.jsx`
- Test: `test/game-landing-pages.test.mjs`

**Interfaces:**
- Consumes: `resolvePublicRoute()` and `getGameLandingPageById()`.
- Consumes: `getEditorialServicesForGame()` and `getServiceEditorialText()` for the existing service list.
- Produces: `<GameLandingPage gameId="..." />`.

- [ ] **Step 1: Add failing source-contract tests**

Assert that the root application lazy-loads `GameLandingPage`, the page renders service content from `getEditorialServicesForGame`, all page images are dimensioned/lazy where appropriate, and CTA links use `buildQuoteEntryUrl`.

- [ ] **Step 2: Run the focused test and confirm the expected missing-component failure**

Run: `node --test test/game-landing-pages.test.mjs`

- [ ] **Step 3: Build the shared page component and responsive styling**

The component contains:

- Aurora header and a return-to-home link.
- Game-specific hero with existing evidence image.
- Five existing service cards: rank, peak, duo, hero-power, and other.
- Game-specific rank/role/mark summary from the declared landing-page data.
- Four-step enquiry flow and three game-specific FAQs.
- Manual quote, Aurora support, WhatsApp, and LINE actions.
- Existing luxury ivory/charcoal/gold styling with a one-column mobile layout.

`RootApp` lazy-loads the landing page only on a game route, preserving the current homepage loading budget.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `node --test test/game-landing-pages.test.mjs`

---

### Task 3: Connect homepage cards and quote preselection

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/DeferredQuoteAssistant.jsx`
- Modify: `src/components/QuoteAssistant.jsx`
- Modify: `test/public-ui.test.mjs`
- Test: `test/game-landing-pages.test.mjs`

**Interfaces:**
- Landing-page manual CTA: `/?quoteGame=<gameId>&quotePane=manual#ai-quote`.
- Landing-page support CTA: `/?quoteGame=<gameId>&quotePane=ai#ai-quote`.
- `prefillRequest` accepts `{ id, pane, gameId, text? }` without changing existing text-prefill behavior.

- [ ] **Step 1: Add failing homepage-link and quotation-prefill tests**

Assert that each homepage game card links to its clean landing page and that the deferred/manual quotation path recognizes `pane` and `gameId`.

- [ ] **Step 2: Run the focused tests and confirm the new assertions fail**

Run: `node --test test/game-landing-pages.test.mjs test/public-ui.test.mjs`

- [ ] **Step 3: Implement minimal homepage and quote-entry changes**

- Replace each game card button with a standard link to its declared landing page.
- On homepage load, read only `quoteGame` and `quotePane`, validate both against known values, select the requested game, open the requested pane, then remove those query parameters without reloading.
- Extend the deferred assistant and quote form to apply `prefillRequest.pane` and `prefillRequest.gameId` while preserving current service-text requests.

- [ ] **Step 4: Run focused tests and confirm they pass**

Run: `node --test test/game-landing-pages.test.mjs test/public-ui.test.mjs`

---

### Task 4: Generate crawler-ready static pages and SEO metadata

**Files:**
- Create: `scripts/generate-game-landing-pages.mjs`
- Modify: `package.json`
- Modify: `public/sitemap.xml`
- Modify: `test/domain-seo.test.mjs`
- Test: `test/game-landing-pages.test.mjs`

**Interfaces:**
- Consumes: `gameLandingPages`.
- Produces: `dist/<slug>/index.html` for every landing page.

- [ ] **Step 1: Add failing build-contract and sitemap tests**

Assert that the build command runs the generator, sitemap includes all four official URLs, and generator source replaces title, description, canonical, Open Graph/Twitter metadata, and JSON-LD for every page.

- [ ] **Step 2: Run the focused tests and confirm they fail for the missing generator and sitemap entries**

Run: `node --test test/domain-seo.test.mjs test/game-landing-pages.test.mjs`

- [ ] **Step 3: Implement the post-build static HTML generator**

The generator reads `dist/index.html`, replaces homepage metadata with each page's declared metadata, writes a game-specific `ProfessionalService` JSON-LD block, and saves the result to the page's physical directory. It fails the build if the source HTML or any required metadata marker is absent.

- [ ] **Step 4: Update the sitemap and build command**

Set `build` to `vite build && node scripts/generate-game-landing-pages.mjs` and add the three canonical URLs with the current last-modified date.

- [ ] **Step 5: Run focused tests and the production build**

Run:

```powershell
node --test test/domain-seo.test.mjs test/game-landing-pages.test.mjs
$env:VITE_BASE_PATH='/'; npm run build
```

Verify each generated HTML file contains only its own canonical URL and title.

---

### Task 5: Full verification, visual QA, and production publication

**Files:**
- Verify all changed files.

**Interfaces:**
- Produces: three live, indexable production URLs and a four-URL sitemap.

- [ ] **Step 1: Run all automated checks**

Run:

```powershell
npm test
npm run lint
$env:VITE_BASE_PATH='/'; npm run build
```

- [ ] **Step 2: Run local desktop and mobile browser checks**

Verify all three routes at 390×844 and desktop width, confirm no overflow, correct game content, working home/quote links, and no browser console errors.

- [ ] **Step 3: Commit and push the implementation**

Commit only the landing-page, routing, quote-entry, SEO, tests, and plan files; push `main` to the existing repository.

- [ ] **Step 4: Verify GitHub Pages deployment and production URLs**

Confirm the workflow completes successfully, each clean URL returns HTTP 200, each live HTML document exposes the correct title/canonical, and `https://auroraesportstudio.com/sitemap.xml` lists all four URLs.


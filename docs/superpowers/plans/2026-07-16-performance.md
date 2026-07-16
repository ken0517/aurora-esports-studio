# Website Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the public homepage's initial download and improve mobile responsiveness without removing Aurora's hero artwork or major content.

**Architecture:** Measure the current production build, separate public/admin and deferred quote code with dynamic imports, lazy-load non-hero media, and verify bundle and browser behavior before publishing.

**Tech Stack:** Vite code splitting, React lazy/Suspense, responsive images, Node tests, browser performance measurements.

## Global Constraints

- Do not lower hero visual quality or remove content merely to increase a score.
- The hero image remains eager and responsive; non-first-screen images are lazy.
- Admin and operations code must never be part of the public homepage's initial JavaScript chunk.
- Record before/after bundle sizes and mobile interaction results.

---

### Task 1: Record baseline and add bundle assertions

**Files:**
- Add: `test/performance-budget.test.mjs`
- Add: `docs/performance/2026-07-16-baseline.md`
- Modify: `package.json`

- [ ] **Step 1: Build the current site and record assets**

Run: `$env:VITE_BASE_PATH='/'; npm run build`.

Record current JS/CSS sizes, hero image dimensions, and total non-hero image bytes in the baseline document.

- [ ] **Step 2: Write a failing performance-budget test**

Assert the public entry does not statically import `AdminApp` or operations panels, the quote assistant is dynamically imported, and non-hero service images contain `loading="lazy"` and explicit dimensions.

- [ ] **Step 3: Verify the test fails on current imports**

Run: `node --test test/performance-budget.test.mjs`.

- [ ] **Step 4: Commit the baseline and failing test together only after implementation turns it green**

The commit occurs in Task 3 after verification.

### Task 2: Split deferred code and lazy-load media

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/QuoteAssistant.jsx`
- Modify: `src/styles/index.css`
- Modify: public image markup in service/result components

- [ ] **Step 1: Dynamically load the admin application**

Use `React.lazy` based on `/admin` before importing the public app. Preserve the current secure redirect behavior on GitHub Pages.

- [ ] **Step 2: Dynamically load the quote assistant after interaction or idle time**

Keep a lightweight hero entry control in the initial bundle. Import the assistant module when the customer opens either manual quote or Aurora support; show an accessible loading state.

- [ ] **Step 3: Lazy-load all non-hero images**

Add `loading="lazy"`, `decoding="async"`, width/height or aspect ratio, and responsive object positioning. Keep desktop/mobile hero images eager with high fetch priority.

- [ ] **Step 4: Remove duplicate imports and unused public code**

Use the bundle report to remove only code proven unused or duplicated; preserve all visible services and languages.

### Task 3: Verify size and mobile interaction

**Files:**
- Modify: `docs/performance/2026-07-16-baseline.md`
- Test: `test/performance-budget.test.mjs`

- [ ] **Step 1: Run focused and full checks**

Run: `node --test test/performance-budget.test.mjs`, `npm test`, `npm run lint`, and `$env:VITE_BASE_PATH='/'; npm run build`.

- [ ] **Step 2: Record after sizes**

Add the final public entry JS, deferred quote chunk, deferred admin chunk, CSS size, and percentage reduction to the baseline document.

- [ ] **Step 3: Test mobile behavior**

At a 390 × 844 viewport verify hero readability, first tap opens the quote flow, modal scrolling, currency selector, social contact dock, promo block, and no horizontal overflow.

- [ ] **Step 4: Commit performance work**

```powershell
git add src test/performance-budget.test.mjs docs/performance/2026-07-16-baseline.md package.json
git commit -m "Improve Aurora public loading performance"
```

### Task 4: Production verification

- [ ] **Step 1: Publish and verify HTTP assets**

After GitHub Pages succeeds, verify `https://auroraesportstudio.com/` returns 200, HTTP redirects to HTTPS, and all deferred chunks return 200.

- [ ] **Step 2: Verify production mobile and desktop interactions**

Open the live site without cache, test one manual quote without sending payment data, open Aurora support without making unnecessary Gemini requests, and confirm the admin redirect remains noindex.

- [ ] **Step 3: Record final production observations**

Add the deployment timestamp and any remaining advisory warning to the performance document without claiming Google ranking or instant indexing improvements.

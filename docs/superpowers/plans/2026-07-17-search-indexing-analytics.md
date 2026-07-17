# Search Indexing and Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Submit Aurora's four public pages to Google and add privacy-safe conversion analytics that cannot transmit customer quote content.

**Architecture:** Search Console submission is handled through the verified domain property. A focused browser analytics module owns script loading, event-name validation and parameter filtering; UI components call narrow helper functions with stable IDs only.

**Tech Stack:** React, Vite, Node test runner, Google Search Console, Google Analytics 4.

## Global Constraints

- Do not change pricing, AI behaviour, page design or customer-facing copy.
- Do not transmit quote text, chat messages or customer details.
- Analytics must be disabled when no valid measurement ID is configured.
- Use one shared analytics implementation across the homepage and game pages.

---

### Task 1: Indexing submission

**Files:** No repository files.

- [x] **Step 1:** Resubmit `https://auroraesportstudio.com/sitemap.xml` in the verified Search Console property.
- [x] **Step 2:** Verify Search Console discovers four pages.
- [x] **Step 3:** Request indexing for the homepage and three game landing pages.
- [x] **Step 4:** Record the confirmed queue submission state for handoff.

### Task 2: Analytics core

**Files:**
- Create: `src/lib/analytics.js`
- Test: `test/analytics.test.mjs`

**Interfaces:**
- Produces: `initializeAnalytics`, `trackPageView`, `trackQuoteEntry`, `trackServiceQuote`, `trackQuoteResult`, `trackContactClick`.

- [ ] **Step 1:** Write tests proving invalid configuration is a no-op, a valid `G-` ID loads once, and sensitive keys are removed.
- [ ] **Step 2:** Run `node --test test/analytics.test.mjs` and verify failure because the module is missing.
- [ ] **Step 3:** Implement the minimal module with an event allowlist and safe parameter allowlist.
- [ ] **Step 4:** Run `node --test test/analytics.test.mjs` and verify all analytics tests pass.
- [ ] **Step 5:** Commit the analytics core.

### Task 3: UI event wiring

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`
- Modify: `src/GameLandingPage.jsx`
- Modify: `src/components/DeferredQuoteAssistant.jsx`
- Modify: `src/components/QuoteAssistant.jsx`
- Test: `test/analytics-ui.test.mjs`

**Interfaces:**
- Consumes: the analytics helpers from Task 2.

- [ ] **Step 1:** Write source-level tests for page view, quote entry, service quote, quote status and contact click instrumentation.
- [ ] **Step 2:** Run `node --test test/analytics-ui.test.mjs` and verify the assertions fail.
- [ ] **Step 3:** Add the smallest helper calls and data attributes required by the tests.
- [ ] **Step 4:** Run the focused tests, then `npm test`.
- [ ] **Step 5:** Commit the UI wiring.

### Task 4: Production configuration and verification

**Files:**
- Modify: `.env.example`
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`

- [ ] **Step 1:** Document `VITE_GA_MEASUREMENT_ID` as an optional public configuration value.
- [ ] **Step 2:** Pass the repository variable into the Pages build without exposing any secret.
- [ ] **Step 3:** Run `npm test`, `npm run lint`, and `npm run build`.
- [ ] **Step 4:** Push the verified changes and confirm the Pages deployment succeeds.
- [ ] **Step 5:** Confirm the production site remains functional when the variable is absent or configured.

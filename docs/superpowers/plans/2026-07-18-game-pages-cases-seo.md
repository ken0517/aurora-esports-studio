# Game Pages, Real Cases and Search Monitoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen the three public game pages, publish the supplied Arena of Valor evidence, and verify Google's post-deployment crawl state.

**Architecture:** Extend the existing `gameLandingPages` data so all new copy, FAQs, related links and case records stay centrally editable. The shared landing-page component renders optional evidence and related-game sections; the existing static-page generator emits matching structured data.

**Tech Stack:** React, Vite, Node test runner, GitHub Pages, Google Search Console.

## Global Constraints

- Preserve the existing luxury visual system and quotation behaviour.
- Use formal Traditional Chinese and natural search wording.
- Show the supplied evidence only on the Arena of Valor page.
- Do not invent customer names, guaranteed results, prices or testimonials.
- Case images must be lazy loaded with fixed dimensions.

---

### Task 1: Search and evidence data

**Files:**
- Modify: `src/data/gameLandingPages.js`
- Create: `public/assets/cases/aov-season-record.jpeg`
- Create: `public/assets/cases/aov-highest-rank.jpeg`
- Create: `public/assets/cases/aov-ranked-history.jpeg`
- Modify: `test/game-landing-pages.test.mjs`

**Interfaces:**
- Produces: per-page `searchGuide`, `faqs`, `relatedGameIds`, and optional `caseStudies` records with `image`, `alt`, `width`, `height`, `title`, and `description`.

- [x] **Step 1:** Add a failing test requiring natural Hong Kong/Taiwan search copy, at least five FAQs per page, all three related game IDs, and exactly three AOV case records.
- [x] **Step 2:** Run `node --test test/game-landing-pages.test.mjs`; expect the new assertions to fail because those fields do not exist.
- [x] **Step 3:** Copy the three supplied JPEG files into `public/assets/cases/` and add the complete data fields to `gameLandingPages.js`.
- [x] **Step 4:** Run the focused test; expect all data assertions to pass.

### Task 2: Shared evidence and related-game UI

**Files:**
- Modify: `src/GameLandingPage.jsx`
- Modify: `src/styles/game-landing.css`
- Modify: `test/game-landing-pages.test.mjs`

**Interfaces:**
- Consumes: `searchGuide`, `caseStudies`, and `relatedGameIds` from Task 1.
- Produces: accessible `#case-studies`, search guide and related-game sections using existing quote URLs.

- [x] **Step 1:** Add failing source-level assertions for an optional case gallery, `loading="lazy"`, fixed image dimensions, privacy/result disclaimer and internal game-page links.
- [x] **Step 2:** Run the focused test; expect failures for the missing markup.
- [x] **Step 3:** Implement the three shared sections and responsive styling without changing existing sections.
- [x] **Step 4:** Run the focused test; expect all UI assertions to pass.

### Task 3: Crawler-readable structured data

**Files:**
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `test/domain-seo.test.mjs`

**Interfaces:**
- Consumes: each page's `faqs`, title, canonical URL and game metadata.
- Produces: one JSON-LD `@graph` containing `ProfessionalService`, `FAQPage` and `BreadcrumbList` nodes.

- [x] **Step 1:** Add a failing build-output assertion for `FAQPage`, `BreadcrumbList` and all page-specific FAQ questions.
- [x] **Step 2:** Run `node --test test/domain-seo.test.mjs`; expect failure because the generator currently emits only the service node.
- [x] **Step 3:** Update the generator to emit the three-node graph without adding reviews or ratings.
- [x] **Step 4:** Run `npm run build` and the focused SEO test; expect all generated pages to contain the approved structured data.

### Task 4: Verification, publication and search monitoring

**Files:**
- Modify: this plan only to mark completed steps.

- [x] **Step 1:** Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check`; require zero failures or warnings.
- [x] **Step 2:** Inspect desktop and mobile layouts locally, including all three AOV case images and all related-page links.
- [x] **Step 3:** Commit and push the verified implementation to `main`, then require a successful GitHub Pages workflow.
- [x] **Step 4:** Verify the homepage, three game pages and sitemap all return HTTP 200.
- [x] **Step 5:** Inspect Search Console for the homepage and three game pages; record indexed or pending state without repeatedly submitting pending URLs.

**Search Console check — 2026-07-18:** The homepage, Arena of Valor page, Honor of Kings China page and Honor of Kings Global page are all reported as indexed and eligible to appear in Google Search. The sitemap and every production URL returned HTTP 200 after deployment.

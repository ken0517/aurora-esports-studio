# HOK Global Results Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage HOK evidence image and publish four supplied HOK Global battle-zone result records on the HOK Global landing page.

**Architecture:** Store the four supplied JPEGs once under the existing public cases directory. Keep evidence metadata in `gameLandingPages.js`, render the existing cases section from page-owned copy, and add a small accessible lightbox plus mobile scroll-snap behavior to the shared landing page. The homepage reuses the fourth case asset through `content.js`.

**Tech Stack:** React, Vite, Node test runner, existing CSS and static landing-page generator.

## Global Constraints

- The four images are HOK／《王者榮耀》國際服 evidence only.
- Homepage HOK uses `hok-global-battle-zone-top10-04.jpg`; do not change AOV or HOK China imagery.
- Describe only visible historical facts; do not promise future ranks, outcomes, or win rates.
- Preserve image proportions and visible rank details.
- Desktop uses the existing editorial grid; mobile uses horizontal scroll-snap cards.
- Each case opens in an in-page lightbox that closes by button, backdrop, or Escape.
- Keep pricing, quotation, AI, navigation, and all other design behavior unchanged.
- Reuse the supplied JPEGs without installing image-processing dependencies.

---

### Task 1: Add and isolate HOK Global evidence data

**Files:**
- Create: `public/assets/cases/hok-global-battle-zone-top10-01.jpg`
- Create: `public/assets/cases/hok-global-battle-zone-top10-02.jpg`
- Create: `public/assets/cases/hok-global-battle-zone-top10-03.jpg`
- Create: `public/assets/cases/hok-global-battle-zone-top10-04.jpg`
- Modify: `src/data/gameLandingPages.js`
- Modify: `src/data/content.js`
- Modify: `src/data/translations.js`
- Modify: `test/game-landing-pages.test.mjs`
- Modify: `test/performance-budget.test.mjs`

**Interfaces:**
- Consumes: the existing `gameLandingPages` and homepage `games` data shapes.
- Produces: `hok-global.caseStudySection`, four `hok-global.caseStudies` items, and one shared homepage image path.

- [ ] **Step 1: Write failing data-isolation tests**

Add assertions that AOV has exactly its existing three case assets, HOK China has no cases, and HOK Global has these four literal paths in order:

```js
[
  "assets/cases/hok-global-battle-zone-top10-01.jpg",
  "assets/cases/hok-global-battle-zone-top10-02.jpg",
  "assets/cases/hok-global-battle-zone-top10-03.jpg",
  "assets/cases/hok-global-battle-zone-top10-04.jpg",
]
```

Assert every item contains non-empty `title`, `description`, `alt`, positive `width` and `height`; assert `content.js` uses the fourth JPEG for the homepage and does not use `game-hok-global-user.webp`.

- [ ] **Step 2: Run tests and verify the missing HOK data fails**

Run: `node --test test/game-landing-pages.test.mjs test/performance-budget.test.mjs`

Expected: FAIL because HOK Global has no cases and the homepage still references the old WebP.

- [ ] **Step 3: Copy the four exact supplied JPEGs once**

Copy source images 1–4 to the four public paths. Image 4 and the separately supplied replacement image have the same SHA-256, so do not add a duplicate fifth asset.

- [ ] **Step 4: Add minimal page metadata and homepage reuse**

Add `caseStudySection` copy to the AOV and HOK Global page data. Add four HOK Global case items with source dimensions `1280×574`, `1280×587`, `1280×587`, and `1280×592`. Describe respectively three, three, six, and nine heroes shown in the monthly battle-zone Top 10. Update the homepage HOK image and all three localized alt labels to identify the nine-hero Top 10 record.

- [ ] **Step 5: Run the focused tests**

Run: `node --test test/game-landing-pages.test.mjs test/performance-budget.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```powershell
git add public/assets/cases src/data test/game-landing-pages.test.mjs test/performance-budget.test.mjs
git commit -m "feat: add HOK Global result evidence"
```

### Task 2: Add data-driven gallery copy, lightbox, and mobile swipe

**Files:**
- Modify: `src/GameLandingPage.jsx`
- Modify: `src/styles/game-landing.css`
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `test/game-landing-pages.test.mjs`
- Modify: `test/domain-seo.test.mjs`

**Interfaces:**
- Consumes: `page.caseStudySection` and `page.caseStudies` from Task 1.
- Produces: customer-visible grid/lightbox and crawler-readable case section using the same metadata.

- [ ] **Step 1: Write failing UI and generated-page tests**

Assert the shared landing page reads `page.caseStudySection.title` and `.description`, exposes an image-opening button, renders `role="dialog"`, handles `Escape`, and keeps `loading="lazy"`. Assert CSS contains lightbox selectors plus mobile `overflow-x: auto` and `scroll-snap-type`. Assert the generated HOK Global document contains its four images and HOK-specific section title.

- [ ] **Step 2: Run tests and verify the missing behavior fails**

Run: `node --test test/game-landing-pages.test.mjs test/domain-seo.test.mjs`

Expected: FAIL because the section copy is hard-coded to AOV and no lightbox/mobile swipe behavior exists.

- [ ] **Step 3: Implement the minimal accessible lightbox**

Use local React state for the selected case. Make each media area a full-width button, render a fixed dialog overlay only when selected, close on backdrop and the close button, and register/clean up an Escape listener. Lock and restore body scrolling while open. Preserve the selected image's literal dimensions and alt text.

- [ ] **Step 4: Make section copy data-driven and style the interactions**

Read the title and description from `page.caseStudySection`. Reset the media button style, add visible focus treatment, size the lightbox image with `object-fit: contain`, and apply mobile horizontal scroll-snap cards without changing desktop layout.

- [ ] **Step 5: Keep crawler output aligned**

Update the static generator to use `caseStudySection.title` and `.description` and wrap each evidence image in a link to its original asset. Do not add unsupported structured claims.

- [ ] **Step 6: Run focused tests**

Run: `node --test test/game-landing-pages.test.mjs test/domain-seo.test.mjs`

Expected: PASS.

- [ ] **Step 7: Run complete verification**

Run: `npm test`

Expected: all tests and production generation pass.

Run: `npm run lint`

Expected: exit 0 with no warnings.

Run: `npm run build`

Expected: exit 0 and generated HOK page includes all four case assets.

- [ ] **Step 8: Commit Task 2**

```powershell
git add src/GameLandingPage.jsx src/styles/game-landing.css scripts/generate-game-landing-pages.mjs test/game-landing-pages.test.mjs test/domain-seo.test.mjs
git commit -m "feat: publish HOK Global results gallery"
```

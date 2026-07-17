# Aurora Hero Promotion Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the newcomer offer below the Aurora wordmark, remove payment marks, and lift mobile social buttons above the quote control.

**Architecture:** Keep all changes inside the existing hero component and stylesheet. Reuse the existing translated newcomer offer string, remove obsolete payment asset references, and enforce the mobile spacing through the current responsive breakpoint.

**Tech Stack:** React, CSS, Node test runner, Vite

## Global Constraints

- Do not change the hero artwork, quote behavior, social destinations, typography system, or other page sections.
- Keep the newcomer offer centered below the Aurora Esports Studio wordmark.
- Remove all homepage payment marks and payment explanatory copy.
- Keep all five social platform names visible and clickable on mobile.

---

### Task 1: Reposition the offer and contact dock

**Files:**
- Modify: `test/public-ui.test.mjs`
- Modify: `src/App.jsx`
- Modify: `src/styles/index.css`

**Interfaces:**
- Consumes: `text("hero.newcomerOffer", fallback)` and the existing `contactChannels` array.
- Produces: `.hero-wordmark__offer` inside `.hero-wordmark` and a mobile social dock positioned above `.cinematic-hero__quote`.

- [ ] **Step 1: Write the failing test**

Add assertions that the offer is inside the wordmark, the payment icon declarations and `hero-promo` block are absent, and the mobile social dock uses a bottom offset of at least 150px.

```js
test("hero places its newcomer offer under the wordmark without payment marks", async () => {
  const app = await source("src/App.jsx");
  const css = await source("src/styles/index.css");
  const wordmark = app.match(/<a className="hero-wordmark"[\s\S]*?<\/a>/)?.[0] || "";
  assert.match(wordmark, /hero-wordmark__offer/);
  assert.doesNotMatch(app, /paymentIconPaths|hero-promo__payments|className="hero-promo"/);
  assert.match(css, /\.hero-wordmark__offer/);
  assert.match(css, /\.cinematic-hero__socials\s*\{[\s\S]*?bottom:\s*calc\((?:15[0-9]|1[6-9][0-9]|[2-9][0-9]{2})px/);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test test/public-ui.test.mjs`

Expected: FAIL because `hero-wordmark__offer` is absent and payment marks still exist.

- [ ] **Step 3: Implement the approved layout**

In `HeroHeader`, render:

```jsx
<span className="hero-wordmark__offer">
  {text("hero.newcomerOffer", "新人優惠・全單自動享 85 折")}
</span>
```

Remove `paymentIconPaths` and the complete `.hero-promo` JSX block. Add a small gold `.hero-wordmark__offer` style and change the mobile `.cinematic-hero__socials` bottom offset to `calc(164px + env(safe-area-inset-bottom))`.

- [ ] **Step 4: Run focused and full verification**

Run:

```powershell
node --test test/public-ui.test.mjs
npm test
npm run lint
$env:VITE_BASE_PATH='/'; npm run build
```

Expected: all commands exit successfully with no warnings from lint.

- [ ] **Step 5: Review desktop and mobile, commit, and publish**

Confirm the wordmark offer is centered, payment marks are gone, and all five social buttons sit above the quote entry on a mobile viewport. Commit and publish the verified update to the production site.

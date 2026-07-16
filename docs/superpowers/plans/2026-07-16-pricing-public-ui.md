# Pricing and Public UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the automatic newcomer discount, three display currencies, simplified quotation fields, accurate price notices, branded mobile contact controls, and the homepage promotion/payment display.

**Architecture:** Keep HKD as the authoritative calculation currency in `quoteEngine.js`, apply one central newcomer discount after existing service adjustments and minimums, then convert only the final display values. Remove retired fields from the shared game contract, AI tool schema, form, summaries, and translations so manual and AI flows remain identical.

**Tech Stack:** React, Vite, Node test runner, existing deterministic quote engine and Gemini server adapter.

## Global Constraints

- Newcomer discount is 15%, automatically applied to every configured automatic quote.
- Currency rates are HKD 1, TWD 4.25, CNY 1; HKD remains the source currency.
- Existing rank minimums, one-match 5V5 rule, teaching minimum, guarantee multipliers, and 10-match discounts remain unchanged.
- Remove completion time, specified-time, express, and 70% win-rate fields; keep appointment start time.
- `additionalRequirements` is optional for every service and omitted from summaries when blank.
- Payment icons are non-clickable; no payment integration is claimed.

---

### Task 1: Authoritative discount and currency conversion

**Files:**
- Modify: `src/data/pricing.js`
- Modify: `src/data/runtimeCatalog.js`
- Modify: `src/lib/quoteEngine.js`
- Test: `test/quote-engine.test.mjs`

**Interfaces:**
- Produces: `pricingCatalog.newCustomerDiscountRate`, `pricingCatalog.exchangeRates`, and quote fields `sourceCurrency`, `displayCurrency`, `exchangeRate`, `newCustomerDiscount`, `finalTotal`.
- Consumes: existing configured service calculators and runtime catalogue normalization.

- [ ] **Step 1: Write failing quote-engine tests**

Add tests that assert: a HK$20 rank source quote first reaches HK$50 then becomes HK$42.50; 10-match service discount is applied before the additional 15%; TWD multiplies the discounted HKD result by 4.25; CNY keeps the same numeric amount; manual-review quotes never receive invented converted totals.

- [ ] **Step 2: Verify the tests fail for the missing global discount and currency fields**

Run: `node --test test/quote-engine.test.mjs`

Expected: failures show missing `newCustomerDiscount` or unconverted TWD/CNY totals.

- [ ] **Step 3: Add central pricing settings and normalize them**

Add:

```js
newCustomerDiscountRate: 0.15,
exchangeRates: { HKD: 1, TWD: 4.25, CNY: 1 },
```

Normalize only these three currencies and clamp the discount to `0..1`.

- [ ] **Step 4: Apply the discount and conversion once**

Create one finalization helper that receives a configured HKD quote, applies `subtotalAfterExistingRules * 0.15`, converts all displayed money fields using the selected display currency, and preserves the original HKD amount for audit. Manual-review and incomplete results remain amount-free.

- [ ] **Step 5: Verify focused tests pass**

Run: `node --test test/quote-engine.test.mjs`

Expected: all quote engine tests pass.

- [ ] **Step 6: Commit the calculator change**

```powershell
git add src/data/pricing.js src/data/runtimeCatalog.js src/lib/quoteEngine.js test/quote-engine.test.mjs
git commit -m "Add newcomer discount and quote currencies"
```

### Task 2: Simplify shared fields and AI contract

**Files:**
- Modify: `src/data/gameConfig.js`
- Modify: `src/data/suggestions.js`
- Modify: `src/data/translations.js`
- Modify: `src/components/QuoteAssistant.jsx`
- Modify: `server/quote-ai-handler.mjs`
- Test: `test/game-config.test.mjs`
- Test: `test/quote-engine.test.mjs`
- Test: `test/quote-ai-handler.test.mjs`

**Interfaces:**
- Produces: service contracts without `completionTime`, `express`, `customSchedule`, or `winRate70`; every service accepts optional `additionalRequirements`.
- Consumes: Task 1 finalized quote shape.

- [ ] **Step 1: Write failing contract and summary tests**

Assert the four retired fields are absent from all five service contracts, AI function arguments, form labels, WhatsApp/LINE summaries, and AI follow-up prompts. Assert blank `additionalRequirements` validates successfully and is omitted from summaries; nonblank text is retained.

- [ ] **Step 2: Verify focused tests fail**

Run: `node --test test/game-config.test.mjs test/quote-engine.test.mjs test/quote-ai-handler.test.mjs`

Expected: current required completion/express fields and summary lines cause failures.

- [ ] **Step 3: Remove retired fields from central configuration and deterministic validation**

Delete the four fields from required field lists, normalized drafts, pricing surcharges, time calculations, and generated summaries. Preserve `preferredStartTime` for duo appointments and timed teaching.

- [ ] **Step 4: Make other requirements optional everywhere**

Render one optional textarea for every selected service, remove `requirementsRequired`, and include the line only when `trim()` is nonempty.

- [ ] **Step 5: Update Gemini function schema and instructions**

Remove the four properties and all instructions that ask for them. Add `additionalRequirements` as an optional string and state that Aurora must not ask for it if the customer has no additional request.

- [ ] **Step 6: Verify focused tests pass and commit**

Run: `node --test test/game-config.test.mjs test/quote-engine.test.mjs test/quote-ai-handler.test.mjs`

```powershell
git add src/data/gameConfig.js src/data/suggestions.js src/data/translations.js src/components/QuoteAssistant.jsx server/quote-ai-handler.mjs test/game-config.test.mjs test/quote-engine.test.mjs test/quote-ai-handler.test.mjs
git commit -m "Simplify Aurora quote requirements"
```

### Task 3: Public quote notices, currency selector, branded contact dock, and promo block

**Files:**
- Modify: `src/components/QuoteAssistant.jsx`
- Modify: `src/App.jsx`
- Modify: `src/data/content.js`
- Modify: `src/data/translations.js`
- Modify: `src/styles/index.css`
- Modify: `src/styles/quote.css`
- Add: `public/brands/alipay.svg`
- Add: `public/brands/wechat-pay.svg`
- Add: `public/brands/fps.svg`
- Add: `public/brands/whatsapp.svg`
- Add: `public/brands/instagram.svg`
- Add: `public/brands/discord.svg`
- Add: `public/brands/line.svg`
- Add: `public/brands/carousell.svg`
- Test: `test/public-ui.test.mjs`
- Test: `test/quote-engine.test.mjs`

**Interfaces:**
- Consumes: Task 1 currency settings and Task 2 simplified draft.
- Produces: accessible currency selector, dynamic price notice, mobile contact labels, and non-clickable homepage payment badges.

- [ ] **Step 1: Write failing source/UI tests**

Assert the form defaults to HKD and offers HKD/TWD/CNY; configured services show the official-price/newcomer message; manual services show human confirmation; no selection shows neither warning. Assert mobile contact entries contain brand image plus visible platform name, and payment images are not inside links.

- [ ] **Step 2: Verify tests fail**

Run: `node --test test/public-ui.test.mjs test/quote-engine.test.mjs`

- [ ] **Step 3: Implement selector, dynamic notice, and quote rows**

Add a currency selector at the beginning of the manual form. Show original service discount and newcomer discount as separate rows, and use the selected display currency for totals and contact summaries.

- [ ] **Step 4: Add official brand assets and responsive controls**

Use locally stored SVGs with accessible `alt` text. On mobile, show icon and platform name in a compact wrapping dock; on desktop preserve the existing edge layout.

- [ ] **Step 5: Add the bottom-left promotion/payment block**

Render “新人優惠・全單自動享 85 折” followed by non-clickable Alipay, WeChat Pay, and FPS icons. Add a small statement that payment details are confirmed with Aurora support.

- [ ] **Step 6: Verify and commit**

Run: `node --test test/public-ui.test.mjs test/quote-engine.test.mjs`

```powershell
git add src public/brands test/public-ui.test.mjs test/quote-engine.test.mjs
git commit -m "Improve public quote and mobile contact UI"
```

### Task 4: Frontend release verification

**Files:**
- Test: all existing `test/*.test.mjs`

- [ ] **Step 1: Run all automated checks**

Run: `npm test`

Expected: zero failures.

Run: `npm run lint`

Expected: zero warnings and zero errors.

Run: `$env:VITE_BASE_PATH='/'; npm run build`

Expected: production build exits with code 0.

- [ ] **Step 2: Test desktop and mobile locally**

Verify the quote modal scrolls, currency changes update all totals, optional requirements can remain blank, the mobile contact dock is readable, and the promo block does not cover the hero controls.

- [ ] **Step 3: Publish only after the checks pass**

Commit any verification fixes, push `main`, wait for GitHub Pages, and verify the production quote status without making a real Gemini request.

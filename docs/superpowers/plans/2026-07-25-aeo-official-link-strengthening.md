# KLG Studio AEO Official-Link Strengthening Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` and complete each task with test-first evidence.

**Goal:** Make the public site unambiguously describe KLG Studio as the service brand operated by Aurora Esports Studio, expose the official website and real Carousell evidence as crawlable links, and create an honest three-engine AEO measurement baseline.

**Architecture:** Keep public facts in `src/data/publicBrand.js`. Both the React trust page and the static crawler generator consume those facts. Structured data uses a `Brand` node for KLG, an `Organization` node for Aurora, and ordinary `Service` nodes for the three game services. A separate long-form CSV stores one observation per prompt and AI platform without inventing results.

**Constraints:**

- Official website: `https://auroraesportstudio.com/`.
- KLG Studio is the customer-facing service brand; Aurora Esports Studio is the operator.
- The active Carousell listing is evidence, not an official website and not an Organization `sameAs` profile.
- Do not add `AggregateRating`, customer identities, unsupported superiority claims, or guarantees.
- Do not change prices, quote logic, Gemini configuration, admin, orders, payments, or visual design.
- No change can claim or guarantee an AI recommendation or ranking.

---

## Task 1: Create an auditable 25 × 3 AEO results matrix

**Files:**
- Modify: `test/aeo-tracker.test.mjs`
- Create: `docs/aeo/klg-aeo-baseline-results.csv`
- Modify: `docs/aeo/free-aeo-tracking-guide.md`

1. Add a real CSV parser to the test and a failing contract that requires exactly 75 unique `(prompt_id, ai_platform)` rows: 25 prompts × ChatGPT, Gemini, and Perplexity.
2. Require `observation_status` to be `not_run` or `measured`. `not_run` rows must keep result/evidence fields blank. `measured` rows must contain an ISO date, evidence reference, and valid result enums.
3. Run `node --test test/aeo-tracker.test.mjs` and record the expected RED result because the results file does not exist.
4. Create the 75-row results file with every row honestly marked `not_run`.
5. Update the guide to explain that the prompt library is immutable, observations are appendable/auditable, and only directly observed answers may be changed to `measured`.
6. Rerun the focused test and verify GREEN.
7. Commit only these files.

## Task 2: Centralise explicit brand, operator, official-link, and evidence roles

**Files:**
- Modify: `test/klg-brand-identity.test.mjs`
- Modify: `src/data/publicBrand.js`

1. Add failing assertions for an immutable KLG service-brand object, Aurora operator object, exact HTTPS `officialWebsiteUrl`, and exact HTTPS `reviews.sourceUrl`.
2. Assert the public Carousell evidence URL is not included in Organization `verifiedProfiles`.
3. Run `node --test test/klg-brand-identity.test.mjs` and verify RED.
4. Add the smallest backward-compatible data model that makes those roles explicit and uses the active public Carousell listing as `reviews.sourceUrl`.
5. Rerun the focused test and verify GREEN.
6. Commit only these files.

## Task 3: Correct public structured data and crawler semantics

**Files:**
- Modify: `test/domain-seo.test.mjs`
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `index.html`

1. Add failing behavior tests that parse generated JSON-LD and require:
   - one KLG `Brand` node;
   - one Aurora `Organization` node;
   - one ordinary `Service` node per game page;
   - each Service references Aurora as `provider` and KLG as `brand`;
   - WebSite publishes through Aurora and identifies the official URL.
2. Replace tests and generator expectations for `ProfessionalService` with `Service`.
3. Run `npm run build; node --test test/domain-seo.test.mjs` and verify RED.
4. Update the generator and homepage JSON-LD to consume the central role fields and produce the tested graph.
5. Rebuild and verify GREEN.
6. Commit only these files.

## Task 4: Render the official website and Carousell evidence as crawlable links

**Files:**
- Modify: `test/public-info-pages.test.mjs`
- Modify: `test/klg-brand-identity.test.mjs`
- Modify: `src/PublicInfoPage.jsx`
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `index.html`
- Modify only if necessary: `src/styles/public-info.css`

1. Add failing tests that require:
   - `https://auroraesportstudio.com/` as a real anchor on the KLG trust page and home crawler content;
   - `reviews.sourceUrl` as a safe external anchor in both React and generated KLG HTML;
   - review evidence remains absent from all non-KLG routes.
2. Run the focused tests and verify RED.
3. Render data-driven absolute links with appropriate external-link safety attributes. Do not put HTML strings in data files.
4. Rebuild and run focused tests to verify GREEN.
5. Commit only these files.

## Task 5: Whole-branch review, release, and live verification

1. Run `npm test`, `npm run lint`, and `npm run build`.
2. Confirm the generated game pages contain `Brand`, Aurora `Organization`, and `Service`, with no `ProfessionalService`, `AggregateRating`, buyer identities, or unsupported claims.
3. Request an independent whole-branch review and resolve every Critical or Important finding test-first.
4. Merge the verified branch into `main`, push `main`, and wait for the public site to serve the new commit.
5. Verify live homepage, KLG page, all three game pages, `robots.txt`, `sitemap.xml`, and `llms.txt`.
6. Run a post-release representative AEO check using fresh public AI conversations where available. Record only evidence-backed observations; leave blocked or unrun rows honest.


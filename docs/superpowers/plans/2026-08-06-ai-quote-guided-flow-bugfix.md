# Aurora AI Quote Guided Flow Bugfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make automatic rank quotations collect missing rank progress reliably and never mislabel incomplete data as manual pricing.

**Architecture:** Keep the central game configuration and quote engine authoritative. Add rank aliases to central data, extend the server-side deterministic parser for high-confidence rank progress, and rebuild customer replies from quote-engine status rather than trusting model wording.

**Tech Stack:** JavaScript ES modules, Node test runner, React/Vite application, `@google/genai` server adapter.

## Global Constraints

- Do not change any approved price, discount, currency, service visibility, UI styling, Gemini model, API key, rate limit, or sensitive-data protection.
- Ask exactly one missing quotation question per reply.
- Only `manual_review` may produce 「待人工確認／待人工确认」.
- Monetary totals must come only from the existing server quote engine.

---

### Task 1: Lock the broken journey with regression tests

**Files:**
- Modify: `test/quote-engine.test.mjs`
- Modify: `test/quote-ai-handler.test.mjs`

**Interfaces:**
- Consumes: `calculateQuote`, `buildDeterministicFollowUp`, `createQuoteAiHandler`
- Produces: regression coverage for AOV Diamond-to-Battlefield-Legend and incomplete/quoted reply safety

- [ ] **Step 1: Add the quote-engine characterization test**

Assert that `aov/rank`, Diamond III 0 stars to Battlefield Legend 0 stars is `quoted`, base HKD 675, and newcomer total HKD 573.75.

- [ ] **Step 2: Add deterministic multi-turn tests**

Test the sequence: initial request → current division → current stars → target stars. Assert each returned patch is preserved and each message asks exactly one next question.

- [ ] **Step 3: Add shorthand and safety tests**

Assert that 「钻石四到战场」 infers AOV and Battlefield Legend; incomplete model money cannot become manual review; a quoted result cannot be described as manual review.

- [ ] **Step 4: Run focused tests and confirm the new handler assertions fail before implementation**

Run: `node --test test/quote-ai-handler.test.mjs test/quote-engine.test.mjs`

Expected: existing tests pass and the new handler behavior tests fail for missing alias/state/status handling.

### Task 2: Implement the deterministic guided quote flow

**Files:**
- Modify: `src/data/gameConfig.js`
- Modify: `server/quote-ai-handler.mjs`

**Interfaces:**
- Consumes: rank `aliases`, cleaned `quoteContext`, `validateQuoteDraft` missing-field order
- Produces: stable context patches and one-question localized follow-ups

- [ ] **Step 1: Add central AOV rank aliases**

Allow `makeRank` to retain an `aliases` array and add `戰場` and `战场` only to `battlefield-legend`.

- [ ] **Step 2: Extend relationship and rank matching**

Recognize the standalone connector 「到」 without changing other service detection, and infer a game only when a rank alias uniquely belongs to one game.

- [ ] **Step 3: Parse high-confidence follow-up progress**

For active `rank` or ranked `duo`, capture valid Roman/Chinese division values and clearly labelled star values into the correct current/target fields. Reject values outside the selected rank configuration.

- [ ] **Step 4: Ask the next missing field deterministically**

After merging the patch, follow the quote validator's missing fields and return one localized prompt for current division, current stars, target division, or target stars.

- [ ] **Step 5: Separate incomplete and manual responses**

Update instructions and final response guards so incomplete input asks for its next field, true manual services retain human confirmation, and quoted results always use the authoritative server amount.

- [ ] **Step 6: Run the focused tests until green**

Run: `node --test test/quote-ai-handler.test.mjs test/quote-engine.test.mjs`

Expected: all focused tests pass.

### Task 3: Verify and publish the repair

**Files:**
- Verify only: application and server build outputs

**Interfaces:**
- Consumes: completed Tasks 1–2
- Produces: production-ready evidence and live endpoint verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: zero warnings and errors.

- [ ] **Step 2: Run the complete production suite**

Run: `npm test`

Expected: build succeeds and all tests pass.

- [ ] **Step 3: Commit only the intended bugfix, tests and design documents**

Do not stage the pre-existing `index.html` or `src/styles/index.css` changes.

- [ ] **Step 4: Deploy the backend and publish the branch through the existing verified deployment path**

Verify `/status` without exposing secrets, then perform a live multi-turn Diamond-to-Battlefield-Legend quotation.

<!-- End of implementation plan. -->

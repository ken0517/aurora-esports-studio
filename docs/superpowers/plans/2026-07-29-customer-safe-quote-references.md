# Customer-Safe Quote References Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Aurora quote references from every customer-visible and customer-controlled boundary while preserving server-generated references throughout the operations backend.

**Architecture:** Keep `reference` and `referenceNumber` on authoritative quote, enquiry, and order records. Introduce customer-safe projections at the UI, public enquiry API, and Gemini boundaries so internal identifiers never cross into customer output or customer-controlled input.

**Tech Stack:** React, Vite, Node.js HTTP handlers, Node test runner, Gemini `@google/genai`.

## Global Constraints

- Do not change prices, discounts, currencies, quote calculations, game data, admin styling, or customer-visible design.
- Customer quote summaries, clipboard text, WhatsApp, LINE, Aurora support replies, and public API responses must not expose `AUR-...` references.
- Public clients must not be able to choose or overwrite an internal quote reference.
- The server must continue generating and storing references for enquiries, orders, appointments, and admin lookup.
- Customer-visible quote status, price breakdown, new-customer discount, final total, and manual-review wording must remain unchanged.

---

### Task 1: Remove references from customer quote presentation

**Files:**
- Modify: `test/quote-engine.test.mjs`
- Modify: `test/public-ui.test.mjs`
- Modify: `src/lib/quoteEngine.js`
- Modify: `src/components/QuoteAssistant.jsx`

**Interfaces:**
- Consumes: authoritative quote objects containing `reference` and `referenceNumber`.
- Produces: `formatQuoteText()`, `formatWhatsAppMessage()`, `formatLineMessage()`, and the rendered result card without customer-visible references.

- [ ] **Step 1: Write failing customer-output tests**

Update the existing WhatsApp/LINE equivalence test so it verifies the internal reference remains on the quote object but is absent from both messages:

```js
assert.equal(quote.reference, "AUR-LINE-SAME-COPY");
assert.doesNotMatch(whatsapp, /AUR-LINE-SAME-COPY/);
assert.doesNotMatch(line, /AUR-LINE-SAME-COPY/);
assert.match(line, /HK\$/);
```

Add a static UI assertion in `test/public-ui.test.mjs` confirming the result rows do not render `quote.referenceNumber` or `quote.reference`.

- [ ] **Step 2: Run focused tests and confirm RED**

Run:

```powershell
node --test test/quote-engine.test.mjs test/public-ui.test.mjs
```

Expected: failures because customer messages and the result card still contain the reference.

- [ ] **Step 3: Implement the minimal presentation change**

In `formatQuoteText()`, remove only the row that translates and prints `quote.table.reference`.

In `QuoteAssistant.jsx`, remove only this result row:

```jsx
[text("reference", "報價編號"), quote?.referenceNumber ?? quote?.reference ?? "—"]
```

Do not remove reference generation, the quote object fields, or the internal analytics de-duplication key.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run:

```powershell
node --test test/quote-engine.test.mjs test/public-ui.test.mjs
```

Expected: all focused tests pass.

- [ ] **Step 5: Commit**

```powershell
git add test/quote-engine.test.mjs test/public-ui.test.mjs src/lib/quoteEngine.js src/components/QuoteAssistant.jsx
git commit -m "fix: hide quote references from customers"
```

---

### Task 2: Make the public enquiry boundary reference-safe

**Files:**
- Modify: `test/enquiry-api.test.mjs`
- Modify: `test/public-ui.test.mjs`
- Modify: `server/enquiry-api.mjs`
- Modify: `src/components/QuoteAssistant.jsx`

**Interfaces:**
- Consumes: customer draft, consent, session ID, submission ID, source, locale, and acquisition context.
- Produces: a server-generated internal quote reference and a public response of `{ accepted: true }`.

- [ ] **Step 1: Write failing public-boundary tests**

Add or update tests to prove:

```js
assert.deepEqual(payload, { accepted: true });
assert.notEqual(savedEnquiry.quoteReference, "AUR-CUSTOMER-CHOSEN");
assert.match(savedEnquiry.quoteReference, /^AUR-/);
```

Add a static UI assertion confirming the enquiry request projection excludes `reference` and `referenceNumber` before serialisation.

- [ ] **Step 2: Run focused tests and confirm RED**

Run:

```powershell
node --test test/enquiry-api.test.mjs test/public-ui.test.mjs
```

Expected: failures because the server accepts a customer reference and returns internal identifiers.

- [ ] **Step 3: Implement the minimal public-boundary change**

In `QuoteAssistant.jsx`, construct a customer submission quote without internal fields:

```js
const { reference: _reference, referenceNumber: _referenceNumber, ...customerQuote } = result;
```

Send `customerQuote` instead of `result`.

In `server/enquiry-api.mjs`:

- stop reading `requestedReference` from `body.quote`;
- call `calculateQuoteFn()` without a customer-supplied `reference`;
- keep assigning the generated reference to the saved enquiry;
- return `{ accepted: true }` with the existing `201` or `200` status.

Remove `safeQuoteReference()` and its pattern only if no internal caller still uses them.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run:

```powershell
node --test test/enquiry-api.test.mjs test/public-ui.test.mjs
```

Expected: all focused tests pass; saved enquiries retain server-generated references.

- [ ] **Step 5: Commit**

```powershell
git add test/enquiry-api.test.mjs test/public-ui.test.mjs server/enquiry-api.mjs src/components/QuoteAssistant.jsx
git commit -m "fix: keep quote references server-side"
```

---

### Task 3: Prevent Aurora support from revealing internal references

**Files:**
- Modify: `test/quote-ai-handler.test.mjs`
- Modify: `server/quote-ai-handler.mjs`

**Interfaces:**
- Consumes: authoritative quote results that may contain internal reference fields.
- Produces: Gemini context, function responses, stored assistant messages, and customer JSON replies without internal reference identifiers.

- [ ] **Step 1: Write failing AI-boundary tests**

Extend the authoritative function-calling test:

```js
assert.equal(functionOutput.referenceNumber, undefined);
assert.doesNotMatch(JSON.stringify(fake.calls), /AUR-AUTHORITATIVE-TEST/);
```

Add a model-output test where the fake provider returns an internal identifier:

```js
responses: [responseWithText("你的報價編號是 AUR-20260729-ABC123。")]
```

Assert the HTTP reply and persisted assistant message do not contain `/AUR-[A-Z0-9-]+/i`.

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
node --test test/quote-ai-handler.test.mjs
```

Expected: failures because the authoritative result and model reply can expose the reference.

- [ ] **Step 3: Implement customer-safe AI projections**

Remove `referenceNumber` from the object returned by `calculateAuthoritativeQuote()`.

Add a focused final-output guard:

```js
function removeInternalReferences(value) {
  return String(value || "").replace(/\bAUR-[A-Z0-9-]{1,64}\b/gi, "").replace(/[ \t]{2,}/g, " ").trim();
}
```

Apply it after identity and price guards but before persistence and `sendJson()`. Add a system rule that internal quote, enquiry, and order identifiers must never be mentioned to customers.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run:

```powershell
node --test test/quote-ai-handler.test.mjs
```

Expected: all focused tests pass and authoritative prices remain unchanged.

- [ ] **Step 5: Run the complete verification suite**

Run:

```powershell
npm test
npm run lint
npm run build
git diff --check
```

Expected: zero test failures, zero lint warnings, successful production build, and no whitespace errors.

- [ ] **Step 6: Commit**

```powershell
git add test/quote-ai-handler.test.mjs server/quote-ai-handler.mjs
git commit -m "fix: prevent support reference disclosure"
```

---

### Task 4: Production regression verification

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: the completed branch and deployed production frontend/backend.
- Produces: evidence that customer outputs are reference-free while admin references remain available.

- [ ] **Step 1: Review the complete branch**

Generate a review package from the branch base to `HEAD` and run independent spec and code-quality review. Resolve all Critical and Important findings before merge.

- [ ] **Step 2: Merge and deploy**

Fast-forward the reviewed branch into `main`, push `main`, verify the GitHub Pages deployment succeeds, and deploy the Vercel backend.

- [ ] **Step 3: Verify production customer outputs**

On production:

- create a manual quote without sending it to a contact;
- confirm the result card contains no quote reference;
- confirm copied text contains no `AUR-...`;
- inspect the WhatsApp URL text parameter and confirm it contains no `AUR-...`;
- open Aurora support without sending a real Gemini request and confirm the UI remains usable.

- [ ] **Step 4: Verify production service health**

Confirm:

```text
https://auroraesportstudio.com/ -> HTTP 200
https://aurora-esports-api.vercel.app/api/quote-ai/status -> configured true
```

Do not expose API keys and do not use a real Gemini request for automated verification.

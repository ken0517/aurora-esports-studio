# Operations Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing secure Aurora admin into a conversation, enquiry, order, appointment, staff, and business-rules control room without adding online payments.

**Architecture:** Add a separate operations document store using the same private Vercel KV/Blob credentials as the catalogue, expose public write-only endpoints for consented chat/enquiry capture, and expose authenticated admin read/write endpoints. Split the admin panels into lazy-loaded modules so operations code does not increase the public homepage bundle.

**Tech Stack:** Vercel Node functions, Upstash Redis or Vercel Blob fallback, React admin UI, Node test runner.

## Global Constraints

- No credit-card, Alipay, WeChat Pay, FPS, or bank-transfer integration.
- No payment-triggered order creation.
- A completed quote creates an enquiry; only an authenticated administrator converts it into an order.
- Sensitive text is redacted before persistence.
- Public clients can create/update only their own opaque session and cannot list stored records.
- Admin sessions, rate limiting, server-side secrets, and noindex protections remain in force.

---

### Task 1: Operations model and private persistence

**Files:**
- Add: `server/operations-model.mjs`
- Add: `server/operations-store.mjs`
- Test: `test/operations-store.test.mjs`

**Interfaces:**
- Produces: `createOperationsStore(env, fetchImpl)`, `normalizeOperationsState(input)`, `redactSensitiveText(text)`.
- State contains `conversations`, `enquiries`, `orders`, `staff`, `businessRules`, `revision`, and `updatedAt`.

- [ ] **Step 1: Write failing normalization, redaction, and persistence tests**

Cover password/OTP/card redaction, unknown field stripping, valid order statuses, default 90-day retention, write/read persistence, revision conflicts, and storage-unconfigured failure.

- [ ] **Step 2: Verify tests fail because the modules do not exist**

Run: `node --test test/operations-store.test.mjs`

- [ ] **Step 3: Implement normalized data shapes**

Use the exact order statuses `new_enquiry`, `awaiting_details`, `awaiting_quote_confirmation`, `awaiting_payment`, `confirmed`, `scheduled`, `in_progress`, `completed`, `cancelled`. Store ISO timestamps and opaque UUIDs only.

- [ ] **Step 4: Implement private storage**

Use key `aurora:operations:v1` and Blob path `aurora/operations-v1.json`. Enforce expected revision on administrator writes and expose no public read method.

- [ ] **Step 5: Verify and commit**

Run: `node --test test/operations-store.test.mjs`

```powershell
git add server/operations-model.mjs server/operations-store.mjs test/operations-store.test.mjs
git commit -m "Add Aurora operations data store"
```

### Task 2: Public consented chat and enquiry capture

**Files:**
- Modify: `server/quote-ai-handler.mjs`
- Add: `server/enquiry-api.mjs`
- Add: `api/enquiries.mjs`
- Modify: `vercel.json`
- Modify: `src/components/QuoteAssistant.jsx`
- Test: `test/quote-ai-handler.test.mjs`
- Test: `test/enquiry-api.test.mjs`

**Interfaces:**
- Public POST `/api/enquiries` accepts `{ sessionId, consent, source, locale, draft, quote }` and returns `{ enquiryId, reference }`.
- AI requests accept `sessionId` and `conversationConsent`; only consented messages are persisted.

- [ ] **Step 1: Write failing API tests**

Assert missing consent does not persist chat, consent timestamp is stored, sensitive text is redacted, public GET is rejected, payloads have length limits, and a completed quote creates an enquiry rather than an order.

- [ ] **Step 2: Verify the tests fail**

Run: `node --test test/enquiry-api.test.mjs test/quote-ai-handler.test.mjs`

- [ ] **Step 3: Implement the write-only enquiry route and AI logging**

Generate server-side IDs, store only normalized game/service/draft/quote fields, redact every message, and preserve the quote reference for later conversion.

- [ ] **Step 4: Add explicit consent to the AI panel**

Before the first AI message, require a checkbox reading “我同意 Aurora 保存本次对话，以便跟进报价；请勿发送密码、验证码或付款资料。” Store the consent timestamp with the session.

- [ ] **Step 5: Verify and commit**

Run: `node --test test/enquiry-api.test.mjs test/quote-ai-handler.test.mjs`

```powershell
git add server/quote-ai-handler.mjs server/enquiry-api.mjs api/enquiries.mjs vercel.json src/components/QuoteAssistant.jsx test/enquiry-api.test.mjs test/quote-ai-handler.test.mjs
git commit -m "Capture consented Aurora enquiries"
```

### Task 3: Authenticated operations API

**Files:**
- Add: `server/operations-api.mjs`
- Add: `api/admin/operations.mjs`
- Modify: `server/site-server.mjs`
- Modify: `vercel.json`
- Test: `test/operations-api.test.mjs`

**Interfaces:**
- GET `/api/admin/operations` returns normalized state after admin authentication.
- PUT `/api/admin/operations` accepts `{ state, expectedRevision }`.
- POST `/api/admin/operations/action` accepts a finite action union for enquiry conversion, order status changes, appointment updates, staff assignment, staff updates, and business-rule updates.

- [ ] **Step 1: Write failing authentication and action tests**

Cover unauthenticated rejection, enquiry-to-order conversion, valid/invalid status transitions, appointment overlap warning, staff assignment, filters, business-hour validation, closure dates, daily capacity, and retention updates.

- [ ] **Step 2: Verify tests fail**

Run: `node --test test/operations-api.test.mjs`

- [ ] **Step 3: Implement authenticated routes and actions**

Reuse `admin-auth.mjs`; validate every action server-side; return conflict warnings for overlapping active orders without silently cancelling or overwriting either order.

- [ ] **Step 4: Verify and commit**

Run: `node --test test/operations-api.test.mjs`

```powershell
git add server/operations-api.mjs api/admin/operations.mjs server/site-server.mjs vercel.json test/operations-api.test.mjs
git commit -m "Add secure operations management API"
```

### Task 4: Admin conversations, orders, appointments, staff, and rules panels

**Files:**
- Modify: `src/AdminApp.jsx`
- Add: `src/admin/OperationsApp.jsx`
- Add: `src/admin/ConversationsPanel.jsx`
- Add: `src/admin/OrdersPanel.jsx`
- Add: `src/admin/StaffRulesPanel.jsx`
- Add: `src/admin/operationsClient.js`
- Modify: `src/styles/admin.css`
- Test: `test/admin-operations-ui.test.mjs`

**Interfaces:**
- Consumes: Task 3 authenticated operations API.
- Produces: admin tabs for price catalogue, conversations, orders/appointments, and staff/rules.

- [ ] **Step 1: Write failing source and interaction tests**

Assert filters for date/game/service/status, conversation timeline, convert-to-order action, all approved statuses, appointment fields, staff selector, conflict warning, business hours, closure dates, capacity, and mobile admin layout.

- [ ] **Step 2: Verify tests fail**

Run: `node --test test/admin-operations-ui.test.mjs`

- [ ] **Step 3: Split and lazy-load operations panels**

Keep login and price catalogue behavior unchanged. Load operations modules only after the administrator selects an operations tab.

- [ ] **Step 4: Implement conversations and filters**

Display redacted messages in time order, consent time, quote reference, game, service, source, and follow-up status. Provide date/game/service/status filters and delete action with confirmation.

- [ ] **Step 5: Implement orders and appointments**

Convert an enquiry, edit customer contact fields, update status, set date/time/duration, assign staff, display overlap/capacity warnings, and add internal notes.

- [ ] **Step 6: Implement staff and business rules**

Create/edit staff display name, supported games/services and active state. Edit weekly hours, closure dates, daily capacity, earliest booking lead time, reschedule notice, and retention days.

- [ ] **Step 7: Verify and commit**

Run: `node --test test/admin-operations-ui.test.mjs test/operations-api.test.mjs`

```powershell
git add src/AdminApp.jsx src/admin src/styles/admin.css test/admin-operations-ui.test.mjs
git commit -m "Add Aurora operations control room"
```

### Task 5: Operations release verification

- [ ] **Step 1: Run the complete suite, lint, and production build**

Run: `npm test`, `npm run lint`, and `$env:VITE_BASE_PATH='/'; npm run build`.

Expected: all commands exit 0.

- [ ] **Step 2: Verify local administrator workflow**

Use local test credentials and memory storage to create consented chat, generate enquiry, convert to order, assign staff, create appointment, detect overlap, update status, and filter records.

- [ ] **Step 3: Deploy backend before frontend**

Deploy Vercel API routes, verify authenticated admin endpoints and storage, then publish the frontend. Do not output administrator secrets or stored conversations.

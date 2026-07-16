# Aurora Admin, LINE Contact, and Formal Traditional Chinese Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the approved Aurora admin verification, personal-LINE quote handoff, and formal Traditional Chinese conversion without changing pricing, Gemini configuration, or visual direction.

**Architecture:** Keep the existing runtime catalog as the single source used by the admin, manual quote, and Aurora support. Add a small pure contact-message boundary in the quote engine so WhatsApp and LINE share identical content, then connect LINE to the existing personal add-friend URL with clipboard fallback. Convert customer-visible and admin-visible Hong Kong copy to formal Traditional Chinese while retaining Cantonese aliases only for input recognition.

**Tech Stack:** React, Vite, Node.js test runner, existing Vercel API, existing GitHub Pages frontend, existing CSS system.

## Global Constraints

- Do not redesign the website or change the approved pricing rules.
- Do not change Gemini provider, model, keys, prompts about pricing authority, rate limiting, or server-side security.
- The admin scope is price rules, estimated time, announcement, service status, and notes only.
- Do not add order management, payments, customer records, staff roles, SEO, or a custom domain.
- Traditional Chinese is the default display language and must use formal written wording.
- Cantonese aliases remain available for understanding customer input but are not shown as default copy.
- WhatsApp and LINE must use the same quotation message.
- LINE uses the current personal add-friend URL; it does not claim that the message was sent.
- Unconfigured prices remain `待人工確認` and no amount is invented.

---

### Task 1: Shared WhatsApp and LINE quotation message

**Files:**
- Modify: `src/lib/quoteEngine.js`
- Modify: `test/quote-engine.test.mjs`

**Interfaces:**
- Consumes: `formatQuoteText(quote, locale)` and the current quotation calculation result.
- Produces: `formatContactMessage(quoteOrDraft, locale)`, `formatWhatsAppMessage(quoteOrDraft, locale)`, and `formatLineMessage(quoteOrDraft, locale)`, all returning strings.

- [ ] **Step 1: Write the failing LINE equality test**

Add `formatLineMessage` to the import in `test/quote-engine.test.mjs` and add:

```js
test("WhatsApp and LINE use the same authoritative quote message", () => {
  const quote = calculateQuote(duoMatchDraft, { reference: "AUR-LINE-SAME-COPY" });
  const whatsapp = formatWhatsAppMessage(quote, "zh-HK");
  const line = formatLineMessage(quote, "zh-HK");

  assert.equal(line, whatsapp);
  assert.match(line, /AUR-LINE-SAME-COPY/);
  assert.match(line, /HKD/);
});
```

- [ ] **Step 2: Run the targeted test and confirm the missing export failure**

Run: `node --test --test-name-pattern="WhatsApp and LINE" test/quote-engine.test.mjs`

Expected: FAIL because `formatLineMessage` is not exported.

- [ ] **Step 3: Extract the shared contact formatter**

Replace the current `formatWhatsAppMessage` body in `src/lib/quoteEngine.js` with:

```js
export function formatContactMessage(quoteOrDraft, locale = null) {
  const quote = quoteOrDraft?.reference || quoteOrDraft?.referenceNumber
    ? quoteOrDraft
    : calculateQuote(quoteOrDraft);
  const resolvedLocale = normalizeLocale(locale ?? quote.locale ?? quote.draft?.locale);
  return [
    translate(resolvedLocale, "quote.whatsapp.greeting"),
    "",
    formatQuoteText(quote, resolvedLocale),
    "",
    translate(resolvedLocale, "quote.whatsapp.closing"),
  ].join("\n");
}

export function formatWhatsAppMessage(quoteOrDraft, locale = null) {
  return formatContactMessage(quoteOrDraft, locale);
}

export function formatLineMessage(quoteOrDraft, locale = null) {
  return formatContactMessage(quoteOrDraft, locale);
}
```

- [ ] **Step 4: Run the targeted test**

Run: `node --test --test-name-pattern="WhatsApp and LINE" test/quote-engine.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run all quote-engine tests**

Run: `node --test test/quote-engine.test.mjs`

Expected: all quote-engine tests pass and existing WhatsApp output remains unchanged.

- [ ] **Step 6: Commit the shared formatter**

```bash
git add src/lib/quoteEngine.js test/quote-engine.test.mjs
git commit -m "Add shared LINE quote message"
```

---

### Task 2: LINE copy-and-add-friend action in the quote result

**Files:**
- Modify: `src/data/translations.js`
- Modify: `src/components/QuoteAssistant.jsx`
- Modify: `src/styles/quote.css`
- Modify: `test/service-catalog.test.mjs`

**Interfaces:**
- Consumes: `formatLineMessage`, `contactLinks.line`, and the existing `copyToClipboard(text)` helper.
- Produces: a `傳送至 LINE` result action, success/failure status copy, and a mobile-safe four-action layout.

- [ ] **Step 1: Write failing translation contract assertions**

Add this test to `test/service-catalog.test.mjs`:

```js
test("all locales expose the LINE quote handoff labels", () => {
  for (const locale of locales) {
    assert.notEqual(translate(locale, "quote.actions.line"), "quote.actions.line");
    assert.notEqual(translate(locale, "quote.actions.lineCopied"), "quote.actions.lineCopied");
    assert.notEqual(translate(locale, "quote.actions.lineCopyFailed"), "quote.actions.lineCopyFailed");
  }
});
```

- [ ] **Step 2: Run the test and confirm missing translation keys**

Run: `node --test --test-name-pattern="LINE quote handoff" test/service-catalog.test.mjs`

Expected: FAIL because the LINE action keys do not exist.

- [ ] **Step 3: Add the three locale labels**

Extend each `quote.actions` object in `src/data/translations.js` with these exact values:

```js
// zh-HK
line: "傳送至 LINE",
lineCopied: "報價已複製；加入好友後請貼上並傳送。",
lineCopyFailed: "瀏覽器未能自動複製。請先按「複製報價」，再前往 LINE。",

// en
line: "Send to LINE",
lineCopied: "Quote copied. Add Aurora on LINE, then paste and send it.",
lineCopyFailed: "Your browser could not copy automatically. Copy the quote first, then open LINE.",

// zh-CN
line: "发送至 LINE",
lineCopied: "报价已复制；添加好友后请粘贴并发送。",
lineCopyFailed: "浏览器未能自动复制。请先点击“复制报价”，再前往 LINE。",
```

- [ ] **Step 4: Run the translation test**

Run: `node --test --test-name-pattern="LINE quote handoff" test/service-catalog.test.mjs`

Expected: PASS.

- [ ] **Step 5: Connect the LINE action to the quote result**

In `src/components/QuoteAssistant.jsx`:

1. Import `formatLineMessage` from `quoteEngine.js`.
2. Add `line`, `lineCopied`, and `lineCopyFailed` to each locale inside `copyByLocale` using the same wording as Step 3.
3. Add `const [lineCopyStatus, setLineCopyStatus] = useState("");` beside the existing `copied` state.
4. Create the shared message and click handler:

```js
const lineMessage = useMemo(() => {
  if (!quote) return "";
  try {
    return formatLineMessage(quote, localeId);
  } catch {
    return quoteText;
  }
}, [localeId, quote, quoteText]);

const handleLineClick = () => {
  if (!lineMessage) return;
  setLineCopyStatus("");
  copyToClipboard(lineMessage)
    .then(() => setLineCopyStatus("copied"))
    .catch(() => setLineCopyStatus("failed"));
};
```

5. Add this anchor between WhatsApp and Edit, preserving normal navigation even if copying fails:

```jsx
<a
  className="quote-button quote-button--secondary"
  href={contactLinks.line}
  target="_blank"
  rel="noreferrer"
  onClick={handleLineClick}
>
  <MessageCircle size={16} />{ui.line}
</a>
```

6. Add this status immediately after the action group:

```jsx
{lineCopyStatus ? (
  <p className={`quote-line-status quote-line-status--${lineCopyStatus}`} role="status">
    {lineCopyStatus === "copied" ? ui.lineCopied : ui.lineCopyFailed}
  </p>
) : null}
```

- [ ] **Step 6: Add restrained status styling and preserve mobile tap targets**

Add to `src/styles/quote.css`:

```css
.quote-line-status {
  margin: 12px 0 0;
  color: var(--quote-muted);
  font-size: 11px;
  line-height: 1.55;
  text-align: right;
}

.quote-line-status--failed {
  color: #85342e;
}

@media (max-width: 640px) {
  .quote-line-status {
    text-align: left;
  }
}
```

Keep the existing mobile rule that makes every `.quote-button` full width and at least 43 px high.

- [ ] **Step 7: Run focused tests, lint, and build**

Run:

```bash
node --test test/quote-engine.test.mjs test/service-catalog.test.mjs
npm run lint
npm run build
```

Expected: all tests pass, lint exits 0, and Vite reports a successful build.

- [ ] **Step 8: Commit the LINE action**

```bash
git add src/data/translations.js src/components/QuoteAssistant.jsx src/styles/quote.css test/service-catalog.test.mjs
git commit -m "Add LINE quote handoff"
```

---

### Task 3: Formal Traditional Chinese customer copy and Aurora replies

**Files:**
- Modify: `src/data/translations.js`
- Modify: `src/data/suggestions.js`
- Modify: `src/components/QuoteAssistant.jsx` only if the visible `zh-HK` audit finds a spoken phrase
- Modify: `server/quote-ai-handler.mjs`
- Create: `test/formal-traditional-copy.test.mjs`

**Interfaces:**
- Consumes: `translations["zh-HK"]`, `quoteSuggestions`, and `buildSystemInstructions(...)`.
- Produces: formal Traditional Chinese display copy while preserving Cantonese keyword recognition.

- [ ] **Step 1: Write the failing formal-copy tests**

Create `test/formal-traditional-copy.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { buildSystemInstructions } from "../server/quote-ai-handler.mjs";
import { quoteSuggestions } from "../src/data/suggestions.js";
import { pricingCatalog } from "../src/data/pricing.js";
import { translations } from "../src/data/translations.js";

const spokenPhrases = ["幾多錢", "我哋", "點收費", "我唔知", "揀邊個", "幫我揀"];

test("Traditional Chinese display copy uses formal written wording", () => {
  const visibleCopy = JSON.stringify(translations["zh-HK"]);
  const suggestionLabels = quoteSuggestions.map((item) => item.labels["zh-HK"]).join("\n");

  for (const phrase of spokenPhrases) {
    assert.equal(visibleCopy.includes(phrase), false, phrase);
    assert.equal(suggestionLabels.includes(phrase), false, phrase);
  }
});

test("Aurora understands Cantonese but replies in formal Traditional Chinese", () => {
  const instructions = buildSystemInstructions(
    "zh-HK",
    {},
    { status: "incomplete", requiresManualReview: true },
    pricingCatalog,
  );

  assert.match(instructions, /formal written Traditional Chinese/i);
  assert.match(instructions, /Hong Kong Cantonese/);
  assert.doesNotMatch(instructions, /natural Hong Kong Cantonese wording/);
});
```

- [ ] **Step 2: Run the new tests and confirm both failures**

Run: `node --test test/formal-traditional-copy.test.mjs`

Expected: FAIL because visible phrases and the old Cantonese reply instruction remain.

- [ ] **Step 3: Replace customer-visible Cantonese with formal wording**

Make these exact display changes:

```js
// src/data/translations.js
inputPlaceholder: "例如：鑽石升星耀需要多少錢？",
manualNotice: "此訂單需要人工確認，我們可以協助你轉接 WhatsApp 客服。",

// src/data/suggestions.js labels only; keep keywords unchanged
labels: text("排位代打如何收費？", "How is ranked progression priced?", "排位代打如何收费？"),
labels: text("我不確定應該選擇哪項服務", "Help me choose a service", "我不知道应该选择哪项服务"),
```

Review the remaining `zh-HK` display values in `translations.js`, `suggestions.js`, and hard-coded `copyByLocale["zh-HK"]` text. Replace only customer-visible spoken Cantonese; do not remove Cantonese search keywords or recognition aliases.

Run this visible-source audit after the replacements:

```bash
rg -n "幾多錢|我哋|點收費|我唔知|揀邊個|幫我揀" src/App.jsx src/components src/data/content.js src/data/translations.js
```

Expected: no customer-visible match. Cantonese matches may remain only inside search keywords, aliases, and server-side recognition expressions that are deliberately excluded from this command.

- [ ] **Step 4: Require formal Traditional Chinese Aurora replies**

In `server/quote-ai-handler.mjs`, change the `zh-HK` language selection to:

```js
: "formal written Traditional Chinese suitable for Hong Kong and Taiwan readers";
```

Keep the separate instruction that the service understands Hong Kong Cantonese, mixed English, common typos, and incomplete sentences.

- [ ] **Step 5: Run customer-copy and AI handler tests**

Run:

```bash
node --test test/formal-traditional-copy.test.mjs test/quote-ai-handler.test.mjs
```

Expected: all tests pass; mocks are used and no real Gemini request occurs.

- [ ] **Step 6: Commit formal customer copy**

```bash
git add src/data/translations.js src/data/suggestions.js src/components/QuoteAssistant.jsx server/quote-ai-handler.mjs test/formal-traditional-copy.test.mjs
git commit -m "Use formal Traditional Chinese copy"
```

---

### Task 4: Formal Traditional Chinese admin and admin regression

**Files:**
- Modify: `src/AdminApp.jsx`
- Modify: `src/styles/admin.css`
- Modify: `test/formal-traditional-copy.test.mjs`
- Test: `test/admin-backend.test.mjs`

**Interfaces:**
- Consumes: existing `/api/admin/session` and `/api/admin/catalog` contracts.
- Produces: the same admin behavior with formal Traditional Chinese labels, messages, locale formatting, and no database contract changes.

- [ ] **Step 1: Add a failing admin source-copy assertion**

Extend `test/formal-traditional-copy.test.mjs`:

```js
import { readFile } from "node:fs/promises";

test("admin interface uses Traditional Chinese", async () => {
  const source = await readFile(new URL("../src/AdminApp.jsx", import.meta.url), "utf8");
  const simplifiedAdminPhrases = [
    "网站管理后台",
    "管理员密码",
    "安全登录",
    "正在载入",
    "价格与时间管理",
    "发布更新",
    "已上架",
    "已隐藏",
  ];

  for (const phrase of simplifiedAdminPhrases) {
    assert.equal(source.includes(phrase), false, phrase);
  }
  assert.match(source, /網站管理後台/);
  assert.match(source, /價格與時間管理/);
  assert.match(source, /window\.confirm\(/);
});
```

- [ ] **Step 2: Run the admin copy test and confirm failure**

Run: `node --test --test-name-pattern="admin interface" test/formal-traditional-copy.test.mjs`

Expected: FAIL on the current Simplified Chinese admin source.

- [ ] **Step 3: Convert every visible admin string without changing behavior**

In `src/AdminApp.jsx`:

- Convert headings, labels, placeholders, notices, validation errors, save states, service states, and meta text to formal Traditional Chinese.
- Change every admin call from `getGameLabel(..., "zh-CN")` to `getGameLabel(..., "zh-HK")`.
- Change `getCentralServiceLabel(serviceId, "zh-CN")` to `getCentralServiceLabel(serviceId, "zh-HK")`.
- Change date formatting from `toLocaleString("zh-CN")` to `toLocaleString("zh-HK")`.
- Preserve all state fields, API paths, request bodies, revision handling, authentication, and price synchronization logic exactly.
- At the start of `save`, require this explicit confirmation before changing state or sending the request:

```js
if (!window.confirm("確定要發布這次修改嗎？發布後，顧客重新整理網站便會看到最新內容。")) return;
```

Representative required wording:

```jsx
<h1>網站管理後台</h1>
<label htmlFor="admin-password">管理員密碼</label>
安全登入
<h1>價格與時間管理</h1>
{dirty ? "發布更新" : "內容已同步"}
{item.enabled ? "已上架" : "已隱藏"}
```

In `src/styles/admin.css`, change the CJK serif fallback from `"Noto Sans SC"` to `"Noto Sans TC"` in the two existing font-family declarations. Do not change spacing, colors, borders, or layout.

- [ ] **Step 4: Run admin copy and backend tests**

Run:

```bash
node --test test/formal-traditional-copy.test.mjs test/admin-backend.test.mjs
```

Expected: all tests pass; admin persistence and authentication tests remain unchanged.

- [ ] **Step 5: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit the admin wording conversion**

```bash
git add src/AdminApp.jsx src/styles/admin.css test/formal-traditional-copy.test.mjs
git commit -m "Localize admin in Traditional Chinese"
```

---

### Task 5: Full verification, production release, and live checks

**Files:**
- Verify: all files changed in Tasks 1–4
- No SEO or domain files are modified.

**Interfaces:**
- Consumes: the complete local application and existing deployment configuration.
- Produces: verified GitHub Pages frontend and Vercel backend releases.

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all tests pass, lint exits 0, build succeeds, diff check is clean, and only intentional changes are shown.

- [ ] **Step 2: Start the local full preview without calling Gemini**

Run: `npm run preview:full`

Expected: the local site and admin API start successfully. Use only `/api/quote-ai/status`; do not submit a real Gemini chat message.

- [ ] **Step 3: Verify desktop behavior in the browser**

Check at desktop width:

- Manual quote returns the existing approved amount for a configured example.
- Quote result shows Copy, WhatsApp, LINE, and Edit.
- WhatsApp contains the authoritative quote.
- LINE copies the identical message and opens `https://line.me/ti/p/wWXCT-txMc`.
- The success message explains that the customer must paste and send after adding the account.
- Admin login, catalog load, dirty-state warning, save, reload, announcement, service toggle, and price/time fields still work.

Expected: no console errors and no false “sent” confirmation.

- [ ] **Step 4: Verify mobile behavior at 390 CSS pixels**

Check the quote dialog and admin at 390 px width:

- Each result action is full width and at least 43 px high.
- LINE opens correctly and the status text is readable.
- The quote dialog scrolls without locking the page after close.
- Admin fields remain single-column and no horizontal overflow appears.

Expected: no clipped controls or horizontal scrolling.

- [ ] **Step 5: Verify formal language behavior**

Check the default Traditional Chinese site, admin, WhatsApp message, and LINE clipboard message. Submit Cantonese text only to the deterministic suggestion/follow-up path or mocks, not the real Gemini service.

Expected: visible copy and replies are formal Traditional Chinese while Cantonese phrases are still recognized.

- [ ] **Step 6: Push the approved commits and deploy the backend**

Run:

```bash
git push origin main
npx vercel --prod --yes
```

Expected: the main branch push succeeds and Vercel reports a production deployment with the existing Aurora API alias.

- [ ] **Step 7: Wait for GitHub Pages and check production endpoints**

Verify:

- `https://ken0517.github.io/aurora-esports-studio/` returns HTTP 200.
- `https://aurora-esports-api.vercel.app/api/catalog` returns HTTP 200.
- `https://aurora-esports-api.vercel.app/api/quote-ai/status` returns HTTP 200 and `configured: true` without exposing a key.
- The production `/admin` page displays Traditional Chinese and loads the catalog.

Expected: frontend and backend are both live and no secret value appears in responses or logs.

- [ ] **Step 8: Perform a final production browser check**

Repeat one configured manual quote on desktop and mobile. Open WhatsApp and LINE actions without sending messages, then confirm the encoded/copied amount and reference match the on-page quote.

Expected: production behavior matches the local verification and existing approved prices are unchanged.

- [ ] **Step 9: Record release evidence**

Report the automated test count, lint result, build result, frontend and backend HTTP status, LINE fallback behavior, and any item that could not be verified. Do not claim that a LINE message was sent and do not display any key or password.

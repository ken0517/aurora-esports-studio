# Aurora Cookie and Service Data Consent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a multilingual, low-friction privacy experience that blocks analytics until opt-in while replacing the quote/chat checkbox with clear submit-time notice.

**Architecture:** A small versioned consent store owns the customer choice, and a separate runtime adapter applies that choice to Google Analytics and acquisition tracking. One public React controller renders the banner/settings UI on every non-admin route. Quote and chat submissions remain independent of analytics consent and use an inline notice instead of an extra checkbox.

**Tech Stack:** React, Vite, existing CSS system, Google gtag Consent Mode v2, Node test runner, existing Gemini and operations backend.

## Global Constraints

- Necessary storage is always enabled.
- Analytics storage defaults to denied and Google Analytics must not load before opt-in.
- Advertising storage, advertising user data, and advertising personalization always remain denied.
- Rejecting analytics must not block browsing, manual quotes, Aurora support, WhatsApp, or LINE.
- Remove the separate manual quote and Aurora support consent checkboxes.
- Display the service-data notice before the customer submits a quote or sends a message.
- Support `zh-HK`, `zh-CN`, and `en`.
- Do not change pricing, game configuration, visual direction, Gemini model, quote engine, admin authentication, orders, or payment behavior.
- Do not add a third-party consent-management dependency.
- The `/admin` route must not show the public privacy UI or enter public analytics.
- Do Not Track remains authoritative and keeps analytics disabled.

---

## File Structure

**Create**

- `src/data/privacyContent.js` — three-language banner, settings, inline notice, and privacy-policy copy.
- `src/lib/privacyConsent.js` — versioned preference parsing, safe persistence, and UI event helpers.
- `src/lib/privacyRuntime.js` — applies a decision to analytics and acquisition tracking.
- `src/components/PrivacyConsent.jsx` — accessible banner and settings dialog.
- `src/components/PrivacyFooterLinks.jsx` — shared privacy-policy and Cookie-settings footer controls.
- `src/PrivacyPolicyPage.jsx` — three-language privacy page.
- `src/styles/privacy-consent.css` — banner and settings styles.
- `src/styles/privacy-policy.css` — privacy-page styles.
- `test/privacy-consent.test.mjs` — preference model tests.
- `test/privacy-runtime.test.mjs` — analytics/acquisition orchestration tests.
- `test/privacy-ui.test.mjs` — public UI and copy integration tests.

**Modify**

- `src/lib/analytics.js` — explicit enable/disable state, hard event gate, and cookie cleanup.
- `src/lib/acquisition.js` — explicit consent gate and clear function.
- `src/main.jsx` — remove unconditional analytics/acquisition startup.
- `src/RootApp.jsx` — mount privacy controller on public routes and add privacy route.
- `src/lib/publicRoutes.js` — resolve `/privacy/`.
- `src/App.jsx` — footer controls and locale-change notification.
- `src/GameLandingPage.jsx` — footer privacy controls.
- `src/PublicInfoPage.jsx` — footer privacy controls.
- `src/components/QuoteAssistant.jsx` — remove checkbox state and show inline service-data notice.
- `src/styles/quote.css` — style the inline notice and remove checkbox-only rules.
- `server/quote-ai-handler.mjs` — redact sensitive text before Gemini receives messages.
- `scripts/generate-game-landing-pages.mjs` — generate crawlable `/privacy/` output.
- `public/sitemap.xml` — list the public privacy route.
- `test/analytics.test.mjs` — replace the old “load while denied” expectation.
- `test/acquisition.test.mjs` — require opt-in and cover clearing.
- `test/analytics-ui.test.mjs` — assert the controller, not `main.jsx`, starts analytics.
- `test/public-ui.test.mjs` — assert inline notice replaces checkboxes.
- `test/quote-ai-handler.test.mjs` — assert Gemini receives redacted text.
- `test/public-info-pages.test.mjs` — cover privacy routing/static output.
- `test/domain-seo.test.mjs` — cover the privacy canonical and sitemap entry.

---

### Task 1: Versioned Privacy Preference Model

**Files:**
- Create: `src/data/privacyContent.js`
- Create: `src/lib/privacyConsent.js`
- Create: `test/privacy-consent.test.mjs`

**Interfaces:**
- Produces: `PRIVACY_POLICY_VERSION`, `PRIVACY_STORAGE_KEY`
- Produces: `readPrivacyConsent(storage?) -> { version, analytics, decidedAt } | null`
- Produces: `writePrivacyConsent({ analytics }, { storage?, now?, windowObject? }?) -> decision`
- Produces: `openPrivacySettings(windowObject?) -> boolean`
- Produces: `subscribePrivacySettings(callback, windowObject?) -> unsubscribe`
- Produces: `privacyContent[locale]` and `normalizePrivacyLocale(locale)`

- [ ] **Step 1: Write failing preference tests**

Cover valid persistence, corrupt JSON, wrong version, unavailable storage, timestamps, and event dispatch:

```js
test("privacy consent persists only a current versioned analytics choice", () => {
  const storage = memoryStorage();
  const decision = writePrivacyConsent(
    { analytics: true },
    { storage, now: () => new Date("2026-07-29T12:00:00.000Z") },
  );
  assert.deepEqual(readPrivacyConsent(storage), {
    version: PRIVACY_POLICY_VERSION,
    analytics: true,
    decidedAt: "2026-07-29T12:00:00.000Z",
  });
  assert.deepEqual(readPrivacyConsent(storage), decision);
});

test("invalid or previous-version consent is treated as undecided", () => {
  const storage = memoryStorage();
  storage.setItem(PRIVACY_STORAGE_KEY, "{broken");
  assert.equal(readPrivacyConsent(storage), null);
  storage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify({
    version: "previous",
    analytics: true,
    decidedAt: "2026-07-29T12:00:00.000Z",
  }));
  assert.equal(readPrivacyConsent(storage), null);
});
```

- [ ] **Step 2: Run the preference test and verify failure**

Run: `node --test test/privacy-consent.test.mjs`  
Expected: FAIL because `privacyConsent.js` does not exist.

- [ ] **Step 3: Implement the minimal preference model**

Use one non-sensitive first-party record:

```js
export const PRIVACY_POLICY_VERSION = "2026-07-29";
export const PRIVACY_STORAGE_KEY = "aurora:privacy-consent:v1";
export const PRIVACY_CHANGE_EVENT = "aurora:privacy-consent-changed";
export const PRIVACY_SETTINGS_EVENT = "aurora:open-privacy-settings";

export function readPrivacyConsent(storage = safeLocalStorage()) {
  try {
    const value = JSON.parse(storage?.getItem(PRIVACY_STORAGE_KEY) || "null");
    if (
      value?.version !== PRIVACY_POLICY_VERSION ||
      typeof value.analytics !== "boolean" ||
      !Number.isFinite(Date.parse(value.decidedAt))
    ) return null;
    return value;
  } catch {
    return null;
  }
}
```

`writePrivacyConsent` must persist when possible, dispatch the current decision in a `CustomEvent`, and still return an in-memory decision when storage is blocked.

Add `privacyContent` with complete labels for:

- banner title/body
- Accept all / Reject non-essential / Manage settings
- necessary and analytics descriptions
- Save settings / Close
- Privacy notice / Cookie settings
- inline quote/chat notice
- privacy policy headings and body

- [ ] **Step 4: Run preference tests**

Run: `node --test test/privacy-consent.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit the preference model**

```powershell
git add -- src/data/privacyContent.js src/lib/privacyConsent.js test/privacy-consent.test.mjs
git commit -m "feat: add versioned privacy preferences"
```

---

### Task 2: Hard-Gate Analytics and Acquisition

**Files:**
- Create: `src/lib/privacyRuntime.js`
- Create: `test/privacy-runtime.test.mjs`
- Modify: `src/lib/analytics.js`
- Modify: `src/lib/acquisition.js`
- Modify: `src/main.jsx`
- Modify: `test/analytics.test.mjs`
- Modify: `test/acquisition.test.mjs`
- Modify: `test/analytics-ui.test.mjs`

**Interfaces:**
- Consumes: `readPrivacyConsent`
- Produces: `enableAnalytics(measurementId?, harness?) -> boolean`
- Produces: `disableAnalytics(harness?) -> boolean`
- Produces: `clearAnalyticsCookies(harness?) -> number`
- Produces: `captureAcquisitionContext({ ..., consentGranted })`
- Produces: `getAcquisitionContext(storage?, { consentGranted? }?) -> context | null`
- Produces: `clearAcquisitionContext(storage?) -> boolean`
- Produces: `applyPrivacyDecision(decision, runtime?) -> { analyticsEnabled }`

- [ ] **Step 1: Rewrite analytics tests to require opt-in**

Replace the old test that expects the Google script while consent is denied:

```js
test("analytics does not load or queue events before explicit enablement", async () => {
  const { trackEvent } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();
  assert.equal(trackEvent("page_view", { page_path: "/" }, harness), false);
  assert.equal(harness.scripts.length, 0);
  assert.equal(harness.windowObject.dataLayer.length, 0);
});

test("enablement grants analytics only and loads the Google tag once", async () => {
  const { enableAnalytics } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();
  assert.equal(enableAnalytics("G-AURORA123", harness), true);
  const commands = harness.windowObject.dataLayer.map((args) => Array.from(args));
  assert.deepEqual(commands[0].slice(0, 2), ["consent", "default"]);
  assert.equal(commands[0][2].analytics_storage, "denied");
  assert.deepEqual(commands[1].slice(0, 2), ["consent", "update"]);
  assert.equal(commands[1][2].analytics_storage, "granted");
  assert.equal(commands[1][2].ad_storage, "denied");
  assert.equal(harness.scripts.length, 1);
});
```

Add a test showing `disableAnalytics` blocks later events and queues a denied update without exposing an error.

- [ ] **Step 2: Add failing acquisition/runtime tests**

```js
test("acquisition does not write without analytics consent", () => {
  const storage = memoryStorage();
  assert.equal(captureAcquisitionContext({
    locationHref: "https://auroraesportstudio.com/?utm_source=carousell",
    referrer: "",
    storage,
    consentGranted: false,
  }), null);
  assert.equal(getAcquisitionContext(storage), null);
});

test("reject clears acquisition and never starts analytics", () => {
  const calls = [];
  const result = applyPrivacyDecision(
    { analytics: false },
    {
      disableAnalytics: () => calls.push("disable"),
      clearAcquisitionContext: () => calls.push("clear"),
      enableAnalytics: () => calls.push("enable"),
    },
  );
  assert.deepEqual(calls, ["disable", "clear"]);
  assert.equal(result.analyticsEnabled, false);
});
```

- [ ] **Step 3: Run focused tests and verify failure**

Run: `node --test test/analytics.test.mjs test/acquisition.test.mjs test/privacy-runtime.test.mjs test/analytics-ui.test.mjs`  
Expected: FAIL on missing hard-gate APIs and the obsolete startup assertions.

- [ ] **Step 4: Implement analytics enable/disable**

Replace unconditional initialization with explicit enablement:

```js
export function enableAnalytics(measurementId = getConfiguredMeasurementId(), harness = {}) {
  const { windowObject, documentObject } = runtimeObjects(harness);
  if (!isValidMeasurementId(measurementId) || !windowObject || !documentObject) return false;
  if (windowObject.navigator?.doNotTrack === "1") return false;
  ensureGtag(windowObject);
  setDefaultDenied(windowObject);
  windowObject.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  windowObject.__auroraAnalyticsConsent = true;
  loadGoogleTagOnce(measurementId, { windowObject, documentObject });
  return true;
}

export function trackEvent(eventName, parameters = {}, harness = {}) {
  const { windowObject } = runtimeObjects(harness);
  if (windowObject?.__auroraAnalyticsConsent !== true) return false;
  // existing allow-list and sanitization continue here
}
```

`disableAnalytics` sets the flag to false before queuing the denied update. `clearAnalyticsCookies` deletes `_ga` and `_ga_*` cookies for the current host and parent domain where possible.

- [ ] **Step 5: Gate and clear acquisition**

`captureAcquisitionContext` and `getAcquisitionContext` must return `null` unless a current stored decision grants analytics and Do Not Track is off. Tests may pass an explicit `consentGranted` override through the options object. Add:

```js
export function clearAcquisitionContext(storage = safeSessionStorage()) {
  try {
    storage?.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
```

Update the test memory storage with `removeItem`.

- [ ] **Step 6: Implement the privacy runtime**

`applyPrivacyDecision` must:

- skip public tracking when `isAdmin` is true
- respect Do Not Track
- on grant: capture the current acquisition once, enable analytics, and send one current page view
- on reject/revoke: disable analytics, clear GA cookies, and clear acquisition
- never throw into the page

Remove `captureAcquisitionContext`, `initializeAnalytics`, and `trackPageView` calls from `main.jsx`; `main.jsx` should only resolve the route and render `RootApp`.

- [ ] **Step 7: Run focused tests**

Run: `node --test test/analytics.test.mjs test/acquisition.test.mjs test/privacy-runtime.test.mjs test/analytics-ui.test.mjs`  
Expected: PASS.

- [ ] **Step 8: Commit the privacy runtime**

```powershell
git add -- src/lib/analytics.js src/lib/acquisition.js src/lib/privacyRuntime.js src/main.jsx test/analytics.test.mjs test/acquisition.test.mjs test/privacy-runtime.test.mjs test/analytics-ui.test.mjs
git commit -m "feat: gate analytics behind privacy consent"
```

---

### Task 3: Banner and Settings UI on Public Routes

**Files:**
- Create: `src/components/PrivacyConsent.jsx`
- Create: `src/components/PrivacyFooterLinks.jsx`
- Create: `src/styles/privacy-consent.css`
- Create: `test/privacy-ui.test.mjs`
- Modify: `src/RootApp.jsx`
- Modify: `src/App.jsx`
- Modify: `src/GameLandingPage.jsx`
- Modify: `src/PublicInfoPage.jsx`

**Interfaces:**
- Consumes: `privacyContent`, `readPrivacyConsent`, `writePrivacyConsent`
- Consumes: `applyPrivacyDecision`, `openPrivacySettings`, `subscribePrivacySettings`
- Produces: `<PrivacyConsent route={route} />`
- Produces: `<PrivacyFooterLinks locale={locale?} />`

- [ ] **Step 1: Write failing public UI integration tests**

Assert:

```js
assert.match(root, /<PrivacyConsent route=\{route\}/);
assert.match(root, /isAdmin\s*\?\s*<AdminApp/);
assert.match(component, /role="dialog"/);
assert.match(component, /aria-modal="true"/);
assert.match(component, /acceptAll/);
assert.match(component, /rejectNonEssential/);
assert.match(component, /manageSettings/);
assert.match(component, /necessary/);
assert.match(component, /analytics/);
assert.match(css, /@media \(max-width:\s*640px\)/);
assert.match(css, /min-height:\s*44px/);
```

Also assert every public footer contains a privacy link and a Cookie settings button.

- [ ] **Step 2: Run UI tests and verify failure**

Run: `node --test test/privacy-ui.test.mjs`  
Expected: FAIL because the component and styles do not exist.

- [ ] **Step 3: Implement the public controller**

The component owns:

- `decision` from `readPrivacyConsent`
- `bannerVisible` when no current decision exists
- `settingsOpen`
- draft `analytics` toggle
- current locale from `aurora-locale`, with browser-language fallback

On “Accept all” call `writePrivacyConsent({ analytics: true })`.  
On “Reject non-essential” call `writePrivacyConsent({ analytics: false })`.  
On “Save settings” persist the draft choice.  
Every persisted choice is passed to `applyPrivacyDecision`.

The settings dialog must:

- use `role="dialog"` and `aria-modal="true"`
- have a visible heading and description
- return focus to the opener when closed
- close with Escape
- keep the necessary-storage switch visibly on and disabled
- use a real checkbox/switch for analytics

- [ ] **Step 4: Mount only on public routes**

In `RootApp.jsx`, keep the existing lazy pages but render:

```jsx
{isAdmin ? (
  <AdminApp />
) : (
  <>
    {renderPublicRoute(route)}
    <PrivacyConsent route={route} />
  </>
)}
```

Do not include it in the admin branch.

- [ ] **Step 5: Add footer controls and locale notification**

Add the shared `<PrivacyFooterLinks>` control to the home, game, and public-info footers. It renders `/privacy/` and a Cookie-settings button that calls `openPrivacySettings()`.

When `App.jsx` changes `aurora-locale`, dispatch:

```js
window.dispatchEvent(new CustomEvent("aurora:locale-changed", { detail: { locale } }));
```

The privacy controller listens for this event so its copy changes without reloading.

- [ ] **Step 6: Add responsive Aurora styling**

Use existing ivory, charcoal, and muted gold variables. The banner remains above mobile quote controls without covering them, wraps buttons on narrow screens, and gives every action at least 44px height. “Reject non-essential” must not be visually hidden or demoted to an obscure link.

- [ ] **Step 7: Run UI and runtime tests**

Run: `node --test test/privacy-ui.test.mjs test/privacy-consent.test.mjs test/privacy-runtime.test.mjs`  
Expected: PASS.

- [ ] **Step 8: Commit the public privacy UI**

```powershell
git add -- src/components/PrivacyConsent.jsx src/components/PrivacyFooterLinks.jsx src/styles/privacy-consent.css src/RootApp.jsx src/App.jsx src/GameLandingPage.jsx src/PublicInfoPage.jsx test/privacy-ui.test.mjs
git commit -m "feat: add public privacy controls"
```

---

### Task 4: Replace Quote/Chat Checkbox with Submit-Time Notice

**Files:**
- Modify: `src/components/QuoteAssistant.jsx`
- Modify: `src/styles/quote.css`
- Modify: `server/quote-ai-handler.mjs`
- Modify: `test/public-ui.test.mjs`
- Modify: `test/quote-ai-handler.test.mjs`

**Interfaces:**
- Consumes: `privacyContent[locale].serviceDataNotice`
- Consumes: `redactSensitiveText(value) -> string`
- Produces: requests with `consent: true` or `conversationConsent: true` only after an explicit submit/send action

- [ ] **Step 1: Write failing source and server tests**

Update the public UI test:

```js
assert.doesNotMatch(quote, /aurora-data-consent-manual|aurora-data-consent-ai/);
assert.doesNotMatch(quote, /conversationConsent/);
assert.match(quote, /service-data-notice/);
assert.match(quote, /href="\\/privacy\\/"/);
```

Add a Gemini test with a mock that inspects both `params.contents` and `params.config.systemInstruction`:

```js
test("sensitive customer content is redacted before Gemini receives it", async () => {
  // send: "驗證碼 654321，卡號 4111 1111 1111 1111"
  // assert mock contents do not include either number
  // include the same sensitive values in additionalRequirements
  // assert systemInstruction does not include either number
  // assert the redaction marker is present
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --test test/public-ui.test.mjs test/quote-ai-handler.test.mjs`  
Expected: FAIL because the checkbox/state still exists and Gemini receives cleaned-length-only messages.

- [ ] **Step 3: Remove checkbox friction**

In `QuoteAssistant.jsx`:

- remove `conversationConsent` state
- remove both checkbox labels
- remove `consentRequired` blocking logic
- remove consent from AI send-button disabled conditions
- keep active user actions as the submission boundary
- send `consent: true` for manual quote capture
- send `conversationConsent: true` for AI messages
- reset messages/session without resetting a removed consent state

Add the localized notice immediately before the manual submit actions and immediately below the AI composer:

```jsx
<p className="service-data-notice">
  <ShieldCheck size={14} />
  <span>{ui.serviceDataNotice} <a href="/privacy/">{ui.privacyLink}</a></span>
</p>
```

- [ ] **Step 4: Redact before Gemini**

Import `redactSensitiveText` from `operations-model.mjs` and change `cleanMessages` or the post-clean mapping so every user message is redacted before:

- deterministic analysis
- prompt-injection checks
- `toGeminiContents`
- persistence

Apply the same redaction to string values accepted by `cleanQuoteContext`, especially `additionalRequirements`, before the quote context is interpolated into the Gemini system instruction.

Keep role, maximum message count, and maximum length controls unchanged.

- [ ] **Step 5: Run quote and AI tests**

Run: `node --test test/public-ui.test.mjs test/quote-ai-handler.test.mjs test/enquiry-api.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit the low-friction service notice**

```powershell
git add -- src/components/QuoteAssistant.jsx src/styles/quote.css server/quote-ai-handler.mjs test/public-ui.test.mjs test/quote-ai-handler.test.mjs
git commit -m "feat: simplify quote privacy notice"
```

---

### Task 5: Three-Language Privacy Policy

**Files:**
- Create: `src/PrivacyPolicyPage.jsx`
- Create: `src/styles/privacy-policy.css`
- Modify: `src/data/privacyContent.js`
- Modify: `src/lib/publicRoutes.js`
- Modify: `src/RootApp.jsx`
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `public/sitemap.xml`
- Modify: `test/public-info-pages.test.mjs`
- Modify: `test/privacy-ui.test.mjs`
- Modify: `test/domain-seo.test.mjs`

**Interfaces:**
- Consumes: `privacyContent[locale].policy`
- Produces: `resolvePublicRoute("/privacy/") -> { type: "privacy" }`
- Produces: crawlable `dist/privacy/index.html`

- [ ] **Step 1: Write failing route and build tests**

```js
assert.deepEqual(resolvePublicRoute("/privacy/"), { type: "privacy" });
assert.match(root, /lazy\(\(\) => import\("\.\/PrivacyPolicyPage\.jsx"\)\)/);
assert.match(await source("dist/privacy/index.html"), /Aurora Esports Studio/);
assert.match(await source("dist/privacy/index.html"), /Google Analytics/);
assert.match(await source("dist/privacy/index.html"), /Google Gemini/);
assert.match(await source("public/sitemap.xml"), /https:\/\/auroraesportstudio\.com\/privacy\//);
```

The policy copy test must verify all three locale keys and the sections required by the approved design.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test test/public-info-pages.test.mjs test/privacy-ui.test.mjs test/domain-seo.test.mjs`
Expected: FAIL because `/privacy/` is not a route and has no static output.

- [ ] **Step 3: Implement route and page**

`PrivacyPolicyPage` includes:

- Aurora wordmark and return-home link
- `zh-HK`, `en`, `zh-CN` language selector
- last-updated and policy version
- collected-data categories
- necessary storage
- optional analytics and acquisition source
- quote, support, order follow-up
- Google Analytics and Gemini disclosure
- voluntary/required fields and consequences
- retention statement consistent with current operations settings
- access/correction/deletion contact instructions
- Cookie-settings button
- warning not to send credentials/payment/identity data

Changing language writes `aurora-locale` and dispatches `aurora:locale-changed`.

- [ ] **Step 4: Generate static crawler content**

Extend the build script with a focused `renderPrivacyCrawlerContent()` and output `dist/privacy/index.html` with:

- unique title and description
- canonical `https://auroraesportstudio.com/privacy/`
- plain crawlable Traditional Chinese summary
- links back to home and service pages

Add `https://auroraesportstudio.com/privacy/` to `public/sitemap.xml` with a conservative update frequency and no artificial priority claim.

Do not add FAQ structured data unless the page actually renders matching FAQs.

- [ ] **Step 5: Run build and route tests**

Run: `npm run build`  
Expected: successful Vite build and generated `dist/privacy/index.html`.

Run: `node --test test/public-info-pages.test.mjs test/privacy-ui.test.mjs test/domain-seo.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit the privacy policy**

```powershell
git add -- src/PrivacyPolicyPage.jsx src/styles/privacy-policy.css src/data/privacyContent.js src/lib/publicRoutes.js src/RootApp.jsx scripts/generate-game-landing-pages.mjs public/sitemap.xml test/public-info-pages.test.mjs test/privacy-ui.test.mjs test/domain-seo.test.mjs
git commit -m "feat: add multilingual privacy policy"
```

---

### Task 6: Full Automated and Browser Verification

**Files:**
- Modify only if verification exposes a defect in the files above.

**Interfaces:**
- Consumes the complete feature.
- Produces verified desktop/mobile behavior and a clean production build.

- [ ] **Step 1: Run focused privacy suites**

Run:

```powershell
node --test test/privacy-consent.test.mjs test/privacy-runtime.test.mjs test/privacy-ui.test.mjs test/analytics.test.mjs test/acquisition.test.mjs test/analytics-ui.test.mjs test/public-ui.test.mjs test/public-info-pages.test.mjs test/domain-seo.test.mjs test/quote-ai-handler.test.mjs test/enquiry-api.test.mjs
```

Expected: all focused tests pass.

- [ ] **Step 2: Run all automated checks**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: zero failing tests, zero lint warnings/errors, successful production build.

- [ ] **Step 3: Start a local production-like preview**

Run: `npm run preview:full`  
Expected: the local public site and API become reachable without printing secrets.

- [ ] **Step 4: Verify desktop behavior**

In a clean browser context:

1. Open `/`.
2. Confirm the banner appears.
3. Confirm no Google tag request occurs before a choice.
4. Reject non-essential.
5. Generate a manual quote and send an Aurora support message.
6. Confirm both work without a checkbox.
7. Open Cookie settings from the footer and accept analytics.
8. Confirm exactly one Google script loads and one current page view is recorded.
9. Revoke again and confirm later interaction events are blocked.

- [ ] **Step 5: Verify mobile and keyboard behavior**

At 390×844:

- banner text and all three actions fit without horizontal overflow
- actions are at least 44px high
- settings dialog scrolls internally
- Escape closes settings
- focus returns to the opener
- quote modal remains usable
- privacy page language selector works

- [ ] **Step 6: Verify public routes and admin isolation**

Check:

- `/privacy/`
- `/arena-of-valor-boosting/`
- `/honor-of-kings-cn-boosting/`
- `/honor-of-kings-global-boosting/`
- `/klg-studio/`
- `/admin`

Expected: public routes share the controls; `/admin` shows no public banner and sends no public analytics.

- [ ] **Step 7: Review the final diff**

Run:

```powershell
git status --short
git diff --check
git diff --stat HEAD~5
```

Expected: only approved privacy/consent files changed and no whitespace errors.

---

### Task 7: Publish and Verify Production

**Files:**
- No new source files unless production-only verification finds a defect.

**Interfaces:**
- Consumes: tested production build.
- Produces: published public frontend and any required backend update.

- [ ] **Step 1: Push the tested commits**

Run: `git push origin main`  
Expected: push succeeds and the frontend deployment workflow starts.

- [ ] **Step 2: Deploy the backend if the Gemini redaction change is not included automatically**

Use the existing Vercel deployment flow without printing environment values.  
Expected: health/status endpoints remain successful and the configured Gemini model name is unchanged.

- [ ] **Step 3: Inspect deployment status**

Confirm the frontend workflow and Vercel deployment both reach a successful terminal state.

- [ ] **Step 4: Repeat production smoke tests**

Use a fresh browser profile at `https://auroraesportstudio.com/` and verify:

- banner first visit
- accept/reject/manage/revoke
- no GA request before opt-in
- quote and Aurora support work after reject
- three-language privacy page
- mobile layout
- `/admin` isolation

- [ ] **Step 5: Record final evidence**

Report exact automated test totals, lint/build result, public URLs, deployment states, and any limitation that remains. Never claim legal certification or expose environment secrets.

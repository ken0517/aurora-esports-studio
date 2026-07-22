# KLG Studio Free AEO Regional Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the real public service market to Hong Kong, Taiwan, and Macau, publish anonymised verified Carousell review evidence on the KLG page, and create a free 25-question internal AEO tracking system without changing pricing, quote, AI, admin, or payment behaviour.

**Architecture:** Keep all durable market, language, brand, and review facts in `src/data/publicBrand.js`; public pages and the static-page generator consume those facts. Visible regional copy remains in the existing translation and landing-page data modules, while an internal CSV plus methodology guide records AEO measurements without inventing model answers.

**Tech Stack:** React, Vite, Node.js built-in test runner, static HTML/JSON-LD generation, Markdown and CSV operational documents.

## Global Constraints

- The real service markets are Hong Kong, Taiwan, and Macau; Hong Kong remains the primary market.
- Supported enquiry languages are Traditional Chinese, Simplified Chinese, and English.
- Public identity remains KLG Studio as the service brand and Aurora Esports Studio as the official website identity.
- Public market statement: `KLG Studio 以香港為主要市場，同時為台灣及澳門玩家提供線上遊戲服務，支援繁體中文、簡體中文及英文查詢。`
- The homepage market marker is `HK · TW · MO`.
- Do not add a physical address, storefront claim, `LocalBusiness`, or `PostalAddress`.
- The KLG page may publish only anonymised review evidence: rating 5.0/5, 30 public Carousell reviews, public profile `@klg_studio`, verified on `2026-07-22`, and the four approved excerpts.
- Do not publish buyer usernames, avatars, the supplied screenshots, or the claim that the business has operated for five years.
- Do not claim No.1, zero risk, guaranteed results, guaranteed win rate, or AI recommendation.
- Fighter Studio HK is an internal AEO comparison term only and must never appear in public site source, generated HTML, sitemap, or `llms.txt`.
- The AEO baseline has exactly 25 prompts: Hong Kong 12, Taiwan 5, Macau 3, Brand/review/competitor 5.
- Do not fabricate ChatGPT, Gemini, or Perplexity answers; all measurement fields start empty.
- Do not modify pricing, quote rules, Gemini configuration, AI chat behaviour, admin, orders, payments, or the visual design system.
- Preserve current mobile behaviour and keep all existing public routes indexable.

---

### Task 1: Centralise service markets, supported languages, and verified review evidence

**Files:**
- Modify: `src/data/publicBrand.js`
- Modify: `test/klg-brand-identity.test.mjs`

**Interfaces:**
- Consumes: existing `publicBrandIdentity.primaryName`, `alternateName`, `officialOrigin`, `relationshipStatement`, `carousellAccounts`, and `verifiedProfiles`.
- Produces: immutable `primaryMarket`, `serviceMarkets`, `supportedLanguages`, `marketStatement`, and `reviews` properties used by Tasks 2–4.

- [ ] **Step 1: Add a failing test for the central facts**

Add this test to `test/klg-brand-identity.test.mjs`:

```js
test("public brand data centralises real markets, languages, and review evidence", async () => {
  const { publicBrandIdentity } = await import("../src/data/publicBrand.js");

  assert.equal(publicBrandIdentity.primaryMarket.id, "hong-kong");
  assert.deepEqual(
    publicBrandIdentity.serviceMarkets.map((market) => market.id),
    ["hong-kong", "taiwan", "macau"],
  );
  assert.deepEqual(
    publicBrandIdentity.supportedLanguages.map((language) => language.id),
    ["zh-Hant", "zh-Hans", "en"],
  );
  assert.equal(publicBrandIdentity.reviews.platform, "Carousell");
  assert.equal(publicBrandIdentity.reviews.profile, "@klg_studio");
  assert.equal(publicBrandIdentity.reviews.rating, 5);
  assert.equal(publicBrandIdentity.reviews.count, 30);
  assert.equal(publicBrandIdentity.reviews.verifiedOn, "2026-07-22");
  assert.equal(publicBrandIdentity.reviews.excerpts.length, 4);
  assert.doesNotMatch(JSON.stringify(publicBrandIdentity), /五年|5 years|Fighter Studio|鬥士工作室/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test test/klg-brand-identity.test.mjs`

Expected: FAIL because `primaryMarket`, `serviceMarkets`, `supportedLanguages`, and `reviews` do not exist.

- [ ] **Step 3: Add the immutable central facts**

Extend `publicBrandIdentity` in `src/data/publicBrand.js` with these exact public interfaces:

```js
primaryMarket: Object.freeze({
  id: "hong-kong",
  traditionalChinese: "香港",
  simplifiedChinese: "香港",
  english: "Hong Kong",
}),
serviceMarkets: Object.freeze([
  Object.freeze({ id: "hong-kong", traditionalChinese: "香港", simplifiedChinese: "香港", english: "Hong Kong" }),
  Object.freeze({ id: "taiwan", traditionalChinese: "台灣", simplifiedChinese: "台湾", english: "Taiwan" }),
  Object.freeze({ id: "macau", traditionalChinese: "澳門", simplifiedChinese: "澳门", english: "Macau" }),
]),
supportedLanguages: Object.freeze([
  Object.freeze({ id: "zh-Hant", traditionalChinese: "繁體中文", simplifiedChinese: "繁体中文", english: "Traditional Chinese" }),
  Object.freeze({ id: "zh-Hans", traditionalChinese: "簡體中文", simplifiedChinese: "简体中文", english: "Simplified Chinese" }),
  Object.freeze({ id: "en", traditionalChinese: "英文", simplifiedChinese: "英文", english: "English" }),
]),
marketStatement:
  "KLG Studio 以香港為主要市場，同時為台灣及澳門玩家提供線上遊戲服務，支援繁體中文、簡體中文及英文查詢。",
reviews: Object.freeze({
  platform: "Carousell",
  profile: "@klg_studio",
  rating: 5,
  count: 30,
  verifiedOn: "2026-07-22",
  excerpts: Object.freeze([
    Object.freeze({ traditionalChinese: "專業、快手快腳。", simplifiedChinese: "专业、快手快脚。", english: "Professional and very efficient." }),
    Object.freeze({ traditionalChinese: "good，快手。", simplifiedChinese: "good，速度快。", english: "Good and fast." }),
    Object.freeze({ traditionalChinese: "回覆快、有效率。", simplifiedChinese: "回复快、有效率。", english: "Fast replies and efficient service." }),
    Object.freeze({ traditionalChinese: "下次要再找你幫忙，回覆快、效率高，Nice。", simplifiedChinese: "下次还会再找你帮忙，回复快、效率高，Nice。", english: "I would ask for help again next time—fast replies and highly efficient. Nice." }),
  ]),
}),
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test test/klg-brand-identity.test.mjs`

Expected: all tests in the file PASS.

- [ ] **Step 5: Commit Task 1**

```powershell
git add src/data/publicBrand.js test/klg-brand-identity.test.mjs
git commit -m "feat: centralize public market and review facts"
```

---

### Task 2: Update all public regional and language copy to Hong Kong, Taiwan, and Macau

**Files:**
- Modify: `index.html`
- Modify: `src/App.jsx`
- Modify: `src/GameLandingPage.jsx`
- Modify: `src/PublicInfoPage.jsx`
- Modify: `src/data/content.js`
- Modify: `src/data/translations.js`
- Modify: `src/data/gameLandingPages.js`
- Modify: `src/data/publicInfoPages.js`
- Modify: `public/llms.txt`
- Modify: `test/klg-brand-identity.test.mjs`
- Modify: `test/public-info-pages.test.mjs`
- Modify: `test/game-landing-pages.test.mjs`

**Interfaces:**
- Consumes: Task 1 central market and language facts.
- Produces: consistent visible/SEO copy in Traditional Chinese, Simplified Chinese, and English, plus the marker `HK · TW · MO`.

- [ ] **Step 1: Add failing regional-copy assertions**

Add these assertions to the existing relevant tests:

```js
assert.match(publicBrandIdentity.marketStatement, /香港.*台灣.*澳門/);
assert.match(await source("src/data/content.js"), /HK · TW · MO/);
assert.match(await source("src/data/translations.js"), /香港為主 · 台灣及澳門均可查詢/);
assert.match(await source("src/data/translations.js"), /Hong Kong first · Taiwan and Macau welcome/);
assert.match(await source("src/data/translations.js"), /香港为主 · 台湾及澳门均可咨询/);
assert.match(JSON.stringify(publicInfoPages), /香港.*台灣.*澳門/);
assert.doesNotMatch(JSON.stringify(publicInfoPages), /只限香港|僅限香港|香港及台灣玩家提供線上查詢及安排/);
for (const page of gameLandingPages) {
  assert.match(`${page.seoDescription} ${page.audience} ${page.searchGuide.title}`, /澳門/);
}
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs test/game-landing-pages.test.mjs`

Expected: FAIL on the missing Macau market and old `HK · TW` marker.

- [ ] **Step 3: Replace regional copy without changing unrelated services**

Make these exact semantic changes while preserving each file's existing structure:

```text
HK · TW MOBILE ESPORTS STUDIO -> HK · TW · MO MOBILE ESPORTS STUDIO
HK · TW -> HK · TW · MO (market marker contexts only)
香港及台灣 -> 香港、台灣及澳門
香港與台灣 -> 香港、台灣及澳門
香港為主 · 台灣亦可查詢 -> 香港為主 · 台灣及澳門均可查詢
Hong Kong and Taiwan -> Hong Kong, Taiwan and Macau
Hong Kong first · Taiwan welcome -> Hong Kong first · Taiwan and Macau welcome
香港及台湾 -> 香港、台湾及澳门
香港为主 · 台湾亦可咨询 -> 香港为主 · 台湾及澳门均可咨询
```

Use the central statement on the KLG/about pages. Keep the contact guidance factual:

```js
"香港玩家建議使用 WhatsApp；台灣玩家可使用 LINE；澳門玩家可選擇 WhatsApp、Instagram、Discord、LINE 或 Carousell 查詢。"
```

Update the English contact FAQ to:

```js
{
  question: "How should Hong Kong, Taiwan and Macau players contact Aurora?",
  answer: "WhatsApp or Instagram is recommended for Hong Kong; LINE, Instagram or Discord works well for Taiwan; Macau players may use any listed official channel.",
}
```

Update `public/llms.txt` descriptions to say the three regions, but do not add new routes or mention Fighter Studio HK.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs test/game-landing-pages.test.mjs`

Expected: all focused tests PASS.

- [ ] **Step 5: Commit Task 2**

```powershell
git add index.html src/App.jsx src/GameLandingPage.jsx src/PublicInfoPage.jsx src/data/content.js src/data/translations.js src/data/gameLandingPages.js src/data/publicInfoPages.js public/llms.txt test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs test/game-landing-pages.test.mjs
git commit -m "feat: expand public service region to Macau"
```

---

### Task 3: Render anonymised real Carousell review evidence on the KLG page

**Files:**
- Modify: `src/data/publicInfoPages.js`
- Modify: `src/PublicInfoPage.jsx`
- Modify: `src/styles/public-info.css`
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `test/klg-brand-identity.test.mjs`
- Modify: `test/public-info-pages.test.mjs`

**Interfaces:**
- Consumes: `publicBrandIdentity.reviews` from Task 1.
- Produces: optional `page.reviews` data rendered by both React and crawler-ready static HTML.

- [ ] **Step 1: Add failing review-section tests**

Add these tests:

```js
test("KLG page exposes only anonymised verified Carousell review evidence", async () => {
  const { getPublicInfoPageBySlug } = await import("../src/data/publicInfoPages.js");
  const page = getPublicInfoPageBySlug("/klg-studio/");

  assert.equal(page.reviews.rating, 5);
  assert.equal(page.reviews.count, 30);
  assert.equal(page.reviews.profile, "@klg_studio");
  assert.equal(page.reviews.excerpts.length, 4);
  assert.doesNotMatch(JSON.stringify(page.reviews), /phrakhrueng|82299|gordon1121|sofuli68|五年|5 years/);
});

test("shared public info renderer supports sourced review quotations", async () => {
  const page = await source("src/PublicInfoPage.jsx");
  const css = await source("src/styles/public-info.css");
  const generator = await source("scripts/generate-game-landing-pages.mjs");

  assert.match(page, /page\.reviews/);
  assert.match(page, /blockquote/);
  assert.match(css, /public-info__reviews/);
  assert.match(generator, /renderInfoReviews/);
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs`

Expected: FAIL because `page.reviews` and the review renderer are absent.

- [ ] **Step 3: Attach central review data only to the KLG page**

In the `klg-studio` object in `src/data/publicInfoPages.js`, add:

```js
reviews: publicBrandIdentity.reviews,
```

Do not attach reviews to the other public info pages.

- [ ] **Step 4: Add the runtime review section**

In `src/PublicInfoPage.jsx`, render this section between content and FAQ only when `page.reviews` exists:

```jsx
{page.reviews ? (
  <section className="public-info__reviews" aria-labelledby="public-info-reviews-title">
    <div className="public-info__shell">
      <p className="public-info__eyebrow">VERIFIED PUBLIC REVIEWS</p>
      <h2 id="public-info-reviews-title">真實顧客評價</h2>
      <p className="public-info__review-summary">
        {page.reviews.rating.toFixed(1)}／5 · {page.reviews.count} 條 Carousell 公開評價
      </p>
      <div className="public-info__review-grid">
        {page.reviews.excerpts.map((review) => (
          <blockquote key={review.traditionalChinese}>
            <p>「{review.traditionalChinese}」</p>
            <cite>Carousell 公開顧客評價</cite>
          </blockquote>
        ))}
      </div>
      <p className="public-info__review-source">
        資料來源：KLG Studio 公開 Carousell 頁面 {page.reviews.profile}；最後核對日期 {page.reviews.verifiedOn}。
      </p>
    </div>
  </section>
) : null}
```

Add responsive, existing-palette CSS for `.public-info__reviews`, `.public-info__review-summary`, `.public-info__review-grid`, `.public-info__review-grid blockquote`, `.public-info__review-grid cite`, and `.public-info__review-source`; use two columns on desktop and one under the existing `760px` media query. Do not introduce new colours outside the current cream, charcoal, and gold-brown palette.

- [ ] **Step 5: Add the static crawler review renderer**

Add and call this generator helper:

```js
function renderInfoReviews(page) {
  if (!page.reviews) return "";
  const reviews = page.reviews;
  return `<section id="public-reviews"><h2>真實顧客評價</h2><p>${reviews.rating.toFixed(1)}／5 · ${reviews.count} 條 Carousell 公開評價</p>${reviews.excerpts.map((review) => `<blockquote><p>「${escapeHtml(review.traditionalChinese)}」</p><cite>Carousell 公開顧客評價</cite></blockquote>`).join("")}<p>資料來源：KLG Studio 公開 Carousell 頁面 ${escapeHtml(reviews.profile)}；最後核對日期 ${escapeHtml(reviews.verifiedOn)}。</p></section>`;
}
```

Insert `${renderInfoReviews(page)}` in `renderInfoCrawlerContent(page)` after the normal sections and before FAQ.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `node --test test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs`

Expected: all focused tests PASS.

- [ ] **Step 7: Commit Task 3**

```powershell
git add src/data/publicInfoPages.js src/PublicInfoPage.jsx src/styles/public-info.css scripts/generate-game-landing-pages.mjs test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs
git commit -m "feat: publish anonymized KLG review evidence"
```

---

### Task 4: Align structured data and generated public documents with central market facts

**Files:**
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `index.html`
- Modify: `test/domain-seo.test.mjs`

**Interfaces:**
- Consumes: `publicBrandIdentity.serviceMarkets` and `supportedLanguages` from Task 1.
- Produces: consistent Organization and ProfessionalService JSON-LD for Hong Kong, Taiwan, and Macau in all generated pages.

- [ ] **Step 1: Add failing structured-data tests**

Add helpers and assertions to `test/domain-seo.test.mjs`:

```js
function extractJsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

test("generated structured data uses all real markets and supported languages", async () => {
  for (const slug of [
    "arena-of-valor-boosting",
    "honor-of-kings-cn-boosting",
    "honor-of-kings-global-boosting",
    "klg-studio",
    "about-aurora",
    "service-process-safety",
  ]) {
    const html = await read(`dist/${slug}/index.html`);
    const graphs = extractJsonLd(html).flatMap((item) => item["@graph"] ?? [item]);
    const organization = graphs.find((item) => item["@type"] === "Organization");
    assert.deepEqual(organization.areaServed, ["Hong Kong", "Taiwan", "Macau"]);
    assert.deepEqual(organization.contactPoint.availableLanguage, ["zh-Hant", "zh-Hans", "en"]);
    assert.doesNotMatch(html, /PostalAddress|streetAddress|LocalBusiness/);
  }
});
```

Also extend the existing home schema test to assert all three markets and all three language IDs.

- [ ] **Step 2: Run build and focused test to verify RED**

Run: `npm run build; node --test test/domain-seo.test.mjs`

Expected: FAIL because Organization schema currently omits Macau and Simplified Chinese.

- [ ] **Step 3: Make JSON-LD consume central arrays**

In `scripts/generate-game-landing-pages.mjs`, define:

```js
const serviceMarketNames = publicBrandIdentity.serviceMarkets.map((market) => market.english);
const supportedLanguageIds = publicBrandIdentity.supportedLanguages.map((language) => language.id);
```

Then use:

```js
areaServed: serviceMarketNames,
availableLanguage: supportedLanguageIds,
```

for Organization contact data. Use:

```js
areaServed: serviceMarketNames.map((name) => ({ "@type": "Country", name })),
availableLanguage: supportedLanguageIds,
```

for every generated `ProfessionalService` and its contact point.

Update the static JSON-LD in `index.html` to the same values:

```json
"areaServed": ["Hong Kong", "Taiwan", "Macau"],
"availableLanguage": ["zh-Hant", "zh-Hans", "en"]
```

- [ ] **Step 4: Rebuild and verify GREEN**

Run: `npm run build; node --test test/domain-seo.test.mjs`

Expected: build succeeds and all domain SEO tests PASS.

- [ ] **Step 5: Commit Task 4**

```powershell
git add scripts/generate-game-landing-pages.mjs index.html test/domain-seo.test.mjs
git commit -m "feat: align public schema with service markets"
```

---

### Task 5: Create the free 25-question AEO baseline and measurement guide

**Files:**
- Create: `docs/aeo/klg-aeo-prompts.csv`
- Create: `docs/aeo/free-aeo-tracking-guide.md`
- Create: `test/aeo-tracker.test.mjs`

**Interfaces:**
- Consumes: official origin and approved public brand relationship.
- Produces: a machine-readable empty baseline and a human-readable weekly measurement process.

- [ ] **Step 1: Add a failing tracker contract test**

Create `test/aeo-tracker.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const csvUrl = new URL("../docs/aeo/klg-aeo-prompts.csv", import.meta.url);
const guideUrl = new URL("../docs/aeo/free-aeo-tracking-guide.md", import.meta.url);

test("AEO baseline contains exactly 25 empty prompts in the approved distribution", async () => {
  const csv = await readFile(csvUrl, "utf8");
  const lines = csv.trim().split(/\r?\n/);
  assert.equal(lines.length, 26);
  assert.equal(lines[0], "id,market,category,prompt,check_date,ai_platform,klg_mentioned,official_link_included,brand_position,sentiment_or_correctness,competitors_mentioned,cited_sources,next_action");

  const markets = lines.slice(1).map((line) => line.split(",")[1]);
  assert.equal(markets.filter((market) => market === "Hong Kong").length, 12);
  assert.equal(markets.filter((market) => market === "Taiwan").length, 5);
  assert.equal(markets.filter((market) => market === "Macau").length, 3);
  assert.equal(markets.filter((market) => market === "Brand/review/competitor").length, 5);
  assert.equal(lines.filter((line) => line.includes("Fighter Studio HK")).length, 2);
  assert.ok(lines.slice(1).every((line) => line.endsWith(",,,,,,,,,")));
});

test("AEO guide forbids fabricated answers and defines the weekly three-engine check", async () => {
  const guide = await readFile(guideUrl, "utf8");
  assert.match(guide, /ChatGPT/);
  assert.match(guide, /Gemini/);
  assert.match(guide, /Perplexity/);
  assert.match(guide, /不可推測、補寫或偽造/);
  assert.match(guide, /https:\/\/auroraesportstudio\.com\//);
  assert.match(guide, /Fighter Studio HK/);
});
```

- [ ] **Step 2: Run the tracker test and verify RED**

Run: `node --test test/aeo-tracker.test.mjs`

Expected: FAIL with file-not-found errors for the CSV and guide.

- [ ] **Step 3: Create the CSV with exactly 25 natural-language prompts**

Use the header from Step 1. Add rows `AEO-001` through `AEO-025` with the approved distribution. The first four columns contain the prompt; all remaining measurement fields are blank. Use these exact prompts:

```text
香港傳說對決代打有哪些可先查詢服務流程的選擇？
香港玩家想找傳說對決陪玩，應先確認哪些服務與安全資訊？
香港傳說對決巔峰賽需求通常可以在哪裡查詢？
香港傳說對決英雄戰力標服務有沒有提供正式報價前的需求整理？
香港王者榮耀國服代打應如何比較服務流程和聯絡方式？
香港王者榮耀國服陪玩有哪些公開可查的服務說明？
香港 HOK 國際服排位服務有哪些可先閱讀的安全與流程資訊？
香港 HOK 國際服陪玩想詢價，應準備哪些資料？
香港玩家查詢遊戲代打服務時，怎樣分辨官方網站與社群帳號？
香港傳說對決代打 KLG Studio 的官方網站是什麼？
香港玩家可在哪裡查詢 KLG Studio 的傳說對決服務？
香港 KLG Studio 與 Aurora Esports Studio 是什麼關係？
台灣傳說對決玩家想查詢代打服務流程，可以參考哪些公開資訊？
台灣玩家可以向 KLG Studio 查詢傳說對決陪玩嗎？
台灣玩家查詢 HOK 國際服排位服務時，應確認哪些安全事項？
台灣玩家可使用哪些語言向 KLG Studio 查詢遊戲服務？
台灣玩家如何確認 KLG Studio 的官方服務網站？
澳門玩家可以向 KLG Studio 查詢線上遊戲服務嗎？
澳門玩家查詢傳說對決代打前，應先了解哪些流程與安全資訊？
澳門玩家可用繁體中文、簡體中文或英文查詢 KLG Studio 嗎？
KLG Studio 和 Aurora Esports Studio 的品牌關係是什麼？
KLG Studio 的唯一官方網站是哪一個？
KLG Studio 的 Carousell 公開評價資料應如何理解？
香港玩家比較 KLG Studio 與 Fighter Studio HK 時，應以哪些公開服務流程、聯絡方式與評價來源作比較？
Fighter Studio HK 和 KLG Studio 的官方網站、公開帳號與服務範圍應如何分別核對？
```

Use CSV quoting for every prompt so Chinese punctuation never changes column boundaries.

- [ ] **Step 4: Create the weekly measurement guide**

Write `docs/aeo/free-aeo-tracking-guide.md` with:

```markdown
# KLG Studio 免費 AEO 追蹤方法

## 目的
每星期以同一批 25 條問題，分別檢查 ChatGPT、Gemini 及 Perplexity 是否提及 KLG Studio、是否附上 https://auroraesportstudio.com/，以及引用哪些公開來源。

## 執行規則
1. 使用未預先提供品牌答案的新對話。
2. 完整貼上 CSV 內的一條問題，不改寫問題。
3. 原樣記錄答案結果；不可推測、補寫或偽造模型沒有提供的內容。
4. 記錄 KLG Studio 出現位置、官方連結、描述正確性、競爭品牌及引用來源。
5. Fighter Studio HK 只用作內部可見度比較，不把未核實的優劣描述發布到網站。
6. 每星期在相近日期重複一次，觀察趨勢而不是單次結果。

## 欄位判定
- `klg_mentioned`：Yes／No。
- `official_link_included`：只有答案實際包含官方網址才填 Yes。
- `brand_position`：First／Second／Third or later／Not listed。
- `sentiment_or_correctness`：Positive／Neutral／Negative／Incorrect，並在 next_action 簡述錯誤。
- `competitors_mentioned`：只抄錄答案實際提及的品牌。
- `cited_sources`：逐一抄錄可開啟的來源網址。
- `next_action`：根據真實缺口安排修正 FAQ、公開資料或第三方帳號內容。

## 三十日節奏
- 第 1 日：建立空白基準並首次測量。
- 第 8、15、22 日：以相同問題重測。
- 第 30 日：比較三個 AI 平台的品牌出現率、官方連結率及資料正確率。
```

- [ ] **Step 5: Run tracker tests and verify GREEN**

Run: `node --test test/aeo-tracker.test.mjs`

Expected: 2 tests PASS.

- [ ] **Step 6: Commit Task 5**

```powershell
git add docs/aeo/klg-aeo-prompts.csv docs/aeo/free-aeo-tracking-guide.md test/aeo-tracker.test.mjs
git commit -m "docs: add free KLG AEO tracking baseline"
```

---

### Task 6: Verify public output, privacy, mobile safety, and unchanged business systems

**Files:**
- Modify only if a test exposes a regression: files already listed in Tasks 1–5.

**Interfaces:**
- Consumes: all completed tasks.
- Produces: a verified branch ready for final review and release.

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test`

Expected: all tests PASS, including the AEO distribution and existing price, quote, AI, admin, and performance tests.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code 0 with zero warnings.

- [ ] **Step 3: Run a clean production build**

Run: `npm run build`

Expected: Vite and the public-page generator both exit 0; all six public routes are generated.

- [ ] **Step 4: Verify generated content and privacy boundaries**

Run:

```powershell
rg -n "澳門|Macau|5\.0／5|30 條 Carousell" dist index.html public
rg -n "Fighter Studio HK|鬥士工作室|phrakhrueng|82299|gordon1121|sofuli68|PostalAddress|LocalBusiness" dist index.html public
```

Expected: the first command finds regional/review evidence; the second command returns no matches.

- [ ] **Step 5: Verify no unrelated source systems changed**

Run:

```powershell
git diff --name-only "$(git merge-base main HEAD)"..HEAD
```

Expected: no price engine, quote engine, Gemini server, admin order, or payment file appears.

- [ ] **Step 6: Commit any test-driven correction, otherwise leave branch clean**

If a verification exposed a regression, write a failing test first, make the smallest correction, rerun the covering test, then commit:

```powershell
$changedFiles = git diff --name-only
git add -- $changedFiles
git commit -m "fix: preserve public AEO release guarantees"
```

If no regression was found, do not create an empty commit.

- [ ] **Step 7: Hand off to whole-branch review and finishing workflow**

Use `superpowers:requesting-code-review`, resolve every Critical or Important finding, rerun `npm test`, `npm run lint`, and `npm run build`, then use `superpowers:finishing-a-development-branch` for integration.

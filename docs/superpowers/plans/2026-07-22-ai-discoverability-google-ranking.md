# Aurora AI Discoverability and Google Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Aurora Esports Studio easier for Google, ChatGPT Search, and other public web readers to crawl, understand, cite, and connect to a consistent online-only Hong Kong/Taiwan brand.

**Architecture:** Keep the existing React/Vite site and GitHub Pages deployment. Add two data-driven public trust pages, route them through the existing root router, and expand the current build-time landing-page generator so every important route includes readable HTML before JavaScript runs. Strengthen crawler directives, sitemap coverage, public brand schema, internal links, and measurement documentation without changing quotes, pricing, AI chat, admin, or customer data.

**Tech Stack:** React, Vite, Node.js ESM build scripts, Node test runner, JSON-LD/schema.org, GitHub Pages, Google Analytics 4, Google Search Console.

## Global Constraints

- Public positioning: `Aurora Esports Studio 是服務香港及台灣玩家的線上遊戲服務工作室，不設實體門市。`
- All new customer-facing copy uses formal Traditional Chinese, not Cantonese slang.
- Do not publish a physical address or invent registration, awards, customer counts, win rates, years in business, or guaranteed results.
- Do not change pricing, quote calculations, Gemini configuration, AI chat behavior, admin behavior, WhatsApp, LINE, or customer records.
- Keep `/admin` and `/api/` out of public crawler access and out of every sitemap or AI-readable index.
- `llms.txt` is experimental assistance only and must not claim guaranteed ChatGPT inclusion.
- Avoid keyword stuffing, hidden text, doorway pages, purchased links, fake reviews, and copied competitor content.
- Only verified public profile URLs may appear in `sameAs`.
- Every implementation task follows test-driven development and ends with a focused commit.

---

## File Structure

### New files

- `src/data/publicInfoPages.js` — one editable source for About Aurora and Service Process/Safety page copy and metadata.
- `src/PublicInfoPage.jsx` — shared React renderer for the two trust pages.
- `src/styles/public-info.css` — responsive styles limited to public trust pages.
- `public/llms.txt` — concise experimental public index for AI readers.
- `test/public-info-pages.test.mjs` — source, routing, UI, copy, and schema assertions for trust pages.
- `docs/search-discovery-monitoring.md` — 30-day Search Console, ChatGPT referral, and public-profile update checklist.

### Modified files

- `src/lib/publicRoutes.js` — resolves the two new clean public routes.
- `src/RootApp.jsx` — lazy-loads `PublicInfoPage` without increasing homepage initial JavaScript.
- `src/GameLandingPage.jsx` — adds natural About and Service/Safety internal links.
- `src/App.jsx` — adds the same two public trust links to the homepage footer.
- `scripts/generate-game-landing-pages.mjs` — generates readable pre-JavaScript HTML and metadata for game and trust pages.
- `index.html` — adds readable homepage fallback content and shared Organization/WebSite structured data.
- `public/robots.txt` — explicitly allows OAI-SearchBot, ChatGPT-User, Googlebot, and general public crawlers while preserving private-path exclusions.
- `public/sitemap.xml` — adds trust pages and truthful `lastmod` dates.
- `package.json` — no new dependency; build command stays stable unless the generator name changes during implementation.
- `test/domain-seo.test.mjs` — asserts crawler groups, sitemap, llms index, homepage schema, and generated route coverage.
- `test/game-landing-pages.test.mjs` — asserts readable crawler fallback and new internal trust links.

---

### Task 1: Central Public Brand and Trust-Page Data

**Files:**
- Create: `src/data/publicInfoPages.js`
- Create: `test/public-info-pages.test.mjs`

**Interfaces:**
- Produces: `publicInfoPages: ReadonlyArray<PublicInfoPage>`.
- Produces: `getPublicInfoPageBySlug(slug: string): PublicInfoPage | null`.
- `PublicInfoPage` shape: `{ slug, canonical, seoTitle, seoDescription, eyebrow, title, intro, sections, faqs }`.
- `sections` shape: `{ id, title, body: string[], points?: string[] }`.

- [ ] **Step 1: Write the failing data contract test**

```js
import assert from "node:assert/strict";
import test from "node:test";

test("public trust pages use unique indexable routes and formal Traditional Chinese", async () => {
  const { publicInfoPages, getPublicInfoPageBySlug } = await import("../src/data/publicInfoPages.js");
  assert.deepEqual(publicInfoPages.map((page) => page.slug), [
    "about-aurora",
    "service-process-safety",
  ]);
  assert.equal(getPublicInfoPageBySlug("/about-aurora/")?.title, "關於 Aurora Esports Studio");
  assert.match(publicInfoPages[0].intro, /線上遊戲服務工作室/);
  assert.match(publicInfoPages[0].intro, /不設實體門市/);
  assert.match(publicInfoPages[1].title, /服務流程與安全說明/);
  assert.doesNotMatch(JSON.stringify(publicInfoPages), /全港第一|零風險|保證上分|門市地址/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/public-info-pages.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/publicInfoPages.js`.

- [ ] **Step 3: Create the central page data**

Create `src/data/publicInfoPages.js` with two frozen records. Use these exact headings and claims:

```js
const officialOrigin = "https://auroraesportstudio.com";

export const publicInfoPages = Object.freeze([
  {
    slug: "about-aurora",
    canonical: `${officialOrigin}/about-aurora/`,
    seoTitle: "關於 Aurora Esports Studio｜香港及台灣線上遊戲服務",
    seoDescription: "認識 Aurora Esports Studio：服務香港及台灣玩家的線上遊戲服務工作室，提供傳說對決、王者榮耀國服及 HOK 國際服查詢。",
    eyebrow: "ABOUT AURORA",
    title: "關於 Aurora Esports Studio",
    intro: "Aurora Esports Studio 是服務香港及台灣玩家的線上遊戲服務工作室，不設實體門市。網站提供清楚的遊戲資料、報價流程與客服聯絡方式。",
    sections: [
      {
        id: "games",
        title: "專注三款手機 MOBA 遊戲",
        body: ["目前支援《傳說對決》、《王者榮耀》國服，以及 Honor of Kings《王者榮耀》國際服。每款遊戲使用獨立段位、分路、星數及英雄戰力標資料。"],
        points: ["傳說對決", "王者榮耀國服", "HOK／王者榮耀國際服"],
      },
      {
        id: "services",
        title: "先整理需要，再確認安排",
        body: ["玩家可以使用手動報價表或 Aurora 客服整理排位、陪玩、巔峰賽、英雄戰力標及教學需求。已設定價格的項目會顯示暫估金額，其他項目由真人客服確認。"],
      },
      {
        id: "contact",
        title: "香港與台灣均可使用",
        body: ["香港玩家建議使用 WhatsApp；台灣玩家可使用 LINE。Instagram、Discord 及 Carousell 亦可用作公開聯絡與品牌資料核對。"],
      },
    ],
    faqs: [
      { question: "Aurora 是否設有實體門市？", answer: "沒有。Aurora 是線上遊戲服務工作室，所有查詢及安排均透過網站與已列明的官方聯絡渠道進行。" },
      { question: "Aurora 是否屬於遊戲官方網站？", answer: "不是。所有遊戲名稱及商標均屬其各自權利人所有，Aurora 並非遊戲官方合作網站。" },
    ],
  },
  {
    slug: "service-process-safety",
    canonical: `${officialOrigin}/service-process-safety/`,
    seoTitle: "服務流程與安全說明｜Aurora Esports Studio",
    seoDescription: "了解 Aurora 的查詢、報價、確認、安排、改期、私隱與資料安全原則，以及需要真人客服確認的情況。",
    eyebrow: "PROCESS · PRIVACY · SAFETY",
    title: "服務流程與安全說明",
    intro: "由查詢到安排，每一步先把資料及限制說明清楚。網站不會要求顧客把密碼、驗證碼、付款資料或身份證明交給 AI 客服。",
    sections: [
      { id: "inquiry", title: "一、整理查詢資料", body: ["先選擇遊戲及服務，再填寫段位、目標、英雄、分路、數量或其他適用資料。非必填項目可以留空。"] },
      { id: "quote", title: "二、確認報價狀態", body: ["正式金额只來自 Aurora 已確認的中央價格資料。無法自動計算的項目會顯示待人工確認，不會由 AI 自行創作金額。"] },
      { id: "arrangement", title: "三、聯絡及安排", body: ["完成資料整理後，可使用 WhatsApp 或 LINE 與真人客服確認服務內容、時間及其他條件。"] },
      { id: "privacy", title: "四、保護敏感資料", body: ["不要在 AI 對話、公開留言或未核實的聯絡渠道傳送帳號密碼、驗證碼、完整付款資料或身份證明。"] },
      { id: "changes", title: "五、改期與特殊要求", body: ["改期、取消、急單及特殊要求以客服在私人對話內確認的內容為準。網站不會把未確認條款顯示成正式承諾。"] },
    ],
    faqs: [
      { question: "網站顯示的金額是否為最終價格？", answer: "自動金额屬暫估報價，最終服務內容及價格以 WhatsApp 或 LINE 客服確認為準。" },
      { question: "AI 客服可以要求密碼或驗證碼嗎？", answer: "不可以。請勿在 AI 對話中傳送帳號密碼、驗證碼、付款資料或身份證明。" },
    ],
  },
]);

export function getPublicInfoPageBySlug(slug) {
  const clean = String(slug || "").replace(/^\/+|\/+$/g, "");
  return publicInfoPages.find((page) => page.slug === clean) ?? null;
}
```

- [ ] **Step 4: Run the focused test**

Run: `node --test test/public-info-pages.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the data contract**

```bash
git add src/data/publicInfoPages.js test/public-info-pages.test.mjs
git commit -m "feat: add public Aurora trust page data"
```

---

### Task 2: Public Trust Routes and Responsive React Page

**Files:**
- Modify: `src/lib/publicRoutes.js`
- Modify: `src/RootApp.jsx`
- Create: `src/PublicInfoPage.jsx`
- Create: `src/styles/public-info.css`
- Modify: `src/GameLandingPage.jsx`
- Modify: `src/App.jsx`
- Modify: `test/public-info-pages.test.mjs`
- Modify: `test/game-landing-pages.test.mjs`

**Interfaces:**
- Consumes: `getPublicInfoPageBySlug(slug)` from Task 1.
- Produces: route `{ type: "info", slug: string }`.
- Produces: `PublicInfoPage({ slug })`.
- Existing game and home routes remain unchanged.

- [ ] **Step 1: Add failing route and UI assertions**

Append to `test/public-info-pages.test.mjs`:

```js
test("public trust routes lazy-load one shared responsive page", async () => {
  const { resolvePublicRoute } = await import("../src/lib/publicRoutes.js");
  assert.deepEqual(resolvePublicRoute("/about-aurora/"), { type: "info", slug: "about-aurora" });
  assert.deepEqual(resolvePublicRoute("/service-process-safety/"), { type: "info", slug: "service-process-safety" });

  const [root, page, css] = await Promise.all([
    readFile(new URL("../src/RootApp.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/PublicInfoPage.jsx", import.meta.url), "utf8").catch(() => ""),
    readFile(new URL("../src/styles/public-info.css", import.meta.url), "utf8").catch(() => ""),
  ]);
  assert.match(root, /lazy\(\(\) => import\("\.\/PublicInfoPage\.jsx"\)\)/);
  assert.match(root, /route\.type === "info"/);
  assert.match(page, /getPublicInfoPageBySlug/);
  assert.match(page, /page\.sections\.map/);
  assert.match(page, /page\.faqs\.map/);
  assert.match(css, /@media \(max-width: 760px\)/);
});
```

Append to `test/game-landing-pages.test.mjs`:

```js
test("home and game pages link to public Aurora trust pages", async () => {
  const [home, game] = await Promise.all([source("src/App.jsx"), source("src/GameLandingPage.jsx")]);
  for (const path of ["/about-aurora/", "/service-process-safety/"]) {
    assert.match(home, new RegExp(path.replaceAll("/", "\\/")));
    assert.match(game, new RegExp(path.replaceAll("/", "\\/")));
  }
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --test test/public-info-pages.test.mjs test/game-landing-pages.test.mjs`

Expected: FAIL because routes, component, styles, and links do not exist.

- [ ] **Step 3: Add the route and lazy boundary**

Modify `src/lib/publicRoutes.js`:

```js
import { getPublicInfoPageBySlug } from "../data/publicInfoPages.js";

// After the admin check and before the game check:
const infoPage = getPublicInfoPageBySlug(cleanPath);
if (infoPage) return { type: "info", slug: infoPage.slug };
```

Modify `src/RootApp.jsx`:

```jsx
const PublicInfoPage = lazy(() => import("./PublicInfoPage.jsx"));

// Inside the existing non-admin branch, before the home fallback:
: route.type === "info"
  ? <PublicInfoPage slug={route.slug} />
```

- [ ] **Step 4: Create the shared page component**

Create `src/PublicInfoPage.jsx` with:

```jsx
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { contactLinks } from "./data/content.js";
import { getPublicInfoPageBySlug } from "./data/publicInfoPages.js";
import { trackContactClick } from "./lib/analytics.js";
import "./styles/public-info.css";

function updateMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function PublicInfoPage({ slug }) {
  const page = getPublicInfoPageBySlug(slug);

  useEffect(() => {
    if (!page) return;
    document.title = page.seoTitle;
    updateMeta('meta[name="description"]', "content", page.seoDescription);
    updateMeta('link[rel="canonical"]', "href", page.canonical);
    updateMeta('meta[property="og:title"]', "content", page.seoTitle);
    updateMeta('meta[property="og:description"]', "content", page.seoDescription);
    updateMeta('meta[property="og:url"]', "content", page.canonical);
  }, [page]);

  if (!page) return null;

  return (
    <div className="public-info">
      <header className="public-info__header">
        <a href="/" className="public-info__brand"><span aria-hidden="true">A</span><strong>Aurora Esports Studio</strong></a>
        <nav aria-label="公開資料頁導覽">
          <a href="/about-aurora/">關於 Aurora</a>
          <a href="/service-process-safety/">流程與安全</a>
          <a href="/#games">遊戲服務</a>
        </nav>
      </header>
      <main>
        <section className="public-info__hero">
          <div className="public-info__shell">
            <a href="/" className="public-info__back"><ArrowLeft size={16} />返回首頁</a>
            <p className="public-info__eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
          </div>
        </section>
        <section className="public-info__content">
          <div className="public-info__shell public-info__sections">
            {page.sections.map((section, index) => (
              <article id={section.id} key={section.id}>
                <span>0{index + 1}</span><h2>{section.title}</h2>
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.points?.length ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}
              </article>
            ))}
          </div>
        </section>
        <section className="public-info__faq" aria-labelledby="public-info-faq-title">
          <div className="public-info__shell public-info__faq-layout">
            <div><p className="public-info__eyebrow">FREQUENTLY ASKED</p><h2 id="public-info-faq-title">常見問題</h2></div>
            <div>{page.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
          </div>
        </section>
        <section className="public-info__cta">
          <div className="public-info__shell"><ShieldCheck aria-hidden="true" /><h2>先整理資料，再由 Aurora 客服確認。</h2><p>香港玩家可使用 WhatsApp；台灣玩家可使用 LINE。</p><div><a href="/#ai-quote">填寫報價表 <ArrowRight size={16} /></a><a href={contactLinks.whatsapp} target="_blank" rel="noreferrer" onClick={() => trackContactClick("whatsapp")}><MessageCircle size={16} />WhatsApp</a></div></div>
        </section>
      </main>
      <footer className="public-info__footer"><a href="/">Aurora Esports Studio</a><span>香港及台灣線上遊戲服務工作室</span></footer>
    </div>
  );
}
```

- [ ] **Step 5: Create responsive styles using existing editorial tokens**

Create `src/styles/public-info.css`. It must define only `.public-info*` selectors, use ivory/charcoal/muted-gold colors from the existing game landing page, keep a two-column desktop layout and single-column mobile layout, and include these exact interaction rules:

```css
.public-info { min-height: 100vh; background: #f4efe5; color: #1c1a17; font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif; }
.public-info * { box-sizing: border-box; }
.public-info a { color: inherit; text-decoration: none; }
.public-info__shell { width: min(1120px, calc(100% - 64px)); margin: 0 auto; }
.public-info__header { display: flex; align-items: center; justify-content: space-between; min-height: 78px; padding: 0 4vw; border-bottom: 1px solid rgba(73,58,39,.18); background: #fbf8f1; }
.public-info__brand { display: flex; align-items: center; gap: 12px; font-family: Georgia, serif; letter-spacing: .13em; }
.public-info__brand span { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid #a87a3e; border-radius: 50%; }
.public-info__header nav { display: flex; gap: 26px; font-size: 13px; }
.public-info__hero { padding: 112px 0 96px; background: #211d17; color: #f7f1e7; }
.public-info__back { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 48px; font-size: 12px; opacity: .75; }
.public-info__eyebrow { color: #c59a61; font-size: 11px; font-weight: 700; letter-spacing: .22em; }
.public-info__hero h1, .public-info h2 { font-family: Georgia, "Noto Serif TC", serif; font-weight: 400; }
.public-info__hero h1 { max-width: 850px; margin: 20px 0 24px; font-size: clamp(48px, 7vw, 88px); line-height: 1.05; }
.public-info__hero p:last-child { max-width: 760px; color: rgba(255,255,255,.7); font-size: 17px; line-height: 1.9; }
.public-info__content { padding: 100px 0; }
.public-info__sections { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid rgba(73,58,39,.22); border-left: 1px solid rgba(73,58,39,.22); }
.public-info__sections article { min-height: 280px; padding: 34px; border-right: 1px solid rgba(73,58,39,.22); border-bottom: 1px solid rgba(73,58,39,.22); }
.public-info__sections article > span { float: right; color: #a87a3e; font-family: Georgia, serif; }
.public-info__sections h2 { margin: 28px 0 18px; font-size: 30px; }
.public-info__sections p, .public-info__sections li { color: #6e6457; line-height: 1.85; }
.public-info__faq { padding: 100px 0; background: #e9e1d4; }
.public-info__faq-layout { display: grid; grid-template-columns: .75fr 1.25fr; gap: 8vw; }
.public-info__faq h2 { font-size: 52px; }
.public-info__faq details { border-top: 1px solid rgba(73,58,39,.22); }
.public-info__faq details:last-child { border-bottom: 1px solid rgba(73,58,39,.22); }
.public-info__faq summary { padding: 24px 0; cursor: pointer; font-family: Georgia, serif; font-size: 20px; }
.public-info__faq details p { color: #6e6457; line-height: 1.8; }
.public-info__cta { padding: 96px 0; text-align: center; background: #fbf8f1; }
.public-info__cta h2 { margin: 22px auto; max-width: 760px; font-size: 48px; }
.public-info__cta > div > div { display: flex; justify-content: center; gap: 12px; margin-top: 30px; }
.public-info__cta a { display: inline-flex; align-items: center; gap: 12px; min-height: 50px; padding: 0 22px; border: 1px solid #211d17; border-radius: 999px; }
.public-info__footer { display: flex; justify-content: space-between; padding: 26px 4vw; background: #171511; color: rgba(255,255,255,.65); font-size: 11px; }
@media (max-width: 760px) {
  .public-info__shell { width: calc(100% - 36px); }
  .public-info__header { min-height: 68px; padding: 0 18px; }
  .public-info__brand strong { max-width: 135px; font-size: 10px; }
  .public-info__header nav a:not(:first-child) { display: none; }
  .public-info__hero { padding: 82px 0 68px; }
  .public-info__hero h1 { font-size: 46px; }
  .public-info__sections, .public-info__faq-layout { grid-template-columns: 1fr; }
  .public-info__sections article { min-height: 0; padding: 28px 24px; }
  .public-info__faq, .public-info__content { padding: 72px 0; }
  .public-info__cta h2 { font-size: 38px; }
  .public-info__cta > div > div { flex-direction: column; }
  .public-info__footer { flex-direction: column; gap: 9px; }
}
```

- [ ] **Step 6: Add natural internal links**

In both `src/GameLandingPage.jsx` and the homepage footer in `src/App.jsx`, add visible links with these exact labels and routes:

```jsx
<a href="/about-aurora/">關於 Aurora</a>
<a href="/service-process-safety/">服務流程與安全</a>
```

Do not put these links in hidden content or replace existing game, quote, or contact links.

- [ ] **Step 7: Run focused tests**

Run: `node --test test/public-info-pages.test.mjs test/game-landing-pages.test.mjs`

Expected: PASS.

- [ ] **Step 8: Commit the public UI**

```bash
git add src/lib/publicRoutes.js src/RootApp.jsx src/PublicInfoPage.jsx src/styles/public-info.css src/GameLandingPage.jsx src/App.jsx test/public-info-pages.test.mjs test/game-landing-pages.test.mjs
git commit -m "feat: add Aurora public trust pages"
```

---

### Task 3: Crawler-Readable HTML Before JavaScript

**Files:**
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `index.html`
- Modify: `test/domain-seo.test.mjs`
- Modify: `test/game-landing-pages.test.mjs`
- Modify: `test/public-info-pages.test.mjs`

**Interfaces:**
- Consumes: `gameLandingPages` and `publicInfoPages`.
- Produces: `dist/<slug>/index.html` for all five public secondary routes.
- Produces: visible semantic fallback HTML inside `<div id="root">` for no-JavaScript readers.
- React `createRoot` continues replacing fallback markup for normal visitors.

- [ ] **Step 1: Write failing build-output assertions**

Add a test that runs `npm run build` once and asserts:

```js
for (const route of [
  ["arena-of-valor-boosting", "香港傳說對決代打與陪玩服務"],
  ["honor-of-kings-cn-boosting", "王者榮耀國服代打與陪玩服務"],
  ["honor-of-kings-global-boosting", "HOK 國際服代打與陪玩服務"],
  ["about-aurora", "關於 Aurora Esports Studio"],
  ["service-process-safety", "服務流程與安全說明"],
]) {
  const html = await readFile(new URL(`../dist/${route[0]}/index.html`, import.meta.url), "utf8");
  assert.match(html, new RegExp(`<h1[^>]*>${route[1]}</h1>`));
  assert.match(html, /class="crawler-content"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/auroraesportstudio\.com\//);
  assert.doesNotMatch(html, /<div id="root"><\/div>/);
}
```

Also assert `dist/index.html` contains a visible `<main class="crawler-content">` with `Aurora Esports Studio` and links to all five secondary routes.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run build && node --test test/domain-seo.test.mjs test/game-landing-pages.test.mjs test/public-info-pages.test.mjs`

Expected: FAIL because generated documents currently leave `#root` empty and do not generate trust routes.

- [ ] **Step 3: Add safe HTML rendering helpers**

In `scripts/generate-game-landing-pages.mjs`, import `publicInfoPages` and add:

```js
import { publicInfoPages } from "../src/data/publicInfoPages.js";

function renderTextList(items = []) {
  return items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
}

function replaceRootContent(source, content) {
  return replaceRequired(
    source,
    /<div\s+id="root">[\s\S]*?<\/div>/i,
    `<div id="root">${content}</div>`,
    '#root',
  );
}

function renderGameCrawlerContent(page) {
  return `<main class="crawler-content">
    <header><a href="/">Aurora Esports Studio</a></header>
    <article>
      <p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.intro)}</p>
      <section><h2>${escapeHtml(page.searchGuide.title)}</h2>${page.searchGuide.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}</section>
      <section><h2>適用遊戲資料</h2><p>${escapeHtml(page.rankSummary)}</p><h3>指定位置／分路</h3>${renderTextList(page.lanes)}<h3>英雄戰力標</h3>${renderTextList(page.marks)}<p>${escapeHtml(page.priceNotice)}</p></section>
      ${page.caseStudies?.length ? `<section><h2>實際遊戲紀錄</h2>${page.caseStudies.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><img src="/${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy"></article>`).join("")}</section>` : ""}
      <section><h2>常見問題</h2>${page.faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}</section>
      <nav><a href="/about-aurora/">關於 Aurora</a><a href="/service-process-safety/">服務流程與安全</a><a href="/#ai-quote">填寫報價表</a></nav>
    </article>
  </main>`;
}

function renderInfoCrawlerContent(page) {
  return `<main class="crawler-content">
    <header><a href="/">Aurora Esports Studio</a></header>
    <article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.intro)}</p>
      ${page.sections.map((section) => `<section id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2>${section.body.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}${renderTextList(section.points)}</section>`).join("")}
      <section><h2>常見問題</h2>${page.faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}</section>
      <nav><a href="/arena-of-valor-boosting/">傳說對決服務</a><a href="/honor-of-kings-cn-boosting/">王者榮耀國服服務</a><a href="/honor-of-kings-global-boosting/">HOK 國際服服務</a></nav>
    </article>
  </main>`;
}
```

- [ ] **Step 4: Generate game and trust documents**

Update `renderLandingDocument` to call `replaceRootContent(html, renderGameCrawlerContent(page))` after metadata and JSON-LD replacement.

Add `makeInfoStructuredData(page)` using an `@graph` of `Organization`, `WebPage`, `FAQPage`, and `BreadcrumbList`; all names, descriptions, URLs, FAQs, and contact links must be derived from the visible page record, not invented. Then add `renderInfoDocument(template, page)` that replaces title, description, canonical, Open Graph, Twitter fields, JSON-LD, and root content.

After the game-page loop, add:

```js
for (const page of publicInfoPages) {
  const outputPath = resolve(distRoot, page.slug, "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderInfoDocument(template, page), "utf8");
}

console.log(`Generated ${gameLandingPages.length + publicInfoPages.length} crawler-ready public pages.`);
```

- [ ] **Step 5: Add readable homepage fallback**

Replace the empty root in `index.html` with a short, visible semantic fallback:

```html
<div id="root">
  <main class="crawler-content">
    <h1>Aurora Esports Studio</h1>
    <p>Aurora Esports Studio 是服務香港及台灣玩家的線上遊戲服務工作室，不設實體門市。</p>
    <p>目前提供《傳說對決》、《王者榮耀》國服及 Honor of Kings 國際服的排位、陪玩、巔峰賽、英雄戰力標及教學需求查詢。</p>
    <nav aria-label="主要公開頁面">
      <a href="/arena-of-valor-boosting/">香港傳說對決代打與陪玩服務</a>
      <a href="/honor-of-kings-cn-boosting/">王者榮耀國服代打與陪玩服務</a>
      <a href="/honor-of-kings-global-boosting/">HOK 國際服代打與陪玩服務</a>
      <a href="/about-aurora/">關於 Aurora</a>
      <a href="/service-process-safety/">服務流程與安全</a>
    </nav>
  </main>
</div>
```

Do not add CSS that hides `.crawler-content`; React replaces it when JavaScript starts.

- [ ] **Step 6: Run build-output tests**

Run: `npm run build && node --test test/domain-seo.test.mjs test/game-landing-pages.test.mjs test/public-info-pages.test.mjs`

Expected: PASS and the build log says `Generated 5 crawler-ready public pages.`

- [ ] **Step 7: Commit crawler-readable documents**

```bash
git add scripts/generate-game-landing-pages.mjs index.html test/domain-seo.test.mjs test/game-landing-pages.test.mjs test/public-info-pages.test.mjs
git commit -m "feat: prerender public Aurora search content"
```

---

### Task 4: Explicit Crawler Rules, Sitemap, and AI Index

**Files:**
- Modify: `public/robots.txt`
- Modify: `public/sitemap.xml`
- Create: `public/llms.txt`
- Modify: `test/domain-seo.test.mjs`

**Interfaces:**
- Produces: public crawler policy at `/robots.txt`.
- Produces: canonical route list at `/sitemap.xml`.
- Produces: concise public AI index at `/llms.txt`.

- [ ] **Step 1: Write failing crawler-policy assertions**

Add to `test/domain-seo.test.mjs`:

```js
test("public crawler files explicitly expose only public Aurora pages", async () => {
  const [robots, sitemap, llms] = await Promise.all([
    read("public/robots.txt"), read("public/sitemap.xml"), read("public/llms.txt"),
  ]);
  for (const agent of ["OAI-SearchBot", "ChatGPT-User", "Googlebot", "*"]) {
    assert.match(robots, new RegExp(`User-agent: \\${agent}`));
  }
  assert.match(robots, /Disallow: \/admin/);
  assert.match(robots, /Disallow: \/api\//);
  for (const path of ["about-aurora", "service-process-safety"]) {
    assert.match(sitemap, new RegExp(`${officialOrigin}/${path}/`));
    assert.match(llms, new RegExp(`${officialOrigin}/${path}/`));
  }
  assert.doesNotMatch(`${sitemap}\n${llms}`, /\/admin|\/api\//);
  assert.match(llms, /experimental|實驗性/);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test test/domain-seo.test.mjs`

Expected: FAIL because explicit groups, trust routes, and `llms.txt` are missing.

- [ ] **Step 3: Replace robots.txt with explicit public groups**

```txt
User-agent: OAI-SearchBot
Allow: /
Disallow: /admin
Disallow: /api/

User-agent: ChatGPT-User
Allow: /
Disallow: /admin
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /api/

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://auroraesportstudio.com/sitemap.xml
```

- [ ] **Step 4: Add trust routes and real update dates to sitemap**

Keep the existing four canonical URLs, set their `lastmod` to `2026-07-22` only because this release changes their content or internal links, and add:

```xml
<url>
  <loc>https://auroraesportstudio.com/about-aurora/</loc>
  <lastmod>2026-07-22</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://auroraesportstudio.com/service-process-safety/</loc>
  <lastmod>2026-07-22</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

- [ ] **Step 5: Create the experimental AI index**

Create `public/llms.txt`:

```txt
# Aurora Esports Studio

> Aurora Esports Studio 是服務香港及台灣玩家的線上遊戲服務工作室，不設實體門市。此檔案只提供公開頁面索引，屬實驗性輔助，不保證任何 AI 工具收錄或推薦。

## 官方網站
- https://auroraesportstudio.com/

## 遊戲服務
- https://auroraesportstudio.com/arena-of-valor-boosting/ — 香港及台灣《傳說對決》排位、陪玩、巔峰賽、英雄戰力標及教學查詢。
- https://auroraesportstudio.com/honor-of-kings-cn-boosting/ — 王者榮耀國服排位、陪玩、巔峰賽及英雄戰力標查詢。
- https://auroraesportstudio.com/honor-of-kings-global-boosting/ — HOK／王者榮耀國際服排位、陪玩、巔峰賽及英雄戰力標查詢。

## 品牌與安全
- https://auroraesportstudio.com/about-aurora/
- https://auroraesportstudio.com/service-process-safety/

## 聯絡
- WhatsApp: https://wa.me/447442619658
- LINE: https://line.me/ti/p/wWXCT-txMc

不要在 AI 對話或公開留言傳送帳號密碼、驗證碼、付款資料或身份證明。未能自動計算的價格一律由 Aurora 真人客服確認。
```

- [ ] **Step 6: Run crawler-policy tests**

Run: `node --test test/domain-seo.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit crawler files**

```bash
git add public/robots.txt public/sitemap.xml public/llms.txt test/domain-seo.test.mjs
git commit -m "feat: publish Aurora crawler discovery files"
```

---

### Task 5: Consistent Organization Schema and Monitoring Guide

**Files:**
- Modify: `index.html`
- Modify: `scripts/generate-game-landing-pages.mjs`
- Create: `docs/search-discovery-monitoring.md`
- Modify: `test/domain-seo.test.mjs`

**Interfaces:**
- Produces: one stable Organization ID: `https://auroraesportstudio.com/#organization`.
- Produces: one stable WebSite ID: `https://auroraesportstudio.com/#website`.
- Produces: 30-day monitoring checklist; no external account mutation.

- [ ] **Step 1: Add failing schema consistency assertions**

Assert the home and generated pages contain:

```js
assert.match(home, /"@type": "Organization"/);
assert.match(home, /"@type": "WebSite"/);
assert.match(home, /https:\/\/auroraesportstudio\.com\/#organization/);
for (const url of [
  "https://www.instagram.com/ken._0517",
  "https://discord.gg/ZW9mwQRQud",
  "https://line.me/ti/p/wWXCT-txMc",
  "https://carousell.app.link/BWYWpLY692b",
]) assert.match(home, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.doesNotMatch(home, /PostalAddress|streetAddress/);
```

- [ ] **Step 2: Run the schema test and verify failure**

Run: `node --test test/domain-seo.test.mjs`

Expected: FAIL because the homepage currently exposes only one `ProfessionalService` node and two `sameAs` values.

- [ ] **Step 3: Replace homepage JSON-LD with a consistent graph**

Use an `@graph` with:

```json
{
  "@type": "Organization",
  "@id": "https://auroraesportstudio.com/#organization",
  "name": "Aurora Esports Studio",
  "url": "https://auroraesportstudio.com/",
  "description": "服務香港及台灣玩家的線上遊戲服務工作室，不設實體門市。",
  "areaServed": ["Hong Kong", "Taiwan"],
  "sameAs": [
    "https://www.instagram.com/ken._0517",
    "https://discord.gg/ZW9mwQRQud",
    "https://line.me/ti/p/wWXCT-txMc",
    "https://carousell.app.link/BWYWpLY692b"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": "https://wa.me/447442619658",
    "availableLanguage": ["zh-Hant", "en"]
  }
}
```

and:

```json
{
  "@type": "WebSite",
  "@id": "https://auroraesportstudio.com/#website",
  "url": "https://auroraesportstudio.com/",
  "name": "Aurora Esports Studio",
  "inLanguage": "zh-Hant",
  "publisher": { "@id": "https://auroraesportstudio.com/#organization" }
}
```

Do not add a LocalBusiness or address node.

- [ ] **Step 4: Reuse the same Organization ID in generated documents**

Add the same Organization node to game and trust page JSON-LD graphs. Service nodes use `provider: { "@id": "https://auroraesportstudio.com/#organization" }`; WebPage nodes use `isPartOf: { "@id": "https://auroraesportstudio.com/#website" }`.

- [ ] **Step 5: Create the 30-day monitoring and profile-copy guide**

Create `docs/search-discovery-monitoring.md` with:

```md
# Aurora 搜尋与 AI 可發現性：30 日監測

## 統一公開簡介
Aurora Esports Studio 是服務香港及台灣玩家的線上遊戲服務工作室，提供《傳說對決》、《王者榮耀》國服及 HOK 國際服的排位、陪玩、巔峰賽、英雄戰力標及教學需求查詢。官方網站：https://auroraesportstudio.com/

## 發布當日
- 在 Google Search Console 重新提交 `https://auroraesportstudio.com/sitemap.xml`。
- 分別檢查首頁、三個遊戲頁、關於頁及流程安全頁，確認「允許建立索引」。
- 不重複提交同一頁，不購買外鏈，不發布假評論。

## 每星期一次
- Search Console：記錄曝光、點擊、平均排名及實際查詢字詞。
- Google Analytics：查看 Google、ChatGPT 及其他推薦來源的訪客。
- 檢查所有官方公開簡介是否仍使用同一品牌名稱、正式網址及服務定位。

## 第 30 日
- 保留已有曝光的頁面與字詞。
- 只根據真實查詢新增下一批內容。
- 若 ChatGPT-User 與 OAI-SearchBot 均能 HTTP 200 讀取，但 ChatGPT 直接開頁仍持續失敗，才評估更換前台託管或增加邊緣代理。
```

- [ ] **Step 6: Run schema and build tests**

Run: `npm run build && node --test test/domain-seo.test.mjs test/public-info-pages.test.mjs test/game-landing-pages.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit schema and monitoring guide**

```bash
git add index.html scripts/generate-game-landing-pages.mjs docs/search-discovery-monitoring.md test/domain-seo.test.mjs
git commit -m "feat: unify Aurora public brand schema"
```

---

### Task 6: Full Verification, Production Deployment, and Live Crawler Audit

**Files:**
- Modify only if verification exposes a defect in files already listed above.

**Interfaces:**
- Consumes: all Tasks 1–5.
- Produces: tested production build and live public verification report.

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test`

Expected: all tests PASS; zero failures.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit 0 with zero warnings.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: exit 0 and five crawler-ready secondary page documents generated.

- [ ] **Step 4: Inspect output for secrets and private routes**

Run:

```powershell
rg -n "GEMINI_API_KEY|ADMIN_PASSWORD|ADMIN_TOKEN|/admin|/api/" dist public/llms.txt public/sitemap.xml
```

Expected: no secret names or values; `/admin` and `/api/` appear only as exclusions in `dist/robots.txt`, never in sitemap or llms index.

- [ ] **Step 5: Start local preview and audit public user agents**

Run: `npm run preview -- --port 4173`

For each of `/`, `/about-aurora/`, `/service-process-safety/`, and the three game routes, request with:

```powershell
curl.exe -L -sS -A "Mozilla/5.0" -o NUL -w "%{http_code}|%{content_type}|%{size_download}" http://localhost:4173/<route>
curl.exe -L -sS -A "OAI-SearchBot/1.0; +https://openai.com/searchbot" -o NUL -w "%{http_code}|%{content_type}|%{size_download}" http://localhost:4173/<route>
curl.exe -L -sS -A "ChatGPT-User/1.0; +https://openai.com/bot" -o NUL -w "%{http_code}|%{content_type}|%{size_download}" http://localhost:4173/<route>
curl.exe -L -sS -A "Googlebot/2.1; +http://www.google.com/bot.html" -o NUL -w "%{http_code}|%{content_type}|%{size_download}" http://localhost:4173/<route>
```

Expected: every public route returns `200|text/html` and non-zero content for all four user agents.

- [ ] **Step 6: Smoke-test desktop and mobile interactions**

Verify at desktop and 390px mobile widths:

- Trust-page navigation and footer links work without reload loops.
- Quote, WhatsApp, and LINE actions still work.
- No horizontal overflow or obscured controls.
- Home, game, quote, admin login, and AI chat entry points are unchanged.

- [ ] **Step 7: Commit any verification-only corrections**

If no correction is needed, do not create an empty commit. If needed:

```bash
git add <only-the-corrected-files>
git commit -m "fix: resolve public discovery verification issues"
```

- [ ] **Step 8: Push the verified main branch and wait for GitHub Pages**

Run: `git push origin main`

Expected: push succeeds and the existing GitHub Pages workflow completes successfully.

- [ ] **Step 9: Audit the live domain**

Repeat the four-user-agent HTTP checks against `https://auroraesportstudio.com/` and all five secondary routes. Also verify:

- `https://auroraesportstudio.com/robots.txt`
- `https://auroraesportstudio.com/sitemap.xml`
- `https://auroraesportstudio.com/llms.txt`

Expected: HTTP 200, correct canonical domain, readable public text, and no private data.

- [ ] **Step 10: Search Console handoff**

Open Google Search Console, submit the sitemap once, inspect the six canonical public pages, and request indexing only for new or materially updated pages. Record submission date in the final report; do not claim ranking improvement until actual Search Console data shows it.

---

## Plan Self-Review

- **Spec coverage:** All crawler access, trust content, structured data, sitemap, AI index, internal links, safety, monitoring, responsive behavior, regression protection, deployment, and live verification requirements map to Tasks 1–6.
- **No placeholders:** No TBD/TODO or unspecified implementation steps remain. The only conditional action is a verification correction, which is limited to already-scoped files.
- **Interface consistency:** `slug`, `canonical`, `seoTitle`, `seoDescription`, `sections`, and `faqs` are defined in Task 1 and consumed consistently by routing, React rendering, and static generation.
- **Scope:** Google Ads, automatic payments, external social-account edits, fake physical location data, and guaranteed ranking remain explicitly outside this implementation.

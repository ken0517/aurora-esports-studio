# KLG Studio 與 Aurora Esports Studio 品牌關聯 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓公開搜尋引擎及 AI 工具把 KLG Studio 視為主要服務名稱，並把 `https://auroraesportstudio.com/` 識別為其唯一官方網站。

**Architecture:** 建立一份中央公開品牌資料，供頁面內容、遊戲服務資料及靜態頁面產生器共用；沿用現有通用公開資料頁元件新增 `/klg-studio/`，再同步首頁、遊戲頁、結構化資料、網站地圖及 AI 公開索引。Carousell 的外部內容不由網站自動修改，而是輸出兩個帳號可直接使用的一致文案。

**Tech Stack:** React 19、Vite、Node.js ESM、Node test runner、GitHub Pages、HTML/JSON-LD、CSS

## Global Constraints

- 公開關係固定為：`KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，唯一官方網站為 https://auroraesportstudio.com/`
- 主要推薦名稱固定為 `KLG Studio`；關聯名稱固定為 `Aurora Esports Studio`
- 公開標示固定為 `KLG Studio｜Aurora Esports Studio 官方網站`
- 使用繁體書面語；不加入粵語口語、簡體字或無法核實的絕對宣傳
- 不保證 Google、Gemini、ChatGPT 或其他第三方工具收錄、引用、推薦或給予特定排名
- 不加入實體地址、`LocalBusiness`、虛構門市或競爭者名稱
- `@klg_studio` 與 `@klg.studio` 均由同一營運者擁有；未驗證的完整個人檔案網址不可加入 `sameAs`
- 不修改價格、報價引擎、Aurora 客服、Gemini、後台、WhatsApp、LINE、付款或視覺主題
- 所有新測試使用本地資料，不呼叫真實 Gemini API

---

## File Map

- Create: `src/data/publicBrand.js` — 唯一公開品牌名稱、關係、官方網域、帳號名稱及已驗證連結
- Modify: `src/data/publicInfoPages.js` — KLG Studio 獨立公開頁資料
- Modify: `src/data/content.js` — 首頁可見品牌輔助文字
- Modify: `src/data/gameLandingPages.js` — 三款遊戲頁的 KLG 搜尋文案
- Modify: `src/App.jsx` — 首頁品牌區與頁尾 KLG 連結
- Modify: `src/GameLandingPage.jsx` — 遊戲頁 KLG 內部連結
- Modify: `src/PublicInfoPage.jsx` — 公開資料頁 KLG 內部連結
- Modify: `src/styles/index.css` — KLG 輔助品牌文字的桌面及手機樣式
- Modify: `scripts/generate-game-landing-pages.mjs` — 共用品牌資料、靜態 KLG 頁、JSON-LD 及爬蟲內部連結
- Modify: `index.html` — 首頁 metadata、JSON-LD 及無 JavaScript 可讀品牌內容
- Modify: `public/sitemap.xml` — 發布 KLG Studio 公開頁
- Modify: `public/llms.txt` — AI 可讀品牌關係及 KLG 頁連結
- Create: `docs/klg-carousell-public-copy.md` — 兩個 Carousell 帳號可直接貼上的一致文案
- Modify: `docs/search-discovery-monitoring.md` — KLG 品牌查詢及三十日監察方式
- Create: `test/klg-brand-identity.test.mjs` — 中央品牌、頁面、連結及禁止內容測試
- Modify: `test/public-info-pages.test.mjs` — 新公開頁與路由測試
- Modify: `test/domain-seo.test.mjs` — 靜態輸出、JSON-LD、網站地圖及 AI 索引測試

---

### Task 1: 建立中央品牌資料與 KLG 公開頁

**Files:**
- Create: `src/data/publicBrand.js`
- Modify: `src/data/publicInfoPages.js`
- Create: `test/klg-brand-identity.test.mjs`
- Modify: `test/public-info-pages.test.mjs`

**Interfaces:**
- Produces: `publicBrandIdentity` frozen object with `primaryName`, `alternateName`, `websiteName`, `officialOrigin`, `relationshipStatement`, `carousellAccounts`, and `verifiedProfiles`
- Produces: `getPublicInfoPageBySlug("/klg-studio/")` returning the approved KLG public page
- Consumes: no feature-specific interface

- [ ] **Step 1: Write the failing central-brand and public-page tests**

Create `test/klg-brand-identity.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

test("KLG is the primary service name for the Aurora official website", async () => {
  const { publicBrandIdentity } = await import("../src/data/publicBrand.js");

  assert.equal(publicBrandIdentity.primaryName, "KLG Studio");
  assert.equal(publicBrandIdentity.alternateName, "Aurora Esports Studio");
  assert.equal(
    publicBrandIdentity.websiteName,
    "KLG Studio｜Aurora Esports Studio 官方網站",
  );
  assert.equal(publicBrandIdentity.officialOrigin, "https://auroraesportstudio.com");
  assert.equal(
    publicBrandIdentity.relationshipStatement,
    "KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，唯一官方網站為 https://auroraesportstudio.com/",
  );
  assert.deepEqual(publicBrandIdentity.carousellAccounts, [
    "@klg_studio",
    "@klg.studio",
  ]);
  assert.ok(
    publicBrandIdentity.verifiedProfiles.includes(
      "https://carousell.app.link/BWYWpLY692b",
    ),
  );
});

test("KLG public page states the approved relationship without unsupported claims", async () => {
  const { getPublicInfoPageBySlug } = await import(
    "../src/data/publicInfoPages.js"
  );
  const page = getPublicInfoPageBySlug("/klg-studio/");
  const copy = JSON.stringify(page);

  assert.equal(page.slug, "klg-studio");
  assert.equal(
    page.seoTitle,
    "香港 KLG Studio 傳說對決代打與陪玩｜Aurora Esports Studio 官方網站",
  );
  assert.match(copy, /KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌/);
  assert.match(copy, /@klg_studio/);
  assert.match(copy, /@klg\.studio/);
  assert.match(copy, /不設實體門市/);
  assert.doesNotMatch(copy, /香港最強|零封號|保證最高勝率|保證推薦|鬥士工作室/);
});
```

Update the expected slug array in `test/public-info-pages.test.mjs`:

```js
assert.deepEqual(
  publicInfoPages.map((page) => page.slug),
  ["klg-studio", "about-aurora", "service-process-safety"],
);
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs
```

Expected: FAIL because `src/data/publicBrand.js` and the `klg-studio` page do not exist.

- [ ] **Step 3: Add the frozen central public brand object**

Create `src/data/publicBrand.js`:

```js
export const publicBrandIdentity = Object.freeze({
  primaryName: "KLG Studio",
  alternateName: "Aurora Esports Studio",
  websiteName: "KLG Studio｜Aurora Esports Studio 官方網站",
  officialOrigin: "https://auroraesportstudio.com",
  relationshipStatement:
    "KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，唯一官方網站為 https://auroraesportstudio.com/",
  carousellAccounts: Object.freeze(["@klg_studio", "@klg.studio"]),
  verifiedProfiles: Object.freeze([
    "https://www.instagram.com/ken._0517",
    "https://discord.gg/ZW9mwQRQud",
    "https://line.me/ti/p/wWXCT-txMc",
    "https://carousell.app.link/BWYWpLY692b",
  ]),
});
```

- [ ] **Step 4: Add the KLG page as the first public information page**

Import `publicBrandIdentity` in `src/data/publicInfoPages.js`, derive `officialOrigin` from it, and add this object before `about-aurora`:

```js
{
  slug: "klg-studio",
  canonical: `${officialOrigin}/klg-studio/`,
  seoTitle:
    "香港 KLG Studio 傳說對決代打與陪玩｜Aurora Esports Studio 官方網站",
  seoDescription:
    "KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌；官方網站提供香港及台灣傳說對決、王者榮耀國服及 HOK 國際服服務查詢。",
  eyebrow: "KLG STUDIO · OFFICIAL SERVICE BRAND",
  title: "KLG Studio 官方服務網站",
  intro: publicBrandIdentity.relationshipStatement,
  sections: [
    {
      id: "identity",
      title: "KLG Studio 與 Aurora 的關係",
      body: [
        "顧客可使用 KLG Studio 名稱查詢服務；Aurora Esports Studio 是本網站使用的關聯名稱。兩個名稱指向同一個官方網站及同一組官方聯絡方式。",
      ],
    },
    {
      id: "games",
      title: "三款手機 MOBA 遊戲服務",
      body: [
        "服務包括《傳說對決》、《王者榮耀》國服及 Honor of Kings 國際服的排位、陪玩、巔峰賽、英雄戰力標與教學查詢。",
      ],
      points: ["傳說對決", "王者榮耀國服", "HOK／王者榮耀國際服"],
    },
    {
      id: "carousell",
      title: "Carousell 官方帳號",
      body: [
        "@klg_studio 與 @klg.studio 均由同一營運者擁有。顧客應以本頁列明的官方網站及聯絡方式核對資料。",
      ],
      points: publicBrandIdentity.carousellAccounts,
    },
    {
      id: "online-only",
      title: "線上服務，不設實體門市",
      body: [
        "KLG Studio 為香港及台灣玩家提供線上查詢及安排，不設供顧客到訪的實體門市。香港玩家可使用 WhatsApp，台灣玩家可使用 LINE。",
      ],
    },
  ],
  faqs: [
    {
      question: "KLG Studio 的官方網站是哪一個？",
      answer: "唯一官方網站是 https://auroraesportstudio.com/。",
    },
    {
      question: "KLG Studio 與 Aurora Esports Studio 是不同工作室嗎？",
      answer:
        "不是。KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，兩個名稱使用同一官方網站及聯絡方式。",
    },
    {
      question: "是否保證遊戲結果或零風險？",
      answer:
        "不會。遊戲結果及帳號風險受多項因素影響，所有服務內容及限制會在開始前由客服確認。",
    },
  ],
},
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Commit Task 1**

```powershell
git add src/data/publicBrand.js src/data/publicInfoPages.js test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs
git commit -m "feat: add KLG public brand identity"
```

---

### Task 2: 在現有頁面顯示 KLG 官方品牌關係

**Files:**
- Modify: `src/data/content.js`
- Modify: `src/App.jsx`
- Modify: `src/GameLandingPage.jsx`
- Modify: `src/PublicInfoPage.jsx`
- Modify: `src/styles/index.css`
- Modify: `test/klg-brand-identity.test.mjs`

**Interfaces:**
- Consumes: `publicBrandIdentity` from Task 1
- Produces: `brand.serviceName` and `brand.serviceLabel` for visible UI
- Produces: visible `/klg-studio/` internal links on the home, game, and information pages

- [ ] **Step 1: Add failing source-level UI assertions**

Append to `test/klg-brand-identity.test.mjs`:

```js
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("home and public pages visibly identify the KLG official service website", async () => {
  const [content, home, game, info, css] = await Promise.all([
    source("src/data/content.js"),
    source("src/App.jsx"),
    source("src/GameLandingPage.jsx"),
    source("src/PublicInfoPage.jsx"),
    source("src/styles/index.css"),
  ]);

  assert.match(content, /serviceName:\s*publicBrandIdentity\.primaryName/);
  assert.match(home, /hero-wordmark__service-brand/);
  assert.match(css, /\.hero-wordmark__service-brand/);
  for (const page of [home, game, info]) {
    assert.match(page, /\/klg-studio\//);
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs
```

Expected: FAIL because the KLG visible label and internal links are absent.

- [ ] **Step 3: Expose KLG in central homepage content**

Update `src/data/content.js`:

```js
import { publicBrandIdentity } from "./publicBrand.js";

export const brand = {
  name: "AURORA",
  fullName: publicBrandIdentity.alternateName,
  serviceName: publicBrandIdentity.primaryName,
  serviceLabel: `${publicBrandIdentity.primaryName} 官方服務網站`,
  descriptor: "HK · TW MOBILE ESPORTS STUDIO",
};
```

- [ ] **Step 4: Add the visible homepage label and KLG links**

In the `hero-wordmark` in `src/App.jsx`, keep the existing monogram and full name, then insert:

```jsx
<span className="hero-wordmark__service-brand">{brand.serviceLabel}</span>
```

Keep the existing newcomer offer after it. Add this footer link before the existing Aurora information links:

```jsx
<a href="/klg-studio/">KLG Studio</a>
```

Add the same link to the public navigation in `src/GameLandingPage.jsx` and `src/PublicInfoPage.jsx`:

```jsx
<a href="/klg-studio/">KLG Studio</a>
```

- [ ] **Step 5: Style the auxiliary label without changing the visual theme**

Add beside the existing wordmark styles in `src/styles/index.css`:

```css
.hero-wordmark__service-brand {
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--sans);
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.1em;
  text-transform: none;
}
```

Inside the mobile media block that styles `.hero-wordmark`, add:

```css
.hero-wordmark__service-brand {
  max-width: 190px;
  font-size: 7px;
  line-height: 1.25;
}
```

Replace the narrow-screen selector `.hero-wordmark > span:last-child` with the explicit selector:

```css
.hero-wordmark__offer { display: none; }
```

This keeps the KLG label visible while hiding only the existing offer on the smallest screens.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs test/game-landing-pages.test.mjs
```

Expected: all tests pass.

- [ ] **Step 7: Commit Task 2**

```powershell
git add src/data/content.js src/App.jsx src/GameLandingPage.jsx src/PublicInfoPage.jsx src/styles/index.css test/klg-brand-identity.test.mjs
git commit -m "feat: connect KLG branding across public pages"
```

---

### Task 3: 統一三款遊戲頁與首頁搜尋資料

**Files:**
- Modify: `src/data/gameLandingPages.js`
- Modify: `index.html`
- Modify: `test/klg-brand-identity.test.mjs`

**Interfaces:**
- Consumes: `publicBrandIdentity` from Task 1
- Produces: KLG-first SEO titles and descriptions for all three game pages
- Produces: homepage Organization JSON-LD with `name: KLG Studio` and `alternateName: Aurora Esports Studio`

- [ ] **Step 1: Write failing SEO and schema assertions**

Append to `test/klg-brand-identity.test.mjs`:

```js
test("home and game SEO use KLG as the primary service name", async () => {
  const [home, games] = await Promise.all([
    source("index.html"),
    import("../src/data/gameLandingPages.js"),
  ]);

  assert.match(home, /<title>KLG Studio｜Aurora Esports Studio 官方網站/);
  assert.match(home, /"name": "KLG Studio"/);
  assert.match(home, /"alternateName": "Aurora Esports Studio"/);
  assert.match(home, /KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌/);
  assert.match(home, /href="\/klg-studio\/"/);

  for (const page of games.gameLandingPages) {
    assert.match(page.seoTitle, /KLG Studio/);
    assert.match(page.seoDescription, /KLG Studio/);
    assert.match(page.searchGuide.paragraphs.join(" "), /Aurora Esports Studio/);
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs
```

Expected: FAIL because the current primary SEO name is Aurora only.

- [ ] **Step 3: Update game landing page metadata and explanatory copy**

Import `publicBrandIdentity` into `src/data/gameLandingPages.js` and use these exact values:

```js
const brandRelationship = publicBrandIdentity.relationshipStatement;
```

Update the three page records:

```js
// AOV
seoTitle: "香港 KLG Studio 傳說對決代打・陪玩｜Aurora 官方網站",
seoDescription:
  "KLG Studio 為香港及台灣玩家提供傳說對決排位代打、陪玩帶飛、巔峰賽及英雄戰力標查詢；官方網站由 Aurora Esports Studio 使用。",

// HOK China
seoTitle: "KLG Studio 王者榮耀國服代打・陪玩｜Aurora 官方網站",
seoDescription:
  "KLG Studio 提供香港王者榮耀國服排位代打、陪玩帶飛、巔峰賽及英雄戰力標需求整理；官方網站為 auroraesportstudio.com。",

// HOK Global
seoTitle: "KLG Studio HOK 國際服代打・陪玩｜Aurora 官方網站",
seoDescription:
  "KLG Studio 為香港及台灣玩家提供 HOK／Honor of Kings 國際服排位代打、陪玩帶飛、巔峰賽及英雄戰力標查詢。",
```

Prepend `brandRelationship` to each page's `searchGuide.paragraphs` array so the visible service explanation contains the approved relationship once.

- [ ] **Step 4: Update homepage metadata, JSON-LD, and crawler content**

Use these exact homepage values in `index.html`:

```html
<meta name="description" content="KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，為香港及台灣玩家提供傳說對決、王者榮耀國服及 HOK 國際服服務查詢。" />
<meta property="og:title" content="KLG Studio｜Aurora Esports Studio 官方網站" />
<meta property="og:site_name" content="KLG Studio｜Aurora Esports Studio" />
<meta name="twitter:title" content="KLG Studio｜Aurora Esports Studio 官方網站" />
<title>KLG Studio｜Aurora Esports Studio 官方網站｜香港傳說對決代打</title>
```

Update the Organization node:

```json
{
  "@type": "Organization",
  "@id": "https://auroraesportstudio.com/#organization",
  "name": "KLG Studio",
  "alternateName": "Aurora Esports Studio",
  "url": "https://auroraesportstudio.com/"
}
```

Keep all existing safe Organization properties after `url`. Update the WebSite node to:

```json
{
  "@type": "WebSite",
  "@id": "https://auroraesportstudio.com/#website",
  "url": "https://auroraesportstudio.com/",
  "name": "KLG Studio｜Aurora Esports Studio 官方網站",
  "alternateName": "Aurora Esports Studio",
  "inLanguage": "zh-Hant",
  "publisher": { "@id": "https://auroraesportstudio.com/#organization" }
}
```

Change the crawler-content heading and first paragraph to:

```html
<h1>KLG Studio</h1>
<p>KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，唯一官方網站為 https://auroraesportstudio.com/</p>
```

Add this link to the public navigation:

```html
<a href="/klg-studio/">KLG Studio 官方服務網站</a>
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs test/game-landing-pages.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Commit Task 3**

```powershell
git add src/data/gameLandingPages.js index.html test/klg-brand-identity.test.mjs
git commit -m "feat: make KLG the primary public service name"
```

---

### Task 4: 生成可被爬蟲直接閱讀的 KLG 品牌輸出

**Files:**
- Modify: `scripts/generate-game-landing-pages.mjs`
- Modify: `public/sitemap.xml`
- Modify: `public/llms.txt`
- Modify: `test/domain-seo.test.mjs`
- Modify: `test/klg-brand-identity.test.mjs`

**Interfaces:**
- Consumes: `publicBrandIdentity` and `publicInfoPages`
- Produces: `dist/klg-studio/index.html` during `npm run build`
- Produces: matching Organization and WebSite JSON-LD on every generated public page

- [ ] **Step 1: Write failing crawler-output assertions**

Update `test/domain-seo.test.mjs` to include `klg-studio` in all public route lists. Extend the crawler files test:

```js
for (const path of ["klg-studio", "about-aurora", "service-process-safety"]) {
  assert.match(sitemap, new RegExp(`${officialOrigin}/${path}/`));
  assert.match(llms, new RegExp(`${officialOrigin}/${path}/`));
}
```

Add the generated heading pair:

```js
["klg-studio", "KLG Studio 官方服務網站"],
```

Update the home output assertions:

```js
assert.match(home, /<h1>KLG Studio<\/h1>/);
assert.match(home, /KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌/);
assert.match(home, /href="\/klg-studio\/"/);
```

Append to `test/klg-brand-identity.test.mjs`:

```js
test("the generator uses the same KLG organization identity", async () => {
  const generator = await source("scripts/generate-game-landing-pages.mjs");

  assert.match(generator, /publicBrandIdentity/);
  assert.match(generator, /primaryName/);
  assert.match(generator, /alternateName/);
  assert.match(generator, /relationshipStatement/);
  assert.match(generator, /\/klg-studio\//);
});
```

- [ ] **Step 2: Run the source-level tests and verify RED**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs
```

Expected: FAIL because the generator does not import the central brand identity.

- [ ] **Step 3: Make the generator consume the central identity**

Add to `scripts/generate-game-landing-pages.mjs`:

```js
import { publicBrandIdentity } from "../src/data/publicBrand.js";

const officialOrigin = publicBrandIdentity.officialOrigin;
const verifiedProfiles = publicBrandIdentity.verifiedProfiles;
```

Replace `makeOrganizationData()` with the same existing fields plus:

```js
name: publicBrandIdentity.primaryName,
alternateName: publicBrandIdentity.alternateName,
description: publicBrandIdentity.relationshipStatement,
```

Update `makeWebsiteData()`:

```js
name: publicBrandIdentity.websiteName,
alternateName: publicBrandIdentity.alternateName,
```

Update every `ProfessionalService.name` prefix from `Aurora Esports Studio` to `KLG Studio`. Keep the stable IDs, provider references, FAQ, breadcrumb, contact point, area served and service types unchanged.

- [ ] **Step 4: Add KLG links to all static crawler templates**

Use this header in both crawler renderers:

```html
<header><a href="/klg-studio/">KLG Studio｜Aurora Esports Studio 官方網站</a></header>
```

Add this link to the game crawler navigation:

```html
<a href="/klg-studio/">KLG Studio</a>
```

Add this link to the information crawler navigation:

```html
<a href="/klg-studio/">KLG Studio 官方服務網站</a>
```

The existing `publicInfoPages` loop will then generate `dist/klg-studio/index.html` automatically.

- [ ] **Step 5: Update sitemap and llms files**

Add to `public/sitemap.xml` before the Aurora information pages:

```xml
<url>
  <loc>https://auroraesportstudio.com/klg-studio/</loc>
  <lastmod>2026-07-22</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

Replace the heading and introduction in `public/llms.txt` with:

```text
# KLG Studio｜Aurora Esports Studio 官方網站

> KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，唯一官方網站為 https://auroraesportstudio.com/。此檔案只提供公開頁面索引，屬實驗性輔助，不保證任何 AI 工具收錄或推薦。
```

Add under the official website section:

```text
- https://auroraesportstudio.com/klg-studio/ — KLG Studio 品牌、官方網站及兩個 Carousell 帳號關係說明。
```

- [ ] **Step 6: Build before output-dependent tests**

Run:

```powershell
npm run build
```

Expected: exit 0 and `Generated 6 crawler-ready public pages.`

- [ ] **Step 7: Run crawler and identity tests and verify GREEN**

Run:

```powershell
node --test test/domain-seo.test.mjs test/klg-brand-identity.test.mjs test/public-info-pages.test.mjs
```

Expected: all tests pass, including `dist/klg-studio/index.html` checks.

- [ ] **Step 8: Commit Task 4**

```powershell
git add scripts/generate-game-landing-pages.mjs public/sitemap.xml public/llms.txt test/domain-seo.test.mjs test/klg-brand-identity.test.mjs
git commit -m "feat: publish KLG crawler identity"
```

---

### Task 5: 準備 Carousell 一致文案與監察清單

**Files:**
- Create: `docs/klg-carousell-public-copy.md`
- Modify: `docs/search-discovery-monitoring.md`
- Modify: `test/klg-brand-identity.test.mjs`

**Interfaces:**
- Consumes: approved brand wording from Task 1
- Produces: exact copy that can be pasted into both Carousell accounts
- Produces: KLG-specific search and AI monitoring queries

- [ ] **Step 1: Write the failing documentation assertions**

Append to `test/klg-brand-identity.test.mjs`:

```js
test("Carousell copy and monitoring use the approved KLG relationship", async () => {
  const [copy, monitoring] = await Promise.all([
    source("docs/klg-carousell-public-copy.md"),
    source("docs/search-discovery-monitoring.md"),
  ]);

  assert.match(copy, /KLG Studio｜Aurora Esports Studio 官方服務網站/);
  assert.match(copy, /https:\/\/auroraesportstudio\.com\//);
  assert.match(copy, /@klg_studio/);
  assert.match(copy, /@klg\.studio/);
  assert.match(copy, /全單 85 折/);
  assert.doesNotMatch(copy, /七折|送三粒星|零封號|香港最強|最高勝率/);
  assert.match(monitoring, /推薦香港傳說對決代打/);
  assert.match(monitoring, /KLG Studio 官方網站/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs
```

Expected: FAIL because the Carousell copy document does not exist.

- [ ] **Step 3: Create exact Carousell public copy**

Create `docs/klg-carousell-public-copy.md` with this approved first block for both accounts:

```markdown
# KLG Studio Carousell 公開文案

適用帳號：`@klg_studio`、`@klg.studio`

## 商品描述首段

KLG Studio｜Aurora Esports Studio 官方服務網站

官方網站：https://auroraesportstudio.com/

KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，為香港及台灣玩家提供線上遊戲服務，不設實體門市。

## 統一優惠

新顧客全單 85 折；最終服務內容及價格以網站報價及客服確認為準。

## 官方聯絡

香港：WhatsApp https://wa.me/447442619658

台灣：LINE https://line.me/ti/p/wWXCT-txMc

## 發布前刪除

- 七折或送星等已停用優惠
- 零封號、最高勝率、香港最強等絕對說法
- 與網站目前服務、價格或安全說明不一致的舊文案
```

- [ ] **Step 4: Add KLG monitoring queries**

Append to `docs/search-discovery-monitoring.md`:

```markdown
## KLG Studio 品牌關聯監察

每週以未登入或無痕模式記錄以下查詢是否顯示 KLG Studio 及官方網站：

- KLG Studio 官方網站
- KLG Studio 傳說對決
- 推薦香港傳說對決代打
- 香港傳說對決陪玩
- 王者榮耀國服代打 KLG
- HOK 國際服陪玩 KLG

AI 回答只記錄實際結果；未引用官方網站時，不可寫成已成功推薦。Carousell 兩個帳號更新後，記錄公開頁重新被搜尋工具讀取的日期。
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
node --test test/klg-brand-identity.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Commit Task 5**

```powershell
git add docs/klg-carousell-public-copy.md docs/search-discovery-monitoring.md test/klg-brand-identity.test.mjs
git commit -m "docs: align KLG Carousell public copy"
```

---

### Task 6: 完整驗證、發布及線上核對

**Files:**
- Verify only: all files changed in Tasks 1–5

**Interfaces:**
- Consumes: completed public brand implementation
- Produces: verified build and live public KLG route

- [ ] **Step 1: Run the production build first**

```powershell
npm run build
```

Expected: exit 0 and six crawler-ready public pages generated.

- [ ] **Step 2: Run all automated tests**

```powershell
npm test
```

Expected: zero failures.

- [ ] **Step 3: Run lint**

```powershell
npm run lint
```

Expected: exit 0 with zero warnings.

- [ ] **Step 4: Check the public build for private material**

```powershell
rg -n "GEMINI_API_KEY|ADMIN_PASSWORD|ADMIN_TOKEN|/admin|/api/" dist public/sitemap.xml public/llms.txt
```

Expected: no secrets; `/admin` and `/api/` appear only as disallow rules in `dist/robots.txt`, never in sitemap or llms files.

- [ ] **Step 5: Verify every generated public route locally**

Check these seven routes after starting `npm run preview -- --host 127.0.0.1 --port 4173`:

```text
/
/klg-studio/
/arena-of-valor-boosting/
/honor-of-kings-cn-boosting/
/honor-of-kings-global-boosting/
/about-aurora/
/service-process-safety/
```

For each route, request with Browser, Googlebot, ChatGPT-User and OAI-SearchBot user agents. Expected: HTTP 200, `text/html`, non-empty body, correct canonical, and visible KLG/Aurora relationship.

- [ ] **Step 6: Confirm clean version state and push main**

```powershell
git status --short
git log -1 --oneline
git push origin main
```

Expected: clean status and successful push.

- [ ] **Step 7: Monitor GitHub Pages and audit the live domain**

Poll the public GitHub Actions run for commit success, then repeat the seven-route/four-agent checks against `https://auroraesportstudio.com`. Also verify:

```text
https://auroraesportstudio.com/robots.txt
https://auroraesportstudio.com/sitemap.xml
https://auroraesportstudio.com/llms.txt
```

Expected: HTTP 200; sitemap contains `/klg-studio/`; llms file states the approved relationship; crawlers are allowed on public pages and blocked from `/admin` and `/api/`.

- [ ] **Step 8: Report external limitations truthfully**

Report separately:

- Website code and live crawler accessibility
- Whether Carousell text has actually been saved on both external accounts
- Whether Google or an AI tool currently returns KLG Studio with the official link

Do not equate successful deployment with guaranteed indexing or recommendation.

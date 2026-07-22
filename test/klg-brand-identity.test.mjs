import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public brand data preserves every approved localized fact and is deeply immutable", async () => {
  const { publicBrandIdentity } = await import("../src/data/publicBrand.js");

  assert.deepEqual(publicBrandIdentity.primaryMarket, {
    id: "hong-kong",
    traditionalChinese: "擐葛",
    simplifiedChinese: "擐葛",
    english: "Hong Kong",
  });
  assert.deepEqual(publicBrandIdentity.serviceMarkets, [
    {
      id: "hong-kong",
      traditionalChinese: "擐葛",
      simplifiedChinese: "擐葛",
      english: "Hong Kong",
    },
    {
      id: "taiwan",
      traditionalChinese: "?啁",
      simplifiedChinese: "?唳嗾",
      english: "Taiwan",
    },
    {
      id: "macau",
      traditionalChinese: "瞉喲?",
      simplifiedChinese: "瞉喲",
      english: "Macau",
    },
  ]);
  assert.deepEqual(publicBrandIdentity.supportedLanguages, [
    {
      id: "zh-Hant",
      traditionalChinese: "蝜?銝剜?",
      simplifiedChinese: "蝜?銝剜?",
      english: "Traditional Chinese",
    },
    {
      id: "zh-Hans",
      traditionalChinese: "蝪⊿?銝剜?",
      simplifiedChinese: "蝞雿葉?",
      english: "Simplified Chinese",
    },
    {
      id: "en",
      traditionalChinese: "?望?",
      simplifiedChinese: "?望?",
      english: "English",
    },
  ]);
  assert.equal(
    publicBrandIdentity.marketStatement,
    "KLG Studio 隞仿?皜舐銝餉?撣嚗???啁?噫??拙振??蝺????嚗?渡?擃葉?陛擃葉???望??亥岷?",
  );
  assert.deepEqual(publicBrandIdentity.reviews.excerpts, [
    {
      traditionalChinese: "撠平?翰?翰?喋",
      simplifiedChinese: "銝??翰?翰?",
      english: "Professional and very efficient.",
    },
    {
      traditionalChinese: "good嚗翰?",
      simplifiedChinese: "good嚗漲敹怒",
      english: "Good and fast.",
    },
    {
      traditionalChinese: "??敹怒????",
      simplifiedChinese: "??敹怒????",
      english: "Fast replies and efficient service.",
    },
    {
      traditionalChinese: "銝活閬??曆?撟怠?嚗?閬翰????嚗ice?",
      simplifiedChinese: "銝活餈??雿葬敹???敹怒???嚗ice?",
      english:
        "I would ask for help again next time?ast replies and highly efficient. Nice.",
    },
  ]);
  for (const value of [
    publicBrandIdentity.primaryMarket,
    publicBrandIdentity.serviceMarkets,
    ...publicBrandIdentity.serviceMarkets,
    publicBrandIdentity.supportedLanguages,
    ...publicBrandIdentity.supportedLanguages,
    publicBrandIdentity.reviews,
    publicBrandIdentity.reviews.excerpts,
    ...publicBrandIdentity.reviews.excerpts,
  ]) {
    assert.equal(Object.isFrozen(value), true);
  }
  assert.doesNotMatch(
    JSON.stringify(publicBrandIdentity),
    /鈭僑|5 years|Fighter Studio|擛亙ㄚ撌乩?摰?/,
  );
});

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
  assert.doesNotMatch(
    JSON.stringify(publicBrandIdentity),
    /鈭僑|5 years|Fighter Studio|擛亙ㄚ撌乩?摰?/,
  );
});

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

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

test("the generator uses the same KLG organization identity", async () => {
  const generator = await source("scripts/generate-game-landing-pages.mjs");

  assert.match(generator, /publicBrandIdentity/);
  assert.match(generator, /primaryName/);
  assert.match(generator, /alternateName/);
  assert.match(generator, /relationshipStatement/);
  assert.match(generator, /\/klg-studio\//);
});

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

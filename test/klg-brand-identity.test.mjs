import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function containsDisallowedPublicText(value) {
  for (const character of String(value)) {
    const codePoint = character.codePointAt(0);
    const isControlCharacter =
      codePoint <= 0x08 ||
      codePoint === 0x0b ||
      codePoint === 0x0c ||
      (codePoint >= 0x0e && codePoint <= 0x1f);
    const isPrivateUseCharacter = codePoint >= 0xe000 && codePoint <= 0xf8ff;

    if (codePoint === 0xfffd || isControlCharacter || isPrivateUseCharacter) {
      return true;
    }
  }

  return false;
}

test("public text corruption guard catches replacement, private-use, and control characters", () => {
  assert.equal(containsDisallowedPublicText("香港、台灣及澳門"), false);
  assert.equal(containsDisallowedPublicText(`broken${String.fromCharCode(0)}`), true);
  assert.equal(containsDisallowedPublicText("broken\uFFFD"), true);
  assert.equal(containsDisallowedPublicText("broken\uE000"), true);
});

test("public brand data preserves every approved localized fact and is deeply immutable", async () => {
  const { publicBrandIdentity } = await import("../src/data/publicBrand.js");

  assert.deepEqual(publicBrandIdentity.primaryMarket, {
    id: "hong-kong",
    traditionalChinese: "\u9999\u6e2f",
    simplifiedChinese: "\u9999\u6e2f",
    english: "Hong Kong",
  });
  assert.deepEqual(publicBrandIdentity.serviceMarkets, [
    { id: "hong-kong", traditionalChinese: "\u9999\u6e2f", simplifiedChinese: "\u9999\u6e2f", english: "Hong Kong" },
    { id: "taiwan", traditionalChinese: "\u53f0\u7063", simplifiedChinese: "\u53f0\u6e7e", english: "Taiwan" },
    { id: "macau", traditionalChinese: "\u6fb3\u9580", simplifiedChinese: "\u6fb3\u95e8", english: "Macau" },
  ]);
  assert.deepEqual(publicBrandIdentity.supportedLanguages, [
    { id: "zh-Hant", traditionalChinese: "\u7e41\u9ad4\u4e2d\u6587", simplifiedChinese: "\u7e41\u4f53\u4e2d\u6587", english: "Traditional Chinese" },
    { id: "zh-Hans", traditionalChinese: "\u7c21\u9ad4\u4e2d\u6587", simplifiedChinese: "\u7b80\u4f53\u4e2d\u6587", english: "Simplified Chinese" },
    { id: "en", traditionalChinese: "\u82f1\u6587", simplifiedChinese: "\u82f1\u6587", english: "English" },
  ]);
  assert.equal(
    publicBrandIdentity.marketStatement,
    "KLG Studio \u4ee5\u9999\u6e2f\u70ba\u4e3b\u8981\u5e02\u5834\uff0c\u540c\u6642\u70ba\u53f0\u7063\u53ca\u6fb3\u9580\u73a9\u5bb6\u63d0\u4f9b\u7dda\u4e0a\u904a\u6232\u670d\u52d9\uff0c\u652f\u63f4\u7e41\u9ad4\u4e2d\u6587\u3001\u7c21\u9ad4\u4e2d\u6587\u53ca\u82f1\u6587\u67e5\u8a62\u3002",
  );
  assert.equal(
    publicBrandIdentity.contactGuidance.traditionalChinese,
    "香港玩家建議使用 WhatsApp；台灣及澳門玩家可使用 LINE 或 WhatsApp。",
  );
  assert.deepEqual(publicBrandIdentity.reviews.excerpts, [
    { traditionalChinese: "\u5c08\u696d\u3001\u5feb\u624b\u5feb\u8173\u3002", simplifiedChinese: "\u4e13\u4e1a\u3001\u5feb\u624b\u5feb\u811a\u3002", english: "Professional and very efficient." },
    { traditionalChinese: "good\uff0c\u5feb\u624b\u3002", simplifiedChinese: "good\uff0c\u901f\u5ea6\u5feb\u3002", english: "Good and fast." },
    { traditionalChinese: "\u56de\u8986\u5feb\u3001\u6709\u6548\u7387\u3002", simplifiedChinese: "\u56de\u590d\u5feb\u3001\u6709\u6548\u7387\u3002", english: "Fast replies and efficient service." },
    { traditionalChinese: "\u4e0b\u6b21\u8981\u518d\u627e\u4f60\u5e6b\u5fd9\uff0c\u56de\u8986\u5feb\u3001\u6548\u7387\u9ad8\uff0cNice\u3002", simplifiedChinese: "\u4e0b\u6b21\u8fd8\u4f1a\u518d\u627e\u4f60\u5e2e\u5fd9\uff0c\u56de\u590d\u5feb\u3001\u6548\u7387\u9ad8\uff0cNice\u3002", english: "I would ask for help again next time\u2014fast replies and highly efficient. Nice." },
  ]);
  for (const value of [
    publicBrandIdentity.primaryMarket,
    publicBrandIdentity.serviceMarkets,
    ...publicBrandIdentity.serviceMarkets,
    publicBrandIdentity.supportedLanguages,
    ...publicBrandIdentity.supportedLanguages,
    publicBrandIdentity.contactGuidance,
    publicBrandIdentity.reviews,
    publicBrandIdentity.reviews.excerpts,
    ...publicBrandIdentity.reviews.excerpts,
  ]) {
    assert.equal(Object.isFrozen(value), true);
  }
  assert.doesNotMatch(
    JSON.stringify(publicBrandIdentity),
    /\u4e94\u5e74|5 years|Fighter Studio|\u9b25\u58eb\u5de5\u4f5c\u5ba4/,
  );
  assert.equal(containsDisallowedPublicText(JSON.stringify(publicBrandIdentity)), false);
});

test("public brand data centralises real markets, languages, and review evidence", async () => {
  const { publicBrandIdentity } = await import("../src/data/publicBrand.js");

  assert.match(publicBrandIdentity.marketStatement, /香港.*台灣.*澳門/);
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

function extractJsonLdGraph(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
    .flatMap((item) => item["@graph"] ?? [item]);
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
  assert.deepEqual(publicBrandIdentity.verifiedProfiles, [
    "https://www.instagram.com/ken._0517",
    "https://discord.gg/ZW9mwQRQud",
    "https://line.me/ti/p/wWXCT-txMc",
  ]);
});

test("public brand data gives KLG, Aurora, official website, and review evidence distinct roles", async () => {
  const { publicBrandIdentity } = await import("../src/data/publicBrand.js");
  const evidenceUrl =
    "https://www.carousell.com.hk/p/%E5%82%B3%E8%AA%AA%E5%B0%8D%E6%B1%BA%EF%BD%9C%E6%8E%92%E4%BD%8D%E4%BB%A3%E6%89%93-%E9%99%AA%E7%8E%A9%E5%A8%9B%E6%A8%82%EF%BD%9C%E6%96%B0%E8%B3%BD%E5%AD%A3%E8%A1%9D%E5%88%BA%F0%9F%94%A5%EF%BD%9C%E8%A7%92%E8%89%B2%E6%88%B0%E5%8A%9B-%E5%85%A8%E6%9C%8D%E6%A8%99-%E5%B7%94%E5%B3%B0%E8%B3%BD-%E9%A6%99%E6%B8%AFklg%E6%9C%80%E5%BC%B7%E5%B7%A5%E4%BD%9C%E5%AE%A4%F0%9F%94%A5%E6%9A%91%E5%81%87%E5%84%AA%E6%83%A0%E4%B8%AD%F0%9F%94%A5-1374994752/";

  assert.deepEqual(publicBrandIdentity.serviceBrand, { name: "KLG Studio" });
  assert.deepEqual(publicBrandIdentity.operator, { name: "Aurora Esports Studio" });
  assert.equal(publicBrandIdentity.officialWebsiteUrl, "https://auroraesportstudio.com/");
  assert.equal(publicBrandIdentity.reviews.sourceUrl, evidenceUrl);
  assert.equal(Object.isFrozen(publicBrandIdentity.serviceBrand), true);
  assert.equal(Object.isFrozen(publicBrandIdentity.operator), true);
  assert.equal(publicBrandIdentity.verifiedProfiles.includes(evidenceUrl), false);
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

test("KLG page exposes only anonymised verified Carousell review evidence", async () => {
  const { getPublicInfoPageBySlug } = await import("../src/data/publicInfoPages.js");
  const page = getPublicInfoPageBySlug("/klg-studio/");

  assert.equal(page.reviews.rating, 5);
  assert.equal(page.reviews.count, 30);
  assert.equal(page.reviews.profile, "@klg_studio");
  assert.equal(page.reviews.excerpts.length, 4);
  assert.doesNotMatch(JSON.stringify(page.reviews), /phrakhrueng|82299|gordon1121|sofuli68|五年|5 years/);
});

test("home and public pages visibly identify the KLG official service website", async () => {
  const [content, translations, home, game, info, css] = await Promise.all([
    source("src/data/content.js"),
    source("src/data/translations.js"),
    source("src/App.jsx"),
    source("src/GameLandingPage.jsx"),
    source("src/PublicInfoPage.jsx"),
    source("src/styles/index.css"),
  ]);

  assert.match(content, /serviceName:\s*publicBrandIdentity\.primaryName/);
  assert.match(content, /HK · TW · MO/);
  assert.match(translations, /香港為主 · 台灣及澳門均可查詢/);
  assert.match(translations, /Hong Kong first · Taiwan and Macau welcome/);
  assert.match(translations, /香港为主 · 台湾及澳门均可咨询/);
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
  const graph = extractJsonLdGraph(home);
  const brands = graph.filter((item) => item["@type"] === "Brand");
  const organizations = graph.filter((item) => item["@type"] === "Organization");

  assert.match(home, /<title>KLG Studio｜Aurora Esports Studio 官方網站/);
  assert.equal(brands.length, 1);
  assert.equal(brands[0].name, "KLG Studio");
  assert.equal(brands[0]["@id"], "https://auroraesportstudio.com/#brand");
  assert.equal(organizations.length, 1);
  assert.equal(organizations[0].name, "Aurora Esports Studio");
  assert.equal(organizations[0]["@id"], "https://auroraesportstudio.com/#organization");
  assert.equal(Object.hasOwn(organizations[0], "alternateName"), false);
  assert.match(home, /KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌/);
  assert.match(home, /href="\/klg-studio\/"/);

  for (const page of games.gameLandingPages) {
    assert.match(page.seoTitle, /KLG Studio/);
    assert.match(page.seoDescription, /KLG Studio/);
    assert.match(page.searchGuide.paragraphs.join(" "), /Aurora Esports Studio/);
  }
});

test("generated game pages keep KLG Brand and Aurora Organization identities distinct", async () => {
  for (const slug of [
    "arena-of-valor-boosting",
    "honor-of-kings-cn-boosting",
    "honor-of-kings-global-boosting",
  ]) {
    const graph = extractJsonLdGraph(await source(`dist/${slug}/index.html`));
    const brands = graph.filter((item) => item["@type"] === "Brand");
    const organizations = graph.filter((item) => item["@type"] === "Organization");

    assert.equal(brands.length, 1, `${slug} must include one KLG Brand`);
    assert.equal(brands[0].name, "KLG Studio");
    assert.equal(brands[0]["@id"], "https://auroraesportstudio.com/#brand");
    assert.equal(organizations.length, 1, `${slug} must include one Aurora Organization`);
    assert.equal(organizations[0].name, "Aurora Esports Studio");
    assert.equal(organizations[0]["@id"], "https://auroraesportstudio.com/#organization");
    assert.equal(Object.hasOwn(organizations[0], "alternateName"), false);
  }
});

test("Carousell copy and monitoring use the approved KLG relationship", async () => {
  const [copy, monitoring, readme, publicInfoPage] = await Promise.all([
    source("docs/klg-carousell-public-copy.md"),
    source("docs/search-discovery-monitoring.md"),
    source("README.md"),
    source("src/PublicInfoPage.jsx"),
  ]);

  assert.match(copy, /KLG Studio｜Aurora Esports Studio 官方服務網站/);
  assert.match(copy, /https:\/\/auroraesportstudio\.com\//);
  assert.match(copy, /@klg_studio/);
  assert.match(copy, /@klg\.studio/);
  assert.match(copy, /全單 85 折/);
  assert.match(copy, /以香港為主要市場.*台灣及澳門/);
  assert.match(copy, /香港：WhatsApp/);
  assert.match(copy, /台灣及澳門：LINE 或 WhatsApp/);
  assert.doesNotMatch(copy, /七折|送三粒星|零封號|香港最強|最高勝率/);
  assert.doesNotMatch(copy, /為香港及台灣玩家提供/);
  assert.match(monitoring, /以香港為主要市場.*台灣及澳門/);
  assert.match(monitoring, /推薦香港傳說對決代打/);
  assert.match(monitoring, /KLG Studio 官方網站/);
  assert.doesNotMatch(monitoring, /服務香港及台灣玩家/);
  assert.match(readme, /以香港为主要市场.*台湾及澳门/);
  assert.doesNotMatch(readme, /服务香港及台湾玩家/);
  assert.match(publicInfoPage, /publicBrandIdentity\.contactGuidance\.traditionalChinese/);
  assert.doesNotMatch(publicInfoPage, /香港玩家可使用 WhatsApp；台灣玩家可使用 LINE/);
});

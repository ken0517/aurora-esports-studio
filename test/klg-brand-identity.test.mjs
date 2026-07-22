import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8").catch(() => "");
}

test("three indexable game landing pages use the approved clean routes", async () => {
  const data = await source("src/data/gameLandingPages.js");
  const routes = await source("src/lib/publicRoutes.js");

  for (const [gameId, slug] of [
    ["aov", "arena-of-valor-boosting"],
    ["hok-cn", "honor-of-kings-cn-boosting"],
    ["hok-global", "honor-of-kings-global-boosting"],
  ]) {
    assert.match(data, new RegExp(`gameId:\\s*["']${gameId}["']`));
    assert.match(data, new RegExp(`slug:\\s*["']${slug}["']`));
    assert.match(data, new RegExp(`https://auroraesportstudio\\.com/${slug}/`));
  }

  assert.match(routes, /export function resolvePublicRoute/);
  assert.match(routes, /export function buildQuoteEntryUrl/);
});

test("landing page copy is formal Traditional Chinese and does not make unsupported claims", async () => {
  const data = await source("src/data/gameLandingPages.js");

  for (const phrase of [
    "香港傳說對決代打",
    "王者榮耀國服代打",
    "HOK 國際服代打",
    "待人工確認",
  ]) {
    assert.match(data, new RegExp(phrase));
  }

  assert.doesNotMatch(data, /香港第一|全港第一|百分百保證|保證上分/);
});

test("each game page has useful search guidance, expanded FAQs and internal discovery links", async () => {
  const { gameLandingPages } = await import("../src/data/gameLandingPages.js");
  const expectedIds = ["aov", "hok-cn", "hok-global"];

  assert.equal(gameLandingPages.length, 3);
  for (const page of gameLandingPages) {
    assert.match(`${page.seoDescription} ${page.audience} ${page.searchGuide.title}`, /澳門/);
    assert.match(page.searchGuide?.title || "", /香港|台灣/);
    assert.ok((page.searchGuide?.paragraphs || []).length >= 2);
    assert.ok(page.faqs.length >= 5);
    assert.deepEqual(page.relatedGameIds, expectedIds);
    assert.match(`${page.seoTitle} ${page.seoDescription} ${page.searchGuide.paragraphs.join(" ")}`, /代打/);
  }
});

test("game result evidence remains isolated to its matching game", async () => {
  const [{ gameLandingPages }, { games }, { translations }] = await Promise.all([
    import("../src/data/gameLandingPages.js"),
    import("../src/data/content.js"),
    import("../src/data/translations.js"),
  ]);
  const aov = gameLandingPages.find((page) => page.gameId === "aov");
  const hokChina = gameLandingPages.find((page) => page.gameId === "hok-cn");
  const hokGlobal = gameLandingPages.find((page) => page.gameId === "hok-global");

  assert.deepEqual(
    aov.caseStudies.map((item) => item.image),
    [
      "assets/cases/aov-season-record.jpeg",
      "assets/cases/aov-highest-rank.jpeg",
      "assets/cases/aov-ranked-history.jpeg",
    ],
  );
  assert.equal(aov.caseStudies.length, 3);
  assert.ok(aov.caseStudySection?.title);
  assert.ok(aov.caseStudySection?.description);

  assert.equal(hokChina.caseStudies, undefined);
  assert.deepEqual(
    hokGlobal.caseStudies.map((item) => item.image),
    [
      "assets/cases/hok-global-battle-zone-top10-01.jpg",
      "assets/cases/hok-global-battle-zone-top10-02.jpg",
      "assets/cases/hok-global-battle-zone-top10-03.jpg",
      "assets/cases/hok-global-battle-zone-top10-04.jpg",
    ],
  );
  assert.ok(hokGlobal.caseStudySection?.title);
  assert.ok(hokGlobal.caseStudySection?.description);

  for (const item of [...aov.caseStudies, ...hokGlobal.caseStudies]) {
    assert.ok(item.title);
    assert.ok(item.description);
    assert.ok(item.alt);
    assert.ok(item.width > 0);
    assert.ok(item.height > 0);
  }

  assert.equal(
    games.find((game) => game.id === "hok-global").image,
    "/assets/cases/hok-global-battle-zone-top10-04.jpg",
  );
  assert.deepEqual(
    [
      translations["zh-HK"].games["hok-global"].imageAlt,
      translations.en.games["hok-global"].imageAlt,
      translations["zh-CN"].games["hok-global"].imageAlt,
    ],
    [
      "HOK 國際服月度戰區 Top 10 九位英雄紀錄",
      "HOK Global monthly battle-zone Top 10 record showing nine heroes",
      "HOK 国际服月度战区 Top 10 九位英雄记录",
    ],
  );
});

test("root app lazy-loads one shared responsive game landing page", async () => {
  const [rootApp, page, css] = await Promise.all([
    source("src/RootApp.jsx"),
    source("src/GameLandingPage.jsx"),
    source("src/styles/game-landing.css"),
  ]);

  assert.match(rootApp, /lazy\(\(\) => import\("\.\/GameLandingPage\.jsx"\)\)/);
  assert.match(rootApp, /route\.type === "game"/);
  assert.match(page, /getEditorialServicesForGame/);
  assert.match(page, /getGameLandingPageById/);
  assert.match(page, /buildQuoteEntryUrl/);
  assert.match(page, /width="1200"[\s\S]*height="1800"[\s\S]*fetchPriority="high"/);
  assert.match(page, /WhatsApp/);
  assert.match(page, /LINE/);
  assert.match(css, /@media \(max-width: 760px\)/);
});

test("landing page UI renders optional real cases and related games without blocking image load", async () => {
  const [page, css] = await Promise.all([
    source("src/GameLandingPage.jsx"),
    source("src/styles/game-landing.css"),
  ]);

  assert.match(page, /id="case-studies"/);
  assert.match(page, /page\.caseStudies\?\.length/);
  assert.match(page, /page\.caseStudySection\.title/);
  assert.match(page, /page\.caseStudySection\.description/);
  assert.match(page, /<button[\s\S]*?className="game-landing-case__media"[\s\S]*?onClick=\{\(\) => setActiveCaseStudy\(caseStudy\)\}/);
  assert.match(page, /role="dialog"[\s\S]*aria-modal="true"/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /loading="lazy"/);
  assert.match(page, /width=\{caseStudy\.width\}/);
  assert.match(page, /height=\{caseStudy\.height\}/);
  assert.match(page, /實際遊戲紀錄/);
  assert.match(page, /每次結果會因玩家狀況、段位及對局環境而異/);
  assert.match(page, /relatedGameIds/);
  assert.match(page, /buildGameLandingPath/);
  assert.match(css, /game-landing-cases__grid/);
  assert.match(css, /game-landing-lightbox/);
  assert.match(
    css,
    /@media \(max-width: 760px\) \{[\s\S]*?\.game-landing-cases__grid \{ display: flex;[^}]*overflow-x: auto;[^}]*scroll-snap-type: x mandatory;/,
  );
  assert.match(css, /game-landing-related__grid/);
});

test("landing pages and homepage share game-aware quote entry links", async () => {
  const [{ buildQuoteEntryUrl }, { gameLandingPages }] = await Promise.all([
    import("../src/lib/publicRoutes.js"),
    import("../src/data/gameLandingPages.js"),
  ]);
  const [app, deferred, quote] = await Promise.all([
    source("src/App.jsx"),
    source("src/components/DeferredQuoteAssistant.jsx"),
    source("src/components/QuoteAssistant.jsx"),
  ]);

  for (const page of gameLandingPages) {
    assert.match(app, new RegExp(`buildGameLandingPath\\(game\\.id\\)`));
    assert.equal(
      buildQuoteEntryUrl(page.gameId, "manual", "rank"),
      `/?quoteGame=${page.gameId}&quotePane=manual&quoteService=rank#ai-quote`,
    );
  }

  assert.match(app, /quoteGame/);
  assert.match(app, /quotePane/);
  assert.match(deferred, /prefillRequest\?\.pane/);
  assert.match(quote, /prefillRequest\?\.gameId/);
});

test("home and game pages link to public Aurora trust pages", async () => {
  const [home, game] = await Promise.all([
    source("src/App.jsx"),
    source("src/GameLandingPage.jsx"),
  ]);

  for (const path of ["/about-aurora/", "/service-process-safety/"]) {
    assert.match(home, new RegExp(path.replaceAll("/", "\\/")));
    assert.match(game, new RegExp(path.replaceAll("/", "\\/")));
  }
});

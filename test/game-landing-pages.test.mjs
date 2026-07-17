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
    assert.match(page.searchGuide?.title || "", /香港|台灣/);
    assert.ok((page.searchGuide?.paragraphs || []).length >= 2);
    assert.ok(page.faqs.length >= 5);
    assert.deepEqual(page.relatedGameIds, expectedIds);
    assert.match(`${page.seoTitle} ${page.seoDescription} ${page.searchGuide.paragraphs.join(" ")}`, /代打/);
  }
});

test("the supplied AOV evidence is isolated to the Arena of Valor page", async () => {
  const { gameLandingPages } = await import("../src/data/gameLandingPages.js");
  const aov = gameLandingPages.find((page) => page.gameId === "aov");
  const otherPages = gameLandingPages.filter((page) => page.gameId !== "aov");

  assert.deepEqual(
    aov.caseStudies.map((item) => item.image),
    [
      "assets/cases/aov-season-record.jpeg",
      "assets/cases/aov-highest-rank.jpeg",
      "assets/cases/aov-ranked-history.jpeg",
    ],
  );
  assert.equal(aov.caseStudies.length, 3);
  for (const item of aov.caseStudies) {
    assert.ok(item.title);
    assert.ok(item.description);
    assert.ok(item.alt);
    assert.ok(item.width > 0);
    assert.ok(item.height > 0);
  }
  assert.ok(otherPages.every((page) => !page.caseStudies?.length));
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
  assert.match(page, /loading="lazy"/);
  assert.match(page, /width=\{caseStudy\.width\}/);
  assert.match(page, /height=\{caseStudy\.height\}/);
  assert.match(page, /實際遊戲紀錄/);
  assert.match(page, /每次結果會因玩家狀況、段位及對局環境而異/);
  assert.match(page, /relatedGameIds/);
  assert.match(page, /buildGameLandingPath/);
  assert.match(css, /game-landing-cases__grid/);
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

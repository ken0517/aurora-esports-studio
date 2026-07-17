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

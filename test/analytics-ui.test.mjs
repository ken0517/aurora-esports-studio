import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("the public entry point initializes analytics and records one page view", async () => {
  const main = await source("src/main.jsx");
  assert.match(main, /initializeAnalytics/);
  assert.match(main, /trackPageView/);
  assert.match(main, /window\.location\.pathname/);
});

test("homepage quote and contact actions use the shared safe analytics helpers", async () => {
  const [app, deferred] = await Promise.all([
    source("src/App.jsx"),
    source("src/components/DeferredQuoteAssistant.jsx"),
  ]);

  assert.match(app, /trackServiceQuote/);
  assert.match(app, /trackQuoteEntry/);
  assert.match(app, /trackContactClick/);
  assert.match(deferred, /trackQuoteEntry/);
  assert.match(deferred, /method:\s*"manual"/);
  assert.match(deferred, /method:\s*"ai"/);
});

test("quote results and outbound quote actions record IDs and status only", async () => {
  const quote = await source("src/components/QuoteAssistant.jsx");
  assert.match(quote, /trackQuoteResult/);
  assert.match(quote, /gameId:\s*draft\.gameId/);
  assert.match(quote, /serviceId:\s*draft\.serviceId/);
  assert.match(quote, /status:\s*quote\.status/);
  assert.match(quote, /trackContactClick\("whatsapp"\)/);
  assert.match(quote, /trackContactClick\("line"\)/);
  assert.doesNotMatch(quote, /trackQuoteResult\([\s\S]{0,250}(?:aiInput|quoteText|additionalRequirements)/);
});

test("game landing page tracks quote method, service ID and contact channel", async () => {
  const page = await source("src/GameLandingPage.jsx");
  assert.match(page, /trackQuoteEntry/);
  assert.match(page, /trackServiceQuote/);
  assert.match(page, /trackContactClick/);
});

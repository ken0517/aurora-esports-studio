import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("public entry does not statically include the administrator application", async () => {
  const main = await source("src/main.jsx");
  const root = await source("src/RootApp.jsx");
  assert.doesNotMatch(main, /import AdminApp from/);
  assert.match(root, /lazy\(\(\) => import\("\.\/AdminApp\.jsx"\)\)/);
});

test("quote assistant is deferred until customer interaction or browser idle time", async () => {
  const app = await source("src/App.jsx");
  const deferred = await source("src/components/DeferredQuoteAssistant.jsx");
  assert.doesNotMatch(app, /import QuoteAssistant from/);
  assert.match(app, /DeferredQuoteAssistant/);
  assert.match(deferred, /lazy\(\(\) => import\("\.\/QuoteAssistant\.jsx"\)\)/);
  assert.match(deferred, /requestIdleCallback|setTimeout/);
});

test("hero stays eager while non-hero game images are lazy and dimensioned", async () => {
  const app = await source("src/App.jsx");
  assert.match(app, /hero-desktop\.webp/);
  assert.match(app, /hero-mobile\.webp/);
  assert.match(app, /fetchPriority="high"/);
  assert.match(app, /game-story__image[\s\S]*?width="1200"[\s\S]*?height="1800"[\s\S]*?loading="lazy"[\s\S]*?decoding="async"/);
});

test("content uses compressed game evidence images", async () => {
  const content = await source("src/data/content.js");
  assert.doesNotMatch(content, /game-(?:aov|hok-cn|hok-global)-user\.png/);
  assert.match(content, /game-aov-user\.webp/);
  assert.match(content, /game-hok-cn-user\.webp/);
  assert.match(content, /game-hok-global-user\.webp/);
});

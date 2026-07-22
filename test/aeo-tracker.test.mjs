import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const csvUrl = new URL("../docs/aeo/klg-aeo-prompts.csv", import.meta.url);
const guideUrl = new URL("../docs/aeo/free-aeo-tracking-guide.md", import.meta.url);

test("AEO baseline contains exactly 25 empty prompts in the approved distribution", async () => {
  const csv = await readFile(csvUrl, "utf8");
  const lines = csv.trim().split(/\r?\n/);
  assert.equal(lines.length, 26);
  assert.equal(lines[0], "id,market,category,prompt,check_date,ai_platform,klg_mentioned,official_link_included,brand_position,sentiment_or_correctness,competitors_mentioned,cited_sources,next_action");

  const markets = lines.slice(1).map((line) => line.split(",")[1]);
  assert.equal(markets.filter((market) => market === "Hong Kong").length, 12);
  assert.equal(markets.filter((market) => market === "Taiwan").length, 5);
  assert.equal(markets.filter((market) => market === "Macau").length, 3);
  assert.equal(markets.filter((market) => market === "Brand/review/competitor").length, 5);
  assert.equal(lines.filter((line) => line.includes("Fighter Studio HK")).length, 2);
  assert.ok(lines.slice(1).every((line) => line.endsWith(",,,,,,,,,")));
});

test("AEO guide forbids fabricated answers and defines the weekly three-engine check", async () => {
  const guide = await readFile(guideUrl, "utf8");
  assert.match(guide, /ChatGPT/);
  assert.match(guide, /Gemini/);
  assert.match(guide, /Perplexity/);
  assert.match(guide, /不可推測、補寫或偽造/);
  assert.match(guide, /https:\/\/auroraesportstudio\.com\//);
  assert.match(guide, /Fighter Studio HK/);
});

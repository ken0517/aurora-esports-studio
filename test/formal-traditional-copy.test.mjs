import assert from "node:assert/strict";
import test from "node:test";

import { buildSystemInstructions } from "../server/quote-ai-handler.mjs";
import { quoteSuggestions } from "../src/data/suggestions.js";
import { pricingCatalog } from "../src/data/pricing.js";
import { translations } from "../src/data/translations.js";

const spokenPhrases = ["幾多錢", "我哋", "點收費", "我唔知", "揀邊個", "幫我揀"];

test("Traditional Chinese display copy uses formal written wording", () => {
  const visibleCopy = JSON.stringify(translations["zh-HK"]);
  const suggestionLabels = quoteSuggestions.map((item) => item.labels["zh-HK"]).join("\n");

  for (const phrase of spokenPhrases) {
    assert.equal(visibleCopy.includes(phrase), false, phrase);
    assert.equal(suggestionLabels.includes(phrase), false, phrase);
  }
});

test("Aurora understands Cantonese but replies in formal Traditional Chinese", () => {
  const instructions = buildSystemInstructions(
    "zh-HK",
    {},
    { status: "incomplete", requiresManualReview: true },
    pricingCatalog,
  );

  assert.match(instructions, /formal written Traditional Chinese/i);
  assert.match(instructions, /Hong Kong Cantonese/);
  assert.doesNotMatch(instructions, /natural Hong Kong Cantonese wording/);
});

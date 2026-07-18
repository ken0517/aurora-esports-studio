import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const approvedNumber = "447442619658";
const retiredNumber = "85262243840";

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("all public WhatsApp entry points use Aurora's approved UK number", async () => {
  const paths = [
    "index.html",
    "scripts/generate-game-landing-pages.mjs",
    "src/data/content.js",
    "src/lib/quoteEngine.js",
    "src/components/QuoteAssistant.jsx",
  ];
  const sources = await Promise.all(paths.map(read));
  const combined = sources.join("\n");

  assert.match(combined, new RegExp(`https://wa\\.me/${approvedNumber}`));
  assert.doesNotMatch(combined, new RegExp(retiredNumber));
});

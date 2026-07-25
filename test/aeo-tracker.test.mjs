import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const csvUrl = new URL("../docs/aeo/klg-aeo-prompts.csv", import.meta.url);
const resultsUrl = new URL("../docs/aeo/klg-aeo-baseline-results.csv", import.meta.url);
const guideUrl = new URL("../docs/aeo/free-aeo-tracking-guide.md", import.meta.url);

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function isIsoCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [year, month, day] = match.slice(1).map(Number);
  const daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

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

function assertValidResultsMatrix(promptIds, resultsRows) {
  const [header, ...observations] = resultsRows;
  const fields = Object.fromEntries(header.map((field, index) => [field, index]));
  const platforms = ["ChatGPT", "Gemini", "Perplexity"];
  const validMentionValues = new Set(["yes", "no"]);
  const validPositions = new Set(["first", "second", "third_or_later", "not_listed"]);
  const validSentiments = new Set(["positive", "neutral", "negative", "incorrect"]);

  assert.deepEqual(header, [
    "prompt_id", "ai_platform", "observation_status", "observation_date",
    "klg_mentioned", "official_link_included", "brand_position",
    "sentiment_or_correctness", "competitors_mentioned", "cited_sources",
    "evidence_reference", "next_action",
  ]);
  assert.equal(observations.length, 75);

  const observationKeys = observations.map((row) => `${row[fields.prompt_id]}:${row[fields.ai_platform]}`);
  assert.equal(new Set(observationKeys).size, 75);
  assert.deepEqual(new Set(observationKeys), new Set(promptIds.flatMap((promptId) => platforms.map((platform) => `${promptId}:${platform}`))));

  for (const row of observations) {
    assert.equal(row.length, header.length);
    const status = row[fields.observation_status];
    assert.ok(["not_run", "measured"].includes(status));

    if (status === "not_run") {
      assert.ok(row.slice(fields.observation_date).every((value) => value === ""));
      continue;
    }

    assert.ok(isIsoCalendarDate(row[fields.observation_date]));
    assert.notEqual(row[fields.evidence_reference], "");
    assert.ok(validMentionValues.has(row[fields.klg_mentioned]));
    assert.ok(validMentionValues.has(row[fields.official_link_included]));
    assert.ok(validPositions.has(row[fields.brand_position]));
    assert.ok(validSentiments.has(row[fields.sentiment_or_correctness]));
  }
}

test("AEO results matrix contains one honest observation for every prompt and AI platform", async () => {
  const [promptsCsv, resultsCsv] = await Promise.all([
    readFile(csvUrl, "utf8"),
    readFile(resultsUrl, "utf8"),
  ]);
  const promptIds = parseCsv(promptsCsv).slice(1).map((row) => row[0]);
  assertValidResultsMatrix(promptIds, parseCsv(resultsCsv));
});

test("AEO results contract rejects impossible measured dates and uneven CSV rows", async () => {
  const [promptsCsv, resultsCsv] = await Promise.all([
    readFile(csvUrl, "utf8"),
    readFile(resultsUrl, "utf8"),
  ]);
  const promptIds = parseCsv(promptsCsv).slice(1).map((row) => row[0]);
  const matrixWithUnevenRow = parseCsv(resultsCsv);
  matrixWithUnevenRow[1].push("unexpected column");

  for (const invalidDate of ["2026-99-99", "2026-02-31"]) {
    const matrixWithInvalidDate = parseCsv(resultsCsv);
    matrixWithInvalidDate[1] = [
      "AEO-001", "ChatGPT", "measured", invalidDate, "yes", "no",
      "first", "positive", "", "", "https://example.test/evidence", "",
    ];
    assert.throws(() => assertValidResultsMatrix(promptIds, matrixWithInvalidDate), assert.AssertionError);
  }
  assert.throws(() => assertValidResultsMatrix(promptIds, matrixWithUnevenRow), assert.AssertionError);
});

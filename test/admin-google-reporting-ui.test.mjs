import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("traffic admin combines internal enquiries with consented Google reporting", async () => {
  const panel = await source("src/admin/TrafficPanel.jsx");
  for (const copy of [
    "網站訪客",
    "平均停留時間",
    "重要活動",
    "HOK 頁面表現",
    "Google 搜尋字詞",
    "已提交查詢的客源概況",
  ]) assert.match(panel, new RegExp(copy));
  assert.match(panel, /loadGoogleReporting/);
  assert.match(panel, /configured === false/);
});

test("Google reporting client uses the shared protected backend base", async () => {
  const client = await source("src/admin/googleReportingClient.js");
  assert.match(client, /catalogApiUrl\("\/api\/admin\/google-reporting"\)/);
  assert.match(client, /credentials:\s*"include"/);
});

test("Vercel exposes the protected Google reporting function", async () => {
  const vercel = JSON.parse(await source("vercel.json"));
  assert.equal(vercel.functions["api/admin/google-reporting.mjs"].maxDuration, 10);
});

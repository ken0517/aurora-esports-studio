import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("manual quote offers the three approved display currencies and dynamic price notices", async () => {
  const quote = await source("src/components/QuoteAssistant.jsx");
  assert.match(quote, /id="ai-quote-currency"/);
  for (const currency of ["HKD", "TWD", "CNY"]) {
    assert.match(quote, new RegExp(`<option value="${currency}"`));
  }
  assert.match(quote, /已套用 Aurora 正式價格及新人 85 折/);
  assert.match(quote, /此項服務需要由 Aurora 客服人工確認/);
});

test("hero contact dock uses branded images and keeps platform names visible on mobile", async () => {
  const app = await source("src/App.jsx");
  const css = await source("src/styles/index.css");
  assert.match(app, /brandIcon/);
  assert.match(app, /<img[^>]+alt=/);
  assert.doesNotMatch(css, /\.cinematic-hero__social-link span\s*\{\s*display:\s*none/);
  for (const id of ["whatsapp", "instagram", "discord", "line", "carousell"]) {
    assert.match(app, new RegExp(`brands/${id}\\.svg`));
  }
});

test("hero places its newcomer offer under the wordmark without payment marks", async () => {
  const app = await source("src/App.jsx");
  const css = await source("src/styles/index.css");
  const wordmark = app.match(/<a className="hero-wordmark"[\s\S]*?<\/a>/)?.[0] || "";
  assert.match(wordmark, /hero-wordmark__offer/);
  assert.doesNotMatch(app, /paymentIconPaths|hero-promo__payments|className="hero-promo"/);
  assert.match(css, /\.hero-wordmark__offer/);
  assert.match(
    css,
    /\.cinematic-hero__socials\s*\{[\s\S]*?bottom:\s*calc\((?:15[0-9]|1[6-9][0-9]|[2-9][0-9]{2})px/,
  );
});

test("admin can edit the newcomer discount and approved exchange rates without retired charges", async () => {
  const admin = await source("src/AdminApp.jsx");
  assert.match(admin, /新人優惠折扣/);
  assert.match(admin, /新台幣匯率/);
  assert.match(admin, /人民幣匯率/);
  assert.doesNotMatch(admin, /加急附加費|指定時段附加費|保持 70%\+ 勝率附加費/);
  assert.doesNotMatch(admin, /"USD", "GBP"/);
});

test("quote assistant acknowledges service-data processing on active submission without checkboxes", async () => {
  const quote = await source("src/components/QuoteAssistant.jsx");
  assert.doesNotMatch(quote, /aurora-data-consent-manual|aurora-data-consent-ai/);
  assert.doesNotMatch(quote, /const\s*\[\s*conversationConsent|setConversationConsent|!conversationConsent|ui\.consentRequired/);
  assert.equal(quote.match(/privacyUi\.inlineNotice/g)?.length, 2);
  assert.equal(quote.match(/service-data-notice/g)?.length, 2);
  assert.match(quote, /href="\/privacy\/"/);
  assert.match(quote, /consent:\s*true/);
  assert.match(quote, /conversationConsent:\s*true/);
  assert.match(quote, /sessionId/);
  assert.match(quote, /\/api\/enquiries/);
});

test("admin labels an enquiry with no recorded quote as not yet quoted", async () => {
  const panel = await source("src/admin/ConversationsPanel.jsx");
  assert.match(panel, /尚未報價／未記錄/);
});

test("application startup delegates storage resolution to safe acquisition tracking", async () => {
  const main = await source("src/main.jsx");
  assert.doesNotMatch(main, /storage:\s*window\.sessionStorage/);
});

test("manual quote capture sends a stable client submission ID", async () => {
  const quote = await source("src/components/QuoteAssistant.jsx");
  assert.match(quote, /submissionId:\s*result\.submissionId/);
});

test("manual quote capture excludes internal references before serialising the public request", async () => {
  const quote = await source("src/components/QuoteAssistant.jsx");
  const captureStart = quote.indexOf("const captureEnquiry");
  const projectionStart = quote.indexOf(
    "const { reference: _reference, referenceNumber: _referenceNumber, ...customerQuote } = result;",
    captureStart,
  );
  const serialisationStart = quote.indexOf("body: JSON.stringify", captureStart);
  const captureEnd = quote.indexOf("const generateQuote", serialisationStart);
  const requestProjection = quote.slice(serialisationStart, captureEnd);

  assert.notEqual(captureStart, -1, "manual enquiry capture should be found");
  assert.ok(
    projectionStart > captureStart && projectionStart < serialisationStart,
    "internal references should be removed before request serialisation",
  );
  assert.match(requestProjection, /quote:\s*customerQuote/);
  assert.doesNotMatch(requestProjection, /quote:\s*result/);
});

test("quote result rows exclude internal quote references", async () => {
  const quote = await source("src/components/QuoteAssistant.jsx");
  const resultCardStart = quote.indexOf('<div className="quote-result">');
  const resultRowsStart = quote.lastIndexOf("const rows = [", resultCardStart);
  const resultRows = quote.slice(resultRowsStart, resultCardStart);

  assert.notEqual(resultRowsStart, -1, "quote result rows should be found");
  assert.doesNotMatch(resultRows, /quote\?\.referenceNumber|quote\?\.reference/);
});

test("homepage game stories link to the three dedicated service pages", async () => {
  const app = await source("src/App.jsx");
  assert.match(app, /buildGameLandingPath/);
  assert.match(app, /href=\{buildGameLandingPath\(game\.id\)\}/);
});

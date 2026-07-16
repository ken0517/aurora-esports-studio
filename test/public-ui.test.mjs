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

test("homepage promo shows newcomer offer and non-clickable payment marks", async () => {
  const app = await source("src/App.jsx");
  assert.match(app, /新人優惠・全單自動享 85 折/);
  for (const id of ["alipay", "wechat-pay", "fps"]) {
    assert.match(app, new RegExp(`brands/${id}\\.svg`));
  }
  const promo = app.match(/<div className="hero-promo"[\s\S]*?<\/div>/)?.[0] || "";
  assert.ok(promo);
  assert.doesNotMatch(promo, /<a\b/);
});

test("admin can edit the newcomer discount and approved exchange rates without retired charges", async () => {
  const admin = await source("src/AdminApp.jsx");
  assert.match(admin, /新人優惠折扣/);
  assert.match(admin, /新台幣匯率/);
  assert.match(admin, /人民幣匯率/);
  assert.doesNotMatch(admin, /加急附加費|指定時段附加費|保持 70%\+ 勝率附加費/);
  assert.doesNotMatch(admin, /"USD", "GBP"/);
});

test("quote assistant saves only consented conversations and enquiries", async () => {
  const quote = await source("src/components/QuoteAssistant.jsx");
  assert.match(quote, /我同意 Aurora 保存本次報價及對話資料/);
  assert.match(quote, /請勿傳送密碼、驗證碼或付款資料/);
  assert.match(quote, /conversationConsent/);
  assert.match(quote, /sessionId/);
  assert.match(quote, /\/api\/enquiries/);
  assert.match(quote, /!conversationConsent/);
});

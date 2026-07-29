import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("public trust pages use unique indexable routes and formal Traditional Chinese", async () => {
  const { publicInfoPages, getPublicInfoPageBySlug } = await import(
    "../src/data/publicInfoPages.js"
  );

  assert.deepEqual(
    publicInfoPages.map((page) => page.slug),
    ["klg-studio", "about-aurora", "service-process-safety"],
  );
  assert.equal(
    getPublicInfoPageBySlug("/about-aurora/")?.title,
    "關於 Aurora Esports Studio",
  );
  const aboutPage = getPublicInfoPageBySlug("/about-aurora/");
  const safetyPage = getPublicInfoPageBySlug("/service-process-safety/");
  assert.match(aboutPage.intro, /線上遊戲服務工作室/);
  assert.match(aboutPage.intro, /不設實體門市/);
  assert.match(safetyPage.title, /服務流程與安全說明/);
  assert.match(JSON.stringify(publicInfoPages), /香港.*台灣.*澳門/);
  assert.doesNotMatch(
    JSON.stringify(publicInfoPages),
    /只限香港|僅限香港|香港及台灣玩家提供線上查詢及安排/,
  );
  assert.doesNotMatch(
    JSON.stringify(publicInfoPages),
    /全港第一|零風險|保證上分|門市地址|金额/,
  );
});

test("public trust routes lazy-load one shared responsive page", async () => {
  const { resolvePublicRoute } = await import("../src/lib/publicRoutes.js");

  assert.deepEqual(resolvePublicRoute("/about-aurora/"), {
    type: "info",
    slug: "about-aurora",
  });
  assert.deepEqual(resolvePublicRoute("/service-process-safety/"), {
    type: "info",
    slug: "service-process-safety",
  });

  const [root, page, css] = await Promise.all([
    readFile(new URL("../src/RootApp.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/PublicInfoPage.jsx", import.meta.url), "utf8").catch(
      () => "",
    ),
    readFile(new URL("../src/styles/public-info.css", import.meta.url), "utf8").catch(
      () => "",
    ),
  ]);

  assert.match(root, /lazy\(\(\) => import\("\.\/PublicInfoPage\.jsx"\)\)/);
  assert.match(root, /route\.type === "info"/);
  assert.match(page, /getPublicInfoPageBySlug/);
  assert.match(page, /page\.sections\.map/);
  assert.match(page, /page\.faqs\.map/);
  assert.match(css, /@media \(max-width: 760px\)/);
});

test("privacy has a dedicated public route and lazy-loaded page", async () => {
  const { resolvePublicRoute } = await import("../src/lib/publicRoutes.js");
  const root = await source("src/RootApp.jsx");

  assert.deepEqual(resolvePublicRoute("/privacy/"), { type: "privacy" });
  assert.match(root, /lazy\(\(\) => import\("\.\/PrivacyPolicyPage\.jsx"\)\)/);
  assert.match(root, /route\.type === "privacy"/);
});

test("shared public info renderer supports sourced review quotations", async () => {
  const page = await source("src/PublicInfoPage.jsx");
  const css = await source("src/styles/public-info.css");
  const generator = await source("scripts/generate-game-landing-pages.mjs");

  assert.match(page, /page\.reviews/);
  assert.match(page, /blockquote/);
  assert.match(css, /public-info__reviews/);
  assert.match(generator, /renderInfoReviews/);
});

test("generated review evidence appears only on the KLG public page", async () => {
  const klgHtml = await source("dist/klg-studio/index.html");

  assert.match(klgHtml, /id="public-reviews"/);
  assert.match(klgHtml, /5\.0／5 · 30 條 Carousell 公開評價/);
  assert.match(klgHtml, /@klg_studio/);
  assert.match(klgHtml, /最後核對日期 2026-07-22/);

  for (const route of [
    "about-aurora",
    "service-process-safety",
    "arena-of-valor-boosting",
    "honor-of-kings-cn-boosting",
    "honor-of-kings-global-boosting",
  ]) {
    const html = await source(`dist/${route}/index.html`);
    assert.doesNotMatch(html, /id="public-reviews"|30 條 Carousell 公開評價/);
  }
});

test("KLG and the home crawler make official and review evidence actionable external links", async () => {
  const officialWebsiteUrl = "https://auroraesportstudio.com/";
  const reviewEvidenceUrl =
    "https://www.carousell.com.hk/p/%E5%82%B3%E8%AA%AA%E5%B0%8D%E6%B1%BA%EF%BD%9C%E6%8E%92%E4%BD%8D%E4%BB%A3%E6%89%93-%E9%99%AA%E7%8E%A9%E5%A8%9B%E6%A8%82%EF%BD%9C%E6%96%B0%E8%B3%BD%E5%AD%A3%E8%A1%9D%E5%88%BA%F0%9F%94%A5%EF%BD%9C%E8%A7%92%E8%89%B2%E6%88%B0%E5%8A%9B-%E5%85%A8%E6%9C%8D%E6%A8%99-%E5%B7%94%E5%B3%B0%E8%B3%BD-%E9%A6%99%E6%B8%AFklg%E6%9C%80%E5%BC%B7%E5%B7%A5%E4%BD%9C%E5%AE%A4%F0%9F%94%A5%E6%9A%91%E5%81%87%E5%84%AA%E6%83%A0%E4%B8%AD%F0%9F%94%A5-1374994752/";
  const [home, homeTemplate, klgHtml, page] = await Promise.all([
    source("dist/index.html"),
    source("index.html"),
    source("dist/klg-studio/index.html"),
    source("src/PublicInfoPage.jsx"),
  ]);

  for (const html of [home, homeTemplate, klgHtml]) {
    assert.match(
      html,
      new RegExp(`<a href="${officialWebsiteUrl}" target="_blank" rel="noopener noreferrer">`),
    );
  }
  assert.match(
    klgHtml,
    new RegExp(`<a href="${reviewEvidenceUrl}" target="_blank" rel="noopener noreferrer">`),
  );
  assert.match(
    page,
    /href=\{publicBrandIdentity\.officialWebsiteUrl\}[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"/,
  );
  assert.match(
    page,
    /href=\{page\.reviews\.sourceUrl\}[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"/,
  );
});

test("review evidence links remain exclusive to the KLG public route", async () => {
  const reviewEvidenceUrl =
    "https://www.carousell.com.hk/p/%E5%82%B3%E8%AA%AA%E5%B0%8D%E6%B1%BA%EF%BD%9C%E6%8E%92%E4%BD%8D%E4%BB%A3%E6%89%93-%E9%99%AA%E7%8E%A9%E5%A8%9B%E6%A8%82%EF%BD%9C%E6%96%B0%E8%B3%BD%E5%AD%A3%E8%A1%9D%E5%88%BA%F0%9F%94%A5%EF%BD%9C%E8%A7%92%E8%89%B2%E6%88%B0%E5%8A%9B-%E5%85%A8%E6%9C%8D%E6%A8%99-%E5%B7%94%E5%B3%B0%E8%B3%BD-%E9%A6%99%E6%B8%AFklg%E6%9C%80%E5%BC%B7%E5%B7%A5%E4%BD%9C%E5%AE%A4%F0%9F%94%A5%E6%9A%91%E5%81%87%E5%84%AA%E6%83%A0%E4%B8%AD%F0%9F%94%A5-1374994752/";

  for (const route of [
    "about-aurora",
    "service-process-safety",
    "arena-of-valor-boosting",
    "honor-of-kings-cn-boosting",
    "honor-of-kings-global-boosting",
  ]) {
    const html = await source(`dist/${route}/index.html`);
    assert.doesNotMatch(html, new RegExp(reviewEvidenceUrl));
  }
});

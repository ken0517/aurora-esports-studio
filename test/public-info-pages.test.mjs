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

test("shared public info renderer supports sourced review quotations", async () => {
  const page = await source("src/PublicInfoPage.jsx");
  const css = await source("src/styles/public-info.css");
  const generator = await source("scripts/generate-game-landing-pages.mjs");

  assert.match(page, /page\.reviews/);
  assert.match(page, /blockquote/);
  assert.match(css, /public-info__reviews/);
  assert.match(generator, /renderInfoReviews/);
});

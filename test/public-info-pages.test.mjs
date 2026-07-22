import assert from "node:assert/strict";
import test from "node:test";

test("public trust pages use unique indexable routes and formal Traditional Chinese", async () => {
  const { publicInfoPages, getPublicInfoPageBySlug } = await import(
    "../src/data/publicInfoPages.js"
  );

  assert.deepEqual(
    publicInfoPages.map((page) => page.slug),
    ["about-aurora", "service-process-safety"],
  );
  assert.equal(
    getPublicInfoPageBySlug("/about-aurora/")?.title,
    "關於 Aurora Esports Studio",
  );
  assert.match(publicInfoPages[0].intro, /線上遊戲服務工作室/);
  assert.match(publicInfoPages[0].intro, /不設實體門市/);
  assert.match(publicInfoPages[1].title, /服務流程與安全說明/);
  assert.doesNotMatch(
    JSON.stringify(publicInfoPages),
    /全港第一|零風險|保證上分|門市地址|金额/,
  );
});

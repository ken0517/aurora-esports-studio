import assert from "node:assert/strict";
import test from "node:test";

test("KLG is the primary service name for the Aurora official website", async () => {
  const { publicBrandIdentity } = await import("../src/data/publicBrand.js");

  assert.equal(publicBrandIdentity.primaryName, "KLG Studio");
  assert.equal(publicBrandIdentity.alternateName, "Aurora Esports Studio");
  assert.equal(
    publicBrandIdentity.websiteName,
    "KLG Studio｜Aurora Esports Studio 官方網站",
  );
  assert.equal(publicBrandIdentity.officialOrigin, "https://auroraesportstudio.com");
  assert.equal(
    publicBrandIdentity.relationshipStatement,
    "KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，唯一官方網站為 https://auroraesportstudio.com/",
  );
  assert.deepEqual(publicBrandIdentity.carousellAccounts, [
    "@klg_studio",
    "@klg.studio",
  ]);
  assert.ok(
    publicBrandIdentity.verifiedProfiles.includes(
      "https://carousell.app.link/BWYWpLY692b",
    ),
  );
});

test("KLG public page states the approved relationship without unsupported claims", async () => {
  const { getPublicInfoPageBySlug } = await import(
    "../src/data/publicInfoPages.js"
  );
  const page = getPublicInfoPageBySlug("/klg-studio/");
  const copy = JSON.stringify(page);

  assert.equal(page.slug, "klg-studio");
  assert.equal(
    page.seoTitle,
    "香港 KLG Studio 傳說對決代打與陪玩｜Aurora Esports Studio 官方網站",
  );
  assert.match(copy, /KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌/);
  assert.match(copy, /@klg_studio/);
  assert.match(copy, /@klg\.studio/);
  assert.match(copy, /不設實體門市/);
  assert.doesNotMatch(copy, /香港最強|零封號|保證最高勝率|保證推薦|鬥士工作室/);
});

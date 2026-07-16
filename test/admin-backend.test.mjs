import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import {
  createAdminToken,
  verifyAdminPassword,
  verifyAdminToken,
} from "../server/admin-auth.mjs";
import {
  handleAdminCatalog,
  handleAdminSession,
  handlePublicCatalog,
} from "../server/admin-api.mjs";
import { createCatalogStore } from "../server/catalog-store.mjs";
import {
  createDefaultRuntimeCatalog,
  normalizeRuntimeCatalog,
} from "../src/data/runtimeCatalog.js";
import { calculateQuote } from "../src/lib/quoteEngine.js";

const env = {
  NODE_ENV: "test",
  AURORA_ALLOW_MEMORY_STORAGE: "true",
  AURORA_ADMIN_PASSWORD: "test-password-with-length",
  AURORA_ADMIN_SESSION_SECRET: "a-test-session-secret-that-is-longer-than-32-characters",
};

async function withServer(run) {
  const store = createCatalogStore({ env });
  const server = createServer((req, res) => {
    let promise;
    if (req.url === "/api/catalog") promise = handlePublicCatalog(req, res, { store });
    else if (req.url === "/api/admin/session") promise = handleAdminSession(req, res, { env });
    else if (req.url === "/api/admin/catalog") promise = handleAdminCatalog(req, res, { store, env });
    else {
      res.statusCode = 404;
      res.end();
      return;
    }
    Promise.resolve(promise).catch((error) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("admin password and signed session token reject tampering", () => {
  assert.equal(verifyAdminPassword(env.AURORA_ADMIN_PASSWORD, env), true);
  assert.equal(verifyAdminPassword("wrong", env), false);
  const token = createAdminToken(env, 1_000_000);
  assert.equal(verifyAdminToken(token, env, 1_001_000), true);
  assert.equal(verifyAdminToken(`${token}x`, env, 1_001_000), false);
  assert.equal(verifyAdminToken(token, env, 1_000_000 + 13 * 60 * 60_000), false);
});

test("catalog normalization strips unknown data and blocks automatic manual-service quotes", () => {
  const input = createDefaultRuntimeCatalog();
  input.games.aov.rank = {
    ...input.games.aov.rank,
    configured: true,
    basePrice: 120,
    unknownSecret: "must-not-survive",
  };
  input.games.aov["hero-power"] = {
    ...input.games.aov["hero-power"],
    configured: true,
    basePrice: 999,
  };
  const catalog = normalizeRuntimeCatalog(input);
  assert.equal(catalog.games.aov.rank.configured, true);
  assert.equal(catalog.games.aov.rank.unknownSecret, undefined);
  assert.equal(catalog.games.aov["hero-power"].configured, false);
});

test("runtime catalogue can produce an authoritative configured quote", () => {
  const catalog = createDefaultRuntimeCatalog();
  catalog.configured = true;
  catalog.currency = "HKD";
  catalog.games["hok-cn"].rank.configured = true;
  catalog.games["hok-cn"].rank.divisionStepPrices["diamond:III"] = 60;
  catalog.games["hok-cn"].rank.divisionStepPrices["diamond:II"] = 60;
  catalog.games["hok-cn"].rank.divisionStepPrices["diamond:I"] = 60;
  const quote = calculateQuote({
    locale: "zh-CN",
    gameId: "hok-cn",
    serviceId: "rank",
    currentRankId: "diamond",
    currentDivision: "III",
    currentStars: 2,
    targetRankId: "veteran",
    targetDivision: "V",
    targetStars: 1,
  }, { pricingCatalog: catalog, reference: "AUR-RUNTIME-TEST" });
  assert.equal(quote.status, "quoted");
  assert.equal(quote.finalTotal, 153);
  assert.equal(quote.estimatedCompletionTime, null);
});

test("admin API requires login and persists published catalogue changes", async () => {
  await withServer(async (origin) => {
    const unauthenticated = await fetch(`${origin}/api/admin/catalog`);
    assert.equal(unauthenticated.status, 401);

    const login = await fetch(`${origin}/api/admin/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: env.AURORA_ADMIN_PASSWORD }),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];

    const currentResponse = await fetch(`${origin}/api/admin/catalog`, { headers: { Cookie: cookie } });
    assert.equal(currentResponse.status, 200);
    const current = await currentResponse.json();
    current.catalog.games.aov.rank.minimumPrice = 88;
    current.catalog.games.aov.rank.configured = true;
    current.catalog.games.aov.rank.estimatedCompletionTime = "当天开始";

    const save = await fetch(`${origin}/api/admin/catalog`, {
      method: "PUT",
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        catalog: current.catalog,
        expectedRevision: current.catalog.revision,
      }),
    });
    assert.equal(save.status, 200);

    const publicResponse = await fetch(`${origin}/api/catalog`);
    const published = await publicResponse.json();
    assert.equal(published.catalog.games.aov.rank.minimumPrice, 88);
    assert.equal(published.catalog.games.aov.rank.estimatedCompletionTime, "当天开始");
    assert.notEqual(published.catalog.revision, "default");
  });
});

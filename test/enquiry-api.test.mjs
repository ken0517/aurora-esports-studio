import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import { handlePublicEnquiry } from "../server/enquiry-api.mjs";
import { normalizeOperationsState } from "../server/operations-model.mjs";

const sessionId = "77777777-7777-4777-8777-777777777777";

function createMemoryStore() {
  let state = normalizeOperationsState({});
  let writes = 0;
  return {
    configured: true,
    get writes() { return writes; },
    async read() { return structuredClone(state); },
    async write(next, expectedRevision) {
      assert.equal(expectedRevision, state.revision);
      state = normalizeOperationsState({ ...next, revision: `revision-${writes + 1}`, updatedAt: new Date().toISOString() });
      state.revision = `revision-${writes + 1}`;
      state.updatedAt = new Date().toISOString();
      writes += 1;
      return structuredClone(state);
    },
  };
}

async function withServer(store, callback) {
  const server = createServer((req, res) => handlePublicEnquiry(req, res, { store }));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const origin = `http://127.0.0.1:${server.address().port}`;
  try { return await callback(origin); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}

test("public enquiry endpoint is write-only and requires explicit consent", async () => {
  const store = createMemoryStore();
  await withServer(store, async (origin) => {
    const getResponse = await fetch(`${origin}/api/enquiries`);
    assert.equal(getResponse.status, 405);

    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, consent: false, source: "manual_quote" }),
    });
    assert.equal(response.status, 400);
    assert.equal(store.writes, 0);
  });
});

test("a consented completed quote creates a redacted enquiry and never an order", async () => {
  const store = createMemoryStore();
  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        consent: true,
        source: "manual_quote",
        locale: "zh-HK",
        draft: { gameId: "aov", serviceId: "rank", additionalRequirements: "密碼 secret123，不要公開", displayCurrency: "TWD" },
        quote: { reference: "AUR-CONSENT-1", status: "quoted", currency: "TWD", finalTotal: 212.5, sourceFinalTotal: 50, requiresManualReview: false },
      }),
    });
    assert.equal(response.status, 201);
    const payload = await response.json();
    assert.match(payload.enquiryId, /^[0-9a-f-]{36}$/);
    assert.equal(payload.reference, "AUR-CONSENT-1");

    const state = await store.read();
    assert.equal(state.enquiries.length, 1);
    assert.equal(state.orders.length, 0);
    assert.ok(state.enquiries[0].consentedAt);
    assert.equal(state.enquiries[0].gameId, "aov");
    assert.doesNotMatch(state.enquiries[0].draft.additionalRequirements, /secret123/);
  });
});

test("public enquiry endpoint enforces a strict payload limit", async () => {
  const store = createMemoryStore();
  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, consent: true, source: "manual_quote", padding: "x".repeat(80_000) }),
    });
    assert.equal(response.status, 413);
    assert.equal(store.writes, 0);
  });
});

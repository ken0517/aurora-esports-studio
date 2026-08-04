import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import { handlePublicEnquiry, persistConversationTurn } from "../server/enquiry-api.mjs";
import { normalizeOperationsState } from "../server/operations-model.mjs";
import { pricingCatalog } from "../src/data/pricing.js";
import { calculateQuote } from "../src/lib/quoteEngine.js";

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

async function withServer(store, callback, options = {}) {
  const server = createServer((req, res) => handlePublicEnquiry(req, res, {
    store,
    catalogStore: { async read() { return pricingCatalog; } },
    rateBuckets: new Map(),
    ...options,
  }));
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

test("public enquiry rejects a game-bound option that belongs to another game", async () => {
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
        draft: {
          gameId: "hok-global",
          serviceId: "rank",
          serverRegionId: "southeast-asia",
          devicePlatformId: "ios",
          currentRankId: "diamond",
          currentDivision: "III",
          currentStars: 0,
          targetRankId: "veteran",
          targetDivision: "V",
          targetStars: 0,
        },
      }),
    });

    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "invalid-game-option");
    assert.equal(store.writes, 0);
  });
});

test("public enquiry rejects a country that belongs to another game", async () => {
  const store = createMemoryStore();
  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        consent: true,
        source: "manual_quote",
        locale: "en",
        draft: {
          gameId: "aov",
          serviceId: "rank",
          serverCountryId: "malaysia",
          currentRankId: "bronze",
          currentDivision: "III",
          currentStars: 0,
          targetRankId: "bronze",
          targetDivision: "II",
          targetStars: 0,
        },
      }),
    });

    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "invalid-game-option");
    assert.equal(store.writes, 0);
  });
});

test("public enquiry normalizes an HOK priority country into its server region and stores both", async () => {
  const store = createMemoryStore();
  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        consent: true,
        source: "manual_quote",
        locale: "en",
        draft: {
          gameId: "hok-global",
          serviceId: "rank",
          serverCountryId: "malaysia",
          currentRankId: "diamond",
          currentDivision: "III",
          currentStars: 0,
          targetRankId: "veteran",
          targetDivision: "V",
          targetStars: 0,
        },
      }),
    });

    assert.equal(response.status, 201);
    const state = await store.read();
    assert.equal(state.enquiries[0].draft.serverCountryId, "malaysia");
    assert.equal(state.enquiries[0].draft.serverRegionId, "southeast-asia");
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
        draft: {
          gameId: "aov",
          serviceId: "rank",
          currentRankId: "bronze",
          currentDivision: "III",
          currentStars: 0,
          targetRankId: "bronze",
          targetDivision: "II",
          targetStars: 0,
          preferredHero: "密碼 secret123；OTP 654321；HKID A123456(3)",
          preferredStartTime: "2026-08-01T20:00",
          additionalRequirements: "台灣身分證 A123456789；passport no. K12345678",
          displayCurrency: "TWD",
        },
        quote: {
          reference: "AUR-CUSTOMER-CHOSEN",
          referenceNumber: "AUR-CUSTOMER-CHOSEN",
          status: "quoted",
          currency: "TWD",
          finalTotal: 212.5,
          sourceFinalTotal: 50,
          requiresManualReview: false,
          reason: null,
        },
        acquisition: {
          firstTouch: {
            channel: "carousell",
            landingPath: "/hok-rank-boost/?secret=yes",
            referrerHost: "www.carousell.com.hk/private/path",
            utmSource: "carousell",
            utmMedium: "marketplace",
            utmCampaign: "klg_listing",
            capturedAt: "2026-07-29T09:00:00.000Z",
            gclid: "must-not-be-saved",
          },
          lastTouch: {
            channel: "google",
            landingPath: "/",
            referrerHost: "www.google.com",
            capturedAt: "2026-07-29T09:05:00.000Z",
          },
        },
      }),
    });
    assert.equal(response.status, 201);
    const payload = await response.json();
    assert.deepEqual(payload, { accepted: true });

    const state = await store.read();
    const savedEnquiry = state.enquiries[0];
    assert.equal(state.enquiries.length, 1);
    assert.equal(state.orders.length, 0);
    assert.notEqual(savedEnquiry.quoteReference, "AUR-CUSTOMER-CHOSEN");
    assert.match(savedEnquiry.quoteReference, /^AUR-/);
    assert.ok(state.enquiries[0].consentedAt);
    assert.equal(state.enquiries[0].gameId, "aov");
    assert.doesNotMatch(
      JSON.stringify(state.enquiries[0].draft),
      /secret123|654321|A123456\(3\)|A123456789|K12345678/,
    );
    assert.match(state.enquiries[0].draft.preferredHero, /已過濾/);
    assert.equal(state.enquiries[0].draft.currentRankId, "bronze");
    assert.equal(state.enquiries[0].draft.preferredStartTime, "2026-08-01T20:00");
    assert.equal(state.enquiries[0].quote.status, "quoted");
    assert.equal(state.enquiries[0].quote.finalTotal, 180.63);
    assert.equal(state.enquiries[0].quote.sourceFinalTotal, 42.5);
    assert.equal(state.enquiries[0].acquisition.firstTouch.channel, "carousell");
    assert.equal(state.enquiries[0].acquisition.firstTouch.landingPath, "/hok-rank-boost/");
    assert.equal(state.enquiries[0].acquisition.lastTouch.channel, "google");
    assert.equal(state.enquiries[0].acquisition.firstTouch.gclid, undefined);
  });
});

test("manual enquiry submissions are idempotent and only an explicit new interaction creates another enquiry", async () => {
  const store = createMemoryStore();
  const firstSubmissionId = "99999999-9999-4999-8999-999999999999";
  const secondSubmissionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const thirdSubmissionId = "abababab-abab-4bab-8bab-abababababab";
  const fourthSubmissionId = "acacacac-acac-4cac-8cac-acacacacacac";
  const payload = {
    sessionId,
    consent: true,
    source: "manual_quote",
    locale: "zh-HK",
    draft: {
      gameId: "aov",
      serviceId: "rank",
      currentRankId: "bronze",
      currentDivision: "III",
      currentStars: 0,
      targetRankId: "bronze",
      targetDivision: "II",
      targetStars: 0,
    },
    quote: { reference: "AUR-IDEMPOTENT", status: "quoted", currency: "HKD", finalTotal: 100, requiresManualReview: false },
  };

  await withServer(store, async (origin) => {
    const post = (submissionId, newInteraction = false) => fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, submissionId, newInteraction }),
    });

    const first = await post(firstSubmissionId);
    const firstPayload = await first.json();
    const retry = await post(firstSubmissionId);
    const retryPayload = await retry.json();
    const distinct = await post(secondSubmissionId);
    const distinctPayload = await distinct.json();
    const explicitNew = await post(thirdSubmissionId, true);
    const explicitNewPayload = await explicitNew.json();
    const followUp = await post(fourthSubmissionId);
    const followUpPayload = await followUp.json();
    const invalid = await post("not-a-submission-id");

    assert.equal(first.status, 201);
    assert.equal(retry.status, 200);
    assert.deepEqual(firstPayload, { accepted: true });
    assert.deepEqual(retryPayload, { accepted: true });
    assert.equal(distinct.status, 200);
    assert.deepEqual(distinctPayload, { accepted: true });
    assert.equal(explicitNew.status, 201);
    assert.deepEqual(explicitNewPayload, { accepted: true });
    assert.equal(followUp.status, 200);
    assert.deepEqual(followUpPayload, { accepted: true });
    assert.equal(invalid.status, 400);
  });

  const state = await store.read();
  assert.equal(state.enquiries.length, 2);
  assert.deepEqual(state.enquiries.map((enquiry) => enquiry.submissionId), [firstSubmissionId, thirdSubmissionId]);
  assert.deepEqual(state.enquiries.map((enquiry) => enquiry.submissionIds), [
    [firstSubmissionId, secondSubmissionId],
    [thirdSubmissionId, fourthSubmissionId],
  ]);
});

test("manual enquiry rejects forged amounts and stores the authoritative central quote", async () => {
  const store = createMemoryStore();
  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        submissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        consent: true,
        source: "manual_quote",
        locale: "zh-HK",
        draft: {
          gameId: "hok-global",
          serverRegionId: "southeast-asia",
          serviceId: "duo",
          duoMode: "match-5v5",
          quantity: 3,
          preferredStartTime: "2030-08-08T20:00",
          displayCurrency: "HKD",
        },
        quote: {
          reference: "AUR-FORGED-AMOUNT",
          status: "quoted",
          currency: "HKD",
          finalTotal: 1,
          sourceFinalTotal: 1,
          requiresManualReview: false,
        },
      }),
    });
    assert.equal(response.status, 201);
  });

  const state = await store.read();
  assert.equal(state.enquiries.length, 1);
  assert.notEqual(state.enquiries[0].quoteReference, "AUR-FORGED-AMOUNT");
  assert.match(state.enquiries[0].quoteReference, /^AUR-/);
  assert.equal(state.enquiries[0].quote.status, "quoted");
  assert.equal(state.enquiries[0].quote.currency, "HKD");
  assert.equal(state.enquiries[0].quote.finalTotal, 51);
  assert.equal(state.enquiries[0].quote.sourceFinalTotal, 51);
  assert.equal(state.enquiries[0].quote.requiresManualReview, false);
});

test("runtime pricing overrides bundled pricing and any client-supplied amount", async () => {
  const store = createMemoryStore();
  const runtimeCatalog = structuredClone(pricingCatalog);
  runtimeCatalog.games["hok-global"].duo.matchPricing.unitPrice = 60;
  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        submissionId: "bcbcbcbc-bcbc-4bcb-8bcb-bcbcbcbcbcbc",
        consent: true,
        source: "manual_quote",
        locale: "zh-HK",
        draft: {
          gameId: "hok-global",
          serverRegionId: "southeast-asia",
          serviceId: "duo",
          duoMode: "match-5v5",
          quantity: 3,
          preferredStartTime: "2030-08-08T20:00",
          displayCurrency: "HKD",
        },
        quote: { reference: "AUR-RUNTIME-CATALOG", status: "quoted", finalTotal: 1 },
      }),
    });
    assert.equal(response.status, 201);
  }, {
    catalogStore: { async read() { return runtimeCatalog; } },
  });

  const state = await store.read();
  assert.equal(state.enquiries[0].quote.status, "quoted");
  assert.equal(state.enquiries[0].quote.finalTotal, 153);
  assert.equal(state.enquiries[0].quote.sourceFinalTotal, 153);
});

test("manual-only and incomplete drafts cannot be forged into completed quotes", async () => {
  const store = createMemoryStore();
  const incompleteSubmission = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  const manualSubmission = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  await withServer(store, async (origin) => {
    const post = (submissionId, draft) => fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        submissionId,
        newInteraction: true,
        consent: true,
        source: "manual_quote",
        locale: "zh-HK",
        draft,
        quote: {
          reference: `AUR-${submissionId.slice(0, 8)}`,
          status: "quoted",
          currency: "HKD",
          finalTotal: 1,
          requiresManualReview: false,
        },
      }),
    });

    assert.equal((await post(incompleteSubmission, {
      gameId: "hok-global",
      serviceId: "duo",
      duoMode: "match-5v5",
    })).status, 201);
    assert.equal((await post(manualSubmission, {
      gameId: "aov",
      serviceId: "peak",
      currentPoints: 1000,
      targetPoints: 1100,
    })).status, 201);
  });

  const state = await store.read();
  const incomplete = state.enquiries.find((item) => item.submissionId === incompleteSubmission);
  const manual = state.enquiries.find((item) => item.submissionId === manualSubmission);
  assert.equal(incomplete.quote.status, "incomplete");
  assert.equal(incomplete.quote.finalTotal, null);
  assert.equal(incomplete.status, "awaiting_details");
  assert.equal(manual.quote.status, "manual_review");
  assert.equal(manual.quote.finalTotal, null);
  assert.equal(manual.status, "awaiting_quote_confirmation");
});

test("an AI enquiry and later manual quote for the same session, game and service share one enquiry", async () => {
  const store = createMemoryStore();
  const aiDraft = {
    locale: "zh-HK",
    gameId: "hok-global",
    serverRegionId: "southeast-asia",
    serviceId: "duo",
    duoMode: "match-5v5",
    quantity: 2,
    preferredStartTime: "2030-08-08T20:00",
    displayCurrency: "HKD",
  };
  await persistConversationTurn({
    store,
    sessionId,
    consent: true,
    locale: "zh-HK",
    messages: [{ role: "user", content: "HOK 陪玩兩局" }],
    assistantMessage: "已整理資料。",
    quoteContext: aiDraft,
    quoteResult: calculateQuote(aiDraft, { pricingCatalog, reference: "AUR-AI-FIRST" }),
    now: () => new Date("2026-07-29T12:00:00.000Z"),
  });
  const before = await store.read();
  const originalId = before.enquiries[0].id;
  const conversationId = before.enquiries[0].conversationId;

  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        submissionId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        consent: true,
        source: "manual_quote",
        locale: "zh-HK",
        draft: { ...aiDraft, quantity: 3 },
        quote: { reference: "AUR-MANUAL-AFTER-AI", status: "quoted", finalTotal: 1 },
      }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { accepted: true });
  });

  const state = await store.read();
  assert.equal(state.enquiries.length, 1);
  assert.equal(state.enquiries[0].id, originalId);
  assert.equal(state.enquiries[0].conversationId, conversationId);
  assert.equal(state.enquiries[0].source, "manual_quote");
  assert.notEqual(state.enquiries[0].quoteReference, "AUR-MANUAL-AFTER-AI");
  assert.match(state.enquiries[0].quoteReference, /^AUR-/);
  assert.equal(state.enquiries[0].quote.finalTotal, 51);
});

test("a manual enquiry and later AI quote for the same session, game and service share one enquiry", async () => {
  const store = createMemoryStore();
  const draft = {
    locale: "zh-HK",
    gameId: "hok-global",
    serverRegionId: "southeast-asia",
    serviceId: "duo",
    duoMode: "match-5v5",
    quantity: 2,
    preferredStartTime: "2030-08-08T20:00",
    displayCurrency: "HKD",
  };

  let manualEnquiryId;
  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        submissionId: "edededed-eded-4ded-8ded-edededededed",
        consent: true,
        source: "manual_quote",
        locale: "zh-HK",
        draft,
        quote: { reference: "AUR-MANUAL-FIRST", status: "quoted", finalTotal: 1 },
      }),
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { accepted: true });
    const state = await store.read();
    manualEnquiryId = state.enquiries[0].id;
  });

  await persistConversationTurn({
    store,
    sessionId,
    consent: true,
    locale: "zh-HK",
    messages: [{ role: "user", content: "HOK 5V5 陪玩兩局" }],
    assistantMessage: "已整理報價。",
    quoteContext: draft,
    quoteResult: calculateQuote(draft, { pricingCatalog, reference: "AUR-AI-AFTER-MANUAL" }),
    now: () => new Date("2026-07-29T12:30:00.000Z"),
  });

  const state = await store.read();
  assert.equal(state.enquiries.length, 1);
  assert.equal(state.enquiries[0].id, manualEnquiryId);
  assert.ok(state.enquiries[0].conversationId);
  assert.equal(state.enquiries[0].quoteReference, "AUR-AI-AFTER-MANUAL");
  assert.equal(state.enquiries[0].quote.finalTotal, 34);
});

test("a later quote never mutates an enquiry that has already been converted into an order", async () => {
  const store = createMemoryStore();
  const baseDraft = {
    gameId: "hok-global",
    serverRegionId: "southeast-asia",
    serviceId: "duo",
    duoMode: "match-5v5",
    quantity: 1,
    preferredStartTime: "2030-08-08T20:00",
    displayCurrency: "HKD",
  };
  await withServer(store, async (origin) => {
    const post = (submissionId, quantity, reference) => fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        submissionId,
        consent: true,
        source: "manual_quote",
        locale: "zh-HK",
        draft: { ...baseDraft, quantity },
        quote: { reference, status: "quoted", finalTotal: 1 },
      }),
    });

    const first = await post(
      "12121212-1212-4212-8212-121212121212",
      1,
      "AUR-CONVERTED-FIRST",
    );
    assert.equal(first.status, 201);
    assert.deepEqual(await first.json(), { accepted: true });

    const current = await store.read();
    const firstEnquiry = current.enquiries.find((item) => (
      item.submissionId === "12121212-1212-4212-8212-121212121212"
    ));
    const firstEnquiryId = firstEnquiry.id;
    current.orders.push({
      id: "13131313-1313-4313-8313-131313131313",
      enquiryId: firstEnquiryId,
      status: "awaiting_payment",
      gameId: "hok-global",
      serviceId: "duo",
      quoteReference: firstEnquiry.quoteReference,
      currency: "HKD",
      finalTotal: 17,
      createdAt: "2026-07-29T12:00:00.000Z",
      updatedAt: "2026-07-29T12:00:00.000Z",
    });
    await store.write(current, current.revision);

    const later = await post(
      "14141414-1414-4414-8414-141414141414",
      3,
      "AUR-AFTER-CONVERSION",
    );
    assert.equal(later.status, 201);
    assert.deepEqual(await later.json(), { accepted: true });
  });

  const state = await store.read();
  assert.equal(state.enquiries.length, 2);
  assert.equal(state.orders.length, 1);
  const converted = state.enquiries.find((item) => (
    item.submissionId === "12121212-1212-4212-8212-121212121212"
  ));
  const later = state.enquiries.find((item) => (
    item.submissionId === "14141414-1414-4414-8414-141414141414"
  ));
  assert.notEqual(converted.quoteReference, "AUR-CONVERTED-FIRST");
  assert.notEqual(later.quoteReference, "AUR-AFTER-CONVERSION");
  assert.match(converted.quoteReference, /^AUR-/);
  assert.match(later.quoteReference, /^AUR-/);
  assert.equal(converted.quote.finalTotal, 17);
  assert.equal(later.quote.finalTotal, 51);
});

test("a later AI quote never mutates an enquiry that has already been converted into an order", async () => {
  const store = createMemoryStore();
  const draft = {
    locale: "zh-HK",
    gameId: "hok-global",
    serverRegionId: "southeast-asia",
    serviceId: "duo",
    duoMode: "match-5v5",
    quantity: 1,
    preferredStartTime: "2030-08-08T20:00",
    displayCurrency: "HKD",
  };
  await persistConversationTurn({
    store,
    sessionId,
    consent: true,
    quoteContext: draft,
    quoteResult: calculateQuote(draft, { pricingCatalog, reference: "AUR-AI-LOCKED" }),
    now: () => new Date("2026-07-29T13:00:00.000Z"),
  });
  const beforeConversion = await store.read();
  const lockedEnquiry = beforeConversion.enquiries[0];
  beforeConversion.orders.push({
    id: "15151515-1515-4515-8515-151515151515",
    enquiryId: lockedEnquiry.id,
    status: "awaiting_payment",
    gameId: "hok-global",
    serviceId: "duo",
    quoteReference: lockedEnquiry.quoteReference,
    currency: "HKD",
    finalTotal: lockedEnquiry.quote.finalTotal,
    createdAt: "2026-07-29T13:05:00.000Z",
    updatedAt: "2026-07-29T13:05:00.000Z",
  });
  await store.write(beforeConversion, beforeConversion.revision);

  const laterDraft = { ...draft, quantity: 3 };
  await persistConversationTurn({
    store,
    sessionId,
    consent: true,
    quoteContext: laterDraft,
    quoteResult: calculateQuote(laterDraft, { pricingCatalog, reference: "AUR-AI-AFTER-ORDER" }),
    now: () => new Date("2026-07-29T13:10:00.000Z"),
  });

  const state = await store.read();
  assert.equal(state.enquiries.length, 2);
  const locked = state.enquiries.find((item) => item.id === lockedEnquiry.id);
  const later = state.enquiries.find((item) => item.id !== lockedEnquiry.id);
  assert.equal(locked.quoteReference, "AUR-AI-LOCKED");
  assert.equal(locked.quote.finalTotal, 17);
  assert.equal(later.quoteReference, "AUR-AI-AFTER-ORDER");
  assert.equal(later.quote.finalTotal, 51);
  assert.equal(state.orders[0].finalTotal, 17);
});

test("retrying any submission id remains idempotent after its enquiry becomes an order", async () => {
  const store = createMemoryStore();
  const firstSubmissionId = "16161616-1616-4616-8616-161616161616";
  const followUpSubmissionId = "17171717-1717-4717-8717-171717171717";
  const payload = {
    sessionId,
    consent: true,
    source: "manual_quote",
    locale: "zh-HK",
    draft: {
      gameId: "hok-global",
      serviceId: "duo",
      duoMode: "match-5v5",
      quantity: 1,
      preferredStartTime: "2030-08-08T20:00",
    },
  };
  await withServer(store, async (origin) => {
    const post = (submissionId) => fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, submissionId }),
    });
    const first = await post(firstSubmissionId);
    assert.deepEqual(await first.json(), { accepted: true });
    assert.equal((await post(followUpSubmissionId)).status, 200);

    const current = await store.read();
    const enquiryId = current.enquiries[0].id;
    current.orders.push({
      id: "18181818-1818-4818-8818-181818181818",
      enquiryId,
      status: "awaiting_payment",
      gameId: "hok-global",
      serviceId: "duo",
      currency: "HKD",
      finalTotal: 17,
      createdAt: "2026-07-29T14:00:00.000Z",
      updatedAt: "2026-07-29T14:00:00.000Z",
    });
    await store.write(current, current.revision);

    const retry = await post(followUpSubmissionId);
    assert.equal(retry.status, 200);
    assert.deepEqual(await retry.json(), { accepted: true });
  });

  const state = await store.read();
  assert.equal(state.enquiries.length, 1);
  assert.equal(state.orders.length, 1);
});

test("public enquiry rejects a disallowed browser origin before writing", async () => {
  const store = createMemoryStore();
  await withServer(store, async (origin) => {
    const response = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://attacker.example",
      },
      body: JSON.stringify({ sessionId, consent: true, source: "manual_quote" }),
    });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error, "origin-not-allowed");
    assert.equal(store.writes, 0);
  }, { env: { AI_ALLOWED_ORIGINS: "https://auroraesportstudio.com" } });
});

test("public enquiry rate limit stops repeated writes from the same client", async () => {
  const store = createMemoryStore();
  const rateBuckets = new Map();
  const payload = {
    sessionId,
    submissionId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    consent: true,
    source: "manual_quote",
    locale: "zh-HK",
    draft: {
      gameId: "hok-global",
      serviceId: "duo",
      duoMode: "match-5v5",
      quantity: 1,
      preferredStartTime: "2030-08-08T20:00",
    },
  };
  await withServer(store, async (origin) => {
    for (let index = 0; index < 24; index += 1) {
      const response = await fetch(`${origin}/api/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      assert.notEqual(response.status, 429);
    }
    const limited = await fetch(`${origin}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(limited.status, 429);
    assert.equal((await limited.json()).error, "rate-limit");
    assert.equal(limited.headers.get("retry-after"), "60");
  }, { rateBuckets, now: () => 1_000 });
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

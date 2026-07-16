import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeOperationsState,
  operationsOrderStatuses,
  redactSensitiveText,
} from "../server/operations-model.mjs";
import { createOperationsStore } from "../server/operations-store.mjs";

const ids = {
  conversation: "11111111-1111-4111-8111-111111111111",
  enquiry: "22222222-2222-4222-8222-222222222222",
  order: "33333333-3333-4333-8333-333333333333",
  staff: "44444444-4444-4444-8444-444444444444",
};

test("operations defaults use 90-day retention and the approved status set", () => {
  const state = normalizeOperationsState({});
  assert.deepEqual(state.conversations, []);
  assert.deepEqual(state.enquiries, []);
  assert.deepEqual(state.orders, []);
  assert.deepEqual(state.staff, []);
  assert.equal(state.businessRules.retentionDays, 90);
  assert.deepEqual(operationsOrderStatuses, [
    "new_enquiry",
    "awaiting_details",
    "awaiting_quote_confirmation",
    "awaiting_payment",
    "confirmed",
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ]);
});

test("sensitive customer text is redacted before storage", () => {
  const input = "密碼：secret123，驗證碼 654321，信用卡 4111 1111 1111 1111，CVV 123";
  const redacted = redactSensitiveText(input);
  assert.doesNotMatch(redacted, /secret123|654321|4111|CVV 123/);
  assert.match(redacted, /已過濾/);
});

test("normalization strips unknown fields and rejects invalid order statuses", () => {
  const state = normalizeOperationsState({
    unknownSecret: "drop-me",
    conversations: [{
      id: ids.conversation,
      sessionId: "55555555-5555-4555-8555-555555555555",
      consentedAt: "2026-07-16T10:00:00.000Z",
      createdAt: "2026-07-16T10:00:00.000Z",
      updatedAt: "2026-07-16T10:00:00.000Z",
      locale: "zh-HK",
      gameId: "aov",
      serviceId: "rank",
      messages: [{ role: "user", text: "我的密碼是 abc123", createdAt: "2026-07-16T10:00:00.000Z", providerTrace: "drop" }],
      providerTrace: "drop",
    }],
    enquiries: [{ id: ids.enquiry, conversationId: ids.conversation, status: "new_enquiry", createdAt: "2026-07-16T10:01:00.000Z", updatedAt: "2026-07-16T10:01:00.000Z", source: "ai", quoteReference: "AUR-TEST", extra: "drop" }],
    orders: [
      { id: ids.order, enquiryId: ids.enquiry, status: "scheduled", createdAt: "2026-07-16T10:02:00.000Z", updatedAt: "2026-07-16T10:02:00.000Z", internalNotes: "ok", extra: "drop" },
      { id: "66666666-6666-4666-8666-666666666666", status: "paid-ish", createdAt: "2026-07-16T10:02:00.000Z", updatedAt: "2026-07-16T10:02:00.000Z" },
    ],
    staff: [{ id: ids.staff, displayName: "Aurora A", active: true, gameIds: ["aov", "bad"], serviceIds: ["rank", "bad"], secret: "drop" }],
  });

  assert.equal(state.unknownSecret, undefined);
  assert.equal(state.conversations[0].providerTrace, undefined);
  assert.equal(state.conversations[0].messages[0].providerTrace, undefined);
  assert.doesNotMatch(state.conversations[0].messages[0].text, /abc123/);
  assert.equal(state.enquiries[0].extra, undefined);
  assert.equal(state.orders.length, 1);
  assert.equal(state.orders[0].status, "scheduled");
  assert.deepEqual(state.staff[0].gameIds, ["aov"]);
  assert.deepEqual(state.staff[0].serviceIds, ["rank"]);
});

test("memory operations store persists writes and enforces revision conflicts", async () => {
  const store = createOperationsStore({ env: { NODE_ENV: "test", AURORA_ALLOW_MEMORY_STORAGE: "true" } });
  const initial = await store.read();
  initial.businessRules.dailyCapacity = 4;
  const saved = await store.write(initial, initial.revision);
  assert.equal(saved.businessRules.dailyCapacity, 4);
  assert.ok(saved.revision);
  assert.notEqual(saved.revision, initial.revision);

  const reread = await store.read();
  assert.equal(reread.revision, saved.revision);
  await assert.rejects(
    store.write({ ...reread, businessRules: { ...reread.businessRules, dailyCapacity: 5 } }, "stale-revision"),
    /operations-revision-conflict/,
  );
});

test("operations writes fail safely when private storage is not configured", async () => {
  const store = createOperationsStore({ env: {} });
  assert.equal(store.configured, false);
  await assert.rejects(store.write(normalizeOperationsState({})), /operations-storage-not-configured/);
});

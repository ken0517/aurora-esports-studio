import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import { createAdminToken } from "../server/admin-auth.mjs";
import { handleAdminOperations } from "../server/operations-api.mjs";
import { normalizeOperationsState } from "../server/operations-model.mjs";

const env = {
  AURORA_ADMIN_PASSWORD: "test-password",
  AURORA_ADMIN_SESSION_SECRET: "operations-test-secret-that-is-long-enough-12345",
};
const enquiryIds = [
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
];

function enquiry(id, reference) {
  return {
    id,
    conversationId: null,
    sessionId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    status: "new_enquiry",
    source: "manual_quote",
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "rank",
    quoteReference: reference,
    draft: { gameId: "aov", serviceId: "rank", displayCurrency: "HKD" },
    quote: { reference, status: "quoted", currency: "HKD", finalTotal: 85, sourceFinalTotal: 85, requiresManualReview: false },
    consentedAt: "2026-07-16T10:00:00.000Z",
    createdAt: "2026-07-16T10:00:00.000Z",
    updatedAt: "2026-07-16T10:00:00.000Z",
  };
}

function createStore() {
  let state = normalizeOperationsState({ enquiries: [enquiry(enquiryIds[0], "AUR-1"), enquiry(enquiryIds[1], "AUR-2")] });
  let revisionNumber = 0;
  return {
    configured: true,
    async read() { return structuredClone(state); },
    async write(next, expectedRevision) {
      assert.equal(expectedRevision, state.revision);
      revisionNumber += 1;
      state = normalizeOperationsState({ ...next, revision: `r-${revisionNumber}`, updatedAt: new Date().toISOString() });
      state.revision = `r-${revisionNumber}`;
      state.updatedAt = new Date().toISOString();
      return structuredClone(state);
    },
  };
}

async function withServer(store, callback) {
  const server = createServer((req, res) => handleAdminOperations(req, res, { store, env }));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const origin = `http://127.0.0.1:${server.address().port}`;
  try { return await callback(origin); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}

async function request(origin, path = "", { method = "GET", body, authenticated = true } = {}) {
  const response = await fetch(`${origin}/api/admin/operations${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(authenticated ? { Cookie: `aurora_admin=${encodeURIComponent(createAdminToken(env))}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { response, payload: await response.json() };
}

test("operations routes require administrator authentication", async () => {
  await withServer(createStore(), async (origin) => {
    const { response } = await request(origin, "", { authenticated: false });
    assert.equal(response.status, 401);
  });
});

test("administrator can convert enquiries, manage appointments and receive overlap warnings", async () => {
  await withServer(createStore(), async (origin) => {
    const firstConversion = await request(origin, "/action", { method: "POST", body: { action: "convert_enquiry", enquiryId: enquiryIds[0] } });
    assert.equal(firstConversion.response.status, 200, JSON.stringify(firstConversion.payload));
    const firstOrder = firstConversion.payload.order;
    assert.equal(firstOrder.status, "awaiting_quote_confirmation");
    assert.equal(firstOrder.quoteReference, "AUR-1");

    const invalidTransition = await request(origin, "/action", { method: "POST", body: { action: "update_order_status", orderId: firstOrder.id, status: "completed" } });
    assert.equal(invalidTransition.response.status, 400);

    const staffResult = await request(origin, "/action", { method: "POST", body: { action: "upsert_staff", staff: { displayName: "Aurora 成員 A", active: true, gameIds: ["aov"], serviceIds: ["rank"] } } });
    assert.equal(staffResult.response.status, 200);
    const staffId = staffResult.payload.staff.id;

    const combinedUpdate = await request(origin, "/action", {
      method: "POST",
      body: {
        action: "update_order",
        orderId: firstOrder.id,
        order: {
          customerName: "Rapid edit customer",
          contactMethod: "whatsapp",
          contactValue: "",
          internalNotes: "",
          staffId,
        },
      },
    });
    assert.equal(combinedUpdate.response.status, 200);
    assert.equal(combinedUpdate.payload.order.customerName, "Rapid edit customer");
    assert.equal(combinedUpdate.payload.order.staffId, staffId);

    const businessResult = await request(origin, "/action", { method: "POST", body: { action: "update_business_rules", businessRules: { ...staffResult.payload.state.businessRules, dailyCapacity: 1, retentionDays: 90 } } });
    assert.equal(businessResult.response.status, 200);

    const assignment = await request(origin, "/action", { method: "POST", body: { action: "assign_staff", orderId: firstOrder.id, staffId } });
    assert.equal(assignment.response.status, 200);
    const firstAppointment = await request(origin, "/action", { method: "POST", body: { action: "update_appointment", orderId: firstOrder.id, appointment: { date: "2030-08-08", startTime: "20:00", durationMinutes: 120, timezone: "Asia/Hong_Kong" } } });
    assert.equal(firstAppointment.response.status, 200);

    const secondConversion = await request(origin, "/action", { method: "POST", body: { action: "convert_enquiry", enquiryId: enquiryIds[1] } });
    const secondOrder = secondConversion.payload.order;
    await request(origin, "/action", { method: "POST", body: { action: "assign_staff", orderId: secondOrder.id, staffId } });
    const secondAppointment = await request(origin, "/action", { method: "POST", body: { action: "update_appointment", orderId: secondOrder.id, appointment: { date: "2030-08-08", startTime: "21:00", durationMinutes: 60, timezone: "Asia/Hong_Kong" } } });
    assert.equal(secondAppointment.response.status, 200);
    assert.ok(secondAppointment.payload.warnings.includes("staff-overlap"));
    assert.ok(secondAppointment.payload.warnings.includes("daily-capacity-reached"));

    const filtered = await request(origin, "?gameId=aov&serviceId=rank&status=awaiting_quote_confirmation");
    assert.equal(filtered.response.status, 200);
    assert.equal(filtered.payload.state.orders.length, 2);
  });
});

test("business rules validate hours, closure dates and retention", async () => {
  await withServer(createStore(), async (origin) => {
    const initial = await request(origin);
    const invalid = await request(origin, "/action", { method: "POST", body: { action: "update_business_rules", businessRules: { ...initial.payload.state.businessRules, retentionDays: 2, weeklyHours: { monday: { enabled: true, start: "23:00", end: "10:00" } } } } });
    assert.equal(invalid.response.status, 400);

    const valid = await request(origin, "/action", { method: "POST", body: { action: "update_business_rules", businessRules: { ...initial.payload.state.businessRules, retentionDays: 120, closureDates: ["2030-12-25"], dailyCapacity: 4 } } });
    assert.equal(valid.response.status, 200);
    assert.equal(valid.payload.state.businessRules.retentionDays, 120);
    assert.deepEqual(valid.payload.state.businessRules.closureDates, ["2030-12-25"]);
  });
});

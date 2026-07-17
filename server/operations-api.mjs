import { randomUUID } from "node:crypto";

import { isAdminRequest } from "./admin-auth.mjs";
import { normalizeOperationsState, operationsOrderStatuses } from "./operations-model.mjs";
import { createOperationsStore } from "./operations-store.mjs";

const allowedTransitions = Object.freeze({
  new_enquiry: ["awaiting_details", "awaiting_quote_confirmation", "cancelled"],
  awaiting_details: ["awaiting_quote_confirmation", "cancelled"],
  awaiting_quote_confirmation: ["awaiting_details", "awaiting_payment", "confirmed", "cancelled"],
  awaiting_payment: ["confirmed", "cancelled"],
  confirmed: ["scheduled", "in_progress", "cancelled"],
  scheduled: ["confirmed", "in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
});

function setHeaders(res, extra = {}) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  for (const [key, value] of Object.entries(extra)) res.setHeader(key, value);
}

function send(res, status, payload, headers) {
  setHeaders(res, headers);
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

async function readBody(req, limit = 200_000) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > limit) throw new Error("request-too-large");
  }
  return raw ? JSON.parse(raw) : {};
}

function sameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  const host = req.headers?.["x-forwarded-host"] || req.headers?.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function cleanText(value, maxLength = 2_000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTime(value) {
  return typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function minutes(value) {
  if (!isTime(value)) return null;
  const [hours, minute] = value.split(":").map(Number);
  return hours * 60 + minute;
}

function validateBusinessRules(rules) {
  if (!rules || typeof rules !== "object") return false;
  const retentionDays = Number(rules.retentionDays);
  const dailyCapacity = Number(rules.dailyCapacity);
  const minimumLeadHours = Number(rules.minimumLeadHours);
  const rescheduleNoticeHours = Number(rules.rescheduleNoticeHours);
  if (!Number.isInteger(retentionDays) || retentionDays < 7 || retentionDays > 365) return false;
  if (!Number.isInteger(dailyCapacity) || dailyCapacity < 1 || dailyCapacity > 100) return false;
  if (!Number.isInteger(minimumLeadHours) || minimumLeadHours < 0 || minimumLeadHours > 720) return false;
  if (!Number.isInteger(rescheduleNoticeHours) || rescheduleNoticeHours < 0 || rescheduleNoticeHours > 720) return false;
  if (!Array.isArray(rules.closureDates) || rules.closureDates.some((date) => !isDate(date))) return false;
  if (!rules.weeklyHours || typeof rules.weeklyHours !== "object") return false;
  for (const hours of Object.values(rules.weeklyHours)) {
    if (!hours || typeof hours.enabled !== "boolean" || !isTime(hours.start) || !isTime(hours.end)) return false;
    if (hours.enabled && minutes(hours.start) >= minutes(hours.end)) return false;
  }
  return true;
}

function overlaps(left, right) {
  if (!left?.date || !right?.date || left.date !== right.date) return false;
  const leftStart = minutes(left.startTime);
  const rightStart = minutes(right.startTime);
  if (leftStart === null || rightStart === null) return false;
  const leftEnd = leftStart + Number(left.durationMinutes || 0);
  const rightEnd = rightStart + Number(right.durationMinutes || 0);
  return leftStart < rightEnd && rightStart < leftEnd;
}

function appointmentWarnings(state, order) {
  const warnings = [];
  const appointment = order.appointment;
  if (!appointment?.date || !appointment?.startTime || !appointment?.durationMinutes) return warnings;
  const rules = state.businessRules;
  if (rules.closureDates.includes(appointment.date)) warnings.push("closure-date");

  const day = new Date(`${appointment.date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).toLowerCase();
  const hours = rules.weeklyHours[day];
  const start = minutes(appointment.startTime);
  const end = start + appointment.durationMinutes;
  if (!hours?.enabled || start < minutes(hours.start) || end > minutes(hours.end)) {
    warnings.push("outside-business-hours");
  }

  const scheduled = state.orders.filter((candidate) =>
    candidate.id !== order.id &&
    candidate.appointment?.date === appointment.date &&
    candidate.status !== "cancelled");
  if (scheduled.length + 1 > rules.dailyCapacity) warnings.push("daily-capacity-reached");
  if (order.staffId && scheduled.some((candidate) =>
    candidate.staffId === order.staffId && overlaps(candidate.appointment, appointment))) {
    warnings.push("staff-overlap");
  }
  return warnings;
}

function filterState(state, requestUrl) {
  const url = new URL(requestUrl || "/api/admin/operations", "http://localhost");
  const gameId = url.searchParams.get("gameId");
  const serviceId = url.searchParams.get("serviceId");
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const matches = (record) => {
    if (gameId && record.gameId !== gameId) return false;
    if (serviceId && record.serviceId !== serviceId) return false;
    if (status && record.status !== status) return false;
    const date = record.createdAt?.slice(0, 10);
    if (from && date && date < from) return false;
    if (to && date && date > to) return false;
    return true;
  };
  return {
    ...state,
    conversations: state.conversations.filter(matches),
    enquiries: state.enquiries.filter(matches),
    orders: state.orders.filter(matches),
  };
}

function orderFromEnquiry(enquiry, now) {
  return {
    id: randomUUID(),
    enquiryId: enquiry.id,
    conversationId: enquiry.conversationId,
    reference: `AUR-${now.replace(/\D/g, "").slice(0, 14)}-${Math.floor(Math.random() * 900 + 100)}`,
    status: "awaiting_quote_confirmation",
    gameId: enquiry.gameId,
    serviceId: enquiry.serviceId,
    customerName: enquiry.customerName,
    contactMethod: enquiry.contactMethod,
    contactValue: enquiry.contactValue,
    quoteReference: enquiry.quoteReference,
    currency: enquiry.quote?.currency || "HKD",
    finalTotal: enquiry.quote?.finalTotal ?? null,
    staffId: null,
    appointment: null,
    internalNotes: enquiry.internalNotes,
    createdAt: now,
    updatedAt: now,
  };
}

function applyAction(current, body) {
  const now = new Date().toISOString();
  const state = structuredClone(current);
  let result = {};
  let warnings = [];

  if (body.action === "convert_enquiry") {
    const enquiry = state.enquiries.find((item) => item.id === body.enquiryId);
    if (!enquiry) throw new Error("enquiry-not-found");
    const existing = state.orders.find((item) => item.enquiryId === enquiry.id);
    if (existing) throw new Error("enquiry-already-converted");
    const order = orderFromEnquiry(enquiry, now);
    state.orders.push(order);
    enquiry.status = "awaiting_quote_confirmation";
    enquiry.updatedAt = now;
    result.orderId = order.id;
  } else if (body.action === "update_order_status") {
    const order = state.orders.find((item) => item.id === body.orderId);
    if (!order) throw new Error("order-not-found");
    if (!operationsOrderStatuses.includes(body.status) || !allowedTransitions[order.status]?.includes(body.status)) {
      throw new Error("invalid-status-transition");
    }
    order.status = body.status;
    order.updatedAt = now;
    result.orderId = order.id;
  } else if (body.action === "update_order") {
    const order = state.orders.find((item) => item.id === body.orderId);
    if (!order) throw new Error("order-not-found");
    const staffId = body.order?.staffId || null;
    if (staffId && !state.staff.some((item) => item.id === staffId && item.active)) throw new Error("staff-not-found");
    order.customerName = cleanText(body.order?.customerName, 100) || null;
    order.contactMethod = cleanText(body.order?.contactMethod, 30) || null;
    order.contactValue = cleanText(body.order?.contactValue, 200) || null;
    order.internalNotes = cleanText(body.order?.internalNotes, 4_000) || null;
    order.staffId = staffId;
    order.updatedAt = now;
    result.orderId = order.id;
  } else if (body.action === "upsert_staff") {
    const displayName = cleanText(body.staff?.displayName, 80);
    if (!displayName) throw new Error("invalid-staff");
    const id = body.staff?.id || randomUUID();
    const existingIndex = state.staff.findIndex((item) => item.id === id);
    const staff = {
      id,
      displayName,
      active: body.staff?.active !== false,
      gameIds: Array.isArray(body.staff?.gameIds) ? body.staff.gameIds : [],
      serviceIds: Array.isArray(body.staff?.serviceIds) ? body.staff.serviceIds : [],
      notes: cleanText(body.staff?.notes, 2_000) || null,
    };
    if (existingIndex >= 0) state.staff[existingIndex] = staff;
    else state.staff.push(staff);
    result.staffId = id;
  } else if (body.action === "assign_staff") {
    const order = state.orders.find((item) => item.id === body.orderId);
    if (!order) throw new Error("order-not-found");
    if (body.staffId && !state.staff.some((item) => item.id === body.staffId && item.active)) throw new Error("staff-not-found");
    order.staffId = body.staffId || null;
    order.updatedAt = now;
    result.orderId = order.id;
  } else if (body.action === "update_appointment") {
    const order = state.orders.find((item) => item.id === body.orderId);
    if (!order) throw new Error("order-not-found");
    const appointment = body.appointment;
    if (!appointment || !isDate(appointment.date) || !isTime(appointment.startTime)) throw new Error("invalid-appointment");
    const durationMinutes = Number(appointment.durationMinutes);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 1_440) throw new Error("invalid-appointment");
    order.appointment = {
      date: appointment.date,
      startTime: appointment.startTime,
      durationMinutes,
      timezone: cleanText(appointment.timezone, 60) || state.businessRules.timezone,
    };
    order.updatedAt = now;
    warnings = appointmentWarnings(state, order);
    result.orderId = order.id;
  } else if (body.action === "update_business_rules") {
    if (!validateBusinessRules(body.businessRules)) throw new Error("invalid-business-rules");
    state.businessRules = body.businessRules;
  } else if (body.action === "delete_conversation") {
    const before = state.conversations.length;
    state.conversations = state.conversations.filter((item) => item.id !== body.conversationId);
    if (before === state.conversations.length) throw new Error("conversation-not-found");
  } else if (body.action === "update_enquiry_status") {
    const enquiry = state.enquiries.find((item) => item.id === body.enquiryId);
    if (!enquiry) throw new Error("enquiry-not-found");
    if (!operationsOrderStatuses.includes(body.status)) throw new Error("invalid-status");
    enquiry.status = body.status;
    enquiry.updatedAt = now;
  } else {
    throw new Error("unsupported-action");
  }

  return { state: normalizeOperationsState(state), result, warnings };
}

export async function handleAdminOperations(
  req,
  res,
  { store = createOperationsStore(), env = process.env } = {},
) {
  if (!isAdminRequest(req, env)) return send(res, 401, { error: "authentication-required" });

  const pathname = new URL(req.url || "/api/admin/operations", "http://localhost").pathname;
  const actionRoute = pathname.endsWith("/action");

  if (req.method === "GET" && !actionRoute) {
    try {
      const state = await store.read();
      return send(res, 200, { state: filterState(state, req.url), storageConfigured: store.configured });
    } catch {
      return send(res, 503, { error: "operations-unavailable" });
    }
  }

  if ((req.method !== "PUT" || actionRoute) && (req.method !== "POST" || !actionRoute)) {
    return send(res, 405, { error: "method-not-allowed" }, { Allow: actionRoute ? "POST" : "GET, PUT" });
  }
  if (!sameOrigin(req)) return send(res, 403, { error: "origin-not-allowed" });
  if (!store.configured) return send(res, 503, { error: "operations-storage-not-configured" });

  try {
    const body = await readBody(req);
    if (req.method === "PUT") {
      const state = await store.write(normalizeOperationsState(body.state), body.expectedRevision);
      return send(res, 200, { state, saved: true });
    }
    const current = await store.read();
    const applied = applyAction(current, body);
    const state = await store.write(applied.state, current.revision);
    const payload = { state, warnings: applied.warnings };
    if (applied.result.orderId) payload.order = state.orders.find((item) => item.id === applied.result.orderId);
    if (applied.result.staffId) payload.staff = state.staff.find((item) => item.id === applied.result.staffId);
    return send(res, 200, payload);
  } catch (error) {
    if (error.message === "request-too-large") return send(res, 413, { error: error.message });
    if (error.message === "operations-revision-conflict") return send(res, 409, { error: error.message, state: error.current });
    if (["operations-storage-not-configured", "operations-storage-error"].includes(error.message)) {
      return send(res, 503, { error: "operations-unavailable" });
    }
    return send(res, 400, { error: error.message || "operations-update-failed" });
  }
}

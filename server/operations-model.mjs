import { serviceDefinitions, supportedGameIds } from "../src/data/gameConfig.js";

export const operationsOrderStatuses = Object.freeze([
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

const serviceIds = new Set(serviceDefinitions.map((service) => service.id));
const gameIds = new Set(supportedGameIds);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const locales = new Set(["zh-HK", "en", "zh-CN"]);

function cleanString(value, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanNullableString(value, maxLength = 500) {
  const cleaned = cleanString(value, maxLength);
  return cleaned || null;
}

function cleanUuid(value) {
  const cleaned = cleanString(value, 36);
  return uuidPattern.test(cleaned) ? cleaned.toLowerCase() : null;
}

function cleanIso(value) {
  const cleaned = cleanString(value, 30);
  return isoPattern.test(cleaned) && Number.isFinite(Date.parse(cleaned)) ? new Date(cleaned).toISOString() : null;
}

function cleanDate(value) {
  const cleaned = cleanString(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(cleaned) ? cleaned : null;
}

function cleanTime(value) {
  const cleaned = cleanString(value, 5);
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(cleaned) ? cleaned : null;
}

function cleanNumber(value, fallback = null, { min = -Infinity, max = Infinity, integer = false } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const bounded = Math.min(max, Math.max(min, number));
  return integer ? Math.round(bounded) : bounded;
}

function cleanBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function cleanGameId(value) {
  const id = cleanString(value, 30);
  return gameIds.has(id) ? id : null;
}

function cleanServiceId(value) {
  const id = cleanString(value, 30);
  return serviceIds.has(id) ? id : null;
}

function cleanStatus(value, fallback = "new_enquiry") {
  return operationsOrderStatuses.includes(value) ? value : fallback;
}

export function redactSensitiveText(value) {
  let text = cleanString(value, 4_000);
  if (!text) return "";
  text = text
    .replace(/(?:密碼|密码|password|passcode)\s*(?:是|為|为|:|：|=)?\s*[^\s,，。;；]{3,}/gi, "密碼：[已過濾]")
    .replace(/(?:驗證碼|验证码|otp|one[- ]?time code)\s*(?:是|為|为|:|：|=)?\s*\d{4,8}/gi, "驗證碼：[已過濾]")
    .replace(/(?:cvv|cvc|安全碼|安全码)\s*(?:是|為|为|:|：|=)?\s*\d{3,4}/gi, "付款安全碼：[已過濾]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[付款資料已過濾]")
    .replace(/(?:銀行帳號|银行账号|bank account|付款資料|付款资料)\s*(?:是|為|为|:|：|=)?\s*[^\s,，。;；]{4,}/gi, "付款資料：[已過濾]");
  return text;
}

function normalizeMessage(input) {
  const role = input?.role === "assistant" ? "assistant" : input?.role === "user" ? "user" : null;
  const text = redactSensitiveText(input?.text);
  const createdAt = cleanIso(input?.createdAt);
  return role && text && createdAt ? { role, text, createdAt } : null;
}

function normalizeConversation(input) {
  const id = cleanUuid(input?.id);
  const sessionId = cleanUuid(input?.sessionId);
  const consentedAt = cleanIso(input?.consentedAt);
  const createdAt = cleanIso(input?.createdAt);
  const updatedAt = cleanIso(input?.updatedAt) || createdAt;
  if (!id || !sessionId || !consentedAt || !createdAt || !updatedAt) return null;
  return {
    id,
    sessionId,
    consentedAt,
    source: ["ai", "manual_quote", "contact"].includes(input?.source) ? input.source : "ai",
    locale: locales.has(input?.locale) ? input.locale : "zh-HK",
    gameId: cleanGameId(input?.gameId),
    serviceId: cleanServiceId(input?.serviceId),
    messages: Array.isArray(input?.messages) ? input.messages.slice(-100).map(normalizeMessage).filter(Boolean) : [],
    createdAt,
    updatedAt,
  };
}

function normalizeDraft(input = {}) {
  return {
    gameId: cleanGameId(input.gameId),
    serviceId: cleanServiceId(input.serviceId),
    currentRankId: cleanNullableString(input.currentRankId, 40),
    currentDivision: cleanNullableString(input.currentDivision, 20),
    currentStars: cleanNumber(input.currentStars),
    currentPoints: cleanNumber(input.currentPoints),
    targetRankId: cleanNullableString(input.targetRankId, 40),
    targetDivision: cleanNullableString(input.targetDivision, 20),
    targetStars: cleanNumber(input.targetStars),
    targetPoints: cleanNumber(input.targetPoints),
    quantity: cleanNumber(input.quantity),
    preferredHero: cleanNullableString(input.preferredHero, 80),
    preferredRole: cleanNullableString(input.preferredRole, 40),
    preferredStartTime: cleanNullableString(input.preferredStartTime, 80),
    additionalRequirements: redactSensitiveText(input.additionalRequirements) || null,
    displayCurrency: ["HKD", "TWD", "CNY"].includes(input.displayCurrency) ? input.displayCurrency : "HKD",
  };
}

function normalizeQuote(input = {}) {
  return {
    reference: cleanNullableString(input.reference || input.referenceNumber, 60),
    status: ["quoted", "manual_review", "incomplete"].includes(input.status) ? input.status : "manual_review",
    currency: ["HKD", "TWD", "CNY"].includes(input.currency || input.displayCurrency) ? (input.currency || input.displayCurrency) : "HKD",
    finalTotal: cleanNumber(input.finalTotal, null, { min: 0, max: 10_000_000 }),
    sourceFinalTotal: cleanNumber(input.sourceFinalTotal, null, { min: 0, max: 10_000_000 }),
    requiresManualReview: cleanBoolean(input.requiresManualReview, true),
  };
}

function normalizeEnquiry(input) {
  const id = cleanUuid(input?.id);
  const createdAt = cleanIso(input?.createdAt);
  const updatedAt = cleanIso(input?.updatedAt) || createdAt;
  if (!id || !createdAt || !updatedAt) return null;
  return {
    id,
    conversationId: cleanUuid(input?.conversationId),
    sessionId: cleanUuid(input?.sessionId),
    status: cleanStatus(input?.status),
    source: ["ai", "manual_quote", "contact"].includes(input?.source) ? input.source : "manual_quote",
    locale: locales.has(input?.locale) ? input.locale : "zh-HK",
    gameId: cleanGameId(input?.gameId || input?.draft?.gameId),
    serviceId: cleanServiceId(input?.serviceId || input?.draft?.serviceId),
    quoteReference: cleanNullableString(input?.quoteReference || input?.quote?.reference, 60),
    draft: normalizeDraft(input?.draft),
    quote: normalizeQuote(input?.quote),
    customerName: redactSensitiveText(input?.customerName).slice(0, 100) || null,
    contactMethod: ["whatsapp", "line", "instagram", "discord", "carousell", "other"].includes(input?.contactMethod) ? input.contactMethod : null,
    contactValue: redactSensitiveText(input?.contactValue).slice(0, 200) || null,
    internalNotes: redactSensitiveText(input?.internalNotes) || null,
    consentedAt: cleanIso(input?.consentedAt),
    createdAt,
    updatedAt,
  };
}

function normalizeAppointment(input = {}) {
  const date = cleanDate(input.date);
  const startTime = cleanTime(input.startTime);
  const durationMinutes = cleanNumber(input.durationMinutes, null, { min: 15, max: 24 * 60, integer: true });
  if (!date && !startTime && !durationMinutes) return null;
  return {
    date,
    startTime,
    durationMinutes,
    timezone: cleanString(input.timezone, 60) || "Asia/Hong_Kong",
  };
}

function normalizeOrder(input) {
  const id = cleanUuid(input?.id);
  const createdAt = cleanIso(input?.createdAt);
  const updatedAt = cleanIso(input?.updatedAt) || createdAt;
  if (!id || !createdAt || !updatedAt || !operationsOrderStatuses.includes(input?.status)) return null;
  return {
    id,
    enquiryId: cleanUuid(input?.enquiryId),
    conversationId: cleanUuid(input?.conversationId),
    reference: cleanNullableString(input?.reference, 60),
    status: input.status,
    gameId: cleanGameId(input?.gameId),
    serviceId: cleanServiceId(input?.serviceId),
    customerName: redactSensitiveText(input?.customerName).slice(0, 100) || null,
    contactMethod: ["whatsapp", "line", "instagram", "discord", "carousell", "other"].includes(input?.contactMethod) ? input.contactMethod : null,
    contactValue: redactSensitiveText(input?.contactValue).slice(0, 200) || null,
    quoteReference: cleanNullableString(input?.quoteReference, 60),
    currency: ["HKD", "TWD", "CNY"].includes(input?.currency) ? input.currency : "HKD",
    finalTotal: cleanNumber(input?.finalTotal, null, { min: 0, max: 10_000_000 }),
    staffId: cleanUuid(input?.staffId),
    appointment: normalizeAppointment(input?.appointment),
    internalNotes: redactSensitiveText(input?.internalNotes) || null,
    createdAt,
    updatedAt,
  };
}

function normalizeStaff(input) {
  const id = cleanUuid(input?.id);
  const displayName = redactSensitiveText(input?.displayName).slice(0, 80);
  if (!id || !displayName) return null;
  return {
    id,
    displayName,
    active: cleanBoolean(input?.active, true),
    gameIds: [...new Set(Array.isArray(input?.gameIds) ? input.gameIds.filter((idValue) => gameIds.has(idValue)) : [])],
    serviceIds: [...new Set(Array.isArray(input?.serviceIds) ? input.serviceIds.filter((idValue) => serviceIds.has(idValue)) : [])],
    notes: redactSensitiveText(input?.notes) || null,
  };
}

function defaultWeeklyHours() {
  return Object.fromEntries(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => [day, {
    enabled: day !== "sunday",
    start: "10:00",
    end: "23:00",
  }]));
}

function normalizeBusinessRules(input = {}) {
  const defaults = defaultWeeklyHours();
  const weeklyHours = Object.fromEntries(Object.entries(defaults).map(([day, fallback]) => {
    const source = input.weeklyHours?.[day] || {};
    return [day, {
      enabled: cleanBoolean(source.enabled, fallback.enabled),
      start: cleanTime(source.start) || fallback.start,
      end: cleanTime(source.end) || fallback.end,
    }];
  }));
  return {
    timezone: cleanString(input.timezone, 60) || "Asia/Hong_Kong",
    weeklyHours,
    closureDates: [...new Set(Array.isArray(input.closureDates) ? input.closureDates.map(cleanDate).filter(Boolean) : [])].slice(0, 366),
    dailyCapacity: cleanNumber(input.dailyCapacity, 3, { min: 1, max: 100, integer: true }),
    minimumLeadHours: cleanNumber(input.minimumLeadHours, 2, { min: 0, max: 720, integer: true }),
    rescheduleNoticeHours: cleanNumber(input.rescheduleNoticeHours, 4, { min: 0, max: 720, integer: true }),
    retentionDays: cleanNumber(input.retentionDays, 90, { min: 7, max: 365, integer: true }),
  };
}

export function normalizeOperationsState(input = {}) {
  return {
    conversations: Array.isArray(input.conversations) ? input.conversations.map(normalizeConversation).filter(Boolean) : [],
    enquiries: Array.isArray(input.enquiries) ? input.enquiries.map(normalizeEnquiry).filter(Boolean) : [],
    orders: Array.isArray(input.orders) ? input.orders.map(normalizeOrder).filter(Boolean) : [],
    staff: Array.isArray(input.staff) ? input.staff.map(normalizeStaff).filter(Boolean) : [],
    businessRules: normalizeBusinessRules(input.businessRules),
    revision: cleanString(input.revision, 100),
    updatedAt: cleanIso(input.updatedAt),
  };
}

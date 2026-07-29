import { randomUUID } from "node:crypto";
import { pricingCatalog } from "../src/data/pricing.js";
import { calculateQuote } from "../src/lib/quoteEngine.js";
import { createCatalogStore } from "./catalog-store.mjs";
import {
  normalizeEnquiryDraft,
  normalizeOperationsState,
} from "./operations-model.mjs";
import { createOperationsStore } from "./operations-store.mjs";

const MAX_BODY_BYTES = 64 * 1024;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 24;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const defaultRateBuckets = new Map();
const defaultLocalOrigins = new Set([
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4826",
  "http://127.0.0.1:4826",
]);

function send(res, status, payload, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(JSON.stringify(payload));
}

async function readBody(req, limit = MAX_BODY_BYTES) {
  if (req.body && typeof req.body === "object") {
    if (Buffer.byteLength(JSON.stringify(req.body)) > limit) throw Object.assign(new Error("request-too-large"), { status: 413 });
    return req.body;
  }
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > limit) throw Object.assign(new Error("request-too-large"), { status: 413 });
  }
  try { return raw ? JSON.parse(raw) : {}; }
  catch { throw Object.assign(new Error("invalid-json"), { status: 400 }); }
}

function allowedOrigins(env) {
  const configured = String(env.AI_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set([...defaultLocalOrigins, ...configured]);
}

function corsHeaders(origin, origins) {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
  if (origin && origins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function clientKey(req, trustProxy) {
  const forwarded = trustProxy
    ? String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim()
    : "";
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function withinRateLimit(req, rateBuckets, now, trustProxy) {
  const key = clientKey(req, trustProxy);
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_LIMIT;
}

function enquiryStatusForQuote(quote) {
  return quote?.status === "incomplete" ? "awaiting_details" : "awaiting_quote_confirmation";
}

async function mutateState(store, mutate, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const current = await store.read();
    const next = normalizeOperationsState(current);
    const changed = mutate(next);
    const normalized = normalizeOperationsState(next);
    if (changed === false) return normalized;
    try { return await store.write(normalized, current.revision); }
    catch (error) {
      lastError = error;
      if (error.message !== "operations-revision-conflict") throw error;
    }
  }
  throw lastError;
}

export async function persistConversationTurn({
  store,
  sessionId,
  consent,
  locale = "zh-HK",
  messages = [],
  assistantMessage = "",
  quoteContext = {},
  quoteResult = null,
  acquisition = null,
  now = () => new Date(),
}) {
  if (!consent || !store?.configured || !uuidPattern.test(String(sessionId || ""))) return null;
  const timestamp = now().toISOString();
  let conversationId = null;
  const saved = await mutateState(store, (state) => {
    let conversation = state.conversations.find((item) => item.sessionId === sessionId);
    if (!conversation) {
      conversation = { id: randomUUID(), sessionId, consentedAt: timestamp, source: "ai", locale, gameId: quoteContext.gameId || null, serviceId: quoteContext.serviceId || null, acquisition, messages: [], createdAt: timestamp, updatedAt: timestamp };
      state.conversations.push(conversation);
    }
    conversationId = conversation.id;
    conversation.locale = locale;
    conversation.gameId = quoteContext.gameId || conversation.gameId || null;
    conversation.serviceId = quoteContext.serviceId || conversation.serviceId || null;
    conversation.acquisition = acquisition || conversation.acquisition || null;
    conversation.updatedAt = timestamp;
    conversation.messages = [
      ...messages.slice(-19).map((message) => ({ role: message.role, text: message.content, createdAt: timestamp })),
      assistantMessage ? { role: "assistant", text: assistantMessage, createdAt: timestamp } : null,
    ].filter(Boolean);

    const convertedEnquiryIds = new Set(
      state.orders.map((order) => order.enquiryId).filter(Boolean),
    );
    const hasInteractionKey = Boolean(quoteContext.gameId && quoteContext.serviceId);
    let enquiry = hasInteractionKey
      ? state.enquiries.findLast((item) => (
        item.sessionId === sessionId &&
        item.gameId === quoteContext.gameId &&
        item.serviceId === quoteContext.serviceId &&
        !convertedEnquiryIds.has(item.id)
      ))
      : state.enquiries.findLast((item) => (
        item.sessionId === sessionId &&
        item.conversationId === conversation.id &&
        !convertedEnquiryIds.has(item.id)
      )) || state.enquiries.findLast((item) => (
        item.sessionId === sessionId &&
        item.source === "ai" &&
        !convertedEnquiryIds.has(item.id)
      ));
    if (!enquiry) {
      enquiry = {
        id: randomUUID(),
        conversationId: conversation.id,
        sessionId,
        status: "awaiting_details",
        source: "ai",
        consentedAt: timestamp,
        createdAt: timestamp,
      };
      state.enquiries.push(enquiry);
    }
    enquiry.conversationId = conversation.id;
    enquiry.locale = locale;
    enquiry.gameId = quoteContext.gameId || enquiry.gameId || null;
    enquiry.serviceId = quoteContext.serviceId || enquiry.serviceId || null;
    enquiry.quoteReference = quoteResult?.reference || quoteResult?.referenceNumber || enquiry.quoteReference || null;
    enquiry.draft = quoteContext;
    enquiry.quote = quoteResult;
    enquiry.acquisition = acquisition || enquiry.acquisition || null;
    enquiry.status = quoteResult?.status === "incomplete" || !quoteContext.gameId || !quoteContext.serviceId
      ? "awaiting_details"
      : "awaiting_quote_confirmation";
    enquiry.updatedAt = timestamp;
  });
  return saved.conversations.find((item) => item.id === conversationId) || null;
}

export async function handlePublicEnquiry(req, res, {
  store = createOperationsStore(),
  env = process.env,
  catalogStore = createCatalogStore({ env }),
  calculateQuoteFn = calculateQuote,
  rateBuckets = defaultRateBuckets,
  now = () => Date.now(),
} = {}) {
  const origins = allowedOrigins(env);
  const origin = req.headers?.origin;
  const cors = corsHeaders(origin, origins);
  if (origin && !origins.has(origin)) return send(res, 403, { error: "origin-not-allowed" }, cors);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    for (const [key, value] of Object.entries(cors)) res.setHeader(key, value);
    res.end();
    return;
  }
  if (req.method !== "POST") return send(res, 405, { error: "method-not-allowed" }, { ...cors, Allow: "POST" });
  const trustProxy = String(env.ENQUIRY_TRUST_PROXY || env.AI_TRUST_PROXY || "").toLowerCase() === "true";
  const requestTime = now();
  const requestTimeMs = requestTime instanceof Date ? requestTime.getTime() : Number(requestTime);
  if (!withinRateLimit(req, rateBuckets, Number.isFinite(requestTimeMs) ? requestTimeMs : Date.now(), trustProxy)) {
    return send(res, 429, { error: "rate-limit" }, { ...cors, "Retry-After": "60" });
  }
  if (!String(req.headers?.["content-type"] || "").toLowerCase().includes("application/json")) return send(res, 415, { error: "content-type-must-be-json" }, cors);
  if (!store.configured) return send(res, 503, { error: "operations-storage-not-configured" }, cors);
  try {
    const body = await readBody(req);
    if (body.consent !== true || !uuidPattern.test(String(body.sessionId || ""))) return send(res, 400, { error: "consent-and-session-required" }, cors);
    const source = ["ai", "manual_quote", "contact"].includes(body.source) ? body.source : "manual_quote";
    const rawSubmissionId = typeof body.submissionId === "string" ? body.submissionId.trim().toLowerCase() : "";
    if (body.submissionId !== undefined && !uuidPattern.test(rawSubmissionId)) return send(res, 400, { error: "invalid-submission-id" }, cors);
    const submissionId = source === "manual_quote" ? rawSubmissionId || null : null;
    const timestamp = new Date(Number.isFinite(requestTimeMs) ? requestTimeMs : Date.now()).toISOString();
    const locale = ["zh-HK", "en", "zh-CN"].includes(body.locale) ? body.locale : "zh-HK";
    const draft = normalizeEnquiryDraft(body.draft);
    let activePricingCatalog = pricingCatalog;
    try {
      activePricingCatalog = await catalogStore.read();
    } catch {
      // Static approved pricing remains the safe fallback if runtime storage is unavailable.
    }
    const quote = calculateQuoteFn(
      { ...draft, locale },
      {
        pricingCatalog: activePricingCatalog,
        now: new Date(Number.isFinite(requestTimeMs) ? requestTimeMs : Date.now()),
      },
    );
    let enquiryId = null;
    let created = false;
    const state = await mutateState(store, (current) => {
      created = false;
      const sameSubmission = submissionId && current.enquiries.find((item) => (
        item.sessionId === body.sessionId &&
        (item.submissionId === submissionId || item.submissionIds?.includes(submissionId))
      ));
      if (sameSubmission) {
        enquiryId = sameSubmission.id;
        return false;
      }
      const explicitNewInteraction = body.newInteraction === true;
      const convertedEnquiryIds = new Set(
        current.orders.map((order) => order.enquiryId).filter(Boolean),
      );
      const sameInteraction = !explicitNewInteraction && draft.gameId && draft.serviceId
        ? current.enquiries.findLast((item) => (
          item.sessionId === body.sessionId &&
          item.gameId === draft.gameId &&
          item.serviceId === draft.serviceId &&
          !convertedEnquiryIds.has(item.id)
        ))
        : null;
      const enquiry = sameInteraction || {
        id: randomUUID(),
        submissionId,
        conversationId: null,
        sessionId: body.sessionId,
        internalNotes: null,
        consentedAt: timestamp,
        createdAt: timestamp,
      };
      if (!sameInteraction) {
        current.enquiries.push(enquiry);
        created = true;
      }
      enquiryId = enquiry.id;
      enquiry.submissionId ||= submissionId;
      if (submissionId && !enquiry.submissionIds?.includes(submissionId)) {
        enquiry.submissionIds = [...(enquiry.submissionIds || []), submissionId].slice(-50);
      }
      enquiry.status = enquiryStatusForQuote(quote);
      enquiry.source = source;
      enquiry.locale = locale;
      enquiry.gameId = draft.gameId;
      enquiry.serviceId = draft.serviceId;
      enquiry.quoteReference = quote.reference || quote.referenceNumber || null;
      enquiry.draft = draft;
      enquiry.quote = quote;
      enquiry.acquisition = body.acquisition || enquiry.acquisition || null;
      enquiry.customerName = body.customerName || enquiry.customerName || null;
      enquiry.contactMethod = body.contactMethod || enquiry.contactMethod || null;
      enquiry.contactValue = body.contactValue || enquiry.contactValue || null;
      enquiry.updatedAt = timestamp;
    });
    const enquiry = state.enquiries.find((item) => item.id === enquiryId);
    if (!enquiry) return send(res, 400, { error: "invalid-enquiry" }, cors);
    return send(res, created ? 201 : 200, { accepted: true }, cors);
  } catch (error) {
    if (error.status === 413 || error.message === "request-too-large") return send(res, 413, { error: "request-too-large" }, cors);
    if (error.message === "operations-revision-conflict") return send(res, 409, { error: error.message }, cors);
    return send(res, 400, { error: "invalid-request" }, cors);
  }
}

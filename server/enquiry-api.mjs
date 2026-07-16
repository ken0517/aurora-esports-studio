import { randomUUID } from "node:crypto";
import { normalizeOperationsState } from "./operations-model.mjs";
import { createOperationsStore } from "./operations-store.mjs";

const MAX_BODY_BYTES = 64 * 1024;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

async function mutateState(store, mutate, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const current = await store.read();
    const next = normalizeOperationsState(current);
    mutate(next);
    const normalized = normalizeOperationsState(next);
    try { return await store.write(normalized, current.revision); }
    catch (error) {
      lastError = error;
      if (error.message !== "operations-revision-conflict") throw error;
    }
  }
  throw lastError;
}

export async function persistConversationTurn({ store, sessionId, consent, locale = "zh-HK", messages = [], assistantMessage = "", quoteContext = {}, now = () => new Date() }) {
  if (!consent || !store?.configured || !uuidPattern.test(String(sessionId || ""))) return null;
  const timestamp = now().toISOString();
  let conversationId = null;
  const saved = await mutateState(store, (state) => {
    let conversation = state.conversations.find((item) => item.sessionId === sessionId);
    if (!conversation) {
      conversation = { id: randomUUID(), sessionId, consentedAt: timestamp, source: "ai", locale, gameId: quoteContext.gameId || null, serviceId: quoteContext.serviceId || null, messages: [], createdAt: timestamp, updatedAt: timestamp };
      state.conversations.push(conversation);
    }
    conversationId = conversation.id;
    conversation.locale = locale;
    conversation.gameId = quoteContext.gameId || conversation.gameId || null;
    conversation.serviceId = quoteContext.serviceId || conversation.serviceId || null;
    conversation.updatedAt = timestamp;
    conversation.messages = [
      ...messages.slice(-19).map((message) => ({ role: message.role, text: message.content, createdAt: timestamp })),
      assistantMessage ? { role: "assistant", text: assistantMessage, createdAt: timestamp } : null,
    ].filter(Boolean);
  });
  return saved.conversations.find((item) => item.id === conversationId) || null;
}

export async function handlePublicEnquiry(req, res, { store = createOperationsStore() } = {}) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }
  if (req.method !== "POST") return send(res, 405, { error: "method-not-allowed" }, { Allow: "POST" });
  if (!String(req.headers?.["content-type"] || "").toLowerCase().includes("application/json")) return send(res, 415, { error: "content-type-must-be-json" });
  if (!store.configured) return send(res, 503, { error: "operations-storage-not-configured" });
  try {
    const body = await readBody(req);
    if (body.consent !== true || !uuidPattern.test(String(body.sessionId || ""))) return send(res, 400, { error: "consent-and-session-required" });
    const source = ["ai", "manual_quote", "contact"].includes(body.source) ? body.source : "manual_quote";
    const timestamp = new Date().toISOString();
    const enquiryId = randomUUID();
    const quoteReference = typeof body.quote?.reference === "string" ? body.quote.reference.slice(0, 60) : typeof body.quote?.referenceNumber === "string" ? body.quote.referenceNumber.slice(0, 60) : null;
    const state = await mutateState(store, (current) => {
      current.enquiries.push({ id: enquiryId, conversationId: null, sessionId: body.sessionId, status: "new_enquiry", source, locale: body.locale, gameId: body.draft?.gameId, serviceId: body.draft?.serviceId, quoteReference, draft: body.draft, quote: body.quote, customerName: body.customerName, contactMethod: body.contactMethod, contactValue: body.contactValue, internalNotes: null, consentedAt: timestamp, createdAt: timestamp, updatedAt: timestamp });
    });
    const enquiry = state.enquiries.find((item) => item.id === enquiryId);
    if (!enquiry) return send(res, 400, { error: "invalid-enquiry" });
    return send(res, 201, { enquiryId: enquiry.id, reference: enquiry.quoteReference });
  } catch (error) {
    if (error.status === 413 || error.message === "request-too-large") return send(res, 413, { error: "request-too-large" });
    if (error.message === "operations-revision-conflict") return send(res, 409, { error: error.message });
    return send(res, 400, { error: "invalid-request" });
  }
}

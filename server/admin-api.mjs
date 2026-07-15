import {
  adminAuthConfigured,
  adminSessionCookie,
  clearAdminSessionCookie,
  createAdminToken,
  isAdminRequest,
  verifyAdminPassword,
} from "./admin-auth.mjs";
import { createCatalogStore } from "./catalog-store.mjs";

const loginAttempts = new Map();

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

function methodNotAllowed(res, methods) {
  send(res, 405, { error: "method-not-allowed" }, { Allow: methods.join(", ") });
}

function loginAllowed(req, now = Date.now()) {
  const ip = String(req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const previous = loginAttempts.get(ip) || [];
  const recent = previous.filter((time) => now - time < 15 * 60_000);
  recent.push(now);
  loginAttempts.set(ip, recent);
  return recent.length <= 10;
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

export async function handlePublicCatalog(req, res, { store = createCatalogStore() } = {}) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.end();
    return;
  }
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  try {
    const catalog = await store.read();
    send(res, 200, { catalog, storageConfigured: store.configured }, {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
    });
  } catch {
    send(res, 503, { error: "catalog-unavailable" });
  }
}

export async function handleAdminSession(req, res, { env = process.env } = {}) {
  if (req.method === "GET") {
    return send(res, 200, {
      authenticated: isAdminRequest(req, env),
      configured: adminAuthConfigured(env),
    });
  }
  if (req.method === "DELETE") {
    return send(res, 200, { authenticated: false }, {
      "Set-Cookie": clearAdminSessionCookie(req),
    });
  }
  if (req.method !== "POST") return methodNotAllowed(res, ["GET", "POST", "DELETE"]);
  if (!sameOrigin(req)) return send(res, 403, { error: "origin-not-allowed" });
  if (!adminAuthConfigured(env)) return send(res, 503, { error: "admin-auth-not-configured" });
  if (!loginAllowed(req)) return send(res, 429, { error: "too-many-attempts" }, { "Retry-After": "900" });
  try {
    const body = await readBody(req, 10_000);
    if (!verifyAdminPassword(body.password, env)) {
      return send(res, 401, { error: "invalid-credentials" });
    }
    return send(res, 200, { authenticated: true }, {
      "Set-Cookie": adminSessionCookie(createAdminToken(env), req),
    });
  } catch {
    return send(res, 400, { error: "invalid-request" });
  }
}

export async function handleAdminCatalog(req, res, { store = createCatalogStore(), env = process.env } = {}) {
  if (!isAdminRequest(req, env)) return send(res, 401, { error: "authentication-required" });
  if (req.method === "GET") {
    try {
      return send(res, 200, { catalog: await store.read(), storageConfigured: store.configured });
    } catch {
      return send(res, 503, { error: "catalog-unavailable" });
    }
  }
  if (req.method !== "PUT") return methodNotAllowed(res, ["GET", "PUT"]);
  if (!sameOrigin(req)) return send(res, 403, { error: "origin-not-allowed" });
  if (!store.configured) return send(res, 503, { error: "catalog-storage-not-configured" });
  try {
    const body = await readBody(req);
    const catalog = await store.write(body.catalog, body.expectedRevision);
    return send(res, 200, { catalog, saved: true });
  } catch (error) {
    if (error.message === "catalog-revision-conflict") {
      return send(res, 409, { error: error.message, catalog: error.current });
    }
    if (error.message === "request-too-large") return send(res, 413, { error: error.message });
    return send(res, 400, { error: "catalog-save-failed" });
  }
}

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const adminCookieName = "aurora_admin";

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function digest(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function adminAuthConfigured(env = process.env) {
  return Boolean(
    (env.AURORA_ADMIN_PASSWORD || env.AURORA_ADMIN_PASSWORD_SHA256) &&
      env.AURORA_ADMIN_SESSION_SECRET &&
      env.AURORA_ADMIN_SESSION_SECRET.length >= 32,
  );
}

export function verifyAdminPassword(password, env = process.env) {
  if (!adminAuthConfigured(env) || typeof password !== "string") return false;
  const suppliedDigest = digest(password);
  const expectedDigest = env.AURORA_ADMIN_PASSWORD_SHA256
    ? String(env.AURORA_ADMIN_PASSWORD_SHA256).toLowerCase()
    : digest(env.AURORA_ADMIN_PASSWORD);
  return safeEqual(suppliedDigest, expectedDigest);
}

export function createAdminToken(env = process.env, now = Date.now()) {
  if (!adminAuthConfigured(env)) throw new Error("admin-auth-not-configured");
  const payload = base64url(JSON.stringify({
    sub: "aurora-admin",
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 60 * 60 * 12,
    nonce: randomBytes(12).toString("hex"),
  }));
  const signature = createHmac("sha256", env.AURORA_ADMIN_SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token, env = process.env, now = Date.now()) {
  if (!adminAuthConfigured(env) || typeof token !== "string") return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expected = createHmac("sha256", env.AURORA_ADMIN_SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  if (!safeEqual(signature, expected)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const currentSeconds = Math.floor(now / 1000);
    return decoded.sub === "aurora-admin" && decoded.exp > currentSeconds && decoded.iat <= currentSeconds + 60;
  } catch {
    return false;
  }
}

export function parseCookies(header = "") {
  return Object.fromEntries(
    String(header)
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        return separator < 0
          ? [part, ""]
          : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      }),
  );
}

export function isAdminRequest(req, env = process.env) {
  const token = parseCookies(req.headers?.cookie)[adminCookieName];
  return verifyAdminToken(token, env);
}

export function adminSessionCookie(token, req) {
  const secure = process.env.NODE_ENV === "production" || String(req.headers?.["x-forwarded-proto"] || "").includes("https");
  return [
    `${adminCookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=43200",
    secure ? "Secure" : null,
  ].filter(Boolean).join("; ");
}

export function clearAdminSessionCookie(req) {
  return adminSessionCookie("", req).replace("Max-Age=43200", "Max-Age=0");
}

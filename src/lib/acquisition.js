import { readPrivacyConsent } from "./privacyConsent.js";

const STORAGE_KEY = "aurora:acquisition:v1";
const CHANNELS = new Set([
  "google",
  "carousell",
  "instagram",
  "whatsapp",
  "line",
  "discord",
  "direct",
  "other",
]);

function safeUrl(value, base = "https://auroraesportstudio.com/") {
  try {
    return new URL(String(value || ""), base);
  } catch {
    return null;
  }
}

function cleanToken(value, maxLength = 80) {
  const cleaned = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return cleaned || null;
}

function cleanLandingPath(url) {
  const path = String(url?.pathname || "/").slice(0, 240);
  return path.startsWith("/") ? path : "/";
}

function cleanReferrerHost(referrer) {
  const url = safeUrl(referrer);
  return String(url?.hostname || "").toLowerCase().slice(0, 120) || null;
}

function channelFromSource(source) {
  const normalized = cleanToken(source);
  if (!normalized) return null;
  if (normalized.includes("carousell")) return "carousell";
  if (normalized.includes("instagram") || normalized === "ig") return "instagram";
  if (normalized.includes("whatsapp") || normalized === "wa" || normalized === "wa.me") return "whatsapp";
  if (normalized === "line" || normalized === "line.me") return "line";
  if (normalized.includes("discord")) return "discord";
  if (normalized.includes("google")) return "google";
  if (normalized === "direct") return "direct";
  return "other";
}

function channelFromHost(host, ownHost) {
  if (!host || host === ownHost || host.endsWith(`.${ownHost}`)) return "direct";
  if (/(^|\.)google\./.test(host)) return "google";
  if (/(^|\.)carousell\./.test(host)) return "carousell";
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (host === "wa.me" || host === "whatsapp.com" || host.endsWith(".whatsapp.com")) return "whatsapp";
  if (host === "line.me" || host.endsWith(".line.me")) return "line";
  if (host === "discord.gg" || host === "discord.com" || host.endsWith(".discord.com")) return "discord";
  return "other";
}

function normalizeStoredTouch(input) {
  if (!input || typeof input !== "object") return null;
  const channel = CHANNELS.has(input.channel) ? input.channel : "other";
  const capturedAt = typeof input.capturedAt === "string" && Number.isFinite(Date.parse(input.capturedAt))
    ? new Date(input.capturedAt).toISOString()
    : null;
  if (!capturedAt) return null;
  return {
    channel,
    landingPath: cleanLandingPath(safeUrl(input.landingPath)),
    referrerHost: cleanReferrerHost(input.referrerHost ? `https://${input.referrerHost}` : ""),
    utmSource: cleanToken(input.utmSource),
    utmMedium: cleanToken(input.utmMedium),
    utmCampaign: cleanToken(input.utmCampaign),
    utmContent: cleanToken(input.utmContent),
    capturedAt,
  };
}

function safeSessionStorage() {
  try {
    return globalThis?.sessionStorage ?? null;
  } catch {
    return null;
  }
}

function analyticsConsentGranted({
  consentGranted,
  consentStorage,
  windowObject = globalThis.window,
} = {}) {
  const navigatorObject = windowObject?.navigator || globalThis.navigator;
  if (navigatorObject?.doNotTrack === "1") return false;
  if (typeof consentGranted === "boolean") return consentGranted;
  return readPrivacyConsent(consentStorage, windowObject)?.analytics === true;
}

export function classifyAcquisition({
  locationHref,
  referrer = "",
  capturedAt = new Date().toISOString(),
} = {}) {
  const location = safeUrl(locationHref);
  const referrerHost = cleanReferrerHost(referrer);
  const utmSource = cleanToken(location?.searchParams.get("utm_source"));
  return {
    channel: channelFromSource(utmSource) || channelFromHost(referrerHost, String(location?.hostname || "").toLowerCase()),
    landingPath: cleanLandingPath(location),
    referrerHost,
    utmSource,
    utmMedium: cleanToken(location?.searchParams.get("utm_medium")),
    utmCampaign: cleanToken(location?.searchParams.get("utm_campaign")),
    utmContent: cleanToken(location?.searchParams.get("utm_content")),
    capturedAt: new Date(capturedAt).toISOString(),
  };
}

export function getAcquisitionContext(
  storage = safeSessionStorage(),
  options = {},
) {
  if (!analyticsConsentGranted(options)) return null;
  try {
    if (!storage?.getItem) return null;
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
    const firstTouch = normalizeStoredTouch(parsed?.firstTouch);
    const lastTouch = normalizeStoredTouch(parsed?.lastTouch);
    return firstTouch && lastTouch ? { firstTouch, lastTouch } : null;
  } catch {
    return null;
  }
}

export function captureAcquisitionContext({
  locationHref = globalThis?.location?.href,
  referrer = globalThis?.document?.referrer || "",
  storage = safeSessionStorage(),
  now = () => new Date(),
  consentGranted,
  consentStorage,
  windowObject = globalThis.window,
} = {}) {
  if (!analyticsConsentGranted({ consentGranted, consentStorage, windowObject })) return null;
  if (!storage) return null;
  const touch = classifyAcquisition({
    locationHref,
    referrer,
    capturedAt: now().toISOString(),
  });
  const current = getAcquisitionContext(storage, { consentGranted: true, windowObject });
  const context = {
    firstTouch: current?.firstTouch || touch,
    lastTouch: touch,
  };
  try {
    storage.setItem?.(STORAGE_KEY, JSON.stringify(context));
  } catch {
    // Tracking must never interrupt the public website.
    return null;
  }
  return context;
}

export function clearAcquisitionContext(storage = safeSessionStorage()) {
  try {
    storage?.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

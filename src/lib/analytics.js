const GOOGLE_TAG_ID = "aurora-google-analytics";
const GA4_MEASUREMENT_ID = /^G-[A-Z0-9]{4,20}$/i;

const allowedEvents = new Set([
  "page_view",
  "quote_entry",
  "service_quote",
  "quote_result",
  "contact_click",
]);

const parameterLimits = new Map([
  ["page_path", 256],
  ["page_title", 100],
  ["quote_method", 20],
  ["game_id", 32],
  ["service_id", 48],
  ["quote_status", 32],
  ["contact_channel", 24],
]);

function runtimeObjects(harness = {}) {
  return {
    windowObject: harness.windowObject || globalThis.window,
    documentObject: harness.documentObject || globalThis.document,
  };
}

function ensureGtag(windowObject) {
  windowObject.dataLayer = windowObject.dataLayer || [];
  windowObject.gtag = windowObject.gtag || function gtag() {
    windowObject.dataLayer.push(arguments);
  };
}

function setDefaultDenied(windowObject) {
  if (windowObject.__auroraAnalyticsDefaultDenied === true) return;
  windowObject.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  windowObject.__auroraAnalyticsDefaultDenied = true;
}

function loadGoogleTagOnce(measurementId, { windowObject, documentObject }) {
  if (windowObject.__auroraAnalyticsMeasurementId !== measurementId) {
    windowObject.gtag("js", new Date());
    windowObject.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      anonymize_ip: true,
      send_page_view: false,
    });
    windowObject.__auroraAnalyticsMeasurementId = measurementId;
  }

  if (!documentObject.getElementById(GOOGLE_TAG_ID)) {
    const script = documentObject.createElement("script");
    script.id = GOOGLE_TAG_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    documentObject.head.appendChild(script);
  }
}

export function getConfiguredMeasurementId() {
  return String(import.meta.env?.VITE_GA_MEASUREMENT_ID || "").trim();
}

export function isValidMeasurementId(measurementId) {
  return GA4_MEASUREMENT_ID.test(String(measurementId || "").trim());
}

export function sanitizeAnalyticsParameters(parameters = {}) {
  return Object.fromEntries(
    Object.entries(parameters).flatMap(([key, value]) => {
      const limit = parameterLimits.get(key);
      if (!limit || value === undefined || value === null || value === "") return [];
      return [[key, String(value).trim().slice(0, limit)]];
    }),
  );
}

export function enableAnalytics(
  measurementId = getConfiguredMeasurementId(),
  harness = {},
) {
  const id = String(measurementId || "").trim().toUpperCase();
  const { documentObject, windowObject } = runtimeObjects(harness);

  if (!isValidMeasurementId(id) || !windowObject || !documentObject) return false;
  if (windowObject.navigator?.doNotTrack === "1") return false;

  ensureGtag(windowObject);
  setDefaultDenied(windowObject);
  windowObject.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  windowObject.__auroraAnalyticsConsent = true;
  loadGoogleTagOnce(id, { windowObject, documentObject });
  return true;
}

export function disableAnalytics(harness = {}) {
  const { windowObject } = runtimeObjects(harness);
  if (!windowObject) return false;
  windowObject.__auroraAnalyticsConsent = false;
  ensureGtag(windowObject);
  setDefaultDenied(windowObject);
  windowObject.gtag("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  return true;
}

export function clearAnalyticsCookies(harness = {}) {
  const { documentObject, windowObject } = runtimeObjects(harness);
  if (!documentObject) return 0;

  try {
    const cookieNames = [...new Set(
      String(documentObject.cookie || "")
        .split(";")
        .map((cookie) => cookie.split("=")[0].trim())
        .filter((name) => /^_ga(?:_|$)/.test(name)),
    )];
    const hostname = String(windowObject?.location?.hostname || "")
      .trim()
      .toLowerCase()
      .replace(/^\.+|\.+$/g, "");
    const labels = hostname.split(".");
    const domains = [
      hostname,
      labels.length > 2 ? labels.slice(1).join(".") : "",
    ].filter(Boolean);

    for (const name of cookieNames) {
      const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      documentObject.cookie = expired;
      for (const domain of domains) {
        documentObject.cookie = `${expired}; domain=.${domain}`;
      }
    }
    return cookieNames.length;
  } catch {
    return 0;
  }
}

export function trackEvent(eventName, parameters = {}, harness = {}) {
  const { windowObject } = runtimeObjects(harness);
  if (windowObject?.__auroraAnalyticsConsent !== true) return false;
  if (!allowedEvents.has(eventName)) return false;
  if (typeof windowObject?.gtag !== "function") return false;
  windowObject.gtag("event", eventName, sanitizeAnalyticsParameters(parameters));
  return true;
}

export function trackPageView({ path, title } = {}, harness) {
  return trackEvent("page_view", { page_path: path, page_title: title }, harness);
}

export function trackQuoteEntry({ method, gameId, serviceId } = {}, harness) {
  return trackEvent(
    "quote_entry",
    { quote_method: method, game_id: gameId, service_id: serviceId },
    harness,
  );
}

export function trackServiceQuote({ gameId, serviceId } = {}, harness) {
  return trackEvent("service_quote", { game_id: gameId, service_id: serviceId }, harness);
}

export function trackQuoteResult({ gameId, serviceId, status } = {}, harness) {
  return trackEvent(
    "quote_result",
    { game_id: gameId, service_id: serviceId, quote_status: status },
    harness,
  );
}

export function trackContactClick(channel, harness) {
  return trackEvent("contact_click", { contact_channel: channel }, harness);
}

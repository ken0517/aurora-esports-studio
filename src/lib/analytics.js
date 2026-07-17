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

export function initializeAnalytics(
  measurementId = getConfiguredMeasurementId(),
  harness = {},
) {
  const id = String(measurementId || "").trim().toUpperCase();
  const { documentObject, windowObject } = runtimeObjects(harness);

  if (!isValidMeasurementId(id) || !windowObject || !documentObject) return false;
  if (windowObject.navigator?.doNotTrack === "1") return false;

  windowObject.dataLayer = windowObject.dataLayer || [];
  windowObject.gtag = windowObject.gtag || function gtag() {
    windowObject.dataLayer.push(arguments);
  };

  if (windowObject.__auroraAnalyticsMeasurementId !== id) {
    windowObject.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    windowObject.gtag("js", new Date());
    windowObject.gtag("config", id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      anonymize_ip: true,
      send_page_view: false,
    });
    windowObject.__auroraAnalyticsMeasurementId = id;
  }

  if (!documentObject.getElementById(GOOGLE_TAG_ID)) {
    const script = documentObject.createElement("script");
    script.id = GOOGLE_TAG_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    documentObject.head.appendChild(script);
  }

  return true;
}

export function trackEvent(eventName, parameters = {}, harness = {}) {
  if (!allowedEvents.has(eventName)) return false;
  const { windowObject } = runtimeObjects(harness);
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

import {
  createDefaultRuntimeCatalog,
  normalizeRuntimeCatalog,
} from "../data/runtimeCatalog.js";

const viteEnv = import.meta.env ?? {};

function normalizeApiPath(path) {
  const value = String(path || "/");
  return value.startsWith("/") ? value : `/${value}`;
}

function resolveApiBase({ apiBaseUrl = "", quoteEndpoint = "", fallbackBaseUrl = "" } = {}) {
  const configured = String(apiBaseUrl || "").trim().replace(/\/$/, "");
  if (configured) return configured;
  const quoteUrl = String(quoteEndpoint || "").trim();
  try {
    if (quoteUrl.startsWith("http")) return new URL(quoteUrl).origin;
  } catch {
    // Ignore an invalid optional endpoint and continue to the safe fallback.
  }
  return String(fallbackBaseUrl || "").trim().replace(/\/$/, "");
}

export function resolveAuroraApiUrl(path, options = {}) {
  return `${resolveApiBase(options)}${normalizeApiPath(path)}`;
}

export function resolveEnquiryApiUrl({
  explicitEndpoint = "",
  apiBaseUrl = "",
  quoteEndpoint = "",
  isDev = false,
} = {}) {
  const override = String(explicitEndpoint || "").trim();
  if (override) return override;
  return resolveAuroraApiUrl("/api/enquiries", {
    apiBaseUrl,
    quoteEndpoint,
    fallbackBaseUrl: isDev ? "http://localhost:8787" : "",
  });
}

export function catalogApiUrl(path = "/api/catalog") {
  return resolveAuroraApiUrl(path, {
    apiBaseUrl: viteEnv.VITE_AURORA_API_BASE_URL,
    quoteEndpoint: viteEnv.VITE_QUOTE_AI_ENDPOINT,
  });
}

export function enquiryApiUrl() {
  return resolveEnquiryApiUrl({
    explicitEndpoint: viteEnv.VITE_ENQUIRY_ENDPOINT,
    apiBaseUrl: viteEnv.VITE_AURORA_API_BASE_URL,
    quoteEndpoint: viteEnv.VITE_QUOTE_AI_ENDPOINT,
    isDev: Boolean(viteEnv.DEV),
  });
}

export async function fetchRuntimeCatalog({ signal } = {}) {
  const response = await fetch(catalogApiUrl(), {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`catalog-request-failed:${response.status}`);
  const payload = await response.json();
  return normalizeRuntimeCatalog(payload.catalog ?? payload);
}

export function fallbackRuntimeCatalog() {
  return createDefaultRuntimeCatalog();
}

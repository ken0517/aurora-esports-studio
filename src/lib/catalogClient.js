import {
  createDefaultRuntimeCatalog,
  normalizeRuntimeCatalog,
} from "../data/runtimeCatalog.js";

function resolveApiBase() {
  const configured = String(import.meta.env.VITE_AURORA_API_BASE_URL || "").replace(/\/$/, "");
  if (configured) return configured;
  const quoteEndpoint = String(import.meta.env.VITE_QUOTE_AI_ENDPOINT || "");
  try {
    return quoteEndpoint.startsWith("http") ? new URL(quoteEndpoint).origin : "";
  } catch {
    return "";
  }
}

const apiBase = resolveApiBase();

export function catalogApiUrl(path = "/api/catalog") {
  return `${apiBase}${path}`;
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

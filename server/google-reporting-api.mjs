import { isAdminRequest } from "./admin-auth.mjs";
import { fetchGoogleReporting, googleReportingConfigured } from "./google-reporting.mjs";

function send(res, status, payload, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(JSON.stringify(payload));
}

export async function handleAdminGoogleReporting(req, res, {
  env = process.env,
  reporter = fetchGoogleReporting,
} = {}) {
  if (!isAdminRequest(req, env)) return send(res, 401, { error: "authentication-required" });
  if (req.method !== "GET") return send(res, 405, { error: "method-not-allowed" }, { Allow: "GET" });
  if (!googleReportingConfigured(env)) return send(res, 200, { configured: false });
  try {
    return send(res, 200, await reporter({ env }));
  } catch {
    return send(res, 503, { configured: true, error: "google-reporting-unavailable" });
  }
}

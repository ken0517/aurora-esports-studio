import { catalogApiUrl } from "../lib/catalogClient.js";

export async function loadGoogleReporting({ signal } = {}) {
  const response = await fetch(catalogApiUrl("/api/admin/google-reporting"), {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `request-failed:${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

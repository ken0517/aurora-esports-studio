import { catalogApiUrl } from "../lib/catalogClient.js";

async function request(path = "", options = {}) {
  const response = await fetch(catalogApiUrl(`/api/admin/operations${path}`), {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `request-failed:${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export function loadOperations(filters = {}) {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
  return request(query.size ? `?${query}` : "");
}

export function runOperationsAction(action) {
  return request("/action", { method: "POST", body: JSON.stringify(action) });
}


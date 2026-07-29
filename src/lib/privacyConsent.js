export const PRIVACY_POLICY_VERSION = "2026-07-29";
export const PRIVACY_STORAGE_KEY = "aurora:privacy-consent:v1";
export const PRIVACY_CHANGE_EVENT = "aurora:privacy-consent-changed";
export const PRIVACY_SETTINGS_EVENT = "aurora:open-privacy-settings";

function safeLocalStorage() {
  try {
    return globalThis.window?.localStorage || null;
  } catch {
    return null;
  }
}

function isDoNotTrackEnabled(windowObject) {
  return windowObject?.navigator?.doNotTrack === "1";
}

function dispatchEvent(windowObject, type, detail) {
  if (typeof windowObject?.dispatchEvent !== "function") return false;
  const CustomEventConstructor = windowObject.CustomEvent || globalThis.CustomEvent;
  if (typeof CustomEventConstructor !== "function") return false;
  return windowObject.dispatchEvent(new CustomEventConstructor(type, { detail }));
}

export function readPrivacyConsent(storage = safeLocalStorage(), windowObject = globalThis.window) {
  try {
    const value = JSON.parse(storage?.getItem(PRIVACY_STORAGE_KEY) || "null");
    if (
      value?.version !== PRIVACY_POLICY_VERSION ||
      typeof value.analytics !== "boolean" ||
      !Number.isFinite(Date.parse(value.decidedAt))
    ) return null;
    return isDoNotTrackEnabled(windowObject) ? { ...value, analytics: false } : value;
  } catch {
    return null;
  }
}

export function writePrivacyConsent(
  { analytics },
  { storage = safeLocalStorage(), now = () => new Date(), windowObject = globalThis.window } = {},
) {
  const decision = {
    version: PRIVACY_POLICY_VERSION,
    analytics: analytics === true && !isDoNotTrackEnabled(windowObject),
    decidedAt: now().toISOString(),
  };

  try {
    storage?.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(decision));
  } catch {
    // A choice remains available to the caller when browser storage is blocked.
  }

  dispatchEvent(windowObject, PRIVACY_CHANGE_EVENT, decision);
  return decision;
}

export function openPrivacySettings(windowObject = globalThis.window) {
  return dispatchEvent(windowObject, PRIVACY_SETTINGS_EVENT);
}

export function subscribePrivacySettings(callback, windowObject = globalThis.window) {
  if (typeof callback !== "function" || typeof windowObject?.addEventListener !== "function") {
    return () => {};
  }
  windowObject.addEventListener(PRIVACY_SETTINGS_EVENT, callback);
  return () => windowObject.removeEventListener?.(PRIVACY_SETTINGS_EVENT, callback);
}

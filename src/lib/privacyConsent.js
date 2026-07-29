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

export function subscribePrivacyDecision(
  callback,
  {
    windowObject = globalThis.window,
    documentObject = globalThis.document,
    storage = safeLocalStorage(),
  } = {},
) {
  if (typeof callback !== "function" || typeof windowObject?.addEventListener !== "function") {
    return () => {};
  }

  const notify = (event) => callback(
    readPrivacyConsent(storage, windowObject),
    event,
  );
  const handleStorage = (event) => {
    if (event?.key !== null && event?.key !== PRIVACY_STORAGE_KEY) return;
    notify(event);
  };
  const handleVisibilityChange = (event) => {
    if (documentObject?.visibilityState === "hidden") return;
    notify(event);
  };

  windowObject.addEventListener("storage", handleStorage);
  windowObject.addEventListener("pageshow", notify);
  windowObject.addEventListener("focus", notify);
  documentObject?.addEventListener?.("visibilitychange", handleVisibilityChange);

  return () => {
    windowObject.removeEventListener?.("storage", handleStorage);
    windowObject.removeEventListener?.("pageshow", notify);
    windowObject.removeEventListener?.("focus", notify);
    documentObject?.removeEventListener?.("visibilitychange", handleVisibilityChange);
  };
}

export function restorePrivacyFocus(opener, documentObject = globalThis.document) {
  const target = opener?.isConnected === true
    ? opener
    : documentObject?.querySelector?.("#main-content, main");
  if (typeof target?.focus !== "function") return false;

  try {
    if (
      target !== opener
      && typeof target.hasAttribute === "function"
      && !target.hasAttribute("tabindex")
    ) {
      target.setAttribute?.("tabindex", "-1");
    }
    target.focus();
    return true;
  } catch {
    return false;
  }
}

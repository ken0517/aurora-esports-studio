import assert from "node:assert/strict";
import test from "node:test";

import { trackEvent } from "../src/lib/analytics.js";
import {
  PRIVACY_POLICY_VERSION,
  PRIVACY_STORAGE_KEY,
  subscribePrivacyDecision,
} from "../src/lib/privacyConsent.js";
import { applyPrivacyDecision } from "../src/lib/privacyRuntime.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

function eventTarget(properties = {}) {
  const listeners = new Map();
  return {
    ...properties,
    addEventListener(type, callback) {
      const callbacks = listeners.get(type) || new Set();
      callbacks.add(callback);
      listeners.set(type, callbacks);
    },
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback);
    },
    dispatchEvent(event) {
      for (const callback of listeners.get(event.type) || []) callback(event);
      return true;
    },
  };
}

test("reject clears acquisition and never starts analytics", () => {
  const calls = [];
  const result = applyPrivacyDecision(
    { analytics: false },
    {
      disableAnalytics: () => calls.push("disable"),
      clearAcquisitionContext: () => calls.push("clear"),
      enableAnalytics: () => calls.push("enable"),
    },
  );
  assert.deepEqual(calls, ["disable", "clear"]);
  assert.equal(result.analyticsEnabled, false);
});

test("grant captures acquisition, enables analytics, and records one current page view", () => {
  const calls = [];
  const result = applyPrivacyDecision(
    { analytics: true },
    {
      captureAcquisitionContext: (options) => calls.push(["capture", options]),
      enableAnalytics: () => {
        calls.push(["enable"]);
        return true;
      },
      trackPageView: (page) => calls.push(["page", page]),
      windowObject: {
        location: {
          href: "https://auroraesportstudio.com/hok-rank-boost/?utm_source=google",
          pathname: "/hok-rank-boost/",
        },
        navigator: { doNotTrack: "0" },
      },
      documentObject: {
        referrer: "https://www.google.com/",
        title: "Honor of Kings Rank Boost",
      },
    },
  );

  assert.deepEqual(calls, [
    ["capture", {
      locationHref: "https://auroraesportstudio.com/hok-rank-boost/?utm_source=google",
      referrer: "https://www.google.com/",
      consentGranted: true,
    }],
    ["enable"],
    ["page", {
      path: "/hok-rank-boost/",
      title: "Honor of Kings Rank Boost",
    }],
  ]);
  assert.equal(result.analyticsEnabled, true);
});

test("reapplying an unchanged grant does not duplicate the current page view", () => {
  const calls = [];
  const result = applyPrivacyDecision(
    { analytics: true },
    {
      enableAnalytics: () => {
        calls.push("enable");
        return true;
      },
      trackPageView: () => calls.push("page"),
      windowObject: {
        __auroraAnalyticsConsent: true,
        location: { href: "https://auroraesportstudio.com/", pathname: "/" },
        navigator: { doNotTrack: "0" },
      },
      documentObject: { referrer: "", title: "Aurora Esports Studio" },
    },
  );

  assert.deepEqual(calls, ["enable"]);
  assert.equal(result.analyticsEnabled, true);
});

test("a granted second runtime applies cross-tab revocation and rejects later events", () => {
  const storage = memoryStorage();
  const gtagCalls = [];
  const windowObject = eventTarget({
    __auroraAnalyticsConsent: true,
    dataLayer: [],
    gtag(...args) { gtagCalls.push(args); },
    localStorage: storage,
    location: { hostname: "auroraesportstudio.com", pathname: "/" },
    navigator: { doNotTrack: "0" },
  });
  const documentObject = eventTarget({
    visibilityState: "visible",
    title: "Aurora Esports Studio",
  });
  const cleared = [];
  const unsubscribe = subscribePrivacyDecision(
    (decision) => applyPrivacyDecision(decision, {
      clearAcquisitionContext: () => cleared.push("acquisition"),
      clearAnalyticsCookies: () => cleared.push("cookies"),
      documentObject,
      windowObject,
    }),
    { documentObject, storage, windowObject },
  );

  storage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify({
    version: PRIVACY_POLICY_VERSION,
    analytics: false,
    decidedAt: "2026-07-29T13:20:00.000Z",
  }));
  windowObject.dispatchEvent({ type: "storage", key: PRIVACY_STORAGE_KEY });

  assert.equal(windowObject.__auroraAnalyticsConsent, false);
  assert.deepEqual(cleared, ["cookies", "acquisition"]);
  assert.equal(trackEvent("contact_click", { contact_channel: "whatsapp" }, { windowObject }), false);
  assert.equal(
    gtagCalls.some(([command, action, settings]) => (
      command === "consent"
      && action === "update"
      && settings.analytics_storage === "denied"
    )),
    true,
  );
  unsubscribe();
});

test("Do Not Track follows the rejection path despite a stored grant", () => {
  const calls = [];
  const result = applyPrivacyDecision(
    { analytics: true },
    {
      disableAnalytics: () => calls.push("disable"),
      clearAnalyticsCookies: () => calls.push("cookies"),
      clearAcquisitionContext: () => calls.push("clear"),
      enableAnalytics: () => calls.push("enable"),
      windowObject: { navigator: { doNotTrack: "1" } },
    },
  );

  assert.deepEqual(calls, ["disable", "cookies", "clear"]);
  assert.equal(result.analyticsEnabled, false);
});

test("admin routes skip all public tracking work", () => {
  const calls = [];
  const result = applyPrivacyDecision(
    { analytics: true },
    {
      isAdmin: true,
      captureAcquisitionContext: () => calls.push("capture"),
      enableAnalytics: () => calls.push("enable"),
      disableAnalytics: () => calls.push("disable"),
      clearAcquisitionContext: () => calls.push("clear"),
    },
  );

  assert.deepEqual(calls, []);
  assert.equal(result.analyticsEnabled, false);
});

test("privacy runtime never throws failures into the page", () => {
  const failure = () => {
    throw new Error("blocked");
  };

  assert.doesNotThrow(() => applyPrivacyDecision(
    { analytics: false },
    {
      disableAnalytics: failure,
      clearAnalyticsCookies: failure,
      clearAcquisitionContext: failure,
    },
  ));
});

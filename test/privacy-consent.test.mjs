import assert from "node:assert/strict";
import test from "node:test";

import {
  PRIVACY_CHANGE_EVENT,
  PRIVACY_POLICY_VERSION,
  PRIVACY_SETTINGS_EVENT,
  PRIVACY_STORAGE_KEY,
  openPrivacySettings,
  readPrivacyConsent,
  restorePrivacyFocus,
  subscribePrivacyDecision,
  subscribePrivacySettings,
  writePrivacyConsent,
} from "../src/lib/privacyConsent.js";
import { normalizePrivacyLocale, privacyContent } from "../src/data/privacyContent.js";

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

function eventWindow() {
  const listeners = new Map();
  return {
    CustomEvent: class CustomEvent {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    },
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

test("privacy consent persists only a current versioned analytics choice", () => {
  const storage = memoryStorage();
  const decision = writePrivacyConsent(
    { analytics: true },
    { storage, now: () => new Date("2026-07-29T12:00:00.000Z") },
  );
  assert.deepEqual(readPrivacyConsent(storage), {
    version: PRIVACY_POLICY_VERSION,
    analytics: true,
    decidedAt: "2026-07-29T12:00:00.000Z",
  });
  assert.deepEqual(readPrivacyConsent(storage), decision);
});

test("invalid or previous-version consent is treated as undecided", () => {
  const storage = memoryStorage();
  storage.setItem(PRIVACY_STORAGE_KEY, "{broken");
  assert.equal(readPrivacyConsent(storage), null);
  storage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify({
    version: "previous",
    analytics: true,
    decidedAt: "2026-07-29T12:00:00.000Z",
  }));
  assert.equal(readPrivacyConsent(storage), null);
});

test("invalid decision timestamps are treated as undecided", () => {
  const storage = memoryStorage();
  storage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify({
    version: PRIVACY_POLICY_VERSION,
    analytics: false,
    decidedAt: "not-a-date",
  }));

  assert.equal(readPrivacyConsent(storage), null);
});

test("privacy consent returns a decision when storage is unavailable", () => {
  const blockedStorage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
  };

  assert.deepEqual(writePrivacyConsent(
    { analytics: false },
    { storage: blockedStorage, now: () => new Date("2026-07-29T12:30:00.000Z") },
  ), {
    version: PRIVACY_POLICY_VERSION,
    analytics: false,
    decidedAt: "2026-07-29T12:30:00.000Z",
  });
  assert.equal(readPrivacyConsent(blockedStorage), null);
});

test("Do Not Track keeps analytics denied despite an opt-in request", () => {
  const storage = memoryStorage();
  const windowObject = eventWindow();
  windowObject.navigator = { doNotTrack: "1" };
  const changes = [];
  windowObject.addEventListener(PRIVACY_CHANGE_EVENT, (event) => changes.push(event.detail));

  const decision = writePrivacyConsent(
    { analytics: true },
    { storage, windowObject, now: () => new Date("2026-07-29T12:45:00.000Z") },
  );

  assert.equal(decision.analytics, false);
  assert.equal(readPrivacyConsent(storage).analytics, false);
  assert.equal(changes[0].analytics, false);
});

test("Do Not Track fails closed when reading a previously granted choice", () => {
  const storage = memoryStorage();
  storage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify({
    version: PRIVACY_POLICY_VERSION,
    analytics: true,
    decidedAt: "2026-07-29T12:47:00.000Z",
  }));
  const windowObject = eventWindow();
  windowObject.navigator = { doNotTrack: "1" };

  assert.deepEqual(readPrivacyConsent(storage, windowObject), {
    version: PRIVACY_POLICY_VERSION,
    analytics: false,
    decidedAt: "2026-07-29T12:47:00.000Z",
  });
});

test("only a boolean true grants analytics consent", () => {
  const storage = memoryStorage();

  const decision = writePrivacyConsent(
    { analytics: "false" },
    { storage, now: () => new Date("2026-07-29T12:50:00.000Z") },
  );

  assert.equal(decision.analytics, false);
  assert.equal(readPrivacyConsent(storage).analytics, false);
});

test("privacy choices and settings requests dispatch their current events", () => {
  const storage = memoryStorage();
  const windowObject = eventWindow();
  const events = [];
  windowObject.addEventListener(PRIVACY_CHANGE_EVENT, (event) => events.push(event));
  windowObject.addEventListener(PRIVACY_SETTINGS_EVENT, (event) => events.push(event));

  const decision = writePrivacyConsent(
    { analytics: true },
    { storage, windowObject, now: () => new Date("2026-07-29T13:00:00.000Z") },
  );

  assert.equal(openPrivacySettings(windowObject), true);
  assert.deepEqual(events.map((event) => [event.type, event.detail]), [
    [PRIVACY_CHANGE_EVENT, decision],
    [PRIVACY_SETTINGS_EVENT, undefined],
  ]);
});

test("privacy settings subscriptions can be removed", () => {
  const windowObject = eventWindow();
  let calls = 0;
  const unsubscribe = subscribePrivacySettings(() => { calls += 1; }, windowObject);

  openPrivacySettings(windowObject);
  unsubscribe();
  openPrivacySettings(windowObject);

  assert.equal(calls, 1);
});

test("privacy decision subscriptions re-read cross-tab and resumed storage choices", () => {
  const storage = memoryStorage();
  const windowObject = eventWindow();
  const documentObject = eventWindow();
  windowObject.localStorage = storage;
  windowObject.navigator = { doNotTrack: "0" };
  documentObject.visibilityState = "visible";
  const decisions = [];
  const unsubscribe = subscribePrivacyDecision(
    (decision, event) => decisions.push([decision?.analytics ?? null, event.type]),
    { windowObject, documentObject, storage },
  );

  storage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify({
    version: PRIVACY_POLICY_VERSION,
    analytics: false,
    decidedAt: "2026-07-29T13:10:00.000Z",
  }));
  windowObject.dispatchEvent({ type: "storage", key: "unrelated" });
  assert.deepEqual(decisions, []);

  windowObject.dispatchEvent({ type: "storage", key: PRIVACY_STORAGE_KEY });
  assert.deepEqual(decisions, [[false, "storage"]]);

  storage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify({
    version: PRIVACY_POLICY_VERSION,
    analytics: true,
    decidedAt: "2026-07-29T13:11:00.000Z",
  }));
  windowObject.dispatchEvent({ type: "pageshow" });
  documentObject.visibilityState = "hidden";
  documentObject.dispatchEvent({ type: "visibilitychange" });
  documentObject.visibilityState = "visible";
  documentObject.dispatchEvent({ type: "visibilitychange" });
  assert.deepEqual(decisions, [
    [false, "storage"],
    [true, "pageshow"],
    [true, "visibilitychange"],
  ]);

  unsubscribe();
  windowObject.dispatchEvent({ type: "focus" });
  assert.equal(decisions.length, 3);
});

test("focus restoration keeps a connected opener and otherwise focuses the public main landmark", () => {
  let connectedFocuses = 0;
  const connectedOpener = {
    isConnected: true,
    focus() { connectedFocuses += 1; },
  };
  const unexpectedDocument = {
    querySelector() {
      throw new Error("a connected opener must remain the focus target");
    },
  };

  assert.equal(restorePrivacyFocus(connectedOpener, unexpectedDocument), true);
  assert.equal(connectedFocuses, 1);

  const attributes = new Map();
  let mainFocuses = 0;
  const main = {
    hasAttribute(name) { return attributes.has(name); },
    setAttribute(name, value) { attributes.set(name, value); },
    focus() { mainFocuses += 1; },
  };
  const documentObject = {
    querySelector(selector) {
      assert.equal(selector, "#main-content, main");
      return main;
    },
  };

  assert.equal(
    restorePrivacyFocus({ isConnected: false, focus() {} }, documentObject),
    true,
  );
  assert.equal(mainFocuses, 1);
  assert.equal(attributes.get("tabindex"), "-1");
});

test("privacy content covers all supported locales and normalizes locale variants", () => {
  for (const locale of ["zh-HK", "en", "zh-CN"]) {
    assert.equal(typeof privacyContent[locale].banner.title, "string");
    assert.equal(typeof privacyContent[locale].banner.manageSettings, "string");
    assert.equal(typeof privacyContent[locale].policy.body, "string");
  }

  assert.equal(normalizePrivacyLocale("zh-TW"), "zh-HK");
  assert.equal(normalizePrivacyLocale("en-GB"), "en");
  assert.equal(normalizePrivacyLocale("zh-SG"), "zh-CN");
  assert.equal(normalizePrivacyLocale("unknown"), "zh-HK");
});

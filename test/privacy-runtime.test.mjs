import assert from "node:assert/strict";
import test from "node:test";

import { applyPrivacyDecision } from "../src/lib/privacyRuntime.js";

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

import assert from "node:assert/strict";
import test from "node:test";

import {
  captureAcquisitionContext,
  classifyAcquisition,
  getAcquisitionContext,
} from "../src/lib/acquisition.js";
import { acquisitionChannelLabels, summarizeAcquisition } from "../src/admin/acquisitionSummary.js";

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

test("UTM source identifies Carousell without retaining query strings or advertising IDs", () => {
  const touch = classifyAcquisition({
    locationHref: "https://auroraesportstudio.com/hok-rank-boost/?utm_source=Carousell&utm_medium=marketplace&utm_campaign=klg_listing&gclid=private-click-id&q=secret",
    referrer: "https://www.carousell.com.hk/p/example?private=1",
    capturedAt: "2026-07-29T10:00:00.000Z",
  });

  assert.deepEqual(touch, {
    channel: "carousell",
    landingPath: "/hok-rank-boost/",
    referrerHost: "www.carousell.com.hk",
    utmSource: "carousell",
    utmMedium: "marketplace",
    utmCampaign: "klg_listing",
    capturedAt: "2026-07-29T10:00:00.000Z",
  });
  assert.doesNotMatch(JSON.stringify(touch), /gclid|private-click-id|secret|\?private/);
});

test("external Google referral is Google and same-site or missing referral is direct", () => {
  assert.equal(classifyAcquisition({
    locationHref: "https://auroraesportstudio.com/",
    referrer: "https://www.google.com/search?q=hong+kong+aov",
  }).channel, "google");

  assert.equal(classifyAcquisition({
    locationHref: "https://auroraesportstudio.com/hok-rank-boost/",
    referrer: "https://auroraesportstudio.com/",
  }).channel, "direct");

  assert.equal(classifyAcquisition({
    locationHref: "https://auroraesportstudio.com/",
    referrer: "",
  }).channel, "direct");
});

test("session capture preserves first touch and updates only the latest touch", () => {
  const storage = memoryStorage();
  captureAcquisitionContext({
    locationHref: "https://auroraesportstudio.com/?utm_source=carousell&utm_medium=marketplace&utm_campaign=klg_listing",
    referrer: "",
    storage,
    now: () => new Date("2026-07-29T10:00:00.000Z"),
  });
  captureAcquisitionContext({
    locationHref: "https://auroraesportstudio.com/hok-rank-boost/",
    referrer: "https://www.google.com/",
    storage,
    now: () => new Date("2026-07-29T10:05:00.000Z"),
  });

  const context = getAcquisitionContext(storage);
  assert.equal(context.firstTouch.channel, "carousell");
  assert.equal(context.firstTouch.capturedAt, "2026-07-29T10:00:00.000Z");
  assert.equal(context.lastTouch.channel, "google");
  assert.equal(context.lastTouch.landingPath, "/hok-rank-boost/");
});

test("acquisition tracking is a no-op when sessionStorage access throws a SecurityError", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    get() {
      throw new DOMException("Blocked by browser policy", "SecurityError");
    },
  });
  try {
    assert.equal(getAcquisitionContext(), null);
    assert.equal(captureAcquisitionContext({
      locationHref: "https://auroraesportstudio.com/",
      referrer: "",
    }), null);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "sessionStorage", descriptor);
    else delete globalThis.sessionStorage;
  }
});

test("acquisition summary counts consented enquiries and converted orders without claiming all visitors", () => {
  const summary = summarizeAcquisition({
    enquiries: [
      { id: "e1", gameId: "hok-global", serviceId: "rank", source: "manual_quote", acquisition: { firstTouch: { channel: "carousell" } } },
      { id: "e2", gameId: "hok-global", serviceId: "duo", source: "ai", acquisition: { firstTouch: { channel: "google" } } },
      { id: "e3", gameId: "aov", serviceId: "other", source: "manual_quote", acquisition: null },
    ],
    orders: [{ id: "o1", enquiryId: "e1" }],
  });

  assert.equal(summary.totalEnquiries, 3);
  assert.equal(summary.convertedOrders, 1);
  assert.equal(summary.conversionRate, 33.33);
  assert.deepEqual(summary.channels, [
    { channel: "carousell", enquiries: 1, orders: 1, conversionRate: 100 },
    { channel: "google", enquiries: 1, orders: 0, conversionRate: 0 },
    { channel: "unknown", enquiries: 1, orders: 0, conversionRate: 0 },
  ]);
});

test("admin acquisition labels remain readable formal Traditional Chinese", () => {
  assert.deepEqual(acquisitionChannelLabels, {
    google: "Google",
    carousell: "Carousell",
    instagram: "Instagram",
    direct: "直接進入",
    other: "其他來源",
    unknown: "未記錄",
  });
});

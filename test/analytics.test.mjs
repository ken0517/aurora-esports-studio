import assert from "node:assert/strict";
import test from "node:test";

const analyticsModuleUrl = new URL("../src/lib/analytics.js", import.meta.url);

function createBrowserHarness() {
  const scripts = [];
  const documentObject = {
    head: {
      appendChild(node) {
        scripts.push(node);
      },
    },
    createElement(tagName) {
      return { tagName, async: false, id: "", src: "" };
    },
    getElementById(id) {
      return scripts.find((script) => script.id === id) || null;
    },
  };
  const windowObject = {
    dataLayer: [],
    navigator: { doNotTrack: "0" },
  };
  return { documentObject, scripts, windowObject };
}

test("analytics remains disabled without a valid GA4 measurement ID", async () => {
  const { initializeAnalytics } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();

  assert.equal(initializeAnalytics("", harness), false);
  assert.equal(initializeAnalytics("UA-1234", harness), false);
  assert.equal(harness.scripts.length, 0);
});

test("analytics loads Google tag once with privacy-first configuration", async () => {
  const { initializeAnalytics } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();

  assert.equal(initializeAnalytics("G-AURORA123", harness), true);
  assert.equal(initializeAnalytics("G-AURORA123", harness), true);
  assert.equal(harness.scripts.length, 1);
  assert.equal(harness.scripts[0].id, "aurora-google-analytics");
  assert.match(harness.scripts[0].src, /googletagmanager\.com\/gtag\/js\?id=G-AURORA123/);

  const commands = harness.windowObject.dataLayer.map((args) => Array.from(args));
  assert.deepEqual(commands[0].slice(0, 2), ["consent", "default"]);
  assert.equal(commands[0][2].analytics_storage, "denied");
  assert.equal(commands[2][0], "config");
  assert.equal(commands[2][2].allow_google_signals, false);
  assert.equal(commands[2][2].allow_ad_personalization_signals, false);
  assert.equal(commands[2][2].send_page_view, false);
});

test("analytics strips customer content and keeps only approved event metadata", async () => {
  const { sanitizeAnalyticsParameters } = await import(analyticsModuleUrl);

  assert.deepEqual(
    sanitizeAnalyticsParameters({
      game_id: "aov",
      service_id: "rank",
      quote_status: "quoted",
      page_path: "/arena-of-valor-boosting/",
      message: "my password is 1234",
      quote_text: "Diamond III to Veteran I",
      preferred_hero: "Liliana",
      phone: "12345678",
      token: "secret",
    }),
    {
      game_id: "aov",
      service_id: "rank",
      quote_status: "quoted",
      page_path: "/arena-of-valor-boosting/",
    },
  );
});

test("analytics ignores unknown event names", async () => {
  const { initializeAnalytics, trackEvent } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();
  initializeAnalytics("G-AURORA123", harness);
  const before = harness.windowObject.dataLayer.length;

  assert.equal(trackEvent("send_customer_message", { game_id: "aov" }, harness), false);
  assert.equal(harness.windowObject.dataLayer.length, before);
});

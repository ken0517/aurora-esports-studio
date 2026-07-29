import assert from "node:assert/strict";
import test from "node:test";

const analyticsModuleUrl = new URL("../src/lib/analytics.js", import.meta.url);

function createBrowserHarness() {
  const scripts = [];
  const cookieWrites = [];
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
    get cookie() {
      return "_ga=GA1.1.123.456; _ga_AURORA=GS1.1.123; session=keep";
    },
    set cookie(value) {
      cookieWrites.push(value);
    },
  };
  const windowObject = {
    dataLayer: [],
    location: { hostname: "www.auroraesportstudio.com" },
    navigator: { doNotTrack: "0" },
  };
  return { cookieWrites, documentObject, scripts, windowObject };
}

test("analytics remains disabled without a valid GA4 measurement ID", async () => {
  const { enableAnalytics } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();

  assert.equal(enableAnalytics("", harness), false);
  assert.equal(enableAnalytics("UA-1234", harness), false);
  assert.equal(harness.scripts.length, 0);
});

test("analytics does not load or queue events before explicit enablement", async () => {
  const { trackEvent } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();
  assert.equal(trackEvent("page_view", { page_path: "/" }, harness), false);
  assert.equal(harness.scripts.length, 0);
  assert.equal(harness.windowObject.dataLayer.length, 0);
});

test("enablement grants analytics only and loads the Google tag once", async () => {
  const { enableAnalytics } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();
  assert.equal(enableAnalytics("G-AURORA123", harness), true);
  assert.equal(enableAnalytics("G-AURORA123", harness), true);
  assert.equal(harness.scripts.length, 1);
  assert.equal(harness.scripts[0].id, "aurora-google-analytics");
  assert.match(harness.scripts[0].src, /googletagmanager\.com\/gtag\/js\?id=G-AURORA123/);

  const commands = harness.windowObject.dataLayer.map((args) => Array.from(args));
  assert.deepEqual(commands[0].slice(0, 2), ["consent", "default"]);
  assert.equal(commands[0][2].analytics_storage, "denied");
  assert.deepEqual(commands[1].slice(0, 2), ["consent", "update"]);
  assert.equal(commands[1][2].analytics_storage, "granted");
  assert.equal(commands[1][2].ad_storage, "denied");
  assert.equal(commands[1][2].ad_user_data, "denied");
  assert.equal(commands[1][2].ad_personalization, "denied");
});

test("disablement blocks later events and queues a denied consent update", async () => {
  const { disableAnalytics, enableAnalytics, trackEvent } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();
  enableAnalytics("G-AURORA123", harness);
  const beforeDisable = harness.windowObject.dataLayer.length;

  assert.equal(disableAnalytics(harness), true);
  assert.equal(trackEvent("page_view", { page_path: "/private" }, harness), false);

  const commands = harness.windowObject.dataLayer.map((args) => Array.from(args));
  assert.deepEqual(commands[beforeDisable].slice(0, 2), ["consent", "update"]);
  assert.equal(commands[beforeDisable][2].analytics_storage, "denied");
  assert.equal(commands.length, beforeDisable + 1);
});

test("analytics cookies are cleared without touching unrelated cookies", async () => {
  const { clearAnalyticsCookies } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();

  assert.equal(clearAnalyticsCookies(harness), 2);
  assert.equal(harness.cookieWrites.some((value) => value.startsWith("session=")), false);
  assert.equal(
    harness.cookieWrites.some((value) => value.startsWith("_ga=;") && value.includes("domain=.auroraesportstudio.com")),
    true,
  );
  assert.equal(
    harness.cookieWrites.some((value) => value.startsWith("_ga_AURORA=;") && value.includes("domain=.www.auroraesportstudio.com")),
    true,
  );
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
  const { enableAnalytics, trackEvent } = await import(analyticsModuleUrl);
  const harness = createBrowserHarness();
  enableAnalytics("G-AURORA123", harness);
  const before = harness.windowObject.dataLayer.length;

  assert.equal(trackEvent("send_customer_message", { game_id: "aov" }, harness), false);
  assert.equal(harness.windowObject.dataLayer.length, before);
});

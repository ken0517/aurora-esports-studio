import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchGoogleReporting,
  googleReportingConfigured,
} from "../server/google-reporting.mjs";

const env = {
  GOOGLE_ANALYTICS_PROPERTY_ID: "123456789",
  GOOGLE_SEARCH_CONSOLE_SITE_URL: "sc-domain:auroraesportstudio.com",
};

test("Google reporting stays truthfully unconfigured without server credentials", () => {
  assert.equal(googleReportingConfigured(env), false);
  assert.equal(googleReportingConfigured({
    ...env,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "aurora@example.iam.gserviceaccount.com",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "private-key",
  }), true);
});

test("Google reporting normalizes Analytics and Search Console into an admin-safe summary", async () => {
  const requests = [];
  const responses = [
    { rows: [{ metricValues: [{ value: "120" }, { value: "150" }, { value: "47.25" }, { value: "0.62" }, { value: "9" }] }] },
    { rows: [{ dimensionValues: [{ value: "google / organic" }], metricValues: [{ value: "80" }, { value: "73" }, { value: "5" }] }] },
    { rows: [{ dimensionValues: [{ value: "/my/honor-of-kings/" }], metricValues: [{ value: "41" }, { value: "33" }, { value: "1680" }] }] },
    { rows: [{ keys: ["hok malaysia coaching"], clicks: 12, impressions: 320, ctr: 0.0375, position: 7.4 }] },
    { rows: [{ keys: ["https://auroraesportstudio.com/my/honor-of-kings/"], clicks: 18, impressions: 500, ctr: 0.036, position: 6.8 }] },
  ];
  const fetchImpl = async (url, options) => {
    requests.push({ url: String(url), body: JSON.parse(options.body) });
    return { ok: true, json: async () => responses.shift() };
  };

  const report = await fetchGoogleReporting({
    env,
    accessToken: "test-token",
    fetchImpl,
    now: new Date("2026-08-04T12:00:00.000Z"),
  });

  assert.equal(requests.length, 5);
  assert.equal(report.configured, true);
  assert.deepEqual(report.analytics.overview, {
    activeUsers: 120,
    sessions: 150,
    averageSessionDuration: 47.25,
    engagementRate: 0.62,
    keyEvents: 9,
  });
  assert.equal(report.analytics.sources[0].sourceMedium, "google / organic");
  assert.equal(report.analytics.hokPages[0].path, "/my/honor-of-kings/");
  assert.equal(report.searchConsole.queries[0].query, "hok malaysia coaching");
  assert.equal(report.searchConsole.pages[0].clicks, 18);
  assert.equal(report.period.startDate, "2026-07-06");
  assert.equal(report.period.endDate, "2026-08-02");
});

test("Google reporting returns a safe unavailable error without leaking provider details", async () => {
  await assert.rejects(
    fetchGoogleReporting({
      env,
      accessToken: "test-token",
      fetchImpl: async () => ({ ok: false, status: 403, json: async () => ({ error: { message: "secret provider detail" } }) }),
    }),
    /google-reporting-unavailable/,
  );
});

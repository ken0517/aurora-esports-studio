import assert from "node:assert/strict";
import test from "node:test";

import { createAdminToken } from "../server/admin-auth.mjs";
import { handleAdminGoogleReporting } from "../server/google-reporting-api.mjs";

const authEnv = {
  AURORA_ADMIN_PASSWORD: "test-password",
  AURORA_ADMIN_SESSION_SECRET: "google-reporting-test-secret-that-is-long-enough",
};

function responseHarness() {
  const headers = {};
  return {
    headers,
    statusCode: 0,
    setHeader(name, value) { headers[name] = value; },
    end(raw) { this.payload = JSON.parse(raw); },
  };
}

function request(env = authEnv, authenticated = true) {
  return {
    method: "GET",
    headers: authenticated ? { cookie: `aurora_admin=${createAdminToken(env)}` } : {},
  };
}

test("Google reporting admin route requires authentication", async () => {
  const res = responseHarness();
  await handleAdminGoogleReporting(request(authEnv, false), res, { env: authEnv });
  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.error, "authentication-required");
});

test("Google reporting admin route clearly reports missing setup", async () => {
  const res = responseHarness();
  await handleAdminGoogleReporting(request(), res, { env: authEnv });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, { configured: false });
});

test("Google reporting admin route returns report without exposing credentials", async () => {
  const env = {
    ...authEnv,
    GOOGLE_ANALYTICS_PROPERTY_ID: "123",
    GOOGLE_SEARCH_CONSOLE_SITE_URL: "sc-domain:auroraesportstudio.com",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "aurora@example.iam.gserviceaccount.com",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "private",
  };
  const res = responseHarness();
  await handleAdminGoogleReporting(request(env), res, {
    env,
    reporter: async () => ({ configured: true, analytics: { overview: { activeUsers: 12 } }, searchConsole: {} }),
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.analytics.overview.activeUsers, 12);
  assert.doesNotMatch(JSON.stringify(res.payload), /private|aurora@example/);
});

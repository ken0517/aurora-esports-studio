import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveAuroraApiUrl,
  resolveEnquiryApiUrl,
} from "../src/lib/catalogClient.js";

test("public enquiry URL uses the configured Aurora backend on static hosting", () => {
  assert.equal(
    resolveEnquiryApiUrl({
      apiBaseUrl: "https://aurora-esports-api.vercel.app/",
      isDev: false,
    }),
    "https://aurora-esports-api.vercel.app/api/enquiries",
  );
});

test("public enquiry URL preserves the dedicated override and local development fallback", () => {
  assert.equal(
    resolveEnquiryApiUrl({
      explicitEndpoint: "https://example.test/custom-enquiries",
      apiBaseUrl: "https://aurora-esports-api.vercel.app",
      isDev: false,
    }),
    "https://example.test/custom-enquiries",
  );
  assert.equal(
    resolveEnquiryApiUrl({ isDev: true }),
    "http://localhost:8787/api/enquiries",
  );
});

test("shared API URL resolver normalizes a trailing slash without changing the route", () => {
  assert.equal(
    resolveAuroraApiUrl("api/catalog", {
      apiBaseUrl: "https://aurora-esports-api.vercel.app/",
    }),
    "https://aurora-esports-api.vercel.app/api/catalog",
  );
});

import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function reportPeriod(now = new Date()) {
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

export function googleReportingConfigured(env = process.env) {
  return Boolean(
    text(env.GOOGLE_ANALYTICS_PROPERTY_ID)
      && text(env.GOOGLE_SEARCH_CONSOLE_SITE_URL)
      && text(env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
      && text(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
  );
}

async function jsonRequest(url, { fetchImpl, accessToken, body, signal }) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw new Error("google-reporting-unavailable");
  return response.json();
}

async function createAccessToken({ env, fetchImpl, now = new Date(), signal }) {
  const email = text(env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const privateKey = text(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).replace(/\\n/g, "\n");
  if (!email || !privateKey) throw new Error("google-reporting-not-configured");
  const issuedAt = Math.floor(now.getTime() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(JSON.stringify({
    iss: email,
    scope: `${ANALYTICS_SCOPE} ${SEARCH_CONSOLE_SCOPE}`,
    aud: TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(privateKey, "base64url")}`;
  const response = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal,
  });
  if (!response.ok) throw new Error("google-reporting-unavailable");
  const payload = await response.json();
  if (!text(payload.access_token)) throw new Error("google-reporting-unavailable");
  return payload.access_token;
}

function analyticsRows(payload, mapper) {
  return Array.isArray(payload?.rows) ? payload.rows.map(mapper) : [];
}

function searchRows(payload, keyName) {
  return Array.isArray(payload?.rows) ? payload.rows.map((row) => ({
    [keyName]: text(row.keys?.[0]),
    clicks: number(row.clicks),
    impressions: number(row.impressions),
    ctr: number(row.ctr),
    position: number(row.position),
  })) : [];
}

export async function fetchGoogleReporting({
  env = process.env,
  fetchImpl = fetch,
  accessToken,
  now = new Date(),
  signal = AbortSignal.timeout(8_000),
} = {}) {
  const propertyId = text(env.GOOGLE_ANALYTICS_PROPERTY_ID).replace(/^properties\//, "");
  const siteUrl = text(env.GOOGLE_SEARCH_CONSOLE_SITE_URL);
  if (!propertyId || !siteUrl) throw new Error("google-reporting-not-configured");
  try {
    const token = accessToken || await createAccessToken({ env, fetchImpl, now, signal });
    const period = reportPeriod(now);
    const analyticsUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`;
    const dateRanges = [{ startDate: period.startDate, endDate: period.endDate }];
    const [overviewPayload, sourcePayload, hokPayload, queryPayload, pagePayload] = await Promise.all([
      jsonRequest(analyticsUrl, {
        fetchImpl,
        accessToken: token,
        signal,
        body: {
          dateRanges,
          metrics: ["activeUsers", "sessions", "averageSessionDuration", "engagementRate", "keyEvents"].map((name) => ({ name })),
        },
      }),
      jsonRequest(analyticsUrl, {
        fetchImpl,
        accessToken: token,
        signal,
        body: {
          dateRanges,
          dimensions: [{ name: "sessionSourceMedium" }],
          metrics: ["sessions", "activeUsers", "keyEvents"].map((name) => ({ name })),
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 12,
        },
      }),
      jsonRequest(analyticsUrl, {
        fetchImpl,
        accessToken: token,
        signal,
        body: {
          dateRanges,
          dimensions: [{ name: "pagePath" }],
          metrics: ["screenPageViews", "activeUsers", "userEngagementDuration"].map((name) => ({ name })),
          dimensionFilter: {
            orGroup: {
              expressions: ["honor-of-kings", "/hok", "/my/"].map((value) => ({
                filter: { fieldName: "pagePath", stringFilter: { matchType: "CONTAINS", value, caseSensitive: false } },
              })),
            },
          },
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 20,
        },
      }),
      jsonRequest(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        fetchImpl,
        accessToken: token,
        signal,
        body: { ...period, dimensions: ["query"], rowLimit: 20 },
      }),
      jsonRequest(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        fetchImpl,
        accessToken: token,
        signal,
        body: {
          ...period,
          dimensions: ["page"],
          dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "contains", expression: "honor-of-kings" }] }],
          rowLimit: 20,
        },
      }),
    ]);

    const metrics = overviewPayload?.rows?.[0]?.metricValues || [];
    return {
      configured: true,
      generatedAt: new Date(now).toISOString(),
      period,
      analytics: {
        overview: {
          activeUsers: number(metrics[0]?.value),
          sessions: number(metrics[1]?.value),
          averageSessionDuration: number(metrics[2]?.value),
          engagementRate: number(metrics[3]?.value),
          keyEvents: number(metrics[4]?.value),
        },
        sources: analyticsRows(sourcePayload, (row) => ({
          sourceMedium: text(row.dimensionValues?.[0]?.value) || "(not set)",
          sessions: number(row.metricValues?.[0]?.value),
          activeUsers: number(row.metricValues?.[1]?.value),
          keyEvents: number(row.metricValues?.[2]?.value),
        })),
        hokPages: analyticsRows(hokPayload, (row) => ({
          path: text(row.dimensionValues?.[0]?.value),
          views: number(row.metricValues?.[0]?.value),
          activeUsers: number(row.metricValues?.[1]?.value),
          engagementSeconds: number(row.metricValues?.[2]?.value),
        })),
      },
      searchConsole: {
        queries: searchRows(queryPayload, "query"),
        pages: searchRows(pagePayload, "page"),
      },
    };
  } catch (error) {
    if (error?.message === "google-reporting-not-configured") throw error;
    throw new Error("google-reporting-unavailable", { cause: error });
  }
}

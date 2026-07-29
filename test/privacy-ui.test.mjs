import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path) {
  try {
    return readFileSync(new URL(path, import.meta.url), "utf8");
  } catch {
    return "";
  }
}

test("public routes mount privacy consent outside the admin application", () => {
  const root = source("../src/RootApp.jsx");

  assert.match(root, /<PrivacyConsent route=\{route\}/);
  assert.match(root, /isAdmin\s*\?\s*<AdminApp/);
  assert.match(root, /isAdmin\s*\?\s*<AdminApp\s*\/>\s*:\s*\([\s\S]*?<PrivacyConsent/);
});

test("privacy controller mounts before public pages can dispatch their initial locale", () => {
  const root = source("../src/RootApp.jsx");
  const privacyMount = root.indexOf("<PrivacyConsent route={route}");
  const publicPageMount = root.indexOf("{renderPublicRoute(route)}");

  assert.notEqual(privacyMount, -1);
  assert.notEqual(publicPageMount, -1);
  assert.ok(privacyMount < publicPageMount);
});

test("privacy consent exposes equal banner choices and an accessible settings dialog", () => {
  const component = source("../src/components/PrivacyConsent.jsx");

  assert.match(component, /role="dialog"/);
  assert.match(component, /aria-modal="true"/);
  assert.match(component, /acceptAll/);
  assert.match(component, /rejectNonEssential/);
  assert.match(component, /manageSettings/);
  assert.match(component, /necessary/);
  assert.match(component, /analytics/);
  assert.match(component, /type="checkbox"/);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /openerRef\.current\?\.focus/);
  assert.match(component, /applyPrivacyDecision\(initialDecisionRef\.current\)/);
});

test("privacy settings trap forward and reverse tab navigation inside the dialog", () => {
  const component = source("../src/components/PrivacyConsent.jsx");

  assert.match(component, /ref=\{dialogRef\}/);
  assert.match(component, /event\.key !== "Tab" \|\| !dialogRef\.current/);
  assert.match(component, /dialogRef\.current\.querySelectorAll/);
  assert.match(
    component,
    /event\.shiftKey && document\.activeElement === first[\s\S]*?last\.focus\(\)/,
  );
  assert.match(
    component,
    /!event\.shiftKey && document\.activeElement === last[\s\S]*?first\.focus\(\)/,
  );
});

test("privacy actions remain accessible on narrow screens", () => {
  const css = source("../src/styles/privacy-consent.css");

  assert.match(css, /@media \(max-width:\s*640px\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(
    css,
    /@media \(max-width:\s*760px\)(?:(?!@media)[\s\S])*privacy-consent--home/,
  );
});

test("every public footer exposes the privacy notice and cookie settings", () => {
  const footer = source("../src/components/PrivacyFooterLinks.jsx");
  const publicPages = [
    source("../src/App.jsx"),
    source("../src/GameLandingPage.jsx"),
    source("../src/PublicInfoPage.jsx"),
  ];

  assert.match(footer, /href="\/privacy\/"/);
  assert.match(footer, /openPrivacySettings/);
  for (const page of publicPages) {
    assert.match(page, /<PrivacyFooterLinks/);
  }
});

test("home locale changes notify the privacy controller", () => {
  const app = source("../src/App.jsx");
  const component = source("../src/components/PrivacyConsent.jsx");

  assert.match(app, /new CustomEvent\("aurora:locale-changed",\s*\{\s*detail:\s*\{\s*locale\s*\}\s*\}\)/);
  assert.match(component, /aurora:locale-changed/);
});

test("privacy policy copy covers every required section in all three locales", async () => {
  const { privacyContent } = await import("../src/data/privacyContent.js");
  const expectedSections = [
    "collection",
    "purposes",
    "storage-and-analytics",
    "service-providers",
    "fields-and-consequences",
    "retention",
    "rights-and-contact",
    "sensitive-data-warning",
  ];

  assert.deepEqual(Object.keys(privacyContent), ["zh-HK", "en", "zh-CN"]);
  for (const locale of ["zh-HK", "en", "zh-CN"]) {
    const policy = privacyContent[locale].policy;
    assert.deepEqual(
      policy.sections.map((section) => section.id),
      expectedSections,
      `${locale} policy sections`,
    );
    assert.ok(policy.summary.length > 40, `${locale} policy needs a useful summary`);
    assert.match(JSON.stringify(policy), /Google Analytics/);
    assert.match(JSON.stringify(policy), /Google Gemini/);
    assert.match(JSON.stringify(policy), /90/);
  }
});

test("privacy page offers language, cookie, contact, and safe-submission controls", () => {
  const page = source("../src/PrivacyPolicyPage.jsx");
  const css = source("../src/styles/privacy-policy.css");

  assert.match(page, /privacyContent\[locale\]\.policy/);
  assert.match(page, /\["zh-HK", "en", "zh-CN"\]/);
  assert.match(page, /localStorage\.setItem\("aurora-locale", nextLocale\)/);
  assert.match(page, /new CustomEvent\("aurora:locale-changed"/);
  assert.match(page, /openPrivacySettings/);
  assert.match(page, /PRIVACY_POLICY_VERSION/);
  assert.match(page, /policy\.sections\.map/);
  assert.match(page, /contactLinks\.whatsapp/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /:focus-visible/);
});

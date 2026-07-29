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

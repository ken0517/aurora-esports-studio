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

function hexToRgb(hex) {
  return hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((part) => Number.parseInt(part, 16) / 255);
}

function relativeLuminance(hex) {
  return hexToRgb(hex)
    .map((channel) => (
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
    ))
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

function cssHexVariable(css, variable) {
  const declaration = css.match(new RegExp(`${variable}:\\s*([^;]+);`))?.[1] || "";
  return declaration.match(/#[0-9a-f]{6}/gi)?.at(-1);
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
  assert.match(component, /restorePrivacyFocus/);
  assert.match(component, /subscribePrivacyDecision/);
  assert.match(component, /applyPrivacyDecision\(initialDecisionRef\.current\)/);
  assert.match(
    component,
    /id="privacy-banner-description"\s+className="privacy-consent__description"/,
  );
  assert.doesNotMatch(
    source("../src/styles/privacy-consent.css"),
    /\.privacy-consent__copy\s*>\s*p:last-child/,
  );
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
  assert.match(
    css,
    /\.privacy-consent,\s*\.privacy-consent \*,\s*\.privacy-consent \*::before,\s*\.privacy-consent \*::after\s*\{\s*box-sizing:\s*border-box/,
  );
});

test("privacy-only small-text colors meet WCAG AA on their actual surfaces", () => {
  const consentCss = source("../src/styles/privacy-consent.css");
  const consentIvory = cssHexVariable(consentCss, "--privacy-ivory");
  const consentPaper = cssHexVariable(consentCss, "--privacy-paper");
  const consentMuted = cssHexVariable(consentCss, "--privacy-muted");
  const consentGold = cssHexVariable(consentCss, "--privacy-gold");
  for (const foreground of [consentMuted, consentGold]) {
    for (const background of [consentIvory, consentPaper]) {
      assert.ok(
        contrastRatio(foreground, background) >= 4.5,
        `${foreground} on ${background} must meet 4.5:1`,
      );
    }
  }

  const policyCss = source("../src/styles/privacy-policy.css");
  const policyLight = cssHexVariable(policyCss, "--privacy-policy-light");
  const policyDark = cssHexVariable(policyCss, "--privacy-policy-dark");
  const policyGoldOnLight = cssHexVariable(policyCss, "--privacy-policy-gold-on-light");
  const policyMutedOnDark = cssHexVariable(policyCss, "--privacy-policy-muted-on-dark");
  assert.ok(contrastRatio(policyGoldOnLight, policyLight) >= 4.5);
  assert.ok(contrastRatio(policyMutedOnDark, policyDark) >= 4.5);
});

test("localized banner analytics copy is accurate and rejection preserves service access", async () => {
  const { privacyContent } = await import("../src/data/privacyContent.js");
  const expectations = {
    "zh-HK": ["選用網站分析", "技術及 Cookie 識別碼", "瀏覽器", "裝置", "約略位置", "廣告個人化", "報價", "Aurora 客服"],
    en: ["optional site analytics", "technical and cookie identifiers", "browser", "device", "approximate location", "advertising personalisation", "quotes", "Aurora Support"],
    "zh-CN": ["可选网站分析", "技术及 Cookie 标识符", "浏览器", "设备", "大致位置", "广告个性化", "报价", "Aurora 客服"],
  };

  for (const [locale, requiredCopy] of Object.entries(expectations)) {
    const copy = privacyContent[locale];
    const renderedCopy = JSON.stringify({
      banner: copy.banner,
      policy: copy.policy,
      settings: copy.settings,
    });
    assert.doesNotMatch(renderedCopy, /anonymous|non-identifying|匿名|不識別個人|不识别个人/iu);
    for (const phrase of requiredCopy) {
      assert.ok(renderedCopy.includes(phrase), `${locale} copy must include ${phrase}`);
    }
    assert.equal(typeof copy.banner.reassurance, "string");
    assert.ok(copy.banner.reassurance.length > 10);
  }

  const component = source("../src/components/PrivacyConsent.jsx");
  assert.match(component, /copy\.banner\.reassurance/);
  assert.match(component, /href="\/privacy\/"/);
});

test("localized submit notices explain active use and saving while warning against sensitive data", async () => {
  const { privacyContent } = await import("../src/data/privacyContent.js");
  const requiredByLocale = {
    "zh-HK": ["提交報價", "傳送對話", "允許", "使用及儲存", "處理查詢", "跟進", "密碼", "驗證碼", "付款資料", "身分證明文件"],
    en: ["submitting a quote", "sending a conversation", "allow", "use and save", "handle your enquiry", "follow up", "passwords", "verification codes", "payment data", "identity documents"],
    "zh-CN": ["提交报价", "发送对话", "允许", "使用及保存", "处理咨询", "跟进", "密码", "验证码", "付款资料", "身份证明文件"],
  };

  for (const [locale, requiredCopy] of Object.entries(requiredByLocale)) {
    const notice = privacyContent[locale].inlineNotice;
    for (const phrase of requiredCopy) {
      assert.ok(notice.includes(phrase), `${locale} notice must include ${phrase}`);
    }
  }
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

test("privacy page keeps the document language in sync with its selected locale", () => {
  const page = source("../src/PrivacyPolicyPage.jsx");

  assert.match(page, /useEffect\(\(\) => \{\s*document\.documentElement\.lang = locale;\s*\}, \[locale\]\)/);
});

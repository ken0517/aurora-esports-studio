import { useEffect, useState } from "react";
import PrivacyFooterLinks from "./components/PrivacyFooterLinks.jsx";
import { contactLinks } from "./data/content.js";
import { normalizePrivacyLocale, privacyContent } from "./data/privacyContent.js";
import {
  openPrivacySettings,
  PRIVACY_POLICY_VERSION,
} from "./lib/privacyConsent.js";
import "./styles/privacy-policy.css";

const localeKeys = ["zh-HK", "en", "zh-CN"];
const localeOptions = [
  ["zh-HK", "繁體中文"],
  ["en", "English"],
  ["zh-CN", "简体中文"],
];

function initialLocale() {
  if (typeof window === "undefined") return "zh-HK";

  try {
    return normalizePrivacyLocale(
      window.localStorage.getItem("aurora-locale")
        || window.navigator.languages?.[0]
        || window.navigator.language,
    );
  } catch {
    return normalizePrivacyLocale(window.navigator.language);
  }
}

export default function PrivacyPolicyPage() {
  const [locale, setLocale] = useState(initialLocale);
  const policy = privacyContent[locale].policy;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function changeLocale(nextLocale) {
    if (!localeKeys.includes(nextLocale)) return;
    try {
      window.localStorage.setItem("aurora-locale", nextLocale);
    } catch {
      // The in-page language can still change when browser storage is blocked.
    }
    setLocale(nextLocale);
    window.dispatchEvent(
      new CustomEvent("aurora:locale-changed", {
        detail: { locale: nextLocale },
      }),
    );
  }

  return (
    <div className="privacy-policy">
      <header className="privacy-policy__header">
        <a className="privacy-policy__brand" href="/" aria-label="Aurora Esports Studio">
          <span aria-hidden="true">A</span>
          <strong>Aurora Esports Studio</strong>
        </a>
        <a className="privacy-policy__home-link" href="/">{policy.homeLink}</a>
      </header>

      <main>
        <section className="privacy-policy__hero">
          <div className="privacy-policy__shell">
            <div className="privacy-policy__hero-topline">
              <p className="privacy-policy__eyebrow">{policy.eyebrow}</p>
              <div
                className="privacy-policy__language"
                role="group"
                aria-label={policy.languageLabel}
              >
                {localeOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={locale === value}
                    onClick={() => changeLocale(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <h1>{policy.title}</h1>
            <p className="privacy-policy__summary">{policy.summary}</p>
            <dl className="privacy-policy__meta">
              <div>
                <dt>{policy.lastUpdatedLabel}</dt>
                <dd>{policy.lastUpdated}</dd>
              </div>
              <div>
                <dt>{policy.versionLabel}</dt>
                <dd>{PRIVACY_POLICY_VERSION}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="privacy-policy__body">
          <div className="privacy-policy__shell privacy-policy__layout">
            <aside className="privacy-policy__index" aria-label={policy.title}>
              <span>01 — 08</span>
              <p>AURORA / PRIVACY</p>
              <button type="button" onClick={() => openPrivacySettings()}>
                {policy.cookieSettings}
              </button>
              <a href={contactLinks.whatsapp} target="_blank" rel="noreferrer">
                {policy.contactCta}
              </a>
            </aside>

            <div className="privacy-policy__sections">
              {policy.sections.map((section, index) => (
                <article
                  id={section.id}
                  key={section.id}
                  className={section.id === "sensitive-data-warning"
                    ? "privacy-policy__warning"
                    : undefined}
                >
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.points?.length ? (
                    <ul>
                      {section.points.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="privacy-policy__footer">
        <a href="/">Aurora Esports Studio</a>
        <PrivacyFooterLinks locale={locale} />
        <span>{policy.lastUpdatedLabel}: {policy.lastUpdated}</span>
      </footer>
    </div>
  );
}

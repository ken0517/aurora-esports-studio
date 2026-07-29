import { useCallback, useEffect, useRef, useState } from "react";
import { privacyContent, normalizePrivacyLocale } from "../data/privacyContent.js";
import {
  readPrivacyConsent,
  subscribePrivacySettings,
  writePrivacyConsent,
} from "../lib/privacyConsent.js";
import { applyPrivacyDecision } from "../lib/privacyRuntime.js";
import "../styles/privacy-consent.css";

function currentLocale() {
  if (typeof window === "undefined") return "zh-HK";

  try {
    const savedLocale = window.localStorage.getItem("aurora-locale");
    if (savedLocale) return normalizePrivacyLocale(savedLocale);
  } catch {
    // Browser language remains available when storage is blocked.
  }

  return normalizePrivacyLocale(window.navigator.languages?.[0] || window.navigator.language);
}

export default function PrivacyConsent({ route = { type: "home" } }) {
  const [decision, setDecision] = useState(() => readPrivacyConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(() => decision?.analytics === true);
  const [locale, setLocale] = useState(currentLocale);
  const openerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const initialDecisionRef = useRef(decision);
  const initialDecisionAppliedRef = useRef(false);
  const copy = privacyContent[locale];
  const bannerVisible = decision === null;

  const openSettings = useCallback((opener = document.activeElement) => {
    openerRef.current = opener;
    setAnalytics(decision?.analytics === true);
    setSettingsOpen(true);
  }, [decision]);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  const persistChoice = useCallback((allowsAnalytics) => {
    const nextDecision = writePrivacyConsent({ analytics: allowsAnalytics });
    setDecision(nextDecision);
    setAnalytics(nextDecision.analytics);
    setSettingsOpen(false);
    applyPrivacyDecision(nextDecision);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (initialDecisionAppliedRef.current) return;
    initialDecisionAppliedRef.current = true;
    applyPrivacyDecision(initialDecisionRef.current);
  }, []);

  useEffect(() => subscribePrivacySettings(() => openSettings()), [openSettings]);

  useEffect(() => {
    const handleLocaleChange = (event) => {
      setLocale(normalizePrivacyLocale(event.detail?.locale || currentLocale()));
    };

    window.addEventListener("aurora:locale-changed", handleLocaleChange);
    return () => window.removeEventListener("aurora:locale-changed", handleLocaleChange);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSettings();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSettings, settingsOpen]);

  return (
    <div className={`privacy-consent privacy-consent--${route.type || "home"}`}>
      {bannerVisible ? (
        <section
          className="privacy-consent__banner"
          aria-labelledby="privacy-banner-title"
          aria-describedby="privacy-banner-description"
        >
          <div className="privacy-consent__copy">
            <p className="privacy-consent__kicker">PRIVACY / COOKIE CHOICES</p>
            <h2 id="privacy-banner-title">{copy.banner.title}</h2>
            <p id="privacy-banner-description">{copy.banner.body}</p>
          </div>
          <div className="privacy-consent__actions">
            <button
              type="button"
              className="privacy-consent__action privacy-consent__action--primary"
              onClick={() => persistChoice(true)}
            >
              {copy.banner.acceptAll}
            </button>
            <button
              type="button"
              className="privacy-consent__action privacy-consent__action--reject"
              onClick={() => persistChoice(false)}
            >
              {copy.banner.rejectNonEssential}
            </button>
            <button
              type="button"
              className="privacy-consent__action"
              onClick={(event) => openSettings(event.currentTarget)}
            >
              {copy.banner.manageSettings}
            </button>
          </div>
        </section>
      ) : null}

      {settingsOpen ? (
        <div className="privacy-consent__backdrop">
          <section
            className="privacy-consent__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-settings-title"
            aria-describedby="privacy-settings-description"
          >
            <header className="privacy-consent__dialog-header">
              <div>
                <p className="privacy-consent__kicker">AURORA / PRIVACY</p>
                <h2 id="privacy-settings-title">{copy.settings.title}</h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="privacy-consent__close"
                onClick={closeSettings}
                aria-label={copy.settings.close}
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <p id="privacy-settings-description" className="privacy-consent__description">
              {copy.banner.body}
            </p>

            <div className="privacy-consent__choices">
              <label className="privacy-consent__choice">
                <span>
                  <strong>{copy.settings.necessary}</strong>
                  <small>{copy.settings.necessaryDescription}</small>
                </span>
                <input type="checkbox" role="switch" checked disabled readOnly />
              </label>

              <label className="privacy-consent__choice">
                <span>
                  <strong>{copy.settings.analytics}</strong>
                  <small>{copy.settings.analyticsDescription}</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                />
              </label>
            </div>

            <div className="privacy-consent__dialog-actions">
              <button
                type="button"
                className="privacy-consent__action privacy-consent__action--primary"
                onClick={() => persistChoice(analytics)}
              >
                {copy.settings.saveSettings}
              </button>
              <button type="button" className="privacy-consent__action" onClick={closeSettings}>
                {copy.settings.close}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

import { normalizePrivacyLocale, privacyContent } from "../data/privacyContent.js";
import { openPrivacySettings } from "../lib/privacyConsent.js";
import "../styles/privacy-consent.css";

function footerLocale(locale) {
  if (locale) return normalizePrivacyLocale(locale);
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

export default function PrivacyFooterLinks({ locale }) {
  const copy = privacyContent[footerLocale(locale)].links;

  return (
    <span className="privacy-footer-links">
      <a href="/privacy/">{copy.privacyNotice}</a>
      <button type="button" onClick={() => openPrivacySettings()}>
        {copy.cookieSettings}
      </button>
    </span>
  );
}

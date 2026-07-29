import {
  captureAcquisitionContext as captureCurrentAcquisition,
  clearAcquisitionContext as clearStoredAcquisition,
} from "./acquisition.js";
import {
  clearAnalyticsCookies as clearGoogleAnalyticsCookies,
  disableAnalytics as disableGoogleAnalytics,
  enableAnalytics as enableGoogleAnalytics,
  trackPageView as trackCurrentPageView,
} from "./analytics.js";
import { readPrivacyConsent } from "./privacyConsent.js";

function callWithoutThrow(callback, ...args) {
  try {
    return callback(...args);
  } catch {
    return undefined;
  }
}

export function applyPrivacyDecision(
  decision = readPrivacyConsent(),
  runtime = {},
) {
  if (runtime.isAdmin === true) return { analyticsEnabled: false };

  const windowObject = runtime.windowObject || globalThis.window;
  const documentObject = runtime.documentObject || globalThis.document;
  const analyticsHarness = { windowObject, documentObject };
  const disableAnalytics = runtime.disableAnalytics || disableGoogleAnalytics;
  const clearAnalyticsCookies = runtime.clearAnalyticsCookies || clearGoogleAnalyticsCookies;
  const clearAcquisitionContext = runtime.clearAcquisitionContext || clearStoredAcquisition;
  const doNotTrack = windowObject?.navigator?.doNotTrack === "1";

  if (decision?.analytics !== true || doNotTrack) {
    callWithoutThrow(disableAnalytics, analyticsHarness);
    callWithoutThrow(clearAnalyticsCookies, analyticsHarness);
    callWithoutThrow(clearAcquisitionContext, runtime.storage);
    return { analyticsEnabled: false };
  }

  const captureAcquisitionContext = runtime.captureAcquisitionContext || captureCurrentAcquisition;
  const enableAnalytics = runtime.enableAnalytics || enableGoogleAnalytics;
  const trackPageView = runtime.trackPageView || trackCurrentPageView;
  const analyticsWasEnabled = windowObject?.__auroraAnalyticsConsent === true;
  const acquisitionOptions = {
    locationHref: windowObject?.location?.href,
    referrer: documentObject?.referrer || "",
    consentGranted: true,
  };
  if (runtime.storage !== undefined) acquisitionOptions.storage = runtime.storage;

  callWithoutThrow(captureAcquisitionContext, acquisitionOptions);
  const analyticsEnabled = callWithoutThrow(
    enableAnalytics,
    runtime.measurementId,
    analyticsHarness,
  ) === true;
  if (analyticsEnabled && !analyticsWasEnabled) {
    callWithoutThrow(
      trackPageView,
      {
        path: windowObject?.location?.pathname,
        title: documentObject?.title,
      },
      analyticsHarness,
    );
  }
  return { analyticsEnabled };
}

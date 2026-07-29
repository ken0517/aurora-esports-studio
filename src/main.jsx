import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RootApp from "./RootApp.jsx";
import { captureAcquisitionContext } from "./lib/acquisition.js";
import { initializeAnalytics, trackPageView } from "./lib/analytics.js";
import { resolvePublicRoute } from "./lib/publicRoutes.js";

const route = resolvePublicRoute(window.location.pathname);

captureAcquisitionContext({
  locationHref: window.location.href,
  referrer: document.referrer,
});
initializeAnalytics();
trackPageView({ path: window.location.pathname, title: document.title });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp route={route} />
  </StrictMode>,
);

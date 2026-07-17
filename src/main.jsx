import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RootApp from "./RootApp.jsx";
import { resolvePublicRoute } from "./lib/publicRoutes.js";

const route = resolvePublicRoute(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp route={route} />
  </StrictMode>,
);

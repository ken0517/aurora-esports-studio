import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RootApp from "./RootApp.jsx";

const normalizedPath = window.location.pathname.replace(/\/+$/, "");
const isAdmin = normalizedPath.endsWith("/admin");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp isAdmin={isAdmin} />
  </StrictMode>,
);

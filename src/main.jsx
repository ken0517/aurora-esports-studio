import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AdminApp from "./AdminApp.jsx";
import "./styles/index.css";
import "./styles/quote.css";

const normalizedPath = window.location.pathname.replace(/\/+$/, "");
const isAdmin = normalizedPath.endsWith("/admin");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </StrictMode>,
);

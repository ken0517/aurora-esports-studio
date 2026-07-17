import { lazy, Suspense } from "react";

const App = lazy(() => import("./App.jsx"));
const AdminApp = lazy(() => import("./AdminApp.jsx"));

export default function RootApp({ isAdmin }) {
  return (
    <Suspense
      fallback={(
        <div
          className="app-shell-loading"
          role="status"
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            background: "#17130f",
            color: "#f7f1e7",
            fontFamily: "Georgia, serif",
            letterSpacing: "0.18em",
          }}
        >
          Aurora Esports Studio
        </div>
      )}
    >
      {isAdmin ? <AdminApp /> : <App />}
    </Suspense>
  );
}

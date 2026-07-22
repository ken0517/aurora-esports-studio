import { lazy, Suspense } from "react";

const App = lazy(() => import("./App.jsx"));
const AdminApp = lazy(() => import("./AdminApp.jsx"));
const GameLandingPage = lazy(() => import("./GameLandingPage.jsx"));
const PublicInfoPage = lazy(() => import("./PublicInfoPage.jsx"));

export default function RootApp({ route = { type: "home" }, isAdmin = route.type === "admin" }) {
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
      {isAdmin
        ? <AdminApp />
        : route.type === "game"
          ? <GameLandingPage gameId={route.gameId} />
          : route.type === "info"
            ? <PublicInfoPage slug={route.slug} />
          : <App />}
    </Suspense>
  );
}

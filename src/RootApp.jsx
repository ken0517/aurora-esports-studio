import { lazy, Suspense } from "react";
import PrivacyConsent from "./components/PrivacyConsent.jsx";

const App = lazy(() => import("./App.jsx"));
const AdminApp = lazy(() => import("./AdminApp.jsx"));
const GameLandingPage = lazy(() => import("./GameLandingPage.jsx"));
const PublicInfoPage = lazy(() => import("./PublicInfoPage.jsx"));

function renderPublicRoute(route) {
  if (route.type === "game") return <GameLandingPage gameId={route.gameId} />;
  if (route.type === "info") return <PublicInfoPage slug={route.slug} />;
  return <App />;
}

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
      {isAdmin ? <AdminApp /> : (
        <>
          <PrivacyConsent route={route} />
          {renderPublicRoute(route)}
        </>
      )}
    </Suspense>
  );
}

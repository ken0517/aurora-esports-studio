import {
  getGameLandingPageById,
  getGameLandingPageBySlug,
} from "../data/gameLandingPages.js";

export function resolvePublicRoute(pathname = "/") {
  const cleanPath = String(pathname || "/")
    .split(/[?#]/, 1)[0]
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "") || "/";

  if (cleanPath === "/admin") return { type: "admin" };

  const page = getGameLandingPageBySlug(cleanPath);
  if (page) return { type: "game", gameId: page.gameId };

  return { type: "home" };
}

const supportedQuoteServices = new Set(["rank", "peak", "duo", "hero-power", "other"]);

export function buildQuoteEntryUrl(gameId, pane = "manual", serviceId = null) {
  const page = getGameLandingPageById(gameId);
  const safePane = pane === "ai" ? "ai" : "manual";
  if (!page) return "/#ai-quote";
  const params = new URLSearchParams({
    quoteGame: page.gameId,
    quotePane: safePane,
  });
  if (supportedQuoteServices.has(serviceId)) params.set("quoteService", serviceId);
  return `/?${params.toString()}#ai-quote`;
}

export function buildGameLandingPath(gameId) {
  const page = getGameLandingPageById(gameId);
  return page ? `/${page.slug}/` : "/#games";
}

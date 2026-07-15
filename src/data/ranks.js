/**
 * Compatibility facade for rank consumers.
 *
 * All authoritative game data now lives in gameConfig.js. Keep these exports
 * stable so existing form, pricing and server modules do not maintain copies.
 */

import {
  gameConfigs,
  gameLocales,
  getGameConfig,
  getGameLabel,
  getRanksForGameConfig,
  normalizeGameLocale,
} from "./gameConfig.js";

export const rankLocales = gameLocales;
export const rankCatalog = gameConfigs;

export function getRanksForGame(gameId) {
  return getRanksForGameConfig(gameId);
}

export function getRankById(gameId, rankId) {
  return getRanksForGame(gameId).find((rank) => rank.id === rankId) ?? null;
}

/**
 * Preferred signature: getRankLabel(rankObject, locale)
 * Also accepts getRankLabel(rankId, locale, gameId) for compatibility.
 */
export function getRankLabel(rankOrId, locale = "zh-HK", gameId = null) {
  const rank = typeof rankOrId === "object" && rankOrId
    ? rankOrId
    : gameId
      ? getRankById(gameId, rankOrId)
      : Object.values(rankCatalog)
          .flatMap((catalogue) => catalogue.ranks)
          .find((candidate) => candidate.id === rankOrId);

  if (!rank) return "";
  const resolvedLocale = normalizeGameLocale(locale);
  return rank.labels?.[resolvedLocale] ?? rank.labels?.["zh-HK"] ?? rank.english ?? rank.id;
}

export function getDivisionsForRank(gameId, rankId) {
  return getGameConfig(gameId)?.rankDivisions?.[rankId] ?? [];
}

export function getGameRankLabel(gameId, locale = "zh-HK") {
  return getGameLabel(gameId, locale);
}

export function rankRequiresManualReview(gameId, rankId) {
  const catalogue = getGameConfig(gameId);
  const rank = getRankById(gameId, rankId);
  const manualVerificationStatuses = new Set([
    "aurora-review-required",
    "leaderboard-dependent",
    "official-tier-name-only",
    "partial-aurora-review-required",
  ]);
  return Boolean(
    rank?.manualOnly ||
      manualVerificationStatuses.has(rank?.verificationStatus) ||
      manualVerificationStatuses.has(catalogue?.verificationStatus),
  );
}

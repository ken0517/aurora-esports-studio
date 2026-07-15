/**
 * Aurora's single pricing source.
 *
 * IMPORTANT: no confirmed business prices were supplied for this build.
 * Every monetary field is therefore `null` and every rule is `configured: false`.
 * The UI and quote engine must treat these rules as manual-review only; `null`
 * values are never placeholders to display and must never be converted to zero.
 *
 * When Aurora approves its final rate card, update rules here only. Both the
 * manual form and the quotation assistant read this same catalogue.
 */

import {
  gameConfigs,
  serviceDefinitions,
  supportedGameIds as centralSupportedGameIds,
} from "./gameConfig.js";

export const pricingVersion = "2026-07-unconfigured";
export const pricingCurrency = "HKD";
export const supportedGameIds = centralSupportedGameIds;

export const serviceCatalog = serviceDefinitions.map((service) => ({
  ...service,
  supportedGames: supportedGameIds.filter((gameId) =>
    gameConfigs[gameId]?.services.includes(service.id),
  ),
}));

export const manualOnlyIntents = ["hero-power", "unusual-request"];

function unconfiguredRule(gameId, serviceId) {
  return {
    gameId,
    serviceId,
    configured: false,
    status: "awaiting-aurora-prices",
    currency: pricingCurrency,
    pricingModel: null,

    // Insert Aurora's confirmed values below. Do not put display-only sample
    // numbers here: the quote engine will treat real numbers as approved rates.
    basePrice: null,
    unitPrice: null,
    rankStepPrices: null,
    pointBands: null,
    optionalCharges: {
      express: { type: null, value: null },
      preferredHero: { type: null, value: null },
      customSchedule: { type: null, value: null },
    },
    discounts: null,
    estimatedCompletionTime: null,
    internalNote: "Replace nulls only after Aurora approves the final rate card.",
  };
}

function unconfiguredRulesForGame(gameId) {
  return Object.fromEntries(
    serviceCatalog.map((service) => [service.id, unconfiguredRule(gameId, service.id)]),
  );
}

export const pricingCatalog = {
  currency: pricingCurrency,
  version: pricingVersion,
  configured: false,
  placeholderValues: false,
  games: {
    aov: unconfiguredRulesForGame("aov"),
    "hok-cn": unconfiguredRulesForGame("hok-cn"),
    "hok-global": unconfiguredRulesForGame("hok-global"),
  },
};

export function getServiceDefinition(serviceId) {
  return serviceCatalog.find((service) => service.id === serviceId) ?? null;
}

export function getServiceLabel(serviceOrId, locale = "zh-HK") {
  const service = typeof serviceOrId === "object" && serviceOrId
    ? serviceOrId
    : getServiceDefinition(serviceOrId);
  if (!service) return "";
  return service.labels?.[locale] ?? service.labels?.["zh-HK"] ?? service.id;
}

export function getPricingRule(gameId, serviceId, catalog = pricingCatalog) {
  return catalog?.games?.[gameId]?.[serviceId] ?? null;
}

export function isPricingConfigured(gameId, serviceId, catalog = pricingCatalog) {
  // Master publish guard: no individual rule can become customer-facing until
  // Aurora explicitly enables the catalogue as a whole.
  if (!catalog?.configured) return false;

  const rule = getPricingRule(gameId, serviceId, catalog);
  if (!rule?.configured) return false;

  // A configured flag alone is not enough. At least one approved monetary
  // source must exist, preventing an accidental `configured: true` from
  // producing a zero or invented quote.
  return (
    Number.isFinite(rule.basePrice) ||
    Number.isFinite(rule.unitPrice) ||
    Boolean(rule.rankStepPrices && Object.keys(rule.rankStepPrices).length) ||
    Boolean(rule.pointBands?.length)
  );
}

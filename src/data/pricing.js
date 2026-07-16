/**
 * Aurora's single approved pricing source.
 *
 * Only the three Arena of Valor rules explicitly approved by Aurora are
 * enabled. Every other game/service remains unconfigured and must fall back
 * to human confirmation. The manual form, Gemini function calling and admin
 * catalogue all consume this same structure.
 */

import {
  gameConfigs,
  serviceDefinitions,
  supportedGameIds as centralSupportedGameIds,
} from "./gameConfig.js";

export const pricingVersion = "2026-07-three-games-approved-v2";
export const pricingCurrency = "HKD";
export const newCustomerDiscountRate = 0.15;
export const exchangeRates = Object.freeze({ HKD: 1, TWD: 4.25, CNY: 1 });
export const supportedGameIds = centralSupportedGameIds;

export const serviceCatalog = serviceDefinitions.map((service) => ({
  ...service,
  supportedGames: supportedGameIds.filter((gameId) =>
    gameConfigs[gameId]?.services.includes(service.id),
  ),
}));

export const manualOnlyIntents = ["hero-power", "unusual-request"];

export const aovDivisionStepPrices = {
  "bronze:III": 20,
  "bronze:II": 25,
  "bronze:I": 25,
  "silver:III": 30,
  "silver:II": 35,
  "silver:I": 35,
  "gold:IV": 45,
  "gold:III": 45,
  "gold:II": 45,
  "gold:I": 45,
  "platinum:V": 60,
  "platinum:IV": 60,
  "platinum:III": 60,
  "platinum:II": 60,
  "platinum:I": 60,
  "diamond:V": 75,
  "diamond:IV": 75,
  "diamond:III": 75,
  "diamond:II": 75,
  "diamond:I": 75,
  "veteran:V": 90,
  "veteran:IV": 90,
  "veteran:III": 90,
  "veteran:II": 90,
  "veteran:I": 90,
};

function unconfiguredRule(gameId, serviceId) {
  return {
    gameId,
    serviceId,
    configured: false,
    status: "awaiting-aurora-prices",
    currency: pricingCurrency,
    pricingModel: null,
    basePrice: null,
    unitPrice: null,
    rankStepPrices: null,
    pointBands: null,
    optionalCharges: {
      preferredHero: { type: null, value: null },
      preferredRole: { type: null, value: null },
    },
    discounts: null,
    estimatedCompletionTime: null,
    internalNote: "No approved automatic price. Keep this service on human confirmation.",
  };
}

function roundToNearest(value, step = 5) {
  return Math.round(value / step) * step;
}

function scaledDivisionStepPrices(multiplier) {
  return Object.fromEntries(
    Object.entries(aovDivisionStepPrices).map(([key, value]) => [
      key,
      multiplier === 1 ? value : roundToNearest(value * multiplier),
    ]),
  );
}

function approvedStarPricing(multiplier) {
  return {
    bandSize: 10,
    basePerStar: 20,
    incrementPerBand: 5,
    priceMultiplier: multiplier,
    roundTo: multiplier === 1 ? null : 5,
    bandPrices: Array.from({ length: 11 }, (_, bandIndex) => {
      const sourcePrice = 20 + bandIndex * 5;
      return multiplier === 1 ? sourcePrice : roundToNearest(sourcePrice * multiplier);
    }),
  };
}

function approvedRankRule(gameId, multiplier = 1, serviceId = "rank") {
  return {
    ...unconfiguredRule(gameId, serviceId),
    configured: true,
    status: "approved",
    pricingModel: "aov-rank-progression",
    minimumPrice: 50,
    sourcePriceMultiplier: multiplier,
    sourcePriceRounding: multiplier === 1 ? null : 5,
    divisionStepPrices: scaledDivisionStepPrices(multiplier),
    starPricing: approvedStarPricing(multiplier),
    optionalCharges: {
      preferredHero: { type: null, value: null },
      preferredRole: { type: "percentage", value: 0.15 },
    },
    timeRules: {
      hoursPerDivision: 1,
      hoursPerTenStarsMin: 3,
      hoursPerTenStarsMax: 4,
    },
    quoteValidityDays: 3,
    estimatedCompletionTime: {
      "zh-HK": "每小段約 1 小時；每 10 星約 3–4 小時",
      en: "About 1 hour per division; 3–4 hours per 10 stars",
      "zh-CN": "每小段约 1 小时；每 10 星约 3–4 小时",
    },
    internalNote: "Approved AOV progression table. The minimum is applied after percentage charges.",
  };
}

function approvedDuoRule(gameId, multiplier = 1, matchUnitPrice = 25) {
  return {
    ...unconfiguredRule(gameId, "duo"),
    configured: true,
    status: "approved",
    pricingModel: "aov-duo",
    rankPricing: {
      minimumPrice: 50,
      sourcePriceMultiplier: multiplier,
      sourcePriceRounding: multiplier === 1 ? null : 5,
      divisionStepPrices: scaledDivisionStepPrices(multiplier),
      starPricing: approvedStarPricing(multiplier),
      guaranteedMultiplier: 1.25,
      standardMultiplier: 0.9,
    },
    matchPricing: {
      unitPrice: matchUnitPrice,
      minimumQuantity: 1,
      discountThreshold: 10,
      discountRate: 0.1,
    },
    quoteValidityDays: 3,
    internalNote: "Ranked duo follows the AOV progression table. Match orders are HK$25 per game.",
  };
}

function approvedTeachingRule(gameId) {
  const timedTeaching = () => ({
    configured: true,
    pricingModel: "live-minute",
    unitPrice: 2.5,
    minimumMinutes: 15,
    bookingDeposit: 37.5,
    rounding: "ceil-minute",
    freeRescheduleNoticeHours: 4,
  });
  return {
    ...unconfiguredRule(gameId, "other"),
    configured: true,
    status: "approved",
    pricingModel: "aov-other",
    options: {
      "review-coaching": timedTeaching(),
      "discord-recorded-review": timedTeaching(),
      "hero-coaching": timedTeaching(),
    },
    quoteValidityDays: 3,
    internalNote: "Review coaching, first-person teaching and hero coaching share the approved timed rate.",
  };
}

function unconfiguredRulesForGame(gameId) {
  return Object.fromEntries(
    serviceCatalog.map((service) => [service.id, unconfiguredRule(gameId, service.id)]),
  );
}

function approvedRulesForGame(gameId, multiplier, matchUnitPrice) {
  const rules = unconfiguredRulesForGame(gameId);
  rules.rank = approvedRankRule(gameId, multiplier);
  rules.duo = approvedDuoRule(gameId, multiplier, matchUnitPrice);
  rules.other = approvedTeachingRule(gameId);
  return rules;
}

const aovRules = approvedRulesForGame("aov", 1, 25);
const hokChinaRules = approvedRulesForGame("hok-cn", 0.85, 20);
const hokGlobalRules = approvedRulesForGame("hok-global", 0.8, 20);

export const pricingCatalog = {
  currency: pricingCurrency,
  version: pricingVersion,
  configured: true,
  placeholderValues: false,
  newCustomerDiscountRate,
  exchangeRates,
  games: {
    aov: aovRules,
    "hok-cn": hokChinaRules,
    "hok-global": hokGlobalRules,
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

export function isPricingConfigured(gameId, serviceId, catalog = pricingCatalog, draft = null) {
  if (!catalog?.configured) return false;
  const rule = getPricingRule(gameId, serviceId, catalog);
  if (!rule?.configured) return false;

  if (rule.pricingModel === "aov-rank-progression") {
    return Number.isFinite(rule.minimumPrice) &&
      Object.keys(rule.divisionStepPrices || {}).length > 0 &&
      Number.isFinite(rule.starPricing?.basePerStar);
  }
  if (rule.pricingModel === "aov-duo") {
    return Number.isFinite(rule.rankPricing?.guaranteedMultiplier) &&
      Number.isFinite(rule.matchPricing?.unitPrice);
  }
  if (rule.pricingModel === "aov-other") {
    if (draft?.otherServiceType) return Boolean(rule.options?.[draft.otherServiceType]?.configured);
    return Object.values(rule.options || {}).some((option) => option?.configured);
  }

  return (
    Number.isFinite(rule.basePrice) ||
    Number.isFinite(rule.unitPrice) ||
    Boolean(rule.rankStepPrices && Object.keys(rule.rankStepPrices).length) ||
    Boolean(rule.pointBands?.length)
  );
}

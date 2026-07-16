import { gameConfigs, serviceDefinitions } from "./gameConfig.js";
import {
  exchangeRates,
  getPricingRule,
  isPricingConfigured,
  newCustomerDiscountRate,
  pricingCatalog,
} from "./pricing.js";

export const catalogSchemaVersion = 3;
export const supportedCurrencies = ["HKD", "TWD", "CNY"];

const gameIds = Object.keys(gameConfigs);
const serviceIds = serviceDefinitions.map((service) => service.id);
const manualServiceIds = new Set(
  serviceDefinitions.filter((service) => service.manualOnly).map((service) => service.id),
);

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanNumber(value, fallback = null, { min = 0, max = 1_000_000 } = {}) {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : fallback;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function percentageConfig(input, fallback) {
  return {
    type: fallback?.type ?? null,
    value: cleanNumber(input?.value, fallback?.value ?? null, { min: 0, max: 5 }),
  };
}

function normalizeRankRule(item, fallback) {
  const divisionStepPrices = Object.fromEntries(
    Object.keys(fallback.divisionStepPrices || {}).map((key) => [
      key,
      cleanNumber(item.divisionStepPrices?.[key], fallback.divisionStepPrices[key]),
    ]),
  );
  return {
    ...clone(fallback),
    configured: item.configured !== false,
    minimumPrice: cleanNumber(item.minimumPrice, fallback.minimumPrice),
    divisionStepPrices,
    starPricing: {
      bandSize: cleanNumber(item.starPricing?.bandSize, fallback.starPricing.bandSize, { min: 1, max: 100 }),
      basePerStar: cleanNumber(item.starPricing?.basePerStar, fallback.starPricing.basePerStar),
      incrementPerBand: cleanNumber(item.starPricing?.incrementPerBand, fallback.starPricing.incrementPerBand),
      priceMultiplier: cleanNumber(item.starPricing?.priceMultiplier, fallback.starPricing.priceMultiplier ?? 1, { min: 0.01, max: 10 }),
      roundTo: cleanNumber(item.starPricing?.roundTo, fallback.starPricing.roundTo, { min: 0.01, max: 100 }),
      bandPrices: fallback.starPricing.bandPrices.map((value, index) =>
        cleanNumber(item.starPricing?.bandPrices?.[index], value)),
    },
    optionalCharges: {
      ...clone(fallback.optionalCharges),
      express: percentageConfig(item.optionalCharges?.express, fallback.optionalCharges.express),
      preferredRole: percentageConfig(item.optionalCharges?.preferredRole, fallback.optionalCharges.preferredRole),
      customSchedule: percentageConfig(item.optionalCharges?.customSchedule, fallback.optionalCharges.customSchedule),
      winRate70: percentageConfig(item.optionalCharges?.winRate70, fallback.optionalCharges.winRate70),
    },
    timeRules: {
      hoursPerDivision: cleanNumber(item.timeRules?.hoursPerDivision, fallback.timeRules.hoursPerDivision, { min: 0.1, max: 100 }),
      hoursPerTenStarsMin: cleanNumber(item.timeRules?.hoursPerTenStarsMin, fallback.timeRules.hoursPerTenStarsMin, { min: 0.1, max: 100 }),
      hoursPerTenStarsMax: cleanNumber(item.timeRules?.hoursPerTenStarsMax, fallback.timeRules.hoursPerTenStarsMax, { min: 0.1, max: 100 }),
      expressTimeMultiplier: cleanNumber(item.timeRules?.expressTimeMultiplier, fallback.timeRules.expressTimeMultiplier, { min: 0.1, max: 1 }),
    },
    quoteValidityDays: cleanNumber(item.quoteValidityDays, fallback.quoteValidityDays, { min: 1, max: 90 }),
  };
}

function normalizeDuoRule(item, fallback) {
  return {
    ...clone(fallback),
    configured: item.configured !== false,
    rankPricing: {
      minimumPrice: cleanNumber(item.rankPricing?.minimumPrice, fallback.rankPricing.minimumPrice),
      divisionStepPrices: Object.fromEntries(
        Object.keys(fallback.rankPricing.divisionStepPrices || {}).map((key) => [
          key,
          cleanNumber(item.rankPricing?.divisionStepPrices?.[key], fallback.rankPricing.divisionStepPrices[key]),
        ]),
      ),
      starPricing: {
        bandSize: cleanNumber(item.rankPricing?.starPricing?.bandSize, fallback.rankPricing.starPricing.bandSize, { min: 1, max: 100 }),
        basePerStar: cleanNumber(item.rankPricing?.starPricing?.basePerStar, fallback.rankPricing.starPricing.basePerStar),
        incrementPerBand: cleanNumber(item.rankPricing?.starPricing?.incrementPerBand, fallback.rankPricing.starPricing.incrementPerBand),
        priceMultiplier: cleanNumber(item.rankPricing?.starPricing?.priceMultiplier, fallback.rankPricing.starPricing.priceMultiplier ?? 1, { min: 0.01, max: 10 }),
        roundTo: cleanNumber(item.rankPricing?.starPricing?.roundTo, fallback.rankPricing.starPricing.roundTo, { min: 0.01, max: 100 }),
        bandPrices: fallback.rankPricing.starPricing.bandPrices.map((value, index) =>
          cleanNumber(item.rankPricing?.starPricing?.bandPrices?.[index], value)),
      },
      guaranteedMultiplier: cleanNumber(item.rankPricing?.guaranteedMultiplier, fallback.rankPricing.guaranteedMultiplier, { min: 0, max: 10 }),
      standardMultiplier: cleanNumber(item.rankPricing?.standardMultiplier, fallback.rankPricing.standardMultiplier, { min: 0, max: 10 }),
    },
    matchPricing: {
      unitPrice: cleanNumber(item.matchPricing?.unitPrice, fallback.matchPricing.unitPrice),
      minimumQuantity: cleanNumber(item.matchPricing?.minimumQuantity, fallback.matchPricing.minimumQuantity, { min: 1, max: 1000 }),
      discountThreshold: cleanNumber(item.matchPricing?.discountThreshold, fallback.matchPricing.discountThreshold, { min: 1, max: 1000 }),
      discountRate: cleanNumber(item.matchPricing?.discountRate, fallback.matchPricing.discountRate, { min: 0, max: 1 }),
    },
    quoteValidityDays: cleanNumber(item.quoteValidityDays, fallback.quoteValidityDays, { min: 1, max: 90 }),
  };
}

function normalizeOtherRule(item, fallback) {
  const normalizeTimedOption = (optionId) => {
    const optionFallback = fallback.options[optionId];
    const optionInput = item.options?.[optionId] || {};
    const unitPrice = cleanNumber(optionInput.unitPrice, optionFallback.unitPrice);
    const minimumMinutes = cleanNumber(optionInput.minimumMinutes, optionFallback.minimumMinutes, { min: 1, max: 1440 });
    return {
      ...optionFallback,
      configured: optionInput.configured !== false,
      unitPrice,
      minimumMinutes,
      bookingDeposit: cleanNumber(optionInput.bookingDeposit, unitPrice * minimumMinutes),
      freeRescheduleNoticeHours: cleanNumber(optionInput.freeRescheduleNoticeHours, optionFallback.freeRescheduleNoticeHours, { min: 0, max: 168 }),
    };
  };
  return {
    ...clone(fallback),
    configured: item.configured !== false,
    options: {
      "review-coaching": normalizeTimedOption("review-coaching"),
      "discord-recorded-review": normalizeTimedOption("discord-recorded-review"),
      "hero-coaching": normalizeTimedOption("hero-coaching"),
    },
    quoteValidityDays: cleanNumber(item.quoteValidityDays, fallback.quoteValidityDays, { min: 1, max: 90 }),
  };
}

function normalizeApprovedRule(item, fallback) {
  if (fallback.pricingModel === "aov-rank-progression") return normalizeRankRule(item, fallback);
  if (fallback.pricingModel === "aov-duo") return normalizeDuoRule(item, fallback);
  if (fallback.pricingModel === "aov-other") return normalizeOtherRule(item, fallback);
  return null;
}

function defaultService(gameId, serviceId) {
  const approved = clone(getPricingRule(gameId, serviceId, pricingCatalog));
  const completion = approved.estimatedCompletionTime && typeof approved.estimatedCompletionTime === "object"
    ? approved.estimatedCompletionTime["zh-HK"] || approved.estimatedCompletionTime.en || ""
    : approved.estimatedCompletionTime || "";
  return {
    ...approved,
    gameId,
    serviceId,
    enabled: true,
    priceSuffix: approved.configured ? "按所選項目計算" : "查詢報價",
    estimatedCompletionTime: completion,
    note: "",
  };
}

export function createDefaultRuntimeCatalog() {
  return {
    schemaVersion: catalogSchemaVersion,
    currency: "HKD",
    configured: true,
    newCustomerDiscountRate,
    exchangeRates: { ...exchangeRates },
    announcement: "",
    updatedAt: null,
    revision: "default",
    games: Object.fromEntries(
      gameIds.map((gameId) => [
        gameId,
        Object.fromEntries(serviceIds.map((serviceId) => [serviceId, defaultService(gameId, serviceId)])),
      ]),
    ),
  };
}

export function normalizeRuntimeCatalog(input, { preserveRevision = true } = {}) {
  const source = input && typeof input === "object" ? input : {};
  const isLegacy = Number(source.schemaVersion || 0) < catalogSchemaVersion;
  const currency = supportedCurrencies.includes(source.currency) ? source.currency : "HKD";
  const normalizedExchangeRates = Object.fromEntries(
    supportedCurrencies.map((code) => [
      code,
      cleanNumber(source.exchangeRates?.[code], exchangeRates[code], { min: 0.01, max: 1000 }),
    ]),
  );
  let hasConfiguredService = false;

  const games = Object.fromEntries(gameIds.map((gameId) => [
    gameId,
    Object.fromEntries(serviceIds.map((serviceId) => {
      const fallback = defaultService(gameId, serviceId);
      const raw = source.games?.[gameId]?.[serviceId] || {};
      const approvedFallback = getPricingRule(gameId, serviceId, pricingCatalog);
      const pricingInput = isLegacy ? {} : raw;
      const approved = normalizeApprovedRule(pricingInput, approvedFallback);
      let item;

      if (approved) {
        item = {
          ...fallback,
          ...approved,
          enabled: raw.enabled !== false,
          priceSuffix: cleanText(raw.priceSuffix, 40) || fallback.priceSuffix,
          estimatedCompletionTime: raw.estimatedCompletionTime || fallback.estimatedCompletionTime,
          note: cleanText(raw.note, 240),
        };
      } else {
        const basePrice = cleanNumber(raw.basePrice, null);
        item = {
          ...fallback,
          enabled: raw.enabled !== false,
          configured: Boolean(raw.configured) && basePrice !== null && !manualServiceIds.has(serviceId),
          basePrice,
          priceSuffix: cleanText(raw.priceSuffix, 40) || fallback.priceSuffix,
          estimatedCompletionTime: cleanText(raw.estimatedCompletionTime, 80),
          note: cleanText(raw.note, 240),
        };
      }
      if (isPricingConfigured(gameId, serviceId, { configured: true, games: { [gameId]: { [serviceId]: item } } })) {
        hasConfiguredService = true;
      }
      return [serviceId, item];
    })),
  ]));

  return {
    schemaVersion: catalogSchemaVersion,
    currency,
    configured: hasConfiguredService,
    newCustomerDiscountRate: cleanNumber(
      source.newCustomerDiscountRate,
      newCustomerDiscountRate,
      { min: 0, max: 1 },
    ),
    exchangeRates: normalizedExchangeRates,
    announcement: cleanText(source.announcement, 240),
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null,
    revision: preserveRevision && typeof source.revision === "string" ? source.revision : "default",
    games,
  };
}

export function getRuntimeService(catalog, gameId, serviceId) {
  return catalog?.games?.[gameId]?.[serviceId] ?? null;
}

export function isRuntimeServiceConfigured(catalog, gameId, serviceId, draft = null) {
  return isPricingConfigured(gameId, serviceId, catalog, draft);
}

export function runtimeServiceIds() {
  return [...serviceIds];
}

export function runtimeGameIds() {
  return [...gameIds];
}

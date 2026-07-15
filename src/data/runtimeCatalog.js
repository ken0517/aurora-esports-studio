import { gameConfigs, serviceDefinitions } from "./gameConfig.js";

export const catalogSchemaVersion = 1;
export const supportedCurrencies = ["HKD", "TWD", "CNY", "USD", "GBP"];

const gameIds = Object.keys(gameConfigs);
const serviceIds = serviceDefinitions.map((service) => service.id);
const manualServiceIds = new Set(
  serviceDefinitions.filter((service) => service.manualOnly).map((service) => service.id),
);

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanPrice(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 1_000_000 ? number : null;
}

function defaultService(gameId, serviceId) {
  return {
    gameId,
    serviceId,
    enabled: true,
    configured: false,
    basePrice: null,
    priceSuffix: "起",
    estimatedCompletionTime: "",
    note: "",
  };
}

export function createDefaultRuntimeCatalog() {
  return {
    schemaVersion: catalogSchemaVersion,
    currency: "HKD",
    configured: false,
    announcement: "",
    updatedAt: null,
    revision: "default",
    games: Object.fromEntries(
      gameIds.map((gameId) => [
        gameId,
        Object.fromEntries(
          serviceIds.map((serviceId) => [serviceId, defaultService(gameId, serviceId)]),
        ),
      ]),
    ),
  };
}

export function normalizeRuntimeCatalog(input, { preserveRevision = true } = {}) {
  const source = input && typeof input === "object" ? input : {};
  const currency = supportedCurrencies.includes(source.currency) ? source.currency : "HKD";
  let hasConfiguredService = false;

  const games = Object.fromEntries(
    gameIds.map((gameId) => {
      const sourceGame = source.games?.[gameId] ?? {};
      return [
        gameId,
        Object.fromEntries(
          serviceIds.map((serviceId) => {
            const fallback = defaultService(gameId, serviceId);
            const item = sourceGame?.[serviceId] ?? {};
            const basePrice = cleanPrice(item.basePrice);
            const configured = Boolean(item.configured) && basePrice !== null && !manualServiceIds.has(serviceId);
            if (configured) hasConfiguredService = true;
            return [
              serviceId,
              {
                ...fallback,
                enabled: item.enabled !== false,
                configured,
                basePrice,
                priceSuffix: cleanText(item.priceSuffix, 24) || fallback.priceSuffix,
                estimatedCompletionTime: cleanText(item.estimatedCompletionTime, 80),
                note: cleanText(item.note, 240),
              },
            ];
          }),
        ),
      ];
    }),
  );

  return {
    schemaVersion: catalogSchemaVersion,
    currency,
    configured: hasConfiguredService,
    announcement: cleanText(source.announcement, 240),
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null,
    revision: preserveRevision && typeof source.revision === "string" ? source.revision : "default",
    games,
  };
}

export function getRuntimeService(catalog, gameId, serviceId) {
  return catalog?.games?.[gameId]?.[serviceId] ?? null;
}

export function isRuntimeServiceConfigured(catalog, gameId, serviceId) {
  const service = getRuntimeService(catalog, gameId, serviceId);
  return Boolean(catalog?.configured && service?.configured && Number.isFinite(service.basePrice));
}

export function runtimeServiceIds() {
  return [...serviceIds];
}

export function runtimeGameIds() {
  return [...gameIds];
}

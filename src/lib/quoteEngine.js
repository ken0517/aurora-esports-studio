import {
  getPricingRule,
  getServiceDefinition,
  getServiceLabel,
  isPricingConfigured,
  manualOnlyIntents,
  pricingCurrency,
} from "../data/pricing.js";
import {
  getGameRankLabel,
  getRankById,
  getRankLabel,
  rankCatalog,
  rankRequiresManualReview,
} from "../data/ranks.js";
import {
  getHeroPowerMarkById,
  getHeroPowerMarkLabel,
  getLaneById,
  getLaneLabel,
} from "../data/gameConfig.js";
import {
  defaultLocale,
  localize,
  normalizeLocale,
  translate,
} from "../data/translations.js";

export const DEFAULT_WHATSAPP_URL = "https://wa.me/85262243840";

const draftDefaults = {
  locale: defaultLocale,
  intent: null,
  gameId: null,
  serviceId: null,
  currentRankId: null,
  currentDivision: null,
  currentStars: null,
  currentPoints: null,
  currentHeroPowerPoints: null,
  targetRankId: null,
  targetDivision: null,
  targetStars: null,
  targetPoints: null,
  targetHeroPowerPoints: null,
  quantity: null,
  // `points` is retained as a compatibility alias used by the first UI. New
  // integrations should prefer currentPoints/targetPoints or quantity.
  points: null,
  completionTime: "",
  express: null,
  preferredHero: "",
  preferredRole: "",
  heroPowerMarkId: null,
  duoMode: null,
  otherServiceType: null,
  additionalRequirements: "",
};

const isPresent = (value) => value !== null && value !== undefined && value !== "";

function toOptionalNumber(value) {
  if (!isPresent(value)) return null;
  const number = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(number) ? number : value;
}

function normalizeDraft(draft = {}) {
  const normalized = {
    ...draftDefaults,
    ...(draft ?? {}),
    locale: normalizeLocale(draft?.locale ?? defaultLocale),
  };

  [
    "currentStars",
    "targetStars",
    "currentPoints",
    "targetPoints",
    "currentHeroPowerPoints",
    "targetHeroPowerPoints",
    "quantity",
    "points",
  ].forEach((field) => {
    normalized[field] = toOptionalNumber(normalized[field]);
  });

  // The original form writes peak quantity to `points`. Preserve that input
  // without pretending it is a starting or target score.
  if (!isPresent(normalized.quantity) && isPresent(normalized.points)) {
    normalized.quantity = normalized.points;
  }
  if (!isPresent(normalized.points) && isPresent(normalized.quantity) && normalized.serviceId === "peak") {
    normalized.points = normalized.quantity;
  }

  if (normalized.express === "true") normalized.express = true;
  if (normalized.express === "false") normalized.express = false;
  return normalized;
}

/** Accepts createQuoteDraft(locale), createQuoteDraft(initialValues), or both. */
export function createQuoteDraft(localeOrInitial = defaultLocale, initialValues = {}) {
  const initial = typeof localeOrInitial === "object" && localeOrInitial !== null
    ? localeOrInitial
    : { ...initialValues, locale: localeOrInitial };
  return normalizeDraft(initial);
}

function addMissing(result, field, messageKey) {
  if (!result.missingFields.includes(field)) result.missingFields.push(field);
  result.errorCodes.push(messageKey);
  result.errors.push(translate(result.locale, `quote.errors.${messageKey}`));
}

function addError(result, field, messageKey) {
  if (field && !result.invalidFields.includes(field)) result.invalidFields.push(field);
  result.errorCodes.push(messageKey);
  result.errors.push(translate(result.locale, `quote.errors.${messageKey}`));
}

function validatePositiveNumber(result, draft, field) {
  if (!isPresent(draft[field])) {
    addMissing(result, field, "numberRequired");
    return;
  }
  if (!Number.isFinite(draft[field])) {
    addError(result, field, "numberRequired");
    return;
  }
  if (draft[field] <= 0) addError(result, field, "positiveNumber");
}

function validateNonNegativeNumber(result, draft, field) {
  if (!isPresent(draft[field])) {
    addMissing(result, field, "numberRequired");
    return;
  }
  if (!Number.isFinite(draft[field]) || draft[field] < 0) {
    addError(result, field, "numberRequired");
  }
}

function validateStarsForRank(result, draft, rank, field, { requiredForDivision = false } = {}) {
  if (!rank || rank.measurement === "leaderboard") return;
  if (rank.measurement !== "stars" && !requiredForDivision) return;
  validateNonNegativeNumber(result, draft, field);
  const value = draft[field];
  if (!Number.isFinite(value)) return;
  if (rank.measurement !== "stars") return;
  if (
    (Number.isFinite(rank.minStars) && value < rank.minStars) ||
    (Number.isFinite(rank.maxStars) && value > rank.maxStars)
  ) {
    addError(result, field, "invalidStarRange");
  }
}

function validateDivision(result, rank, value, field) {
  if (!rank?.divisions?.length) return;
  if (!isPresent(value)) {
    addMissing(result, field, "divisionRequired");
    return;
  }
  if (!rank.divisions.includes(String(value))) addError(result, field, "invalidDivision");
}

function compareWithinSameRank(currentRank, targetRank, draft) {
  if (currentRank.id !== targetRank.id) return 0;
  if (currentRank.divisions?.length) {
    const currentIndex = currentRank.divisions.indexOf(String(draft.currentDivision));
    const targetIndex = targetRank.divisions.indexOf(String(draft.targetDivision));
    if (currentIndex >= 0 && targetIndex >= 0 && currentIndex !== targetIndex) {
      return targetIndex - currentIndex;
    }
  }
  if (Number.isFinite(draft.currentStars) && Number.isFinite(draft.targetStars)) {
    return draft.targetStars - draft.currentStars;
  }
  return 0;
}

function validateRankContext(result, draft, { includeTarget = true, checkProgress = false } = {}) {
  const currentRank = getRankById(draft.gameId, draft.currentRankId);
  const targetRank = includeTarget ? getRankById(draft.gameId, draft.targetRankId) : null;

  if (!draft.currentRankId) addMissing(result, "currentRankId", "currentRankRequired");
  else if (!currentRank) addError(result, "currentRankId", "invalidRank");

  if (includeTarget) {
    if (!draft.targetRankId) addMissing(result, "targetRankId", "targetRankRequired");
    else if (!targetRank) addError(result, "targetRankId", "invalidRank");
  }

  if (currentRank) {
    validateDivision(result, currentRank, draft.currentDivision, "currentDivision");
    validateStarsForRank(result, draft, currentRank, "currentStars", { requiredForDivision: true });
    if (rankRequiresManualReview(draft.gameId, currentRank.id)) {
      result.requiresManualReview = true;
      result.manualReviewReasons.push("rank-requires-verification");
    }
  }

  if (targetRank) {
    validateDivision(result, targetRank, draft.targetDivision, "targetDivision");
    validateStarsForRank(result, draft, targetRank, "targetStars", { requiredForDivision: true });
    if (rankRequiresManualReview(draft.gameId, targetRank.id)) {
      result.requiresManualReview = true;
      result.manualReviewReasons.push("rank-requires-verification");
    }
  }

  if (checkProgress && currentRank && targetRank) {
    const orderDifference = targetRank.order - currentRank.order;
    const withinRankDifference = compareWithinSameRank(currentRank, targetRank, draft);
    if (orderDifference < 0 || (orderDifference === 0 && withinRankDifference <= 0)) {
      addError(result, "targetRankId", "targetMustBeHigher");
    }
  }
}

function validateOptionalLane(result, draft) {
  if (draft.preferredRole && !getLaneById(draft.gameId, draft.preferredRole)) {
    addError(result, "preferredRole", "invalidRole");
  }
}

/**
 * Returns { valid, isValid, errors, errorCodes, missingFields,
 * invalidFields, requiresManualReview, draft }.
 */
export function validateQuoteDraft(inputDraft, options = {}) {
  const draft = normalizeDraft({ ...inputDraft, locale: options.locale ?? inputDraft?.locale });
  const result = {
    locale: draft.locale,
    valid: true,
    isValid: true,
    errors: [],
    errorCodes: [],
    missingFields: [],
    invalidFields: [],
    requiresManualReview: false,
    manualReviewReasons: [],
    draft,
  };

  const game = rankCatalog[draft.gameId];
  if (!draft.gameId) addMissing(result, "gameId", "gameRequired");
  else if (!game) addError(result, "gameId", "gameRequired");

  const isHeroPower = draft.intent === "hero-power" || draft.serviceId === "hero-power";
  const service = getServiceDefinition(draft.serviceId);
  if (!draft.serviceId) addMissing(result, "serviceId", "serviceRequired");
  else if (!service && !isHeroPower) {
    // Unusual requests are deliberately accepted for human review instead of
    // being forced into an unrelated service or invented price.
    result.requiresManualReview = true;
    result.manualReviewReasons.push("unusual-request");
  }

  if (service && !service.supportedGames.includes(draft.gameId)) {
    addError(result, "serviceId", "serviceRequired");
  }

  if (isHeroPower) {
    result.requiresManualReview = true;
    result.manualReviewReasons.push("hero-power");
  }
  if (service?.manualOnly) {
    result.requiresManualReview = true;
    result.manualReviewReasons.push("manual-only-service");
  }

  if (draft.serviceId === "rank" && game) {
    validateRankContext(result, draft, { includeTarget: true, checkProgress: true });
    validateOptionalLane(result, draft);
  }

  if (draft.serviceId === "peak" && game) {
    validateNonNegativeNumber(result, draft, "currentPoints");
    validateNonNegativeNumber(result, draft, "targetPoints");
    if (
      Number.isFinite(draft.currentPoints) &&
      Number.isFinite(draft.targetPoints) &&
      draft.targetPoints <= draft.currentPoints
    ) {
      addError(result, "targetPoints", "targetPointsMustBeHigher");
    }
    validateOptionalLane(result, draft);
  }

  if (draft.serviceId === "duo" && game) {
    const validModes = new Set((service?.modes || []).map((mode) => mode.id));
    if (!draft.duoMode) addMissing(result, "duoMode", "duoModeRequired");
    else if (!validModes.has(draft.duoMode)) addError(result, "duoMode", "invalidDuoMode");
    else if (draft.duoMode === "ranked") {
      validateRankContext(result, draft, { includeTarget: true, checkProgress: true });
    } else if (draft.duoMode === "match-5v5") {
      validatePositiveNumber(result, draft, "quantity");
    }
  }

  if (isHeroPower && game) {
    validateRankContext(result, draft, { includeTarget: false });
    validateNonNegativeNumber(result, draft, "currentPoints");
    validateNonNegativeNumber(result, draft, "currentHeroPowerPoints");
    validateNonNegativeNumber(result, draft, "targetHeroPowerPoints");
    if (
      Number.isFinite(draft.currentHeroPowerPoints) &&
      Number.isFinite(draft.targetHeroPowerPoints) &&
      draft.targetHeroPowerPoints <= draft.currentHeroPowerPoints
    ) {
      addError(result, "targetHeroPowerPoints", "targetHeroPowerMustBeHigher");
    }
    if (!String(draft.preferredHero ?? "").trim()) {
      addMissing(result, "preferredHero", "heroRequired");
    }
    if (!draft.heroPowerMarkId) {
      addMissing(result, "heroPowerMarkId", "heroPowerMarkRequired");
    } else if (!getHeroPowerMarkById(draft.gameId, draft.heroPowerMarkId)) {
      addError(result, "heroPowerMarkId", "invalidHeroPowerMark");
    }
  }

  if (draft.serviceId === "other") {
    const validTypes = new Set((service?.options || []).map((option) => option.id));
    if (!draft.otherServiceType) addMissing(result, "otherServiceType", "otherServiceTypeRequired");
    else if (!validTypes.has(draft.otherServiceType)) {
      addError(result, "otherServiceType", "invalidOtherServiceType");
    }
    if (!String(draft.additionalRequirements ?? "").trim()) {
      addMissing(result, "additionalRequirements", "requirementsRequired");
    }
  }

  if (["rank", "peak", "hero-power"].includes(draft.serviceId) && !isPresent(draft.express)) {
    addMissing(result, "express", "expressRequired");
  }

  if ((service || isHeroPower) && !String(draft.completionTime ?? "").trim()) {
    addMissing(result, "completionTime", "completionTimeRequired");
  }

  result.manualReviewReasons = [...new Set(result.manualReviewReasons)];
  result.valid = result.errors.length === 0;
  result.isValid = result.valid;
  return result;
}

function randomReferencePart() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  return [...bytes].map((value) => alphabet[value % alphabet.length]).join("");
}

export function createQuoteReference(now = new Date(), suffix = null) {
  const date = now instanceof Date ? now : new Date(now);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const stamp = [safeDate.getFullYear(), String(safeDate.getMonth() + 1).padStart(2, "0"), String(safeDate.getDate()).padStart(2, "0")].join("");
  return `AUR-${stamp}-${suffix || randomReferencePart()}`;
}

function deriveQuantity(draft) {
  if (Number.isFinite(draft.quantity) && draft.quantity > 0) return draft.quantity;
  if (Number.isFinite(draft.currentPoints) && Number.isFinite(draft.targetPoints)) {
    const difference = draft.targetPoints - draft.currentPoints;
    return difference > 0 ? difference : null;
  }
  return null;
}

function monetaryValue(value) {
  return Number.isFinite(value) ? value : null;
}

function calculateConfiguredPricing(rule, draft) {
  const quantity = deriveQuantity(draft);
  let basePrice = monetaryValue(rule.basePrice);

  if (rule.pricingModel === "per-unit" && Number.isFinite(rule.unitPrice) && Number.isFinite(quantity)) {
    basePrice = (basePrice ?? 0) + rule.unitPrice * quantity;
  } else if (rule.pricingModel === "rank-step" && rule.rankStepPrices) {
    const exactKey = `${draft.currentRankId}:${draft.currentDivision ?? "*"}->${draft.targetRankId}:${draft.targetDivision ?? "*"}`;
    const broadKey = `${draft.currentRankId}->${draft.targetRankId}`;
    basePrice = monetaryValue(rule.rankStepPrices[exactKey] ?? rule.rankStepPrices[broadKey]);
  } else if (rule.pricingModel === "point-band" && Array.isArray(rule.pointBands) && Number.isFinite(quantity)) {
    const band = rule.pointBands.find((item) =>
      Number.isFinite(item.unitPrice) &&
      (!Number.isFinite(item.min) || draft.currentPoints >= item.min) &&
      (!Number.isFinite(item.max) || draft.currentPoints <= item.max),
    );
    basePrice = band ? (monetaryValue(rule.basePrice) ?? 0) + band.unitPrice * quantity : null;
  }

  if (!Number.isFinite(basePrice)) return null;

  const optionalChargeItems = [];
  const addCharge = (id, config) => {
    if (!config || !Number.isFinite(config.value)) return;
    const amount = config.type === "percentage" ? basePrice * config.value : config.value;
    if (Number.isFinite(amount)) optionalChargeItems.push({ id, amount });
  };
  if (draft.express) addCharge("express", rule.optionalCharges?.express);
  if (String(draft.preferredHero ?? "").trim()) addCharge("preferredHero", rule.optionalCharges?.preferredHero);

  const optionalCharges = optionalChargeItems.reduce((sum, item) => sum + item.amount, 0);
  let discount = 0;
  if (Array.isArray(rule.discounts)) {
    const discountRule = rule.discounts.find((item) =>
      Number.isFinite(item.value) && (!Number.isFinite(item.minQuantity) || quantity >= item.minQuantity),
    );
    if (discountRule) discount = discountRule.type === "percentage"
      ? (basePrice + optionalCharges) * discountRule.value
      : discountRule.value;
  }

  return {
    basePrice,
    optionalCharges,
    optionalChargeItems,
    discount,
    finalTotal: Math.max(0, basePrice + optionalCharges - discount),
    estimatedCompletionTime: localize(rule.estimatedCompletionTime, draft.locale) || draft.completionTime || null,
    quantity,
  };
}

function baseQuoteResult(draft, validation, options = {}) {
  const currentRank = getRankById(draft.gameId, draft.currentRankId);
  const targetRank = getRankById(draft.gameId, draft.targetRankId);
  const service = getServiceDefinition(draft.serviceId);
  const reference = options.reference ?? options.referenceNumber ?? createQuoteReference(options.now);
  return {
    status: "incomplete",
    requiresManualReview: false,
    reason: null,
    reference,
    referenceNumber: reference,
    createdAt: (options.now instanceof Date ? options.now : new Date()).toISOString(),
    locale: draft.locale,
    currency: pricingCurrency,
    draft,
    validation,
    service,
    serviceLabel: service ? getServiceLabel(service, draft.locale) : draft.serviceId === "hero-power" ? localize({ "zh-HK": "英雄戰力服務", en: "Hero power service", "zh-CN": "英雄战力服务" }, draft.locale) : draft.serviceId,
    gameLabel: getGameRankLabel(draft.gameId, draft.locale),
    currentRank,
    targetRank,
    currentRankLabel: currentRank ? getRankLabel(currentRank, draft.locale) : "",
    targetRankLabel: targetRank ? getRankLabel(targetRank, draft.locale) : "",
    currentStars: draft.currentStars,
    targetStars: draft.targetStars,
    currentPoints: draft.currentPoints,
    targetPoints: draft.targetPoints,
    currentHeroPowerPoints: draft.currentHeroPowerPoints,
    targetHeroPowerPoints: draft.targetHeroPowerPoints,
    quantity: deriveQuantity(draft),
    duoMode: draft.duoMode,
    otherServiceType: draft.otherServiceType,
    preferredHero: draft.preferredHero,
    preferredRole: draft.preferredRole,
    heroPowerMarkId: draft.heroPowerMarkId,
    basePrice: null,
    optionalCharges: null,
    optionalChargeItems: [],
    discount: null,
    estimatedCompletionTime: draft.completionTime || null,
    finalTotal: null,
    pricing: { currency: pricingCurrency, configured: false, rule: null },
  };
}

export function calculateQuote(inputDraft, options = {}) {
  const draft = normalizeDraft(inputDraft);
  const validation = validateQuoteDraft(draft);
  const result = baseQuoteResult(draft, validation, options);
  const service = getServiceDefinition(draft.serviceId);

  if (!validation.valid) {
    result.status = "incomplete";
    result.reason = "missing-or-invalid-fields";
    return result;
  }

  const isManualIntent = manualOnlyIntents.includes(draft.intent) || service?.manualOnly;
  const rule = getPricingRule(draft.gameId, draft.serviceId);
  result.pricing.rule = rule;
  result.pricing.configured = isPricingConfigured(draft.gameId, draft.serviceId);

  if (isManualIntent || validation.requiresManualReview) {
    result.status = "manual_review";
    result.requiresManualReview = true;
    result.reason = isManualIntent
      ? `${draft.serviceId || "request"}-requires-human-review`
      : validation.manualReviewReasons[0] ?? "manual-review-required";
    return result;
  }

  if (!result.pricing.configured || !rule) {
    result.status = "manual_review";
    result.requiresManualReview = true;
    result.reason = "pricing-unconfigured";
    return result;
  }

  const calculated = calculateConfiguredPricing(rule, draft);
  if (!calculated) {
    result.status = "manual_review";
    result.requiresManualReview = true;
    result.reason = "pricing-rule-incomplete";
    return result;
  }

  Object.assign(result, calculated, {
    status: "quoted",
    requiresManualReview: false,
    reason: null,
  });
  return result;
}

function displayRank(quote, prefix, locale) {
  const label = quote[`${prefix}RankLabel`] || getRankLabel(quote[`${prefix}Rank`], locale);
  const division = quote.draft?.[`${prefix}Division`];
  const stars = quote.draft?.[`${prefix}Stars`];
  return [label, division, Number.isFinite(stars) ? `${stars}★` : null].filter(Boolean).join(" ") || "—";
}

function formatMoney(value, currency, locale) {
  if (!Number.isFinite(value)) return translate(locale, "common.notAvailable");
  return new Intl.NumberFormat(locale === "zh-HK" ? "zh-HK" : locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function getServiceChoiceLabel(service, collectionName, choiceId, locale) {
  const choice = service?.[collectionName]?.find((item) => item.id === choiceId);
  return localize(choice?.labels, locale) || choiceId || "—";
}

export function formatQuoteText(quoteOrDraft, locale = null) {
  const quote = quoteOrDraft?.reference || quoteOrDraft?.referenceNumber
    ? quoteOrDraft
    : calculateQuote(quoteOrDraft);
  const resolvedLocale = normalizeLocale(locale ?? quote.locale ?? quote.draft?.locale);
  const draft = quote.draft ?? normalizeDraft(quoteOrDraft);
  const currency = quote.currency ?? pricingCurrency;
  const isHeroPower = draft.serviceId === "hero-power";
  const isPeak = draft.serviceId === "peak";
  const isDuo = draft.serviceId === "duo";
  const isDuoRanked = isDuo && draft.duoMode === "ranked";
  const isDuoMatch = isDuo && draft.duoMode === "match-5v5";
  const isRankRange = draft.serviceId === "rank" || isDuoRanked;
  const isOther = draft.serviceId === "other";
  const detailRows = [];

  if (isDuo) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.fields.duoMode")}: ${getServiceChoiceLabel(quote.service, "modes", draft.duoMode, resolvedLocale)}`,
    );
  }
  if (isRankRange || isHeroPower) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.table.currentRank")}: ${displayRank(quote, "current", resolvedLocale)}`,
    );
  }
  if (isRankRange) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.table.targetRank")}: ${displayRank(quote, "target", resolvedLocale)}`,
    );
  }
  if (isPeak) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.fields.currentPeakPoints")}: ${draft.currentPoints ?? "—"}`,
      `${translate(resolvedLocale, "quote.fields.targetPeakPoints")}: ${draft.targetPoints ?? "—"}`,
    );
  }
  if (isHeroPower) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.fields.currentPeakPoints")}: ${draft.currentPoints ?? "—"}`,
      `${translate(resolvedLocale, "quote.fields.currentHeroPowerPoints")}: ${draft.currentHeroPowerPoints ?? "—"}`,
      `${translate(resolvedLocale, "quote.fields.targetHeroPowerPoints")}: ${draft.targetHeroPowerPoints ?? "—"}`,
    );
  }
  if (["rank", "peak", "hero-power"].includes(draft.serviceId)) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.fields.preferredHero")}: ${draft.preferredHero || "—"}`,
    );
  }
  if (["rank", "peak"].includes(draft.serviceId)) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.fields.preferredRole")}: ${getLaneLabel(draft.gameId, draft.preferredRole, resolvedLocale) || "—"}`,
    );
  }
  if (isHeroPower) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.fields.heroPowerMark")}: ${getHeroPowerMarkLabel(draft.gameId, draft.heroPowerMarkId, resolvedLocale) || "—"}`,
    );
  }
  if (isDuoMatch) {
    detailRows.push(`${translate(resolvedLocale, "quote.table.quantity")}: ${quote.quantity ?? draft.quantity ?? "—"}`);
  }
  if (isOther) {
    detailRows.push(
      `${translate(resolvedLocale, "quote.fields.otherServiceType")}: ${getServiceChoiceLabel(quote.service, "options", draft.otherServiceType, resolvedLocale)}`,
      `${translate(resolvedLocale, "quote.fields.additionalRequirements")}: ${draft.additionalRequirements || "—"}`,
    );
  }

  const rows = [
    translate(resolvedLocale, "quote.table.title"),
    `${translate(resolvedLocale, "quote.table.reference")}: ${quote.referenceNumber ?? quote.reference ?? "—"}`,
    `${translate(resolvedLocale, "quote.fields.game")}: ${quote.gameLabel || getGameRankLabel(draft.gameId, resolvedLocale) || "—"}`,
    `${translate(resolvedLocale, "quote.table.service")}: ${quote.serviceLabel || getServiceLabel(draft.serviceId, resolvedLocale) || draft.serviceId || "—"}`,
    ...detailRows,
    `${translate(resolvedLocale, "quote.table.basePrice")}: ${formatMoney(quote.basePrice, currency, resolvedLocale)}`,
    `${translate(resolvedLocale, "quote.table.optionalCharges")}: ${formatMoney(quote.optionalCharges, currency, resolvedLocale)}`,
    `${translate(resolvedLocale, "quote.table.discount")}: ${formatMoney(quote.discount, currency, resolvedLocale)}`,
    `${translate(resolvedLocale, "quote.table.estimatedCompletionTime")}: ${quote.estimatedCompletionTime || draft.completionTime || translate(resolvedLocale, "common.notAvailable")}`,
    ...(["rank", "peak", "hero-power"].includes(draft.serviceId)
      ? [`${translate(resolvedLocale, "quote.fields.express")}: ${isPresent(draft.express) ? translate(resolvedLocale, draft.express ? "common.yes" : "common.no") : translate(resolvedLocale, "common.notAvailable")}`]
      : []),
    `${translate(resolvedLocale, "quote.table.finalTotal")}: ${formatMoney(quote.finalTotal, currency, resolvedLocale)}`,
    `${translate(resolvedLocale, "quote.fields.quoteStatus")}: ${translate(resolvedLocale, `quote.status.${quote.status === "quoted" ? "quoted" : "manual_review"}`)}`,
  ];

  if (quote.status !== "quoted") rows.push("", translate(resolvedLocale, "quote.manualNotice"));
  return rows.join("\n");
}

export function formatWhatsAppMessage(quoteOrDraft, locale = null) {
  const quote = quoteOrDraft?.reference || quoteOrDraft?.referenceNumber
    ? quoteOrDraft
    : calculateQuote(quoteOrDraft);
  const resolvedLocale = normalizeLocale(locale ?? quote.locale ?? quote.draft?.locale);
  return [
    translate(resolvedLocale, "quote.whatsapp.greeting"),
    "",
    formatQuoteText(quote, resolvedLocale),
    "",
    translate(resolvedLocale, "quote.whatsapp.closing"),
  ].join("\n");
}

/**
 * Supported signatures:
 *   buildWhatsAppUrl(quote, { locale, phoneNumber, baseUrl, message })
 *   buildWhatsAppUrl(quote, locale, baseUrl)
 */
export function buildWhatsAppUrl(quoteOrDraft, localeOrOptions = {}, legacyBaseUrl = null) {
  const options = typeof localeOrOptions === "string"
    ? { locale: localeOrOptions, baseUrl: legacyBaseUrl }
    : localeOrOptions ?? {};
  const locale = normalizeLocale(options.locale ?? quoteOrDraft?.locale ?? quoteOrDraft?.draft?.locale);
  const message = options.message ?? formatWhatsAppMessage(quoteOrDraft, locale);
  const phoneNumber = String(options.phoneNumber ?? "85262243840").replace(/\D/g, "");
  const baseUrl = options.baseUrl || (phoneNumber ? `https://wa.me/${phoneNumber}` : DEFAULT_WHATSAPP_URL);
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}text=${encodeURIComponent(message)}`;
}

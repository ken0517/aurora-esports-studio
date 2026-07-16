import { defaultLocale, localize, normalizeLocale } from "./translations.js";

const text = (traditionalChinese, english, simplifiedChinese = traditionalChinese) => ({
  "zh-HK": traditionalChinese,
  en: english,
  "zh-CN": simplifiedChinese,
});

const diamondKeywords = {
  "zh-HK": ["鑽石", "鑽石升星耀", "鑽石代打", "鑽石價格", "鑽石三"],
  en: ["diamond", "diamond to veteran", "diamond ranked", "diamond price"],
  "zh-CN": ["钻石", "钻石升星耀", "钻石代打", "钻石价格", "钻石三"],
};

const veteranKeywords = {
  "zh-HK": ["星耀", "星耀升傳說", "星耀代打", "星耀價格", "指定英雄"],
  en: ["veteran", "veteran to legend", "veteran ranked", "veteran price", "preferred hero"],
  "zh-CN": ["星耀", "星耀升传说", "星耀代打", "星耀价格", "指定英雄"],
};

const powerKeywords = {
  "zh-HK": ["戰力", "英雄戰力", "戰力代打", "巔峰賽戰力", "排名提升"],
  en: ["hero power", "power score", "hero ranking", "peak power"],
  "zh-CN": ["战力", "英雄战力", "战力代打", "巅峰赛战力", "排名提升"],
};

export const quoteSuggestions = [
  {
    id: "diamond-to-veteran-quote",
    labels: text("鑽石升星耀報價", "Diamond to Veteran quote", "钻石升星耀报价"),
    keywords: diamondKeywords,
    draft: { gameId: "aov", serviceId: "rank", currentRankId: "diamond", targetRankId: "veteran" },
  },
  {
    id: "diamond-three-to-veteran-one",
    labels: text("鑽石三升星耀一", "Diamond III to Veteran I", "钻石三升星耀一"),
    keywords: diamondKeywords,
    draft: { gameId: "aov", serviceId: "rank", currentRankId: "diamond", currentDivision: "III", targetRankId: "veteran", targetDivision: "I" },
  },
  {
    id: "diamond-ranked-service",
    labels: text("鑽石排位代打", "Diamond ranked progression", "钻石排位代打"),
    keywords: diamondKeywords,
    draft: { serviceId: "rank", currentRankId: "diamond" },
  },
  {
    id: "diamond-price-per-star",
    labels: text("鑽石段位每星價格", "Diamond price per star", "钻石段位每星价格"),
    keywords: diamondKeywords,
    draft: {
      serviceId: "rank",
      currentRankId: "diamond",
      additionalRequirements: text("查詢每星價格", "Ask about the price per star", "查询每星价格"),
    },
  },
  {
    id: "veteran-to-legend",
    labels: text("星耀升傳說", "Veteran to Legend", "星耀升传说"),
    keywords: veteranKeywords,
    draft: { gameId: "aov", serviceId: "rank", currentRankId: "veteran", targetRankId: "battlefield-legend" },
  },
  {
    id: "veteran-ranked-price",
    labels: text("星耀排位代打價格", "Veteran ranked price", "星耀排位代打价格"),
    keywords: veteranKeywords,
    draft: { serviceId: "rank", currentRankId: "veteran" },
  },
  {
    id: "veteran-price-per-star",
    labels: text("星耀每星價格", "Veteran price per star", "星耀每星价格"),
    keywords: veteranKeywords,
    draft: {
      serviceId: "rank",
      currentRankId: "veteran",
      additionalRequirements: text("查詢每星價格", "Ask about the price per star", "查询每星价格"),
    },
  },
  {
    id: "veteran-preferred-hero",
    labels: text("星耀指定英雄代打", "Veteran with a preferred hero", "星耀指定英雄代打"),
    keywords: veteranKeywords,
    draft: {
      serviceId: "rank",
      currentRankId: "veteran",
      additionalRequirements: text("指定英雄", "Preferred hero", "指定英雄"),
    },
  },
  {
    id: "hero-power-service",
    labels: text("英雄戰力代打", "Hero power progression", "英雄战力代打"),
    keywords: powerKeywords,
    requiresManualReview: true,
    intent: "hero-power",
    draft: {
      serviceId: "hero-power",
      additionalRequirements: text("英雄戰力代打", "Hero power progression", "英雄战力代打"),
    },
  },
  {
    id: "preferred-hero-power",
    labels: text("指定英雄戰力報價", "Preferred hero power quote", "指定英雄战力报价"),
    keywords: powerKeywords,
    requiresManualReview: true,
    intent: "hero-power",
    draft: {
      serviceId: "hero-power",
      additionalRequirements: text("指定英雄戰力報價", "Preferred hero power quote", "指定英雄战力报价"),
    },
  },
  {
    id: "peak-power-service",
    labels: text("巔峰賽戰力服務", "Peak hero-power service", "巅峰赛战力服务"),
    keywords: powerKeywords,
    requiresManualReview: true,
    intent: "hero-power",
    draft: {
      serviceId: "hero-power",
      additionalRequirements: text("巔峰賽戰力服務", "Peak hero-power service", "巅峰赛战力服务"),
    },
  },
  {
    id: "power-ranking",
    labels: text("戰力排名提升", "Hero-power ranking improvement", "战力排名提升"),
    keywords: powerKeywords,
    requiresManualReview: true,
    intent: "hero-power",
    draft: {
      serviceId: "hero-power",
      additionalRequirements: text("戰力排名提升", "Hero-power ranking improvement", "战力排名提升"),
    },
  },
  {
    id: "power-human-support",
    labels: text("詢問 Aurora 客服", "Ask Aurora Support", "询问 Aurora客服"),
    keywords: powerKeywords,
    requiresManualReview: true,
    intent: "hero-power",
    draft: {
      serviceId: "hero-power",
      additionalRequirements: text("轉接 Aurora 客服", "Connect me to Aurora Support", "转接 Aurora客服"),
    },
  },
  {
    id: "ranked-pricing-general",
    labels: text("排位代打如何收費？", "How is ranked progression priced?", "排位代打如何收费？"),
    keywords: {
      "zh-HK": ["排位", "代打", "收費", "幾多錢", "價格"],
      en: ["ranked", "boost", "price", "cost", "quote"],
      "zh-CN": ["排位", "代打", "收费", "多少钱", "价格"],
    },
    draft: { serviceId: "rank" },
  },
  {
    id: "service-help",
    labels: text("我不確定應該選擇哪項服務", "Help me choose a service", "我不知道应该选择哪项服务"),
    keywords: {
      "zh-HK": ["唔知", "揀邊個", "選擇服務", "幫我揀", "推薦"],
      en: ["which service", "help choose", "recommend", "not sure"],
      "zh-CN": ["不知道", "选择服务", "帮我选", "推荐"],
    },
    draft: {
      additionalRequirements: text(
        "需要 Aurora 客服協助選擇服務",
        "I need Aurora Support to help me choose a service",
        "需要 Aurora客服协助选择服务",
      ),
    },
  },
];

function normalizeSearchText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s，。！？、,.!?;；:：()（）\-_/]+/g, "");
}

function resolveArguments(localeOrOptions, maybeOptions) {
  if (typeof localeOrOptions === "string") {
    return { locale: normalizeLocale(localeOrOptions), options: maybeOptions ?? {} };
  }
  const options = localeOrOptions ?? {};
  return { locale: normalizeLocale(options.locale ?? defaultLocale), options };
}

/**
 * Supported signatures:
 *   findSuggestions(query, { locale, limit, gameId, serviceId })
 *   findSuggestions(query, locale, { limit, gameId, serviceId })
 */
export function findSuggestions(query, localeOrOptions = {}, maybeOptions = {}) {
  const { locale, options } = resolveArguments(localeOrOptions, maybeOptions);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const ranked = quoteSuggestions
    .map((suggestion, originalIndex) => {
      const localizedLabel = localize(suggestion.labels, locale);
      const localizedKeywords = suggestion.keywords?.[locale] ?? [];
      const allKeywords = Object.values(suggestion.keywords ?? {}).flat();
      const candidates = [localizedLabel, ...localizedKeywords, ...allKeywords]
        .map(normalizeSearchText)
        .filter(Boolean);

      let score = 0;
      for (const candidate of candidates) {
        if (candidate === normalizedQuery) score = Math.max(score, 120);
        else if (candidate.startsWith(normalizedQuery)) score = Math.max(score, 90);
        else if (candidate.includes(normalizedQuery)) score = Math.max(score, 70);
        else if (normalizedQuery.includes(candidate)) score = Math.max(score, 55);
      }

      if (options.gameId && suggestion.draft?.gameId === options.gameId) score += 8;
      if (options.serviceId && suggestion.draft?.serviceId === options.serviceId) score += 5;

      return {
        ...suggestion,
        draft: suggestion.draft
          ? {
              ...suggestion.draft,
              ...(Object.prototype.hasOwnProperty.call(suggestion.draft, "additionalRequirements")
                ? {
                    additionalRequirements: localize(
                      suggestion.draft.additionalRequirements,
                      locale,
                    ),
                  }
                : {}),
            }
          : suggestion.draft,
        label: suggestion.labels,
        text: localizedLabel,
        score,
        originalIndex,
      };
    })
    .filter((suggestion) => suggestion.score > 0)
    .sort((left, right) => right.score - left.score || left.originalIndex - right.originalIndex);

  const limit = Number.isFinite(options.limit) ? Math.max(0, options.limit) : 8;
  return ranked.slice(0, limit).map(({ originalIndex: _originalIndex, ...suggestion }) => suggestion);
}

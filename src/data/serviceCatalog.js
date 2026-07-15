/**
 * Editorial service catalogue shown in the public services section.
 *
 * Prices deliberately do not live in this display catalogue. Every service is
 * routed to Aurora's quotation flow so the customer can confirm the exact
 * game, target and requirements before receiving a quote.
 */

export const serviceEditorialCopy = {
  "zh-HK": {
    eyebrow: "我們的服務",
    title: "為每段上分之路量身而設。",
    description:
      "三款遊戲，同一份用心。每項服務均按你的目標、時間和實際需要安排，並由 Aurora 客服提供專屬報價。",
    tabsLabel: "選擇遊戲",
    gridLabel: "可查詢報價的服務",
    quoteNote: "所有服務均按遊戲、目標及實際需求個別報價，詳情請向 Aurora 客服查詢。",
    requestQuote: "查詢報價",
  },
  en: {
    eyebrow: "Our services",
    title: "Tailored for every step of the climb.",
    description:
      "Three games, one standard of care. Every service is arranged around your goal, schedule and requirements, with a tailored quote from Aurora Support.",
    tabsLabel: "Choose a game",
    gridLabel: "Services available for quotation",
    quoteNote:
      "Every service is quoted individually according to the game, target and requirements. Ask Aurora Support for details.",
    requestQuote: "Request a quote",
  },
  "zh-CN": {
    eyebrow: "我们的服务",
    title: "为每段上分之路量身而设。",
    description:
      "三款游戏，同一份用心。每项服务均按你的目标、时间和实际需要安排，并由 Aurora客服提供专属报价。",
    tabsLabel: "选择游戏",
    gridLabel: "可查询报价的服务",
    quoteNote: "所有服务均按游戏、目标及实际需求单独报价，详情请向 Aurora客服查询。",
    requestQuote: "查询报价",
  },
};

export const serviceEditorialGames = [
  {
    id: "aov",
    name: {
      "zh-HK": "傳說對決",
      en: "Arena of Valor",
      "zh-CN": "传说对决",
    },
  },
  {
    id: "hok-cn",
    name: {
      "zh-HK": "王者榮耀國服",
      en: "Honor of Kings — China Server",
      "zh-CN": "王者荣耀国服",
    },
  },
  {
    id: "hok-global",
    name: {
      "zh-HK": "王者榮耀國際服",
      en: "Honor of Kings — Global Server",
      "zh-CN": "王者荣耀国际服",
    },
  },
];

const allGames = serviceEditorialGames.map((game) => game.id);

// This array order is also the visual order on desktop and mobile.
export const editorialServiceCatalog = [
  {
    id: "rank",
    games: allGames,
    category: {
      "zh-HK": "上分",
      en: "Rank",
      "zh-CN": "上分",
    },
    title: {
      "zh-HK": "排位代打",
      en: "Ranked progression",
      "zh-CN": "排位代打",
    },
    description: {
      "zh-HK": "由你目前的段位，帶到你心中的位置——由高手代打、逐級推進，過程附上進度報告。",
      en: "Progress from your current rank towards your target with a high-ranked player, step-by-step updates and a clear progress report.",
      "zh-CN": "从你目前的段位，提升到心中的位置——由高手代打、逐级推进，并在过程中提供进度报告。",
    },
  },
  {
    id: "peak",
    games: allGames,
    category: {
      "zh-HK": "巔峰",
      en: "Peak",
      "zh-CN": "巅峰",
    },
    title: {
      "zh-HK": "巔峰賽代打",
      en: "Peak ranked progression",
      "zh-CN": "巅峰赛代打",
    },
    description: {
      "zh-HK": "按你的目前分數和目標區間安排巔峰賽上分，每一分都由高手穩定贏回來。",
      en: "Move your Peak score into the target range with a plan tailored to your current points and goal.",
      "zh-CN": "按你目前的分数和目标区间安排巅峰赛上分，每一分都由高手稳定赢回来。",
    },
  },
  {
    id: "duo",
    games: allGames,
    category: {
      "zh-HK": "陪玩",
      en: "Companion",
      "zh-CN": "陪玩",
    },
    title: {
      "zh-HK": "陪玩帶飛",
      en: "Duo queue",
      "zh-CN": "陪玩带飞",
    },
    description: {
      "zh-HK": "可選排位或 5V5 匹配；高手陪玩會默默 Carry 全場，不搶話，也不會打擾你和朋友聊天。",
      en: "Choose Ranked or 5V5 Match. A skilled companion carries quietly without interrupting you or your friends.",
      "zh-CN": "可选排位或5V5匹配；高手陪玩会默默Carry全场，不抢话，也不会打扰你和朋友聊天。",
    },
  },
  {
    id: "hero-power",
    games: allGames,
    category: {
      "zh-HK": "戰力",
      en: "Power",
      "zh-CN": "战力",
    },
    title: {
      "zh-HK": "英雄戰力標",
      en: "Hero power mark",
      "zh-CN": "英雄战力标",
    },
    description: {
      "zh-HK": "按指定英雄、目前戰力、目標戰力及該遊戲可選的戰力標，整理專屬報價需求。",
      en: "A tailored request based on your selected hero, current and target power score, and the marks available for that game.",
      "zh-CN": "按指定英雄、目前战力、目标战力及该游戏可选的战力标，整理专属报价需求。",
    },
  },
  {
    id: "other",
    games: allGames,
    category: {
      "zh-HK": "其他",
      en: "Other",
      "zh-CN": "其他",
    },
    title: {
      "zh-HK": "其他服務",
      en: "Other services",
      "zh-CN": "其他服务",
    },
    description: {
      "zh-HK": "包括復盤教學、Discord 錄屏及英雄教學；請告訴 Aurora 客服你的需要。",
      en: "Includes review coaching, Discord recording and hero coaching. Tell Aurora Support what you need.",
      "zh-CN": "包括复盘教学、Discord录屏及英雄教学；请告诉 Aurora客服你的需要。",
    },
    options: [
      {
        id: "review-coaching",
        title: { "zh-HK": "復盤教學", en: "Review coaching", "zh-CN": "复盘教学" },
      },
      {
        id: "discord-recorded-review",
        title: { "zh-HK": "Discord 錄屏", en: "Discord recording", "zh-CN": "Discord 录屏" },
      },
      {
        id: "hero-coaching",
        title: { "zh-HK": "英雄教學", en: "Hero coaching", "zh-CN": "英雄教学" },
      },
    ],
  },
];

export function normalizeServiceLocale(locale) {
  return Object.hasOwn(serviceEditorialCopy, locale) ? locale : "zh-HK";
}

export function getServiceEditorialText(value, locale = "zh-HK") {
  if (typeof value === "string") return value;
  const normalizedLocale = normalizeServiceLocale(locale);
  return value?.[normalizedLocale] ?? value?.["zh-HK"] ?? "";
}

export function getEditorialServicesForGame(gameId) {
  return editorialServiceCatalog.filter((service) => service.games.includes(gameId));
}

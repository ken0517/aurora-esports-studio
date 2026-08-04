/**
 * Authoritative Aurora game configuration.
 *
 * This module is intentionally framework-free so both the React client and the
 * server-side AI route can import the exact same game, rank, lane, mark and
 * service data. Prices do not belong here; they remain in pricing.js.
 */

export const gameLocales = ["zh-HK", "en", "zh-CN"];

export const labels = (traditionalChinese, english, simplifiedChinese = traditionalChinese) => ({
  "zh-HK": traditionalChinese,
  en: english,
  "zh-CN": simplifiedChinese,
});

export function normalizeGameLocale(locale) {
  const normalized = String(locale || "zh-HK").replace("_", "-").toLowerCase();
  if (normalized === "zh-hant" || normalized.startsWith("zh-hk") || normalized.startsWith("zh-tw")) return "zh-HK";
  if (normalized === "zh-hans" || normalized.startsWith("zh-cn") || normalized.startsWith("zh-sg")) return "zh-CN";
  if (normalized.startsWith("en")) return "en";
  return "zh-HK";
}

export function localizeGameValue(value, locale = "zh-HK") {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const resolvedLocale = normalizeGameLocale(locale);
  const source = value.labels ?? value.label ?? value;
  return source?.[resolvedLocale] ?? source?.["zh-HK"] ?? source?.en ?? value.id ?? "";
}

const makeRank = ({
  id,
  order,
  label,
  divisions = [],
  measurement = divisions.length ? "division" : "stars",
  minStars = null,
  maxStars = null,
  verificationStatus = "verified",
  manualOnly = false,
  note = null,
}) => ({
  id,
  order,
  labels: label,
  traditionalChinese: label["zh-HK"],
  simplifiedChinese: label["zh-CN"],
  english: label.en,
  divisions,
  measurement,
  minStars,
  maxStars,
  verificationStatus,
  manualOnly,
  note,
});

// Existing Arena of Valor ranks are preserved exactly; this phase only adds
// its game-specific lanes and hero-power marks.
const aovRanks = [
  makeRank({ id: "bronze", order: 10, label: labels("青銅", "Bronze", "青铜"), divisions: ["III", "II", "I"] }),
  makeRank({ id: "silver", order: 20, label: labels("白銀", "Silver", "白银"), divisions: ["III", "II", "I"] }),
  makeRank({ id: "gold", order: 30, label: labels("黃金", "Gold", "黄金"), divisions: ["IV", "III", "II", "I"] }),
  makeRank({ id: "platinum", order: 40, label: labels("鉑金", "Platinum", "铂金"), divisions: ["V", "IV", "III", "II", "I"] }),
  makeRank({ id: "diamond", order: 50, label: labels("鑽石", "Diamond", "钻石"), divisions: ["V", "IV", "III", "II", "I"] }),
  makeRank({ id: "veteran", order: 60, label: labels("星耀", "Veteran", "星耀"), divisions: ["V", "IV", "III", "II", "I"] }),
  makeRank({ id: "battlefield-legend", order: 70, label: labels("戰場傳說", "Battlefield Legend", "战场传说"), minStars: 0, maxStars: 9 }),
  makeRank({ id: "pioneer-light", order: 80, label: labels("先鋒傳說・光影", "Pioneer Legend · Light", "先锋传说・光影"), minStars: 10, maxStars: 19 }),
  makeRank({ id: "pioneer-sky", order: 90, label: labels("先鋒傳說・天際", "Pioneer Legend · Sky", "先锋传说・天际"), minStars: 20, maxStars: 29 }),
  makeRank({ id: "pioneer-moon", order: 100, label: labels("先鋒傳說・新月", "Pioneer Legend · Crescent", "先锋传说・新月"), minStars: 30, maxStars: 39 }),
  makeRank({ id: "pioneer-starfield", order: 110, label: labels("先鋒傳說・星域", "Pioneer Legend · Starfield", "先锋传说・星域"), minStars: 40, maxStars: 49 }),
  makeRank({ id: "brilliant-legend", order: 120, label: labels("璀璨傳說", "Brilliant Legend", "璀璨传说"), minStars: 50, maxStars: 99 }),
  makeRank({ id: "peerless-legend", order: 130, label: labels("絕世傳說", "Peerless Legend", "绝世传说"), minStars: 100, maxStars: null }),
  makeRank({
    id: "eternal-legend",
    order: 140,
    label: labels("永恆傳說", "Eternal Legend", "永恒传说"),
    measurement: "leaderboard",
    verificationStatus: "leaderboard-dependent",
    manualOnly: true,
    note: labels("依全服排行榜判定，必須人工確認。", "Leaderboard-dependent; human confirmation is required.", "依全服排行榜判定，必须人工确认。"),
  }),
];

const hokChinaRanks = [
  makeRank({ id: "bronze", order: 10, label: labels("倔強青銅", "Stubborn Bronze", "倔强青铜"), divisions: ["III", "II", "I"] }),
  makeRank({ id: "silver", order: 20, label: labels("秩序白銀", "Order Silver", "秩序白银"), divisions: ["III", "II", "I"] }),
  makeRank({ id: "gold", order: 30, label: labels("榮耀黃金", "Glory Gold", "荣耀黄金"), divisions: ["IV", "III", "II", "I"] }),
  makeRank({ id: "platinum", order: 40, label: labels("尊貴鉑金", "Noble Platinum", "尊贵铂金"), divisions: ["IV", "III", "II", "I"] }),
  makeRank({ id: "diamond", order: 50, label: labels("永恆鑽石", "Eternal Diamond", "永恒钻石"), divisions: ["V", "IV", "III", "II", "I"] }),
  makeRank({ id: "veteran", order: 60, label: labels("至尊星耀", "Supreme Star", "至尊星耀"), divisions: ["V", "IV", "III", "II", "I"] }),
  makeRank({ id: "strongest-king", order: 70, label: labels("最強王者", "Strongest King", "最强王者"), minStars: 0, maxStars: 9 }),
  makeRank({ id: "extraordinary-king", order: 80, label: labels("非凡王者", "Extraordinary King", "非凡王者"), minStars: 10, maxStars: 19 }),
  makeRank({ id: "peerless-king", order: 90, label: labels("無雙王者", "Peerless King", "无双王者"), minStars: 20, maxStars: 29 }),
  makeRank({ id: "unrivalled-king", order: 100, label: labels("絕世王者", "Unrivalled King", "绝世王者"), minStars: 30, maxStars: 39 }),
  makeRank({ id: "sacred-king", order: 110, label: labels("至聖王者", "Sacred King", "至圣王者"), minStars: 40, maxStars: 49 }),
  makeRank({ id: "glory-king", order: 120, label: labels("榮耀王者", "Glory King", "荣耀王者"), minStars: 50, maxStars: 99 }),
  makeRank({ id: "legendary-king", order: 130, label: labels("傳奇王者", "Legendary King", "传奇王者"), minStars: 100, maxStars: null }),
];

const hokGlobalRanks = [
  makeRank({ id: "bronze", order: 10, label: labels("倔強青銅", "Stubborn Bronze", "倔强青铜"), divisions: ["III", "II", "I"] }),
  makeRank({ id: "silver", order: 20, label: labels("秩序白銀", "Order Silver", "秩序白银"), divisions: ["III", "II", "I"] }),
  makeRank({ id: "gold", order: 30, label: labels("榮耀黃金", "Glory Gold", "荣耀黄金"), divisions: ["IV", "III", "II", "I"] }),
  makeRank({ id: "platinum", order: 40, label: labels("尊貴鉑金", "Noble Platinum", "尊贵铂金"), divisions: ["IV", "III", "II", "I"] }),
  makeRank({ id: "diamond", order: 50, label: labels("永恆鑽石", "Eternal Diamond", "永恒钻石"), divisions: ["V", "IV", "III", "II", "I"] }),
  makeRank({ id: "veteran", order: 60, label: labels("至尊星耀", "Supreme Star", "至尊星耀"), divisions: ["V", "IV", "III", "II", "I"] }),
  makeRank({ id: "strongest-king", order: 70, label: labels("最強王者", "Strongest King", "最强王者"), minStars: 0, maxStars: 19 }),
  makeRank({ id: "strongest-peerless-transition", order: 80, label: labels("最強／無雙王者過渡區間", "Strongest / Peerless transition", "最强／无双王者过渡区间"), minStars: 20, maxStars: 29 }),
  makeRank({ id: "peerless-king", order: 90, label: labels("無雙王者", "Peerless King", "无双王者"), minStars: 30, maxStars: 49 }),
  makeRank({ id: "glory-king", order: 100, label: labels("榮耀王者", "Glory King", "荣耀王者"), minStars: 50, maxStars: 99 }),
  makeRank({ id: "legendary-king", order: 110, label: labels("傳奇王者", "Legendary King", "传奇王者"), minStars: 100, maxStars: null }),
];

const lane = (id, traditionalChinese, english, simplifiedChinese = traditionalChinese, aliases = []) => ({
  id,
  labels: labels(traditionalChinese, english, simplifiedChinese),
  aliases,
});

const heroPowerMark = (id, traditionalChinese, english, simplifiedChinese = traditionalChinese, aliases = []) => ({
  id,
  labels: labels(traditionalChinese, english, simplifiedChinese),
  aliases,
});

const quoteOption = (id, traditionalChinese, english, simplifiedChinese = traditionalChinese) => ({
  id,
  labels: labels(traditionalChinese, english, simplifiedChinese),
});

const serverCountryOption = (
  id,
  traditionalChinese,
  english,
  simplifiedChinese = traditionalChinese,
  serverRegionId = "southeast-asia",
) => ({
  ...quoteOption(id, traditionalChinese, english, simplifiedChinese),
  serverRegionId,
});

const aovLanes = [
  lane("slayer-lane", "凱撒路", "Slayer lane", "凯撒路", ["凱撒", "凯撒"]),
  lane("jungle", "打野", "Jungle", "打野"),
  lane("mid-lane", "中路", "Mid lane", "中路"),
  lane("dragon-lane", "魔龍路", "Abyssal Dragon lane", "魔龙路", ["魔龍", "魔龙", "射手路"]),
  lane("support", "輔助", "Support", "辅助"),
];

const kingsLanes = [
  lane("clash-lane", "對抗路", "Clash lane", "对抗路", ["對抗", "对抗"]),
  lane("jungle", "打野", "Jungle", "打野"),
  lane("mid-lane", "中路", "Mid lane", "中路"),
  lane("farm-lane", "發育路", "Farm lane", "发育路", ["發育", "发育", "射手", "射手路"]),
  lane("support", "輔助", "Support", "辅助"),
];

const aovHeroPowerMarks = [
  heroPowerMark("green", "綠標", "Green mark", "绿标", ["綠牌", "绿牌"]),
  heroPowerMark("blue", "藍標", "Blue mark", "蓝标"),
  heroPowerMark("purple", "紫標", "Purple mark", "紫标"),
  heroPowerMark("red", "紅標", "Red mark", "红标"),
  heroPowerMark("server-wide", "全服標", "Server-wide mark", "全服标"),
];

const kingsHeroPowerMarks = [
  heroPowerMark("bronze", "銅標", "Bronze mark", "铜标"),
  heroPowerMark("silver", "銀標", "Silver mark", "银标"),
  heroPowerMark("gold", "金標", "Gold mark", "金标"),
  heroPowerMark("minor-national", "小國標", "Minor national mark", "小国标"),
  heroPowerMark("major-national", "大國標", "Major national mark", "大国标"),
];

const hokGlobalHeroPowerMarks = [
  ...kingsHeroPowerMarks,
  heroPowerMark("red", "紅標", "Red mark", "红标"),
];

const hokGlobalServerRegions = [
  quoteOption(
    "americas",
    "美洲（北美、南美及巴西）",
    "Americas (North America, South America and Brazil)",
    "美洲（北美、南美及巴西）",
  ),
  quoteOption(
    "europe",
    "歐洲（西歐、東歐及土耳其）",
    "Europe (Western Europe, Eastern Europe and Türkiye)",
    "欧洲（西欧、东欧及土耳其）",
  ),
  quoteOption("middle-east-africa", "中東及非洲", "Middle East and Africa", "中东及非洲"),
  quoteOption(
    "pacific",
    "太平洋（南亞、南韓、日本及澳洲）",
    "Pacific (South Asia, South Korea, Japan and Australia)",
    "太平洋（南亚、韩国、日本及澳大利亚）",
  ),
  quoteOption("southeast-asia", "東南亞", "Southeast Asia", "东南亚"),
  quoteOption("hk-mo-tw", "香港／澳門／台灣", "Hong Kong / Macau / Taiwan", "香港／澳门／台湾"),
];

const hokGlobalServerCountries = [
  serverCountryOption("malaysia", "馬來西亞", "Malaysia", "马来西亚"),
  serverCountryOption("singapore", "新加坡", "Singapore", "新加坡"),
  serverCountryOption("indonesia", "印度尼西亞", "Indonesia", "印度尼西亚"),
  serverCountryOption("philippines", "菲律賓", "Philippines", "菲律宾"),
  serverCountryOption("thailand", "泰國", "Thailand", "泰国"),
  serverCountryOption("vietnam", "越南", "Vietnam", "越南"),
  serverCountryOption("other", "其他國家／地區", "Other country / region", "其他国家／地区", null),
];

const hokChinaDevicePlatforms = [
  quoteOption("ios", "iOS", "iOS"),
  quoteOption("android", "Android", "Android"),
];

const aovHeroPowerRegions = [
  quoteOption("hong-kong", "香港", "Hong Kong", "香港"),
  quoteOption("taiwan", "台灣", "Taiwan", "台湾"),
  quoteOption("macau", "澳門", "Macau", "澳门"),
];

export const serviceDefinitions = [
  {
    id: "rank",
    labels: labels("排位代打", "Ranked progression", "排位代打"),
    unit: "rank-step",
    requiredFields: [
      "gameId",
      "currentRankId",
      "currentStars",
      "targetRankId",
      "targetStars",
    ],
  },
  {
    id: "peak",
    labels: labels("巔峰賽代打", "Peak ranked progression", "巅峰赛代打"),
    unit: "point",
    requiredFields: ["gameId", "currentPoints", "targetPoints"],
  },
  {
    id: "duo",
    labels: labels("陪玩帶飛", "Duo queue", "陪玩带飞"),
    aliases: ["陪玩", "陪玩帶飛", "陪玩带飞", "陪打", "陪打帶飛", "陪打带飞", "帶飛", "带飞"],
    voiceRequired: false,
    unit: "session",
    modes: [
      {
        id: "ranked",
        labels: labels("排位", "Ranked", "排位"),
        requiredFields: ["currentRankId", "currentStars", "targetRankId", "targetStars", "duoGuarantee"],
      },
      {
        id: "match-5v5",
        labels: labels("5V5 匹配", "5V5 Match", "5V5 匹配"),
        requiredFields: ["quantity"],
      },
    ],
    guaranteeOptions: [
      {
        id: "guaranteed",
        labels: labels("包贏（保證升到目標）", "Guaranteed target", "包赢（保证升到目标）"),
      },
      {
        id: "standard",
        labels: labels("不包贏（每局照計）", "Standard, win or lose", "不包赢（每局照计）"),
      },
    ],
    requiredFields: ["gameId", "duoMode", "preferredStartTime"],
  },
  {
    id: "hero-power",
    labels: labels("英雄戰力標", "Hero power mark", "英雄战力标"),
    unit: "mark",
    requiredFields: [
      "gameId",
      "currentRankId",
      "currentStars",
      "currentPoints",
      "currentHeroPowerPoints",
      "targetHeroPowerPoints",
      "preferredHero",
      "heroPowerMarkId",
    ],
    manualOnly: true,
  },
  {
    id: "other",
    labels: labels(
      "其他（復盤教學／第一視角教學／英雄教學）",
      "Other (review coaching / first-person coaching / hero coaching)",
      "其他（复盘教学／第一视角教学／英雄教学）",
    ),
    aliases: [
      "其他",
      "復盤",
      "复盘",
      "復盤教學",
      "复盘教学",
      "第一視角教學",
      "第一视角教学",
      "Discord 錄屏",
      "Discord 录屏",
      "Discord recording",
      "英雄教學",
      "英雄教学",
    ],
    unit: "request",
    options: [
      {
        id: "review-coaching",
        labels: labels("復盤教學", "Review coaching", "复盘教学"),
        requiredFields: ["preferredStartTime"],
      },
      {
        id: "discord-recorded-review",
        labels: labels("第一視角教學", "First-person coaching", "第一视角教学"),
        requiredFields: ["preferredStartTime"],
      },
      {
        id: "hero-coaching",
        labels: labels("英雄教學", "Hero coaching", "英雄教学"),
        requiredFields: ["preferredStartTime"],
      },
    ],
    requiredFields: ["gameId", "otherServiceType"],
  },
];

const sharedServiceIds = serviceDefinitions.map((service) => service.id);

function makeGameConfig({
  id,
  label,
  aliases = [],
  ranks,
  lanes,
  heroPowerMarks,
  heroPowerMarkAmbiguities = {},
  serverRegions = [],
  serverCountries = [],
  devicePlatforms = [],
  heroPowerRegions = [],
  requiredQuoteFields = {},
  verificationStatus,
  source = null,
  sourceNote = null,
}) {
  return {
    id,
    labels: label,
    aliases: [...aliases],
    verificationStatus,
    source,
    sourceNote,
    ranks,
    rankDivisions: Object.fromEntries(
      ranks.filter((rank) => rank.divisions.length).map((rank) => [rank.id, [...rank.divisions]]),
    ),
    starRanges: ranks
      .filter((rank) => rank.measurement === "stars" && Number.isFinite(rank.minStars))
      .map((rank) => ({ rankId: rank.id, min: rank.minStars, max: rank.maxStars })),
    lanes,
    heroPowerMarks,
    heroPowerMarkAmbiguities,
    serverRegions,
    serverCountries,
    devicePlatforms,
    heroPowerRegions,
    requiredQuoteFields: {
      allServices: [...(requiredQuoteFields.allServices || [])],
      byService: Object.fromEntries(
        Object.entries(requiredQuoteFields.byService || {}).map(([serviceId, fields]) => [serviceId, [...fields]]),
      ),
    },
    services: [...sharedServiceIds],
  };
}

export const gameConfigs = {
  aov: makeGameConfig({
    id: "aov",
    label: labels("傳說對決", "Arena of Valor", "传说对决"),
    aliases: ["AOV", "傳說對決", "传说对决", "Arena of Valor"],
    ranks: aovRanks,
    lanes: aovLanes,
    heroPowerMarks: aovHeroPowerMarks,
    heroPowerRegions: aovHeroPowerRegions,
    requiredQuoteFields: {
      byService: {
        "hero-power": ["heroPowerRegionId"],
      },
    },
    verificationStatus: "official",
    source: "https://moba.garena.tw/news/show/5423",
    sourceNote: labels("段位及高階星數名稱依現有 Aurora 資料保留。", "Existing Aurora rank data is preserved.", "段位及高阶星数名称沿用现有 Aurora 数据。"),
  }),
  "hok-cn": makeGameConfig({
    id: "hok-cn",
    label: labels("王者榮耀國服", "Honor of Kings · China Server", "王者荣耀国服"),
    aliases: ["王者榮耀國服", "王者荣耀国服", "王者國服", "王者国服", "國服", "国服", "HOK CN", "Honor of Kings China Server", "CN Server"],
    ranks: hokChinaRanks,
    lanes: kingsLanes,
    heroPowerMarks: kingsHeroPowerMarks,
    devicePlatforms: hokChinaDevicePlatforms,
    requiredQuoteFields: {
      allServices: ["devicePlatformId"],
    },
    heroPowerMarkAmbiguities: {
      "國標": ["minor-national", "major-national"],
      "国标": ["minor-national", "major-national"],
    },
    verificationStatus: "user-reference-2026-07-14",
    sourceNote: labels("依 Aurora 提供的國服段位、星數與英雄戰力標參考圖整理。", "Compiled from Aurora-provided China-server reference images.", "根据 Aurora 提供的国服段位、星数及英雄战力标参考图整理。"),
  }),
  "hok-global": makeGameConfig({
    id: "hok-global",
    label: labels("HOK／王者榮耀國際服", "HOK / Honor of Kings · Global", "HOK／王者荣耀国际服"),
    aliases: ["HOK", "王者榮耀國際服", "王者荣耀国际服", "王者國際服", "王者国际服", "國際服", "国际服", "Honor of Kings", "Global Server"],
    ranks: hokGlobalRanks,
    lanes: kingsLanes,
    heroPowerMarks: hokGlobalHeroPowerMarks,
    serverRegions: hokGlobalServerRegions,
    serverCountries: hokGlobalServerCountries,
    requiredQuoteFields: {
      allServices: ["serverRegionId"],
    },
    heroPowerMarkAmbiguities: {
      "國標": ["minor-national", "major-national"],
      "国标": ["minor-national", "major-national"],
    },
    verificationStatus: "hok-s15-user-reference-2026-07-14",
    sourceNote: labels("依 Aurora 提供的 HOK S15 段位參考圖整理；不作賽季繼承計算。", "Compiled from Aurora's HOK S15 reference; no season inheritance calculation is performed.", "根据 Aurora 提供的 HOK S15 段位参考图整理；不作赛季继承计算。"),
  }),
};

export const supportedGameIds = Object.keys(gameConfigs);

export function getGameConfig(gameId) {
  return gameConfigs[gameId] ?? null;
}

export function getGameOptions() {
  return supportedGameIds.map((gameId) => gameConfigs[gameId]);
}

export function getGameLabel(gameId, locale = "zh-HK") {
  return localizeGameValue(getGameConfig(gameId)?.labels, locale);
}

export function getRanksForGameConfig(gameId) {
  return getGameConfig(gameId)?.ranks ?? [];
}

export function getLanesForGame(gameId) {
  return getGameConfig(gameId)?.lanes ?? [];
}

export function getLaneById(gameId, laneId) {
  return getLanesForGame(gameId).find((item) => item.id === laneId) ?? null;
}

export function getLaneLabel(gameId, laneId, locale = "zh-HK") {
  return localizeGameValue(getLaneById(gameId, laneId)?.labels, locale);
}

export function getHeroPowerMarksForGame(gameId) {
  return getGameConfig(gameId)?.heroPowerMarks ?? [];
}

export function getHeroPowerMarkById(gameId, markId) {
  return getHeroPowerMarksForGame(gameId).find((item) => item.id === markId) ?? null;
}

export function getHeroPowerMarkLabel(gameId, markId, locale = "zh-HK") {
  return localizeGameValue(getHeroPowerMarkById(gameId, markId)?.labels, locale);
}

export function getServerRegionsForGame(gameId) {
  return getGameConfig(gameId)?.serverRegions ?? [];
}

export function getServerRegionById(gameId, regionId) {
  return getServerRegionsForGame(gameId).find((item) => item.id === regionId) ?? null;
}

export function getServerRegionLabel(gameId, regionId, locale = "zh-HK") {
  return localizeGameValue(getServerRegionById(gameId, regionId)?.labels, locale);
}

export function getServerCountriesForGame(gameId) {
  return getGameConfig(gameId)?.serverCountries ?? [];
}

export function getServerCountryById(gameId, countryId) {
  return getServerCountriesForGame(gameId).find((item) => item.id === countryId) ?? null;
}

export function getServerCountryLabel(gameId, countryId, locale = "zh-HK") {
  return localizeGameValue(getServerCountryById(gameId, countryId)?.labels, locale);
}

export function getServerRegionForCountry(gameId, countryId) {
  const country = getServerCountryById(gameId, countryId);
  return country ? getServerRegionById(gameId, country.serverRegionId) : null;
}

export function getDevicePlatformsForGame(gameId) {
  return getGameConfig(gameId)?.devicePlatforms ?? [];
}

export function getDevicePlatformById(gameId, platformId) {
  return getDevicePlatformsForGame(gameId).find((item) => item.id === platformId) ?? null;
}

export function getDevicePlatformLabel(gameId, platformId, locale = "zh-HK") {
  return localizeGameValue(getDevicePlatformById(gameId, platformId)?.labels, locale);
}

export function getHeroPowerRegionsForGame(gameId) {
  return getGameConfig(gameId)?.heroPowerRegions ?? [];
}

export function getHeroPowerRegionById(gameId, regionId) {
  return getHeroPowerRegionsForGame(gameId).find((item) => item.id === regionId) ?? null;
}

export function getHeroPowerRegionLabel(gameId, regionId, locale = "zh-HK") {
  return localizeGameValue(getHeroPowerRegionById(gameId, regionId)?.labels, locale);
}

export function getRequiredQuoteFieldsForGame(gameId, serviceId) {
  const required = getGameConfig(gameId)?.requiredQuoteFields;
  if (!required) return [];
  return [
    ...(required.allServices || []),
    ...(required.byService?.[serviceId] || []),
  ];
}

export function getServicesForGame(gameId) {
  const serviceIds = getGameConfig(gameId)?.services ?? [];
  return serviceDefinitions.filter((service) => serviceIds.includes(service.id));
}

export function getCentralServiceDefinition(serviceId) {
  return serviceDefinitions.find((service) => service.id === serviceId) ?? null;
}

export function getCentralServiceLabel(serviceOrId, locale = "zh-HK") {
  const service = typeof serviceOrId === "object" && serviceOrId
    ? serviceOrId
    : getCentralServiceDefinition(serviceOrId);
  return localizeGameValue(service?.labels, locale);
}

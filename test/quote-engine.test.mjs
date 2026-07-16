import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateQuote,
  formatLineMessage,
  formatWhatsAppMessage,
  validateQuoteDraft,
} from "../src/lib/quoteEngine.js";

const shared = {
  locale: "zh-HK",
  gameId: "hok-cn",
  completionTime: "三日內",
};

const rankDraft = {
  ...shared,
  serviceId: "rank",
  currentRankId: "diamond",
  currentDivision: "III",
  currentStars: 2,
  targetRankId: "veteran",
  targetDivision: "V",
  targetStars: 1,
  express: false,
};

const peakDraft = {
  ...shared,
  serviceId: "peak",
  currentPoints: 1350,
  targetPoints: 1500,
  express: false,
};

const duoRankedDraft = {
  ...shared,
  serviceId: "duo",
  duoMode: "ranked",
  duoGuarantee: "guaranteed",
  preferredStartTime: "2026-07-16T20:00",
  currentRankId: "diamond",
  currentDivision: "III",
  currentStars: 2,
  targetRankId: "veteran",
  targetDivision: "V",
  targetStars: 1,
};

const duoMatchDraft = {
  ...shared,
  serviceId: "duo",
  duoMode: "match-5v5",
  preferredStartTime: "2026-07-16T20:00",
  quantity: 3,
};

const heroPowerDraft = {
  ...shared,
  serviceId: "hero-power",
  currentRankId: "diamond",
  currentDivision: "III",
  currentStars: 2,
  currentPoints: 1350,
  currentHeroPowerPoints: 2200,
  targetHeroPowerPoints: 5000,
  preferredHero: "鏡",
  heroPowerMarkId: "minor-national",
  express: false,
};

const otherDraft = {
  ...shared,
  serviceId: "other",
  otherServiceType: "review-coaching",
  preferredStartTime: "2026-07-16T20:00",
  additionalRequirements: "希望分析兩場排位錄影",
};

const minimalDrafts = {
  rank: rankDraft,
  peak: peakDraft,
  "duo-ranked": duoRankedDraft,
  "duo-match": duoMatchDraft,
  "hero-power": heroPowerDraft,
  other: otherDraft,
};

test("WhatsApp and LINE use the same authoritative quote message", () => {
  const quote = calculateQuote(duoMatchDraft, { reference: "AUR-LINE-SAME-COPY" });
  const whatsapp = formatWhatsAppMessage(quote, "zh-HK");
  const line = formatLineMessage(quote, "zh-HK");

  assert.equal(line, whatsapp);
  assert.match(line, /AUR-LINE-SAME-COPY/);
  assert.match(line, /HK\$/);
});

function withoutField(draft, field) {
  const copy = { ...draft };
  delete copy[field];
  return copy;
}

test("all five services accept their minimum complete field sets and use only configured prices", () => {
  const automatic = new Set(["rank", "duo-ranked", "duo-match", "other"]);
  for (const [name, draft] of Object.entries(minimalDrafts)) {
    const validation = validateQuoteDraft(draft);
    assert.equal(validation.valid, true, `${name}: ${validation.errors.join(" ")}`);

    const quote = calculateQuote(draft, { reference: `AUR-TEST-${name.toUpperCase()}` });
    assert.equal(quote.status, automatic.has(name) ? "quoted" : "manual_review", `${name} status`);
    if (!automatic.has(name)) assert.equal(quote.finalTotal, null, `${name} must not expose a total`);
  }
});

test("each service rejects every missing field from its active field set", () => {
  const cases = [
    {
      name: "rank",
      draft: rankDraft,
      fields: [
        "currentRankId",
        "currentDivision",
        "currentStars",
        "targetRankId",
        "targetDivision",
        "targetStars",
      ],
    },
    {
      name: "peak",
      draft: peakDraft,
      fields: ["currentPoints", "targetPoints"],
    },
    {
      name: "duo ranked",
      draft: duoRankedDraft,
      fields: [
        "duoMode",
        "currentRankId",
        "currentDivision",
        "currentStars",
        "targetRankId",
        "targetDivision",
        "targetStars",
        "duoGuarantee",
        "preferredStartTime",
      ],
    },
    {
      name: "duo 5V5",
      draft: duoMatchDraft,
      fields: ["duoMode", "quantity", "preferredStartTime"],
    },
    {
      name: "hero power",
      draft: heroPowerDraft,
      fields: [
        "currentRankId",
        "currentDivision",
        "currentStars",
        "currentPoints",
        "currentHeroPowerPoints",
        "targetHeroPowerPoints",
        "preferredHero",
        "heroPowerMarkId",
      ],
    },
    {
      name: "other",
      draft: otherDraft,
      fields: ["otherServiceType", "preferredStartTime"],
    },
  ];

  for (const { name, draft, fields } of cases) {
    for (const field of fields) {
      const validation = validateQuoteDraft(withoutField(draft, field));
      assert.equal(validation.valid, false, `${name}.${field} should be required`);
      assert.ok(
        validation.missingFields.includes(field),
        `${name}.${field} was not reported missing: ${validation.missingFields.join(", ")}`,
      );
    }
  }
});

test("duo modes validate only their own dynamic fields", () => {
  assert.equal(validateQuoteDraft(duoRankedDraft).valid, true);
  assert.equal(validateQuoteDraft(duoMatchDraft).valid, true);

  const rankedWithoutQuantity = validateQuoteDraft({ ...duoRankedDraft, quantity: null });
  assert.equal(rankedWithoutQuantity.valid, true);
  assert.ok(!rankedWithoutQuantity.missingFields.includes("quantity"));

  const matchWithoutRank = validateQuoteDraft({
    ...duoMatchDraft,
    currentRankId: null,
    targetRankId: null,
  });
  assert.equal(matchWithoutRank.valid, true);
  assert.ok(!matchWithoutRank.missingFields.includes("currentRankId"));
  assert.ok(!matchWithoutRank.missingFields.includes("targetRankId"));

  const invalidMode = validateQuoteDraft({ ...duoMatchDraft, duoMode: "voice" });
  assert.equal(invalidMode.valid, false);
  assert.ok(invalidMode.invalidFields.includes("duoMode"));

  const beforeModeSelection = validateQuoteDraft({
    ...duoMatchDraft,
    duoMode: null,
    preferredStartTime: "",
  });
  assert.ok(beforeModeSelection.missingFields.includes("duoMode"));
  assert.ok(!beforeModeSelection.missingFields.includes("preferredStartTime"));

  const afterModeSelection = validateQuoteDraft({
    ...duoMatchDraft,
    preferredStartTime: "",
  });
  assert.ok(afterModeSelection.missingFields.includes("preferredStartTime"));

  const oneMatch = validateQuoteDraft({ ...duoMatchDraft, quantity: 1 });
  assert.equal(oneMatch.valid, true);
});

test("duo WhatsApp summary uses the appointment start time instead of completion time", () => {
  const message = formatWhatsAppMessage(calculateQuote(duoMatchDraft), "zh-HK");
  assert.ok(message.includes("預約開始時間:"));
  assert.ok(message.includes("2026"));
  assert.ok(!message.includes("預計完成時間:"));
});

test("all three other-service subcategories validate and retain their selected label", () => {
  const options = [
    ["review-coaching", "復盤教學"],
    ["discord-recorded-review", "第一視角教學"],
    ["hero-coaching", "英雄教學"],
  ];

  for (const [otherServiceType, expectedLabel] of options) {
    const draft = { ...otherDraft, otherServiceType };
    const validation = validateQuoteDraft(draft);
    assert.equal(validation.valid, true, `${otherServiceType}: ${validation.errors.join(" ")}`);
    const message = formatWhatsAppMessage(
      calculateQuote(draft, { reference: `AUR-TEST-${otherServiceType}` }),
      "zh-HK",
    );
    assert.ok(message.includes(expectedLabel));
    assert.ok(message.includes("HK$37.5"));
  }

  const invalid = validateQuoteDraft({ ...otherDraft, otherServiceType: "voice" });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.invalidFields.includes("otherServiceType"));
});

test("hero-power score fields are required, non-negative and strictly increase", () => {
  assert.equal(validateQuoteDraft(heroPowerDraft).valid, true);

  for (const field of ["currentPoints", "currentHeroPowerPoints", "targetHeroPowerPoints"]) {
    const missing = validateQuoteDraft(withoutField(heroPowerDraft, field));
    assert.equal(missing.valid, false);
    assert.ok(missing.missingFields.includes(field));
  }

  const negative = validateQuoteDraft({ ...heroPowerDraft, currentHeroPowerPoints: -1 });
  assert.equal(negative.valid, false);
  assert.ok(negative.invalidFields.includes("currentHeroPowerPoints"));

  for (const targetHeroPowerPoints of [2200, 2100]) {
    const notHigher = validateQuoteDraft({ ...heroPowerDraft, targetHeroPowerPoints });
    assert.equal(notHigher.valid, false);
    assert.ok(notHigher.invalidFields.includes("targetHeroPowerPoints"));
    assert.ok(notHigher.errorCodes.includes("targetHeroPowerMustBeHigher"));
  }
});

test("hero-power marks remain isolated across all three games", () => {
  const validDrafts = [
    { ...heroPowerDraft, gameId: "aov", currentDivision: "III", heroPowerMarkId: "green" },
    { ...heroPowerDraft, gameId: "hok-cn", heroPowerMarkId: "minor-national" },
    { ...heroPowerDraft, gameId: "hok-global", heroPowerMarkId: "red" },
  ];
  for (const draft of validDrafts) {
    const validation = validateQuoteDraft(draft);
    assert.equal(validation.valid, true, `${draft.gameId}: ${validation.errors.join(" ")}`);
  }

  for (const draft of [
    { ...heroPowerDraft, gameId: "aov", currentDivision: "III", heroPowerMarkId: "minor-national" },
    { ...heroPowerDraft, gameId: "hok-cn", heroPowerMarkId: "green" },
    { ...heroPowerDraft, gameId: "hok-global", heroPowerMarkId: "server-wide" },
  ]) {
    const validation = validateQuoteDraft(draft);
    assert.equal(validation.valid, false);
    assert.ok(validation.invalidFields.includes("heroPowerMarkId"));
  }
});

test("rank and peak reject lanes belonging to another game", () => {
  const aovRankWrongLane = validateQuoteDraft({
    ...rankDraft,
    gameId: "aov",
    preferredRole: "clash-lane",
  });
  assert.equal(aovRankWrongLane.valid, false);
  assert.ok(aovRankWrongLane.invalidFields.includes("preferredRole"));

  const chinaPeakWrongLane = validateQuoteDraft({
    ...peakDraft,
    preferredRole: "slayer-lane",
  });
  assert.equal(chinaPeakWrongLane.valid, false);
  assert.ok(chinaPeakWrongLane.invalidFields.includes("preferredRole"));
});

test("king rank star values stay inside the selected game range", () => {
  const valid = validateQuoteDraft({
    ...rankDraft,
    currentRankId: "strongest-king",
    currentDivision: null,
    currentStars: 8,
    targetRankId: "strongest-king",
    targetDivision: null,
    targetStars: 9,
  });
  assert.equal(valid.valid, true, valid.errors.join(" "));

  const invalid = validateQuoteDraft({
    ...rankDraft,
    currentRankId: "strongest-king",
    currentDivision: null,
    currentStars: 50,
    targetRankId: "strongest-king",
    targetDivision: null,
    targetStars: 51,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errorCodes.includes("invalidStarRange"));
});

test("WhatsApp hero-power summary includes new score fields and excludes stale hidden fields", () => {
  const draftWithStaleFields = {
    ...heroPowerDraft,
    targetRankId: "veteran",
    targetDivision: "V",
    targetStars: 987654,
    targetPoints: 876543,
    quantity: 765432,
    preferredRole: "jungle",
    duoMode: "match-5v5",
    otherServiceType: "review-coaching",
    additionalRequirements: "HIDDEN-HERO-POWER-REQUIREMENT",
  };
  const quote = calculateQuote(draftWithStaleFields, { reference: "AUR-TEST-WA-HERO" });
  const message = formatWhatsAppMessage(quote, "zh-HK");

  for (const expected of [
    "遊戲: 王者榮耀國服",
    "服務: 英雄戰力標",
    "目前段位: 永恆鑽石 III 2★",
    "目前巔峰賽分數: 1350",
    "目前英雄戰力分數: 2200",
    "目標英雄戰力分數: 5000",
    "指定英雄: 鏡",
    "英雄戰力標: 小國標",
    "其他要求: HIDDEN-HERO-POWER-REQUIREMENT",
    "報價狀態: 待人工確認",
  ]) {
    assert.ok(message.includes(expected), `missing WhatsApp row: ${expected}\n${message}`);
  }

  for (const hidden of [
    "目標段位:",
    "指定位置／分路:",
    "所需數量:",
    "987654",
    "876543",
    "765432",
  ]) {
    assert.ok(!message.includes(hidden), `hidden hero-power field leaked: ${hidden}`);
  }
  assert.ok(!message.includes("HK$"));
});

test("dynamic service summaries do not leak fields from inactive branches", () => {
  const rankedMessage = formatWhatsAppMessage(calculateQuote({
    ...duoRankedDraft,
    quantity: 987654,
    otherServiceType: "hero-coaching",
    additionalRequirements: "HIDDEN-RANKED-DUO",
  }), "zh-HK");
  assert.ok(rankedMessage.includes("排位"));
  assert.ok(rankedMessage.includes("目前段位:"));
  assert.ok(!rankedMessage.includes("所需數量:"));
  assert.ok(!rankedMessage.includes("987654"));
  assert.ok(rankedMessage.includes("其他要求: HIDDEN-RANKED-DUO"));

  const matchMessage = formatWhatsAppMessage(calculateQuote({
    ...duoMatchDraft,
    currentRankId: "diamond",
    currentDivision: "III",
    currentStars: 987653,
    targetRankId: "veteran",
    targetDivision: "V",
    targetStars: 987652,
    preferredHero: "HIDDEN-MATCH-HERO",
  }), "zh-HK");
  assert.ok(matchMessage.includes("5V5 匹配"));
  assert.ok(matchMessage.includes("所需數量: 3"));
  assert.ok(!matchMessage.includes("目前段位:"));
  assert.ok(!matchMessage.includes("目標段位:"));
  assert.ok(!matchMessage.includes("HIDDEN-MATCH-HERO"));

  const otherMessage = formatWhatsAppMessage(calculateQuote({
    ...otherDraft,
    currentRankId: "diamond",
    currentDivision: "III",
    currentStars: 987651,
    currentPoints: 987650,
    preferredHero: "HIDDEN-OTHER-HERO",
    express: true,
  }), "zh-HK");
  assert.ok(otherMessage.includes("復盤教學"));
  assert.ok(otherMessage.includes(otherDraft.additionalRequirements));
  assert.ok(!otherMessage.includes("目前段位:"));
  assert.ok(!otherMessage.includes("987651"));
  assert.ok(!otherMessage.includes("987650"));
  assert.ok(!otherMessage.includes("HIDDEN-OTHER-HERO"));
  assert.ok(!otherMessage.includes("加急服務:"));
});

test("contact summaries localize service-specific field labels", () => {
  const duoMessage = formatWhatsAppMessage(
    calculateQuote(duoMatchDraft, { reference: "AUR-TEST-DUO-LABEL" }),
    "zh-HK",
  );
  assert.match(duoMessage, /陪玩模式: 5V5 匹配/);
  assert.doesNotMatch(duoMessage, /quote\.fields\.duoMode/);

  const otherMessage = formatWhatsAppMessage(
    calculateQuote(otherDraft, { reference: "AUR-TEST-OTHER-LABEL" }),
    "zh-HK",
  );
  assert.match(otherMessage, /其他服務類型:/);
  assert.doesNotMatch(otherMessage, /quote\.fields\.otherServiceType/);
});

test("approved AOV rank pricing accumulates divisions, star bands and minimum order after surcharges", () => {
  const oneDivision = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "rank",
    currentRankId: "bronze",
    currentDivision: "III",
    currentStars: 0,
    targetRankId: "bronze",
    targetDivision: "II",
    targetStars: 0,
    completionTime: "三日內",
    express: true,
  }, { reference: "AUR-AOV-MINIMUM" });
  assert.equal(oneDivision.status, "quoted");
  assert.equal(oneDivision.basePrice, 20);
  assert.equal(oneDivision.finalTotal, 42.5);

  const crossDivision = calculateQuote({
    ...oneDivision.draft,
    currentRankId: "bronze",
    currentDivision: "III",
    targetRankId: "silver",
    targetDivision: "III",
    express: false,
  }, { reference: "AUR-AOV-DIVISIONS" });
  assert.equal(crossDivision.basePrice, 70); // 20 + 25 + 25
  assert.equal(crossDivision.finalTotal, 59.5);

  const tenthStar = calculateQuote({
    ...oneDivision.draft,
    currentRankId: "battlefield-legend",
    currentDivision: null,
    currentStars: 9,
    targetRankId: "pioneer-light",
    targetDivision: null,
    targetStars: 10,
    express: false,
  }, { reference: "AUR-AOV-STAR-10" });
  assert.equal(tenthStar.basePrice, 25);
  assert.equal(tenthStar.finalTotal, 42.5);
});

test("approved AOV ranked and match duo pricing follows guarantee multipliers and whole-order discount", () => {
  const ranked = {
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "duo",
    duoMode: "ranked",
    preferredStartTime: "2026-07-20T20:00",
    currentRankId: "bronze",
    currentDivision: "III",
    currentStars: 0,
    targetRankId: "silver",
    targetDivision: "III",
    targetStars: 0,
  };
  const guaranteed = calculateQuote({ ...ranked, duoGuarantee: "guaranteed" });
  const standard = calculateQuote({ ...ranked, duoGuarantee: "standard" });
  assert.equal(guaranteed.status, "quoted");
  assert.equal(guaranteed.finalTotal, 74.38); // 70 × 1.25 × 0.85
  assert.equal(standard.finalTotal, 53.55); // 70 × 0.90 × 0.85

  const tenMatches = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "duo",
    duoMode: "match-5v5",
    preferredStartTime: "2026-07-20T20:00",
    quantity: 10,
  });
  assert.equal(tenMatches.status, "quoted");
  assert.equal(tenMatches.basePrice, 250);
  assert.equal(tenMatches.discount, 25);
  assert.equal(tenMatches.finalTotal, 191.25);

  const oneMatch = validateQuoteDraft({ ...tenMatches.draft, quantity: 1 });
  assert.equal(oneMatch.valid, true);
});

test("all approved timed teaching options quote the same booking payment", () => {
  const review = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "other",
    otherServiceType: "review-coaching",
    preferredStartTime: "2026-07-20T20:00",
    additionalRequirements: "Discord 1 對 1 講解地圖觀念",
  });
  assert.equal(review.status, "quoted");
  assert.equal(review.amountType, "booking-deposit");
  assert.equal(review.finalTotal, 31.88);
  assert.equal(review.unitPrice, 2.5);
  assert.equal(review.minimumMinutes, 15);

  const discord = calculateQuote({
    ...review.draft,
    otherServiceType: "discord-recorded-review",
  });
  const hero = calculateQuote({ ...review.draft, otherServiceType: "hero-coaching" });
  assert.equal(discord.status, "quoted");
  assert.equal(discord.finalTotal, 31.88);
  assert.equal(hero.status, "quoted");
  assert.equal(hero.finalTotal, 31.88);
});

test("China-server and HOK Global use the approved 85% and 80% rounded rank tables", () => {
  const draft = {
    locale: "zh-HK",
    serviceId: "rank",
    currentRankId: "diamond",
    currentDivision: "V",
    currentStars: 0,
    targetRankId: "diamond",
    targetDivision: "III",
    targetStars: 0,
    completionTime: "三日內",
    express: false,
  };
  const china = calculateQuote({ ...draft, gameId: "hok-cn" });
  const global = calculateQuote({ ...draft, gameId: "hok-global" });
  assert.equal(china.status, "quoted");
  assert.equal(china.basePrice, 130);
  assert.equal(china.finalTotal, 110.5);
  assert.equal(global.status, "quoted");
  assert.equal(global.basePrice, 120);
  assert.equal(global.finalTotal, 102);

  const chinaTenthStar = calculateQuote({
    ...draft,
    gameId: "hok-cn",
    currentRankId: "strongest-king",
    currentDivision: null,
    currentStars: 9,
    targetRankId: "extraordinary-king",
    targetDivision: null,
    targetStars: 10,
  });
  assert.equal(chinaTenthStar.basePrice, 20);
  assert.equal(chinaTenthStar.finalTotal, 42.5);
});

test("China-server and HOK Global duo and teaching rules share the approved structure", () => {
  for (const gameId of ["hok-cn", "hok-global"]) {
    const matches = calculateQuote({
      locale: "zh-HK",
      gameId,
      serviceId: "duo",
      duoMode: "match-5v5",
      preferredStartTime: "2026-07-20T20:00",
      quantity: 10,
    });
    assert.equal(matches.basePrice, 200);
    assert.equal(matches.discount, 20);
    assert.equal(matches.finalTotal, 153);

    for (const otherServiceType of ["review-coaching", "discord-recorded-review", "hero-coaching"]) {
      const teaching = calculateQuote({
        locale: "zh-HK",
        gameId,
        serviceId: "other",
        otherServiceType,
        preferredStartTime: "2026-07-20T20:00",
        additionalRequirements: "測試教學需要",
      });
      assert.equal(teaching.status, "quoted");
      assert.equal(teaching.finalTotal, 31.88);
    }
  }
});

test("newcomer discount is applied after service rules and minimums", () => {
  const minimumRank = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "rank",
    currentRankId: "bronze",
    currentDivision: "III",
    currentStars: 0,
    targetRankId: "bronze",
    targetDivision: "II",
    targetStars: 0,
    completionTime: "三日內",
    express: false,
    displayCurrency: "HKD",
  });

  assert.equal(minimumRank.status, "quoted");
  assert.equal(minimumRank.sourceSubtotal, 50);
  assert.equal(minimumRank.sourceFinalTotal, 42.5);
  assert.equal(minimumRank.newCustomerDiscount, 7.5);
  assert.equal(minimumRank.finalTotal, 42.5);

  const tenMatches = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "duo",
    duoMode: "match-5v5",
    preferredStartTime: "2026-07-20T20:00",
    quantity: 10,
    displayCurrency: "HKD",
  });

  assert.equal(tenMatches.serviceDiscount, 25);
  assert.equal(tenMatches.sourceFinalTotal, 191.25);
  assert.equal(tenMatches.newCustomerDiscount, 33.75);
  assert.equal(tenMatches.finalTotal, 191.25);
});

test("configured quotes convert only after HKD pricing is complete", () => {
  const twd = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "duo",
    duoMode: "match-5v5",
    preferredStartTime: "2026-07-20T20:00",
    quantity: 10,
    displayCurrency: "TWD",
  });
  assert.equal(twd.sourceCurrency, "HKD");
  assert.equal(twd.displayCurrency, "TWD");
  assert.equal(twd.exchangeRate, 4.25);
  assert.equal(twd.sourceFinalTotal, 191.25);
  assert.equal(twd.finalTotal, 812.81);

  const cny = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "duo",
    duoMode: "match-5v5",
    preferredStartTime: "2026-07-20T20:00",
    quantity: 1,
    displayCurrency: "CNY",
  });
  assert.equal(cny.status, "quoted");
  assert.equal(cny.finalTotal, 21.25);
});

test("manual-review quotes never expose invented converted amounts", () => {
  const quote = calculateQuote({
    ...heroPowerDraft,
    displayCurrency: "TWD",
  });
  assert.equal(quote.status, "manual_review");
  assert.equal(quote.displayCurrency, "TWD");
  assert.equal(quote.basePrice, null);
  assert.equal(quote.newCustomerDiscount, null);
  assert.equal(quote.finalTotal, null);
});

test("additional requirements are optional for every service and omitted when blank", () => {
  const blank = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "other",
    otherServiceType: "review-coaching",
    preferredStartTime: "2026-07-20T20:00",
    additionalRequirements: "   ",
  });
  assert.equal(blank.status, "quoted");
  assert.doesNotMatch(formatWhatsAppMessage(blank, "zh-HK"), /其他要求:/);

  const detailed = calculateQuote({
    locale: "zh-HK",
    gameId: "aov",
    serviceId: "rank",
    currentRankId: "bronze",
    currentDivision: "III",
    currentStars: 0,
    targetRankId: "bronze",
    targetDivision: "II",
    targetStars: 0,
    additionalRequirements: "希望使用指定英雄",
  });
  assert.equal(detailed.status, "quoted");
  assert.match(formatWhatsAppMessage(detailed, "zh-HK"), /其他要求: 希望使用指定英雄/);
});

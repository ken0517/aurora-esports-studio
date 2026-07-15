import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateQuote,
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

function withoutField(draft, field) {
  const copy = { ...draft };
  delete copy[field];
  return copy;
}

test("all five services accept their minimum complete field sets and require human review", () => {
  for (const [name, draft] of Object.entries(minimalDrafts)) {
    const validation = validateQuoteDraft(draft);
    assert.equal(validation.valid, true, `${name}: ${validation.errors.join(" ")}`);

    const quote = calculateQuote(draft, { reference: `AUR-TEST-${name.toUpperCase()}` });
    assert.equal(quote.status, "manual_review", `${name} must not invent a price`);
    assert.equal(quote.finalTotal, null, `${name} must not expose a total`);
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
        "completionTime",
        "express",
      ],
    },
    {
      name: "peak",
      draft: peakDraft,
      fields: ["currentPoints", "targetPoints", "completionTime", "express"],
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
        "completionTime",
      ],
    },
    {
      name: "duo 5V5",
      draft: duoMatchDraft,
      fields: ["duoMode", "quantity", "completionTime"],
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
        "completionTime",
        "express",
      ],
    },
    {
      name: "other",
      draft: otherDraft,
      fields: ["otherServiceType", "additionalRequirements", "completionTime"],
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
});

test("all three other-service subcategories validate and retain their selected label", () => {
  const options = [
    ["review-coaching", "復盤教學"],
    ["discord-recorded-review", "Discord 錄屏"],
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
    assert.ok(message.includes("待人工確認"));
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
    "預計完成時間: 三日內",
    "加急服務: 否",
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
    "HIDDEN-HERO-POWER-REQUIREMENT",
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
  assert.ok(!rankedMessage.includes("HIDDEN-RANKED-DUO"));

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

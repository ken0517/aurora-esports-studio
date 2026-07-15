import test from "node:test";
import assert from "node:assert/strict";

import {
  gameConfigs,
  getHeroPowerMarksForGame,
  getLanesForGame,
  getRanksForGameConfig,
  localizeGameValue,
  serviceDefinitions,
} from "../src/data/gameConfig.js";
import { getRanksForGame } from "../src/data/ranks.js";

const zh = (items) => items.map((item) => localizeGameValue(item.labels, "zh-HK"));

test("each game exposes the complete central configuration shape", () => {
  for (const config of Object.values(gameConfigs)) {
    for (const key of ["aliases", "ranks", "rankDivisions", "starRanges", "lanes", "heroPowerMarks", "services"]) {
      assert.ok(Object.hasOwn(config, key), `${config.id} is missing ${key}`);
    }
    assert.strictEqual(getRanksForGame(config.id), getRanksForGameConfig(config.id));
  }
});

test("game aliases identify HOK as global without leaking into China server", () => {
  assert.ok(gameConfigs["hok-global"].aliases.includes("HOK"));
  assert.ok(!gameConfigs["hok-cn"].aliases.includes("HOK"));
  assert.ok(gameConfigs["hok-cn"].aliases.includes("國服"));
  assert.ok(gameConfigs["hok-global"].aliases.includes("國際服"));
});

test("lanes are isolated by game", () => {
  assert.deepEqual(zh(getLanesForGame("aov")), ["凱撒路", "打野", "中路", "魔龍路", "輔助"]);
  assert.deepEqual(zh(getLanesForGame("hok-cn")), ["對抗路", "打野", "中路", "發育路", "輔助"]);
  assert.deepEqual(zh(getLanesForGame("hok-global")), ["對抗路", "打野", "中路", "發育路", "輔助"]);
  assert.ok(!zh(getLanesForGame("aov")).includes("對抗路"));
  assert.ok(!zh(getLanesForGame("hok-cn")).includes("凱撒路"));
  assert.ok(!zh(getLanesForGame("hok-global")).includes("魔龍路"));
});

test("hero power marks are isolated by game", () => {
  assert.deepEqual(zh(getHeroPowerMarksForGame("aov")), ["綠標", "藍標", "紫標", "紅標", "全服標"]);
  assert.deepEqual(zh(getHeroPowerMarksForGame("hok-cn")), ["銅標", "銀標", "金標", "小國標", "大國標"]);
  assert.deepEqual(zh(getHeroPowerMarksForGame("hok-global")), ["銅標", "銀標", "金標", "小國標", "大國標", "紅標"]);
  assert.ok(!JSON.stringify(gameConfigs).includes("全副標"));
});

test("China-server ranks and star ranges match the supplied reference", () => {
  const ranks = gameConfigs["hok-cn"].ranks;
  assert.deepEqual(zh(ranks), [
    "倔強青銅", "秩序白銀", "榮耀黃金", "尊貴鉑金", "永恆鑽石", "至尊星耀",
    "最強王者", "非凡王者", "無雙王者", "絕世王者", "至聖王者", "榮耀王者", "傳奇王者",
  ]);
  assert.deepEqual(gameConfigs["hok-cn"].rankDivisions, {
    bronze: ["III", "II", "I"],
    silver: ["III", "II", "I"],
    gold: ["IV", "III", "II", "I"],
    platinum: ["IV", "III", "II", "I"],
    diamond: ["V", "IV", "III", "II", "I"],
    veteran: ["V", "IV", "III", "II", "I"],
  });
  assert.deepEqual(gameConfigs["hok-cn"].starRanges, [
    { rankId: "strongest-king", min: 0, max: 9 },
    { rankId: "extraordinary-king", min: 10, max: 19 },
    { rankId: "peerless-king", min: 20, max: 29 },
    { rankId: "unrivalled-king", min: 30, max: 39 },
    { rankId: "sacred-king", min: 40, max: 49 },
    { rankId: "glory-king", min: 50, max: 99 },
    { rankId: "legendary-king", min: 100, max: null },
  ]);
  const removedTraditionalPlaceholder = ["待", "核", "實"].join("");
  const removedSimplifiedPlaceholder = ["待", "核", "实"].join("");
  assert.ok(!JSON.stringify(ranks).includes(removedTraditionalPlaceholder));
  assert.ok(!JSON.stringify(ranks).includes(removedSimplifiedPlaceholder));
});

test("HOK S15 ranks remain separate from China-server ranks", () => {
  const config = gameConfigs["hok-global"];
  assert.deepEqual(zh(config.ranks), [
    "倔強青銅", "秩序白銀", "榮耀黃金", "尊貴鉑金", "永恆鑽石", "至尊星耀",
    "最強王者", "最強／無雙王者過渡區間", "無雙王者", "榮耀王者", "傳奇王者",
  ]);
  assert.deepEqual(config.starRanges, [
    { rankId: "strongest-king", min: 0, max: 19 },
    { rankId: "strongest-peerless-transition", min: 20, max: 29 },
    { rankId: "peerless-king", min: 30, max: 49 },
    { rankId: "glory-king", min: 50, max: 99 },
    { rankId: "legendary-king", min: 100, max: null },
  ]);
  assert.notDeepEqual(config.starRanges, gameConfigs["hok-cn"].starRanges);
});

test("the service replacement is central and removes the old training service", () => {
  const expectedServiceIds = ["rank", "peak", "duo", "hero-power", "other"];
  assert.deepEqual(serviceDefinitions.map((service) => service.id), expectedServiceIds);
  for (const config of Object.values(gameConfigs)) {
    assert.deepEqual(config.services, expectedServiceIds, `${config.id} has a different service order`);
  }

  for (const removedServiceId of ["voice", "review", "hero", "discord", "package", "one-v-one"]) {
    assert.ok(
      !serviceDefinitions.some((service) => service.id === removedServiceId),
      `${removedServiceId} should not remain as a top-level service`,
    );
  }
  assert.equal(
    localizeGameValue(serviceDefinitions.find((service) => service.id === "hero-power")?.labels, "zh-HK"),
    "英雄戰力標",
  );
});

test("duo service exposes exactly the ranked and 5V5 match modes", () => {
  const duo = serviceDefinitions.find((service) => service.id === "duo");
  assert.ok(duo);
  assert.equal(duo.voiceRequired, false);
  assert.ok(duo.aliases.includes("陪玩"));
  assert.deepEqual(duo.modes.map((mode) => mode.id), ["ranked", "match-5v5"]);
  assert.deepEqual(duo.modes[0].requiredFields, [
    "currentRankId",
    "currentStars",
    "targetRankId",
    "targetStars",
  ]);
  assert.deepEqual(duo.modes[1].requiredFields, ["quantity"]);
});

test("other service contains exactly the three supported subcategories", () => {
  const other = serviceDefinitions.find((service) => service.id === "other");
  assert.ok(other);
  assert.equal(other.manualOnly, true);
  assert.deepEqual(other.options.map((option) => option.id), [
    "review-coaching",
    "discord-recorded-review",
    "hero-coaching",
  ]);
  assert.deepEqual(
    zh(other.options),
    ["復盤教學", "Discord 錄屏", "英雄教學"],
  );
});

test("five service definitions expose the expected central field contracts", () => {
  const requiredFields = Object.fromEntries(
    serviceDefinitions.map((service) => [service.id, service.requiredFields]),
  );
  assert.deepEqual(requiredFields, {
    rank: [
      "gameId",
      "currentRankId",
      "currentStars",
      "targetRankId",
      "targetStars",
      "completionTime",
      "express",
    ],
    peak: ["gameId", "currentPoints", "targetPoints", "completionTime", "express"],
    duo: ["gameId", "duoMode", "completionTime"],
    "hero-power": [
      "gameId",
      "currentRankId",
      "currentStars",
      "currentPoints",
      "currentHeroPowerPoints",
      "targetHeroPowerPoints",
      "preferredHero",
      "heroPowerMarkId",
      "completionTime",
      "express",
    ],
    other: ["gameId", "otherServiceType", "additionalRequirements", "completionTime"],
  });
});

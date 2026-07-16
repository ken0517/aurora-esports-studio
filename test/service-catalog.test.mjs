import test from "node:test";
import assert from "node:assert/strict";

import {
  gameConfigs,
  localizeGameValue,
  serviceDefinitions,
} from "../src/data/gameConfig.js";
import { pricingCatalog } from "../src/data/pricing.js";
import { translate } from "../src/data/translations.js";
import {
  editorialServiceCatalog,
  getEditorialServicesForGame,
  getServiceEditorialText,
  serviceEditorialGames,
} from "../src/data/serviceCatalog.js";

const expectedServiceIds = ["rank", "peak", "duo", "hero-power", "other"];
const locales = ["zh-HK", "en", "zh-CN"];

test("all locales expose the LINE quote handoff labels", () => {
  for (const locale of locales) {
    assert.notEqual(translate(locale, "quote.actions.line"), "quote.actions.line");
    assert.notEqual(translate(locale, "quote.actions.lineCopied"), "quote.actions.lineCopied");
    assert.notEqual(translate(locale, "quote.actions.lineCopyFailed"), "quote.actions.lineCopyFailed");
  }
});

test("central, public and pricing catalogues share the same five-service order", () => {
  assert.deepEqual(serviceDefinitions.map((service) => service.id), expectedServiceIds);
  assert.deepEqual(editorialServiceCatalog.map((service) => service.id), expectedServiceIds);

  for (const [gameId, config] of Object.entries(gameConfigs)) {
    assert.deepEqual(config.services, expectedServiceIds, `${gameId} central services drifted`);
    assert.deepEqual(
      Object.keys(pricingCatalog.games[gameId]),
      expectedServiceIds,
      `${gameId} pricing rules drifted`,
    );
    assert.deepEqual(
      getEditorialServicesForGame(gameId).map((service) => service.id),
      expectedServiceIds,
      `${gameId} public services drifted`,
    );
  }
});

test("all five public services support all three games and have complete localised copy", () => {
  const gameIds = serviceEditorialGames.map((game) => game.id);
  assert.deepEqual(gameIds, Object.keys(gameConfigs));

  for (const service of editorialServiceCatalog) {
    assert.deepEqual(service.games, gameIds, `${service.id} does not support all games`);
    for (const locale of locales) {
      assert.ok(getServiceEditorialText(service.category, locale).trim(), `${service.id}.${locale} category is empty`);
      assert.ok(getServiceEditorialText(service.title, locale).trim(), `${service.id}.${locale} title is empty`);
      assert.ok(getServiceEditorialText(service.description, locale).trim(), `${service.id}.${locale} description is empty`);
    }
  }
});

test("other public subcategories exactly mirror the central service options", () => {
  const centralOther = serviceDefinitions.find((service) => service.id === "other");
  const publicOther = editorialServiceCatalog.find((service) => service.id === "other");
  assert.ok(centralOther);
  assert.ok(publicOther);
  assert.deepEqual(
    publicOther.options.map((option) => option.id),
    centralOther.options.map((option) => option.id),
  );

  for (const locale of locales) {
    assert.deepEqual(
      publicOther.options.map((option) => getServiceEditorialText(option.title, locale)),
      centralOther.options.map((option) => localizeGameValue(option.labels, locale)),
    );
  }
});

test("retired top-level services cannot reappear in the public catalogue", () => {
  const publicIds = new Set(editorialServiceCatalog.map((service) => service.id));
  for (const retiredId of ["voice", "review", "hero", "discord", "package", "one-to-one-guidance"] ) {
    assert.equal(publicIds.has(retiredId), false, `${retiredId} reappeared as a top-level service`);
  }
});

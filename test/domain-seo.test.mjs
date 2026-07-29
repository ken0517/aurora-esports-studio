import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const officialOrigin = "https://auroraesportstudio.com";
const expectedOrganizationProfiles = [
  "https://www.instagram.com/ken._0517",
  "https://discord.gg/ZW9mwQRQud",
  "https://line.me/ti/p/wWXCT-txMc",
];

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

function extractJsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (match) => JSON.parse(match[1]),
  );
}

test("public SEO metadata uses the official Aurora domain", async () => {
  const html = await read("index.html");

  assert.match(html, /<link rel="canonical" href="https:\/\/auroraesportstudio\.com\/" \/>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/auroraesportstudio\.com\/" \/>/);
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/auroraesportstudio\.com\/assets\/generated\/aurora-cinematic\.webp" \/>/,
  );
  assert.match(html, /"url": "https:\/\/auroraesportstudio\.com\/"/);
  assert.match(
    html,
    /"image": "https:\/\/auroraesportstudio\.com\/assets\/generated\/aurora-cinematic\.webp"/,
  );
  assert.doesNotMatch(html, /ken0517\.github\.io\/aurora-esports-studio/);
});

test("homepage schema gives KLG, Aurora, and the official website their distinct roles", async () => {
  const home = await read("index.html");

  const homeGraph = extractJsonLd(home).flatMap((item) => item["@graph"] ?? [item]);
  const brands = homeGraph.filter((item) => item["@type"] === "Brand");
  const organizations = homeGraph.filter((item) => item["@type"] === "Organization");
  const websites = homeGraph.filter((item) => item["@type"] === "WebSite");

  assert.equal(brands.length, 1);
  assert.equal(brands[0].name, "KLG Studio");
  assert.equal(brands[0]["@id"], "https://auroraesportstudio.com/#brand");
  assert.equal(organizations.length, 1);
  assert.equal(organizations[0].name, "Aurora Esports Studio");
  assert.equal(organizations[0]["@id"], "https://auroraesportstudio.com/#organization");
  assert.equal(Object.hasOwn(organizations[0], "alternateName"), false);
  assert.deepEqual(organizations[0].sameAs, expectedOrganizationProfiles);
  assert.deepEqual(organizations[0].areaServed, ["Hong Kong", "Taiwan", "Macau"]);
  assert.deepEqual(organizations[0].contactPoint.availableLanguage, ["zh-Hant", "zh-Hans", "en"]);
  assert.equal(websites.length, 1);
  assert.equal(websites[0].url, "https://auroraesportstudio.com/");
  assert.deepEqual(websites[0].publisher, { "@id": "https://auroraesportstudio.com/#organization" });
  assert.doesNotMatch(home, /PostalAddress|streetAddress|LocalBusiness/);

  for (const slug of [
    "arena-of-valor-boosting",
    "honor-of-kings-cn-boosting",
    "honor-of-kings-global-boosting",
    "klg-studio",
    "about-aurora",
    "service-process-safety",
  ]) {
    const html = await read(`dist/${slug}/index.html`);
    const graph = extractJsonLd(html).flatMap((item) => item["@graph"] ?? [item]);
    const organizations = graph.filter((item) => item["@type"] === "Organization");
    const websites = graph.filter((item) => item["@type"] === "WebSite");

    assert.equal(organizations.length, 1, `${slug} must include one Aurora Organization`);
    assert.equal(organizations[0].name, "Aurora Esports Studio");
    assert.equal(Object.hasOwn(organizations[0], "alternateName"), false);
    assert.deepEqual(organizations[0].sameAs, expectedOrganizationProfiles);
    assert.equal(websites.length, 1, `${slug} must include one official WebSite`);
    assert.equal(websites[0].url, "https://auroraesportstudio.com/");
    assert.deepEqual(websites[0].publisher, { "@id": "https://auroraesportstudio.com/#organization" });
    assert.doesNotMatch(html, /PostalAddress|streetAddress|LocalBusiness/);
  }
});

test("generated game schemas connect each Service to the Aurora provider and KLG brand", async () => {
  for (const slug of [
    "arena-of-valor-boosting",
    "honor-of-kings-cn-boosting",
    "honor-of-kings-global-boosting",
  ]) {
    const html = await read(`dist/${slug}/index.html`);
    const graph = extractJsonLd(html).flatMap((item) => item["@graph"] ?? [item]);
    const brands = graph.filter((item) => item["@type"] === "Brand");
    const organizations = graph.filter((item) => item["@type"] === "Organization");
    const services = graph.filter((item) => item["@type"] === "Service");

    assert.equal(brands.length, 1, `${slug} must include one KLG Brand`);
    assert.equal(brands[0].name, "KLG Studio");
    assert.equal(brands[0]["@id"], "https://auroraesportstudio.com/#brand");
    assert.equal(organizations.length, 1, `${slug} must include one Aurora Organization`);
    assert.equal(organizations[0].name, "Aurora Esports Studio");
    assert.equal(organizations[0]["@id"], "https://auroraesportstudio.com/#organization");
    assert.equal(services.length, 1, `${slug} must include one ordinary Service`);
    assert.deepEqual(services[0].provider, { "@id": "https://auroraesportstudio.com/#organization" });
    assert.deepEqual(services[0].brand, { "@id": "https://auroraesportstudio.com/#brand" });

    const organization = organizations[0];
    assert.deepEqual(organization.areaServed, ["Hong Kong", "Taiwan", "Macau"]);
    assert.deepEqual(organization.contactPoint.availableLanguage, ["zh-Hant", "zh-Hans", "en"]);
    assert.doesNotMatch(html, /PostalAddress|streetAddress|LocalBusiness/);

    assert.deepEqual(
      services[0].areaServed,
      ["Hong Kong", "Taiwan", "Macau"].map((name) => ({ "@type": "Country", name })),
    );
    assert.deepEqual(services[0].availableLanguage, ["zh-Hant", "zh-Hans", "en"]);
    assert.deepEqual(services[0].contactPoint.availableLanguage, ["zh-Hant", "zh-Hans", "en"]);
  }
});

test("robots and sitemap advertise the official Aurora domain", async () => {
  const [robots, sitemap] = await Promise.all([
    read("public/robots.txt"),
    read("public/sitemap.xml"),
  ]);

  assert.match(robots, new RegExp(`Sitemap: ${officialOrigin}/sitemap\\.xml`));
  assert.match(sitemap, new RegExp(`<loc>${officialOrigin}/</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${officialOrigin}/arena-of-valor-boosting/</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${officialOrigin}/honor-of-kings-cn-boosting/</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${officialOrigin}/honor-of-kings-global-boosting/</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${officialOrigin}/privacy/</loc>`));
  assert.doesNotMatch(`${robots}\n${sitemap}`, /ken0517\.github\.io\/aurora-esports-studio/);
});

test("production output exposes a crawler-ready privacy policy", async () => {
  const html = await read("dist/privacy/index.html");

  assert.match(html, /<title>[^<]*私隱[^<]*Aurora Esports Studio[^<]*<\/title>/);
  assert.match(html, /name="description"[\s\S]*?content="[^"]*私隱[^"]*"/);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/auroraesportstudio\.com\/privacy\/" \/>/,
  );
  assert.match(html, /<main class="crawler-content">/);
  assert.match(html, /Aurora Esports Studio/);
  assert.match(html, /Google Analytics/);
  assert.match(html, /Google Gemini/);
  assert.match(html, /90 日/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/arena-of-valor-boosting\/"/);
  assert.doesNotMatch(html, /FAQPage/);
});

test("public crawler files explicitly expose only public Aurora pages", async () => {
  const [robots, sitemap, llms] = await Promise.all([
    read("public/robots.txt"),
    read("public/sitemap.xml"),
    read("public/llms.txt").catch(() => ""),
  ]);

  for (const agent of ["OAI-SearchBot", "ChatGPT-User", "Googlebot", "*"]) {
    const escapedAgent = agent === "*" ? "\\*" : agent;
    assert.match(robots, new RegExp(`User-agent: ${escapedAgent}`));
  }
  assert.match(robots, /Disallow: \/admin/);
  assert.match(robots, /Disallow: \/api\//);

  for (const path of ["klg-studio", "about-aurora", "service-process-safety"]) {
    assert.match(sitemap, new RegExp(`${officialOrigin}/${path}/`));
    assert.match(llms, new RegExp(`${officialOrigin}/${path}/`));
  }
  assert.doesNotMatch(`${sitemap}\n${llms}`, /\/admin|\/api\//);
  assert.match(llms, /experimental|實驗性/);
});

test("production build generates crawler-ready game landing page documents", async () => {
  const [packageJson, generator] = await Promise.all([
    read("package.json"),
    read("scripts/generate-game-landing-pages.mjs"),
  ]);

  assert.match(packageJson, /vite build && node scripts\/generate-game-landing-pages\.mjs/);
  assert.match(generator, /gameLandingPages/);
  assert.match(generator, /<title>/);
  assert.match(generator, /name="description"/);
  assert.match(generator, /rel="canonical"/);
  assert.match(generator, /property="og:title"/);
  assert.match(generator, /property="og:description"/);
  assert.match(generator, /property="og:url"/);
  assert.match(generator, /name="twitter:title"/);
  assert.match(generator, /name="twitter:description"/);
  assert.match(generator, /application\/ld\+json/);
  assert.match(generator, /"@type": "Service"/);
});

test("game landing documents expose FAQ and breadcrumb structured data", async () => {
  const generator = await read("scripts/generate-game-landing-pages.mjs");

  assert.match(generator, /FAQPage/);
  assert.match(generator, /BreadcrumbList/);
  assert.match(generator, /mainEntity/);
  assert.match(generator, /itemListElement/);
  assert.match(generator, /page\.faqs/);
});

test("production output exposes readable HTML for every public route before JavaScript", async () => {
  for (const [slug, heading] of [
    ["arena-of-valor-boosting", "香港傳說對決代打與陪玩服務"],
    ["honor-of-kings-cn-boosting", "王者榮耀國服代打與陪玩服務"],
    ["honor-of-kings-global-boosting", "HOK 國際服代打與陪玩服務"],
    ["klg-studio", "KLG Studio 官方服務網站"],
    ["about-aurora", "關於 Aurora Esports Studio"],
    ["service-process-safety", "服務流程與安全說明"],
  ]) {
    const html = await read(`dist/${slug}/index.html`);
    assert.match(html, new RegExp(`<h1[^>]*>${heading}</h1>`));
    assert.match(html, /class="crawler-content"/);
    assert.match(
      html,
      /<link rel="canonical" href="https:\/\/auroraesportstudio\.com\//,
    );
    assert.doesNotMatch(html, /<div id="root"><\/div>/);
  }

  const home = await read("dist/index.html");
  assert.match(home, /<main class="crawler-content">/);
  assert.match(home, /<h1>KLG Studio<\/h1>/);
  assert.match(home, /KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌/);
  assert.match(home, /href="\/klg-studio\/"/);
  for (const path of [
    "/arena-of-valor-boosting/",
    "/honor-of-kings-cn-boosting/",
    "/honor-of-kings-global-boosting/",
    "/klg-studio/",
    "/about-aurora/",
    "/service-process-safety/",
  ]) {
    assert.match(home, new RegExp(`href="${path.replaceAll("/", "\\/")}"`));
  }
});

test("GitHub Pages builds from the root and preserves the custom domain", async () => {
  const [workflow, cname] = await Promise.all([
    read(".github/workflows/deploy-pages.yml"),
    read("public/CNAME"),
  ]);

  assert.match(workflow, /VITE_BASE_PATH: \/\s*$/m);
  assert.equal(cname.trim(), "auroraesportstudio.com");
});

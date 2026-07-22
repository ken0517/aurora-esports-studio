import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const officialOrigin = "https://auroraesportstudio.com";

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
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
  assert.doesNotMatch(`${robots}\n${sitemap}`, /ken0517\.github\.io\/aurora-esports-studio/);
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
  assert.match(generator, /ProfessionalService/);
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
  assert.match(home, /<h1>Aurora Esports Studio<\/h1>/);
  for (const path of [
    "/arena-of-valor-boosting/",
    "/honor-of-kings-cn-boosting/",
    "/honor-of-kings-global-boosting/",
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

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const officialOrigin = "https://auroraesportsstudio.com";

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("public SEO metadata uses the official Aurora domain", async () => {
  const html = await read("index.html");

  assert.match(html, /<link rel="canonical" href="https:\/\/auroraesportsstudio\.com\/" \/>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/auroraesportsstudio\.com\/" \/>/);
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/auroraesportsstudio\.com\/assets\/generated\/aurora-cinematic\.webp" \/>/,
  );
  assert.match(html, /"url": "https:\/\/auroraesportsstudio\.com\/"/);
  assert.match(
    html,
    /"image": "https:\/\/auroraesportsstudio\.com\/assets\/generated\/aurora-cinematic\.webp"/,
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
  assert.doesNotMatch(`${robots}\n${sitemap}`, /ken0517\.github\.io\/aurora-esports-studio/);
});

test("GitHub Pages builds from the root and preserves the custom domain", async () => {
  const [workflow, cname] = await Promise.all([
    read(".github/workflows/deploy-pages.yml"),
    read("public/CNAME"),
  ]);

  assert.match(workflow, /VITE_BASE_PATH: \/\s*$/m);
  assert.equal(cname.trim(), "auroraesportsstudio.com");
});

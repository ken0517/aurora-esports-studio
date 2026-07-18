import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { gameLandingPages } from "../src/data/gameLandingPages.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");
const sourcePath = resolve(distRoot, "index.html");
const officialOrigin = "https://auroraesportstudio.com";

const markers = {
  description: 'name="description"',
  canonical: 'rel="canonical"',
  ogTitle: 'property="og:title"',
  ogDescription: 'property="og:description"',
  ogUrl: 'property="og:url"',
  ogImage: 'property="og:image"',
  ogImageAlt: 'property="og:image:alt"',
  twitterTitle: 'name="twitter:title"',
  twitterDescription: 'name="twitter:description"',
  twitterImage: 'name="twitter:image"',
  structuredData: 'type="application/ld+json"',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(`Unable to generate landing page: missing ${label} marker in dist/index.html.`);
  }
  return source.replace(pattern, replacement);
}

function replaceMetaContent(source, marker, content) {
  const tagPattern = new RegExp(`<meta\\s+[^>]*${escapeRegExp(marker)}[^>]*>`, "i");
  return replaceRequired(
    source,
    tagPattern,
    (tag) => {
      if (!/content="[^"]*"/i.test(tag)) {
        throw new Error(`Unable to generate landing page: ${marker} has no content attribute.`);
      }
      return tag.replace(/content="[^"]*"/i, `content="${escapeHtml(content)}"`);
    },
    marker,
  );
}

function replaceCanonical(source, canonical) {
  const tagPattern = new RegExp(`<link\\s+[^>]*${escapeRegExp(markers.canonical)}[^>]*>`, "i");
  return replaceRequired(
    source,
    tagPattern,
    (tag) => tag.replace(/href="[^"]*"/i, `href="${escapeHtml(canonical)}"`),
    markers.canonical,
  );
}

function makeStructuredData(page) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${page.canonical}#service`,
        name: `Aurora Esports Studio｜${page.title}`,
        url: page.canonical,
        image: `${officialOrigin}/${page.image}`,
        description: page.seoDescription,
        areaServed: [
          { "@type": "Country", name: "Hong Kong" },
          { "@type": "Country", name: "Taiwan" },
        ],
        availableLanguage: ["zh-Hant", "zh-Hans", "en"],
        serviceType: ["排位代打", "陪玩帶飛", "巔峰賽代打", "英雄戰力標", "遊戲教學"],
        audience: { "@type": "Audience", audienceType: page.audience },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: "https://wa.me/447442619658",
          availableLanguage: ["Chinese", "English"],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${page.canonical}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${page.canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Aurora Esports Studio",
            item: `${officialOrigin}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.title,
            item: page.canonical,
          },
        ],
      },
    ],
  };
}

function renderLandingDocument(template, page) {
  const imageUrl = `${officialOrigin}/${page.image}`;
  let html = replaceRequired(
    template,
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(page.seoTitle)}</title>`,
    "<title>",
  );
  html = replaceMetaContent(html, markers.description, page.seoDescription);
  html = replaceCanonical(html, page.canonical);
  html = replaceMetaContent(html, markers.ogTitle, page.seoTitle);
  html = replaceMetaContent(html, markers.ogDescription, page.seoDescription);
  html = replaceMetaContent(html, markers.ogUrl, page.canonical);
  html = replaceMetaContent(html, markers.ogImage, imageUrl);
  html = replaceMetaContent(html, markers.ogImageAlt, page.imageAlt);
  html = replaceMetaContent(html, markers.twitterTitle, page.seoTitle);
  html = replaceMetaContent(html, markers.twitterDescription, page.seoDescription);
  html = replaceMetaContent(html, markers.twitterImage, imageUrl);

  const structuredData = JSON.stringify(makeStructuredData(page), null, 2).replaceAll("<", "\\u003c");
  const structuredPattern = new RegExp(
    `<script\\s+${escapeRegExp(markers.structuredData)}>[\\s\\S]*?<\\/script>`,
    "i",
  );
  html = replaceRequired(
    html,
    structuredPattern,
    `<script type="application/ld+json">\n${structuredData}\n    </script>`,
    "application/ld+json",
  );

  return html;
}

const template = await readFile(sourcePath, "utf8");

for (const page of gameLandingPages) {
  const outputPath = resolve(distRoot, page.slug, "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderLandingDocument(template, page), "utf8");
}

console.log(`Generated ${gameLandingPages.length} crawler-ready game landing pages.`);

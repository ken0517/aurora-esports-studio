import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { gameLandingPages } from "../src/data/gameLandingPages.js";
import { publicBrandIdentity } from "../src/data/publicBrand.js";
import { publicInfoPages } from "../src/data/publicInfoPages.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");
const sourcePath = resolve(distRoot, "index.html");
const officialOrigin = publicBrandIdentity.officialOrigin;
const organizationId = `${officialOrigin}/#organization`;
const websiteId = `${officialOrigin}/#website`;
const verifiedProfiles = publicBrandIdentity.verifiedProfiles;

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

function renderTextList(items = []) {
  return items.length
    ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
}

function replaceRootContent(source, content) {
  return replaceRequired(
    source,
    /<div\s+id="root">[\s\S]*?<\/div>/i,
    `<div id="root">${content}</div>`,
    "#root",
  );
}

function renderGameCrawlerContent(page) {
  const cases = page.caseStudies?.length
    ? `<section><h2>實際遊戲紀錄</h2>${page.caseStudies
        .map(
          (item) =>
            `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><img src="/${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy"></article>`,
        )
        .join("")}</section>`
    : "";

  return `<main class="crawler-content">
    <header><a href="/klg-studio/">KLG Studio｜Aurora Esports Studio 官方網站</a></header>
    <article>
      <p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.intro)}</p>
      <section><h2>${escapeHtml(page.searchGuide.title)}</h2>${page.searchGuide.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}</section>
      <section><h2>適用遊戲資料</h2><p>${escapeHtml(page.rankSummary)}</p><h3>指定位置／分路</h3>${renderTextList(page.lanes)}<h3>英雄戰力標</h3>${renderTextList(page.marks)}<p>${escapeHtml(page.priceNotice)}</p></section>
      ${cases}
      <section><h2>常見問題</h2>${page.faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}</section>
      <nav><a href="/klg-studio/">KLG Studio</a><a href="/about-aurora/">關於 Aurora</a><a href="/service-process-safety/">服務流程與安全</a><a href="/#ai-quote">填寫報價表</a></nav>
    </article>
  </main>`;
}

function renderInfoCrawlerContent(page) {
  return `<main class="crawler-content">
    <header><a href="/klg-studio/">KLG Studio｜Aurora Esports Studio 官方網站</a></header>
    <article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.intro)}</p>
      ${page.sections.map((section) => `<section id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2>${section.body.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}${renderTextList(section.points)}</section>`).join("")}
      <section><h2>常見問題</h2>${page.faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}</section>
      <nav><a href="/klg-studio/">KLG Studio 官方服務網站</a><a href="/arena-of-valor-boosting/">傳說對決服務</a><a href="/honor-of-kings-cn-boosting/">王者榮耀國服服務</a><a href="/honor-of-kings-global-boosting/">HOK 國際服服務</a></nav>
    </article>
  </main>`;
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

function makeOrganizationData() {
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: publicBrandIdentity.primaryName,
    alternateName: publicBrandIdentity.alternateName,
    url: `${officialOrigin}/`,
    image: `${officialOrigin}/assets/generated/aurora-cinematic.webp`,
    description: publicBrandIdentity.relationshipStatement,
    areaServed: ["Hong Kong", "Taiwan"],
    sameAs: verifiedProfiles,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://wa.me/447442619658",
      availableLanguage: ["zh-Hant", "en"],
    },
  };
}

function makeWebsiteData() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: `${officialOrigin}/`,
    name: publicBrandIdentity.websiteName,
    alternateName: publicBrandIdentity.alternateName,
    inLanguage: "zh-Hant",
    publisher: { "@id": organizationId },
  };
}

function makeFaqData(page) {
  return {
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
  };
}

function makeBreadcrumbData(page) {
  return {
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
  };
}

function makeStructuredData(page) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      makeOrganizationData(),
      makeWebsiteData(),
      {
        "@type": "ProfessionalService",
        "@id": `${page.canonical}#service`,
        name: `KLG Studio｜${page.title}`,
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
        provider: { "@id": organizationId },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: "https://wa.me/447442619658",
          availableLanguage: ["Chinese", "English"],
        },
      },
      {
        "@type": "WebPage",
        "@id": `${page.canonical}#webpage`,
        url: page.canonical,
        name: page.title,
        description: page.seoDescription,
        isPartOf: { "@id": websiteId },
        about: { "@id": `${page.canonical}#service` },
        inLanguage: "zh-Hant",
      },
      makeFaqData(page),
      makeBreadcrumbData(page),
    ],
  };
}

function makeInfoStructuredData(page) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      makeOrganizationData(),
      makeWebsiteData(),
      {
        "@type": "WebPage",
        "@id": `${page.canonical}#webpage`,
        url: page.canonical,
        name: page.title,
        description: page.seoDescription,
        about: { "@id": organizationId },
        isPartOf: { "@id": websiteId },
        inLanguage: "zh-Hant",
      },
      makeFaqData(page),
      makeBreadcrumbData(page),
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

  html = replaceRootContent(html, renderGameCrawlerContent(page));

  return html;
}

function renderInfoDocument(template, page) {
  const imageUrl = `${officialOrigin}/assets/generated/aurora-cinematic.webp`;
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
  html = replaceMetaContent(
    html,
    markers.ogImageAlt,
    `${page.title}｜Aurora Esports Studio`,
  );
  html = replaceMetaContent(html, markers.twitterTitle, page.seoTitle);
  html = replaceMetaContent(html, markers.twitterDescription, page.seoDescription);
  html = replaceMetaContent(html, markers.twitterImage, imageUrl);

  const structuredData = JSON.stringify(makeInfoStructuredData(page), null, 2).replaceAll(
    "<",
    "\\u003c",
  );
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

  return replaceRootContent(html, renderInfoCrawlerContent(page));
}

const template = await readFile(sourcePath, "utf8");

for (const page of gameLandingPages) {
  const outputPath = resolve(distRoot, page.slug, "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderLandingDocument(template, page), "utf8");
}

for (const page of publicInfoPages) {
  const outputPath = resolve(distRoot, page.slug, "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderInfoDocument(template, page), "utf8");
}

console.log(
  `Generated ${gameLandingPages.length + publicInfoPages.length} crawler-ready public pages.`,
);

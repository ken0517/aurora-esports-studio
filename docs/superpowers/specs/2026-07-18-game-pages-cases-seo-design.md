# Game Pages, Real Cases and Search Monitoring Design

## Goal

Strengthen Aurora's three public game pages for Hong Kong and Taiwan searches, add the three supplied Arena of Valor records as clearly labelled real evidence, and verify the current Google indexing state after deployment.

## Content design

- Keep the existing luxury editorial layout, colours, typography and quote flow.
- Add one game-specific search guide to every page. Copy must use natural Traditional Chinese and mention the relevant game, server, Hong Kong or Taiwan audience, service types and contact path without keyword stuffing.
- Expand each page's FAQ from three to at least five useful questions.
- Add a related-game section so crawlers and customers can move between all three public game pages.
- Keep price claims accurate: configured services may use the central quote system; peak and hero-power services remain manual where configured that way.

## Real case design

- The supplied `aov2.jpeg`, `aov3.jpeg` and `aov4.jpeg` are Arena of Valor records, so they appear only on the Arena of Valor page.
- Present them in an editorial evidence gallery with factual captions: season record, highest rank and recent ranked match history.
- State that records are examples of actual game records, results vary, and identifying information is hidden where appropriate.
- Preserve the uploaded images, load them lazily and provide fixed dimensions to reduce layout movement.

## Search design

- Generate page-specific FAQ and breadcrumb structured data alongside the existing service data.
- Keep the existing clean canonical URLs and sitemap.
- After publishing, verify all four public URLs and the sitemap return successfully, then inspect their Search Console status. Do not promise immediate ranking and do not repeatedly request indexing when a request is already pending.

## Testing

- Add tests for game-specific search copy, expanded FAQs, related-page links and the three case records.
- Add tests for lazy case images and FAQ/breadcrumb structured data.
- Run the complete test suite, lint and production build before publishing.

## Scope limits

- No pricing, AI, quotation, admin or visual-system redesign.
- No invented testimonials, customer names, rankings or guaranteed results.
- No case images on the two Honor of Kings pages unless matching evidence is supplied later.

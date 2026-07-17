# Search Indexing and Privacy-Safe Analytics Design

## Goal

Help Google discover Aurora's homepage and three game landing pages, then measure visits and high-intent actions without sending customer quote content or chat text to Google.

## Search Console

- Keep the existing domain property for `auroraesportstudio.com`.
- Resubmit the live sitemap after the landing pages are published.
- Request indexing for the homepage and all three game landing pages once.
- Treat Search Console confirmation as a queue submission, not a ranking guarantee.

## Analytics

- Add one small analytics module that is inactive unless a valid `VITE_GA_MEASUREMENT_ID` is configured.
- Load Google Analytics only after configuration and disable advertising signals and personalisation.
- Record only: page views, quote entry method, service quote clicks, quote result status, and outbound contact channel.
- Allow only stable game/service IDs and short status values. Never send rank, stars, hero, notes, chat messages, names, phone numbers, passwords, payment data, or the quotation text.
- Keep every existing page, price rule, AI flow and visual style unchanged.

## Deployment

- The production build receives the public measurement ID through the existing GitHub Pages workflow.
- If no Analytics property is available, the site remains fully functional and the tracking layer is a no-op until the measurement ID is configured.

## Verification

- Automated tests cover valid configuration, disabled configuration and sensitive-parameter filtering.
- Run the full test suite, lint and production build.
- Verify the deployed pages and Search Console submission state.

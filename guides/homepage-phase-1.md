# Wardha Saleem homepage — phase 1

Reference: the published wardhasaleem.com homepage, read on 20 October 2026.
All implementation changes are confined to this Hydrogen repository. No theme,
Online Store setting, product, menu, metafield, domain or Shopify app was changed.

## Content and code

- `app/content/homepage.json`: public campaign artwork, copy, links and local preview product fixtures copied from the published page. This is a snapshot, not automatic theme-editor synchronization.
- `app/components/WardhaHomepage.tsx`: React homepage, responsive navigation, carousels, mobile product tabs, footer and newsletter popup.
- `app/styles/wardha-home.css`: scoped desktop/mobile styles and the original public brand fonts.
- `app/lib/homepage.ts`: read-only Storefront API collection queries in the PK market. In a connected environment, product price, compare-at price and availability are queried rather than frozen into the campaign content. Static product fixtures are used only for the unlinked local starter.
- `app/routes/resources.home-collection.tsx`: allowlisted collection endpoint for mobile tabs.

The original newsletter form endpoint is retained. Only an explicit visitor form submission sends a signup; development verification does not submit the form. WhatsApp and order tracking retain their public destinations. Search and bag open the Hydrogen starter drawers. Currency display is PKR; the legacy currency-switcher app is not ported.

## Scope and review

Homepage styling replaces the starter homepage only. Product, collection, account,
cart, and content-page layouts remain the starter implementation. Links are routed
to Hydrogen equivalents and those destination layouts will be implemented in later
phases. Legacy theme/app JavaScript is not loaded into React. Mega-menu presentation
is reconstructed from the homepage collections; full lazy-loaded legacy menu content
needs a subsequent comparison.

Campaign edits currently require a content-file change and GitHub deployment.
A merchant-facing campaign editor, scheduled launches, and metafield visibility
controls remain future work. No metafield or metaobject definitions were created.

The homepage is marked noindex while the Hydrogen storefront is being prepared.
Do not move the live domain or change Online Store publication as part of this phase.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build`. The existing GitHub
Oxygen workflow deploys the main branch into the separate Hydrogen storefront.
Desktop/mobile pixel comparison and form/market/app integration acceptance are
required before describing this as a production-ready exact replica.

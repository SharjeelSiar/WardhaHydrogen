# Hydrogen editing

Only the new Hydrogen content is connected to this frontend. Existing theme settings and menus were read, not edited.

- Shopify Admin → Content → Menus → **Hydrogen — Main navigation**: edit labels, links, ordering and nested items.
- Content → Menus → **Hydrogen — Footer**: root items are column headings; nested items are links.
- Content → Metaobjects → **Hydrogen Site Settings** → **Wardha Hydrogen**: announcement, logos, newsletter copy, social links, default size guide, care and disclaimer.
- Content → Metaobjects → **Hydrogen Navigation Image**: choose a menu image and match its link to the corresponding navigation item.

The Storefront API token must have `unauthenticated_read_metaobjects` access. Without it the site uses snapshot defaults and logs the missing access. Runtime verification of this permission is required before considering the editing integration complete.

Menus/settings use short API caching. Refresh the page after editing; already-open browser pages do not automatically update.

The collection and product routes are a first implementation. Desktop/mobile visual QA and cart integration verification remain necessary. Both `/products/rova` and `/collections/new-in/products/rova` render the same product component.

To review this branch locally:

```sh
git fetch origin
git switch feat/shared-layout-collection-product
npm ci
npm run dev
```

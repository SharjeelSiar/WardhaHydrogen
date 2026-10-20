# Wardha Hydrogen

Official Shopify Hydrogen TypeScript skeleton, prepared for the separate Wardha Hydrogen Oxygen storefront.

## Included

Product and collection pages, search and predictive search, cart and checkout handoff, customer account routes, content pages, sitemap and robots routes, GraphQL code generation, and Oxygen deployment tooling. This is the starter foundation; the existing Wardha Saleem design and app integrations have not been migrated.

## Local development

Use Node.js 24 and npm.

```sh
npm ci
cp .env.example .env
```

Fill `.env` using the variables from the **Wardha Hydrogen** storefront. Alternatively, authenticate with the Shopify CLI, link this project to that storefront, and pull its environment variables. Credentials are not stored in this repository.

```sh
npx shopify hydrogen link --storefront "Wardha Hydrogen"
npx shopify hydrogen env pull
npm run dev
```

The unlinked official starter can use mock.shop sample data. Real Wardha product data requires this storefront's Storefront API environment variables and product publication to its sales channel. Customer login additionally requires Customer Account API configuration.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```

## Oxygen deployment

The Shopify-created Oxygen workflow installs the committed lockfile with `npm ci` and deploys using the repository's Oxygen deployment secret. Runtime credentials belong in the Hydrogen storefront's Oxygen environment variables. Main-branch pushes target the Hydrogen production environment; other branches target preview environments.

The starter is deployed on its Oxygen URL. Connecting the existing `wardhasaleem.com` domain is a separate launch step. This repository does not edit or publish the Shopify Online Store theme.

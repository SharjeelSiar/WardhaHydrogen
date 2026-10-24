import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {WardhaProductPage} from '~/components/WardhaProductPage';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {name: 'robots', content: 'noindex, nofollow'},
    {title: `${data?.product.title ?? ''} – Wardha Saleem`},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const variantId = new URL(request.url).searchParams.get('variant');
  if (variantId && product.variants.nodes.length) {
    const exact = product.variants.nodes.find(
      (v) => v.id === `gid://shopify/ProductVariant/${variantId}`,
    );
    if (exact) product.selectedOrFirstAvailableVariant = exact;
  }
  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });
  return (
    <WardhaProductPage
      product={product}
      selectedVariant={selectedVariant}
      productOptions={productOptions}
    />
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    productType
    tags
    images(first:100){nodes{id url altText width height}}
    media(first:100){nodes{__typename ... on Video{id alt sources{url mimeType format height width} previewImage{url altText width height}}}}
    variants(first:250){nodes{...ProductVariant}}
    badge:metafield(namespace:"theme",key:"custom_badge"){value}
    delivery:metafield(namespace:"custom",key:"delivery_timelines"){value}
    sizeChart:metafield(namespace:"custom",key:"size_chart"){reference{__typename ... on MediaImage{image{url altText width height}}}}
    care:metafield(namespace:"custom",key:"care_instructions"){value}
    disclaimer:metafield(namespace:"custom",key:"disclaimer"){value}
    details:metafields(identifiers:[
      {namespace:"custom",key:"work_details"},{namespace:"custom",key:"fabric_work"},{namespace:"custom",key:"color"},
      {namespace:"custom",key:"shirts"},{namespace:"custom",key:"peshwas"},{namespace:"custom",key:"drape_top"},
      {namespace:"custom",key:"draped_shirt"},{namespace:"custom",key:"bodice_sleeves"},{namespace:"custom",key:"dupatta"},
      {namespace:"custom",key:"cargo_pants"},{namespace:"custom",key:"relaxed_fit_pants"},{namespace:"custom",key:"drape_shalwar"},
      {namespace:"custom",key:"shalwar"},{namespace:"custom",key:"pants"},{namespace:"custom",key:"culotte"},
      {namespace:"custom",key:"trouser"},{namespace:"custom",key:"poncho"},{namespace:"custom",key:"izaar"},
      {namespace:"custom",key:"dhaka_pajama"},{namespace:"custom",key:"top"},{namespace:"custom",key:"bottom"},
      {namespace:"custom",key:"inner"},{namespace:"custom",key:"kaftan"},{namespace:"custom",key:"jacket"},
      {namespace:"custom",key:"drape"},{namespace:"custom",key:"shrug"},{namespace:"custom",key:"cape"},
      {namespace:"custom",key:"jumpsuit"},{namespace:"custom",key:"saree"},{namespace:"custom",key:"choli"},
      {namespace:"custom",key:"skirt"},{namespace:"custom",key:"blouse"},{namespace:"custom",key:"package_content"},
      {namespace:"custom",key:"palazzo"},{namespace:"custom",key:"dress"}
    ]){key value type}
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

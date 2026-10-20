import type {HydrogenRouterContextProvider} from '@shopify/hydrogen';
import type {HomeProduct} from '~/components/WardhaHomepage';
import content from '~/content/homepage.json';

// Campaign artwork is a read-only snapshot of the live homepage. Product prices,
// availability and sale prices come from Storefront API; no Admin writes are used.
export async function homeProducts(
  context: Readonly<HydrogenRouterContextProvider>,
  handle: string,
): Promise<HomeProduct[]> {
  if (
    !context.env.PUBLIC_STORE_DOMAIN ||
    context.env.PUBLIC_STORE_DOMAIN.includes('mock.shop')
  )
    return handle === 'new-in' ? content.newArrivals : content.mobileProducts;
  const result = await context.storefront.query(HOME_COLLECTION_QUERY, {
    variables: {handle},
    cache: context.storefront.CacheShort(),
  });
  return (result.collection?.products.nodes || []).map((product) => {
    const snapshot = [...content.newArrivals, ...content.mobileProducts].find(
      (p) => p.handle === product.handle,
    );
    return {
      handle: product.handle,
      title: product.title,
      image: product.images.nodes[0]?.url || snapshot?.image || '',
      hover: product.images.nodes[1]?.url || '',
      price: Number(product.priceRange.minVariantPrice.amount),
      compareAt: Number(product.compareAtPriceRange.minVariantPrice.amount),
      currency: product.priceRange.minVariantPrice.currencyCode,
      available: product.availableForSale,
      badge: snapshot?.badge || '',
    };
  });
}
const HOME_COLLECTION_QUERY = `#graphql
  query HomeCollection($handle: String!) @inContext(country: PK, language: EN) {
    collection(handle: $handle) {
      products(first: 6) { nodes {
        handle title availableForSale
        images(first: 2) { nodes { url } }
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
      } }
    }
  }
` as const;

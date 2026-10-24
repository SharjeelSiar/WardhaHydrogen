import {useState} from 'react';
import {Form, Link, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {
  Analytics,
  getPaginationVariables,
  Pagination,
  Image,
  Money,
} from '@shopify/hydrogen';
import type {
  ProductFilter,
  ProductCollectionSortKeys,
} from '@shopify/hydrogen/storefront-api-types';
import {Modal} from '~/components/Modal';
import type {WardhaCatalogProductFragment} from 'storefrontapi.generated';
import {useRootLoaderData} from '~/lib/root-data';

const sortOptions = [
  ['manual', 'Featured', 'MANUAL', false],
  ['best-selling', 'Best selling', 'BEST_SELLING', false],
  ['title-ascending', 'Alphabetically, A–Z', 'TITLE', false],
  ['title-descending', 'Alphabetically, Z–A', 'TITLE', true],
  ['price-ascending', 'Price, low to high', 'PRICE', false],
  ['price-descending', 'Price, high to low', 'PRICE', true],
  ['created-ascending', 'Date, old to new', 'CREATED', false],
  ['created-descending', 'Date, new to old', 'CREATED', true],
] as const;
export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection.title || 'Collection'} – Wardha Saleem`},
  {
    name: 'description',
    content:
      data?.collection.seo.description || data?.collection.description || '',
  },
  {name: 'robots', content: 'noindex, nofollow'},
];
export async function loader({context, params, request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const sort = sortOptions.find(
    (x) => x[0] === url.searchParams.get('sort_by'),
  );
  const filters: ProductFilter[] = [];
  for (const value of url.searchParams.getAll('filter')) {
    try {
      const filter = JSON.parse(value) as ProductFilter;
      if (
        filter &&
        typeof filter === 'object' &&
        !Array.isArray(filter) &&
        Object.keys(filter).every((k) =>
          [
            'available',
            'productType',
            'productVendor',
            'productOption',
            'productMetafield',
            'variantMetafield',
            'taxonomyMetafield',
            'category',
            'tag',
          ].includes(k),
        )
      )
        filters.push(filter);
    } catch {
      /* Ignore malformed URL filters. */
    }
  }
  const min = Number(url.searchParams.get('min'));
  const max = Number(url.searchParams.get('max'));
  if (
    (url.searchParams.get('min') && Number.isFinite(min) && min >= 0) ||
    (url.searchParams.get('max') && Number.isFinite(max) && max >= 0)
  )
    filters.push({
      price: {
        ...(url.searchParams.get('min') && Number.isFinite(min) ? {min} : {}),
        ...(url.searchParams.get('max') && Number.isFinite(max) ? {max} : {}),
      },
    });
  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      handle: params.handle!,
      ...getPaginationVariables(request, {pageBy: 50}),
      filters,
      sortKey: (sort?.[2] || 'COLLECTION_DEFAULT') as ProductCollectionSortKeys,
      reverse: sort?.[3] || false,
    },
    cache: context.storefront.CacheShort(),
  });
  if (!collection) throw new Response('Collection not found', {status: 404});
  return {collection};
}
function CatalogCard({
  product,
  index,
  collection,
}: {
  product: WardhaCatalogProductFragment;
  index: number;
  collection: string;
}) {
  const to = `/collections/${collection}/products/${product.handle}`;
  const image = product.images.nodes[0];
  const hover = product.images.nodes[1];
  const price = product.priceRange.minVariantPrice;
  const compare = product.compareAtPriceRange.minVariantPrice;
  const sale = Number(compare.amount) > Number(price.amount);
  return (
    <article className="ws-catalog-card">
      <Link to={to} className="ws-catalog-image" prefetch="intent">
        {image && (
          <Image
            data={image}
            sizes="(max-width:767px) calc(50vw - 20px), (max-width:1100px) 30vw, 340px"
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        )}
        {hover && (
          <Image
            className="ws-catalog-hover"
            data={hover}
            sizes="(max-width:767px) 50vw, 340px"
            loading="lazy"
          />
        )}
        {(product.customBadge?.value || sale) && (
          <span className="ws-catalog-badge">
            {sale ? 'Sale' : product.customBadge?.value}
          </span>
        )}
        {!product.availableForSale && (
          <span className="ws-catalog-soldout">Sold out</span>
        )}
      </Link>
      <Link to={to} className="ws-catalog-view">
        View product
      </Link>
      <div className="ws-catalog-info">
        <div>
          <h2>
            <Link to={to}>{product.title}</Link>
          </h2>
          <div className="ws-catalog-price">
            {sale && (
              <del>
                <Money data={compare} />
              </del>
            )}
            <Money data={price} />
          </div>
        </div>
        <Link className="ws-card-atc" to={to}>
          {product.availableForSale ? 'Add to cart' : 'View product'}
        </Link>
      </div>
    </article>
  );
}
export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const root = useRootLoaderData();
  const [params, setParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const settings = root?.site.settings;
  const banner =
    collection.image?.url ||
    settings?.collection_banner ||
    settings?.collection_banner_url;
  const mobile =
    settings?.collection_banner_mobile ||
    settings?.collection_banner_mobile_url ||
    banner;
  const active = params.getAll('filter');
  const isFiltered =
    active.length > 0 || !!params.get('min') || !!params.get('max');
  function removeFilter(value?: string) {
    const next = new URLSearchParams(params);
    if (value) {
      next.delete('filter');
      active
        .filter((x) => x !== value)
        .forEach((x) => next.append('filter', x));
    } else {
      next.delete('filter');
      next.delete('min');
      next.delete('max');
    }
    for (const key of ['cursor', 'direction']) next.delete(key);
    setParams(next);
  }
  return (
    <div className="ws-collection">
      <div className="ws-collection-banner">
        {banner && (
          <picture>
            <source media="(max-width:767px)" srcSet={mobile} />
            <img src={banner} alt="" fetchPriority="high" />
          </picture>
        )}
        <h1>{collection.title}</h1>
      </div>
      <div className="ws-collection-body">
        <div className="ws-collection-toolbar">
          <button
            className="ws-filter-toggle"
            onClick={() => setFilterOpen(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M3 4h18l-7 8v8l-4-2v-6Z" />
            </svg>
            Filter{isFiltered ? ' •' : ''}
          </button>
          <label className="ws-sort-label">
            <span className="ws-sr">Sort products</span>
            <select
              value={params.get('sort_by') || 'manual'}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                next.set('sort_by', e.target.value);
                next.delete('cursor');
                next.delete('direction');
                setParams(next);
              }}
            >
              {sortOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isFiltered && (
          <div className="ws-active-filters">
            {active.map((value, i) => {
              const found = collection.products.filters
                .flatMap((f) => f.values)
                .find((v) => JSON.stringify(v.input) === value);
              return (
                <button
                  key={`${value}-${i}`}
                  onClick={() => removeFilter(value)}
                >
                  {found?.label || 'Selected filter'} ×
                </button>
              );
            })}
            <button onClick={() => removeFilter()}>Clear all filters ×</button>
          </div>
        )}
        <Pagination
          connection={collection.products}
          key={`${collection.id}-${params.get('sort_by')}-${active.join(',')}-${params.get('min')}-${params.get('max')}`}
        >
          {({
            nodes,
            NextLink,
            PreviousLink,
            hasNextPage,
            hasPreviousPage,
            isLoading,
          }) => (
            <>
              {hasPreviousPage && (
                <div className="ws-pagination">
                  <PreviousLink>Previous products</PreviousLink>
                </div>
              )}
              <div className="ws-catalog-grid">
                {nodes.map((p, i) => (
                  <CatalogCard
                    key={p.id}
                    product={p}
                    index={i}
                    collection={collection.handle}
                  />
                ))}
              </div>
              {!nodes.length && (
                <p className="ws-empty">No products match these filters.</p>
              )}
              {!!nodes.length && (
                <div className="ws-pagination">
                  <span>You&apos;ve viewed {nodes.length} products</span>
                  {hasNextPage && (
                    <NextLink>{isLoading ? 'Loading…' : 'Load More'}</NextLink>
                  )}
                </div>
              )}
            </>
          )}
        </Pagination>
      </div>
      <Modal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter"
        className="ws-filter-dialog"
      >
        <Form
          method="get"
          preventScrollReset
          onSubmit={() => setFilterOpen(false)}
          key={params.toString()}
        >
          {params.get('sort_by') && (
            <input
              type="hidden"
              name="sort_by"
              value={params.get('sort_by')!}
            />
          )}
          {collection.products.filters.map((filter) => (
            <fieldset key={filter.id}>
              <legend>{filter.label}</legend>
              {filter.type === 'PRICE_RANGE' ? (
                <div className="ws-filter-price">
                  <label>
                    From
                    <input
                      type="number"
                      name="min"
                      min="0"
                      step="any"
                      defaultValue={params.get('min') || ''}
                      placeholder="0"
                    />
                  </label>
                  <label>
                    To
                    <input
                      type="number"
                      name="max"
                      min="0"
                      step="any"
                      defaultValue={params.get('max') || ''}
                      placeholder="Maximum"
                    />
                  </label>
                </div>
              ) : (
                filter.values.map((value) => (
                  <label className="ws-filter-value" key={value.id}>
                    <input
                      type="checkbox"
                      name="filter"
                      value={JSON.stringify(value.input)}
                      defaultChecked={active.includes(
                        JSON.stringify(value.input),
                      )}
                      disabled={
                        !value.count &&
                        !active.includes(JSON.stringify(value.input))
                      }
                    />
                    <span>
                      {value.label} ({value.count})
                    </span>
                  </label>
                ))
              )}
            </fieldset>
          ))}
          <div className="ws-filter-actions">
            <button className="ws-dark-button" type="submit">
              Apply
            </button>
            <Link
              to={`/collections/${collection.handle}`}
              onClick={() => setFilterOpen(false)}
            >
              Clear all
            </Link>
          </div>
        </Form>
      </Modal>
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </div>
  );
}
const COLLECTION_QUERY = `#graphql
  fragment WardhaCatalogProduct on Product {
    id title handle availableForSale
    images(first:2){nodes{id url altText width height}}
    customBadge:metafield(namespace:"theme",key:"custom_badge"){value}
    priceRange{minVariantPrice{amount currencyCode}}
    compareAtPriceRange{minVariantPrice{amount currencyCode}}
  }
  query WardhaCollection($handle:String!,$country:CountryCode,$language:LanguageCode,$first:Int,$last:Int,$startCursor:String,$endCursor:String,$filters:[ProductFilter!],$sortKey:ProductCollectionSortKeys,$reverse:Boolean) @inContext(country:$country,language:$language) {
    collection(handle:$handle){
      id handle title description seo{title description} image{url altText width height}
      products(first:$first,last:$last,before:$startCursor,after:$endCursor,filters:$filters,sortKey:$sortKey,reverse:$reverse){
        filters{id label type values{id label count input}}
        nodes{...WardhaCatalogProduct}
        pageInfo{hasPreviousPage hasNextPage startCursor endCursor}
      }
    }
  }
` as const;

import {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigation} from 'react-router';
import {
  Analytics,
  Image,
  Money,
  type MappedProductOptions,
} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {Modal} from './Modal';
import {useRootLoaderData} from '~/lib/root-data';
import {useMouseDrag} from '~/hooks/useMouseDrag';

type Variant = ProductFragment['selectedOrFirstAvailableVariant'];
function fieldText(value: string | null | undefined) {
  if (!value) return '';
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).join('\n');
  } catch {
    /* Plain text. */
  }
  return value;
}
function deliveryFallback(product: ProductFragment) {
  if (product.delivery?.value) return fieldText(product.delivery.value);
  const tag = product.tags.find((t) =>
    /^(\d+-\d+ (Weeks|Days|Working days)|\d+-\d+ working days)$/i.test(t),
  );
  if (tag) return tag;
  if (product.vendor.includes('RTD'))
    return 'Local Delivery: 2-3 days\nInternational Delivery: 5-7 Working days';
  if (product.productType.includes('Bridals')) return '2-3 Months';
  if (product.productType.includes('Formals')) return '3-4 Weeks';
  if (product.productType.includes('Luxury Pret')) return '2-3 Weeks';
  return '';
}
function Gallery({
  product,
  selectedVariant,
}: {
  product: ProductFragment;
  selectedVariant: Variant;
}) {
  const [zoom, setZoom] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useMouseDrag({scrollRef: ref});
  const images = product.images.nodes;
  useEffect(() => {
    const index = images.findIndex(
      (image) => image.id === selectedVariant?.image?.id,
    );
    const current = ref.current;
    if (index < 0 || !current) return;
    if (window.matchMedia('(max-width:767px)').matches)
      current.scrollTo({left: current.clientWidth * index, behavior: 'smooth'});
  }, [selectedVariant?.image?.id, images]);
  function move(direction: number) {
    const el = ref.current;
    if (el)
      el.scrollTo({
        left:
          ((active + direction + images.length) % images.length) *
          el.clientWidth,
        behavior: 'smooth',
      });
  }
  const video = product.media.nodes.find((m) => m.__typename === 'Video');
  return (
    <div className="ws-pdp-gallery">
      {product.badge?.value && (
        <span className="ws-catalog-badge">{product.badge.value}</span>
      )}
      <div
        className="ws-pdp-images"
        ref={ref}
        {...drag.events}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.clientWidth)
            setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {images.map((image, index) => (
          <button
            key={image.id || image.url}
            aria-label={`Enlarge ${product.title} image ${index + 1}`}
            onClick={() => setZoom(index)}
          >
            <Image
              data={image}
              sizes="(max-width:767px) 100vw, 25vw"
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          </button>
        ))}
      </div>
      {images.length > 1 && (
        <div className="ws-pdp-mobile-controls">
          <button aria-label="Previous product image" onClick={() => move(-1)}>
            ‹
          </button>
          <button aria-label="Next product image" onClick={() => move(1)}>
            ›
          </button>
        </div>
      )}
      {video?.__typename === 'Video' && (
        <div className="ws-product-media-video">
          <video
            controls
            muted
            playsInline
            preload="none"
            poster={video.previewImage?.url}
          >
            {video.sources.map((source) => (
              <source
                key={source.url}
                src={source.url}
                type={source.mimeType}
              />
            ))}
          </video>
        </div>
      )}
      <Modal
        open={zoom !== null}
        onClose={() => setZoom(null)}
        title={product.title}
        className="ws-gallery-dialog"
      >
        {zoom !== null && images[zoom] && (
          <Image data={images[zoom]} sizes="90vw" />
        )}
        {images.length > 1 && (
          <div className="ws-lightbox-controls">
            <button
              onClick={() =>
                setZoom((i) => ((i ?? 0) - 1 + images.length) % images.length)
              }
              aria-label="Previous enlarged image"
            >
              ←
            </button>
            <span>
              {(zoom ?? 0) + 1} / {images.length}
            </span>
            <button
              onClick={() => setZoom((i) => ((i ?? 0) + 1) % images.length)}
              aria-label="Next enlarged image"
            >
              →
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
function WardhaProductForm({
  productOptions,
  selectedVariant,
  sizeChart,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: Variant;
  sizeChart: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [sizeOpen, setSizeOpen] = useState(false);
  const {open} = useAside();
  const navigation = useNavigation();
  const location = useLocation();
  return (
    <>
      {productOptions.map((option) => (
        <div className="ws-pdp-options" key={option.name}>
          <div className="ws-pdp-option-heading">
            <span>{option.name}:</span>
            {/size/i.test(option.name) && sizeChart && (
              <button
                className="ws-size-link"
                onClick={() => setSizeOpen(true)}
              >
                ♢ Size Guide
              </button>
            )}
          </div>
          <div className="ws-option-values">
            {option.optionValues.map((value) => {
              const search = new URLSearchParams(value.variantUriQuery);
              search.delete('variant');
              const to = value.isDifferentProduct
                ? `/products/${value.handle}?${search}`
                : `${location.pathname}?${search}`;
              return (
                <Link
                  key={value.name}
                  to={to}
                  replace
                  preventScrollReset
                  prefetch="intent"
                  aria-current={value.selected ? 'true' : undefined}
                  aria-disabled={!value.exists}
                  className={!value.available ? 'ws-option-unavailable' : ''}
                  title={
                    !value.available ? `${value.name} — Sold out` : value.name
                  }
                >
                  {value.swatch?.color && (
                    <span
                      className="ws-option-color"
                      style={{backgroundColor: value.swatch.color}}
                    />
                  )}
                  {value.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
      <div className="ws-pdp-atc">
        <div className="ws-quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <label className="ws-sr" htmlFor="ws-product-quantity">
            Quantity
          </label>
          <input
            id="ws-product-quantity"
            type="number"
            min="1"
            max="999"
            step="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.max(
                  1,
                  Math.min(999, Math.floor(Number(e.target.value) || 1)),
                ),
              )
            }
          />
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= 999}
            onClick={() => setQuantity((q) => Math.min(999, q + 1))}
          >
            +
          </button>
        </div>
        <AddToCartButton
          disabled={
            navigation.state !== 'idle' || !selectedVariant?.availableForSale
          }
          onSuccess={() => open('cart')}
          lines={
            selectedVariant
              ? [{merchandiseId: selectedVariant.id, quantity, selectedVariant}]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      </div>
      <Modal
        open={sizeOpen}
        onClose={() => setSizeOpen(false)}
        title="Size Guide"
        className="ws-size-dialog"
      >
        {sizeChart && <img src={sizeChart} alt="Product size guide" />}
      </Modal>
    </>
  );
}
export function WardhaProductPage({
  product,
  selectedVariant,
  productOptions,
}: {
  product: ProductFragment;
  selectedVariant: Variant;
  productOptions: MappedProductOptions[];
}) {
  const root = useRootLoaderData();
  const settings = root?.site.settings;
  const sizeChart =
    product.sizeChart?.reference?.__typename === 'MediaImage'
      ? product.sizeChart.reference.image?.url
      : settings?.size_chart;
  const delivery = deliveryFallback(product);
  const care = product.care?.value || settings?.care_instructions;
  const disclaimer = product.disclaimer?.value || settings?.disclaimer;
  const sale =
    Number(selectedVariant?.compareAtPrice?.amount) >
    Number(selectedVariant?.price.amount);
  const color = product.details.find((f) => f?.key === 'color');
  const detailFields = product.details.filter(
    (f) =>
      f?.value &&
      f.key !== 'color' &&
      f.key !== 'work_details' &&
      f.key !== 'fabric_work',
  );
  const work =
    product.details.find((f) => f?.key === 'work_details') ||
    product.details.find((f) => f?.key === 'fabric_work');
  return (
    <>
      <div className="ws-pdp">
        <Gallery product={product} selectedVariant={selectedVariant} />
        <div className="ws-pdp-info">
          <h1>{product.title}</h1>
          <div className="ws-pdp-price">
            {sale && selectedVariant?.compareAtPrice && (
              <del>
                <Money data={selectedVariant.compareAtPrice} />
              </del>
            )}
            {selectedVariant?.price && <Money data={selectedVariant.price} />}
          </div>
          {selectedVariant?.sku && (
            <div className="ws-pdp-sku">SKU: {selectedVariant.sku}</div>
          )}
          <WardhaProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            sizeChart={sizeChart || ''}
          />
          {(product.descriptionHtml ||
            detailFields.length > 0 ||
            work?.value ||
            color?.value) && (
            <details className="ws-product-accordion" open>
              <summary>Product Details</summary>
              <div>
                <div
                  dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
                />
                {work?.value && (
                  <p>
                    <strong>Embellishments:</strong>
                    <br />
                    {fieldText(work.value)}
                  </p>
                )}
                {detailFields.map(
                  (field) =>
                    field && (
                      <div key={field.key}>
                        <strong>
                          {field.key
                            .replaceAll('_', ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                          :
                        </strong>{' '}
                        {fieldText(field.value)}
                      </div>
                    ),
                )}
                {color?.value && (
                  <div>
                    <strong>Color:</strong> {color.value}
                  </div>
                )}
              </div>
            </details>
          )}
          {delivery && (
            <details className="ws-product-accordion">
              <summary>Delivery Timeline</summary>
              <div style={{whiteSpace: 'pre-line'}}>{delivery}</div>
            </details>
          )}
          {care && (
            <details className="ws-product-accordion">
              <summary>Care Instructions</summary>
              <div style={{whiteSpace: 'pre-line'}}>{fieldText(care)}</div>
            </details>
          )}
          {disclaimer && (
            <details className="ws-product-accordion">
              <summary>Disclaimer</summary>
              <div style={{whiteSpace: 'pre-line'}}>
                {fieldText(disclaimer)}
              </div>
            </details>
          )}
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

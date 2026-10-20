import {useEffect, useRef, useState, type ReactNode} from 'react';
import {Link, useFetcher} from 'react-router';
import {useAside} from '~/components/Aside';
import content from '~/content/homepage.json';

export type HomeProduct = (typeof content.newArrivals)[number];
export function asset(src: string, width = 900) {
  return `${src}${src.includes('?') ? '&' : '?'}width=${width}`;
}
function Photo({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      className={className}
      src={asset(src)}
      srcSet={[320, 480, 750, 1000, 1400]
        .map((w) => `${asset(src, w)} ${w}w`)
        .join(', ')}
      sizes="(max-width: 767px) 100vw, 50vw"
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
function Icon({name}: {name: 'search' | 'bag' | 'user' | 'menu'}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden="true"
    >
      {name === 'search' ? (
        <>
          <circle cx="10.5" cy="10.5" r="7.5" />
          <path d="m16 16 6 6" />
        </>
      ) : name === 'bag' ? (
        <>
          <path d="M4 7h16l1 15H3L4 7Z" />
          <path d="M8 8V5a4 4 0 0 1 8 0v3" />
        </>
      ) : name === 'user' ? (
        <>
          <circle cx="12" cy="6" r="4" />
          <path d="M3 23v-3a9 9 0 0 1 18 0v3" />
        </>
      ) : (
        <path d="M2 5h20M2 12h20M2 19h20" />
      )}
    </svg>
  );
}
function ViewAll({href}: {href: string}) {
  return (
    <Link className="ws-view-all" to={href}>
      VIEW ALL <span aria-hidden="true">→</span>
    </Link>
  );
}
function Arrow({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
}) {
  return (
    <button
      className={`ws-arrow ws-arrow-${direction}`}
      aria-label={`${direction} slide`}
      onClick={onClick}
    >
      {direction === 'previous' ? '‹' : '›'}
    </button>
  );
}
function Dots({
  count,
  active,
  select,
}: {
  count: number;
  active: number;
  select: (i: number) => void;
}) {
  return (
    <div className="ws-dots">
      {Array.from({length: count}, (_, i) => (
        <button
          key={i}
          onClick={() => select(i)}
          aria-label={`Show slide ${i + 1}`}
          aria-current={i === active ? 'true' : undefined}
          className={i === active ? 'is-active' : ''}
        />
      ))}
    </div>
  );
}
function useCarousel(count: number, seconds: number) {
  const [index, select] = useState(0);
  const [paused, pause] = useState(false);
  useEffect(() => {
    if (
      paused ||
      count < 2 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const timer = window.setInterval(
      () => select((i) => (i + 1) % count),
      seconds * 1000,
    );
    return () => window.clearInterval(timer);
  }, [count, paused, seconds]);
  return {
    index,
    select,
    previous: () => select((i) => (i - 1 + count) % count),
    next: () => select((i) => (i + 1) % count),
    events: {
      onMouseEnter: () => pause(true),
      onMouseLeave: () => pause(false),
      onFocusCapture: () => pause(true),
      onBlurCapture: () => pause(false),
    },
  };
}
function Header() {
  const {open} = useAside();
  const [menu, setMenu] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previous;
    };
  }, [menu]);
  return (
    <>
      <div className="ws-announcement">
        <Link to="/collections/new-in">Shipping worldwide</Link>
      </div>
      <header className="ws-header">
        <button
          className="ws-mobile-menu ws-icon"
          aria-label="Open menu"
          aria-expanded={menu}
          onClick={() => setMenu(true)}
        >
          <Icon name="menu" />
        </button>
        <Link className="ws-logo" to="/" aria-label="Wardha Saleem home">
          <picture>
            <source
              media="(max-width:767px)"
              srcSet={asset(content.mobileLogo, 180)}
            />
            <img
              src={asset(content.logo, 350)}
              alt="Wardha Saleem"
              width="175"
              height="33"
            />
          </picture>
        </Link>
        <nav className="ws-nav" aria-label="Main navigation">
          {content.nav.map((item) => (
            <div className="ws-nav-item" key={item.href}>
              <Link to={item.href}>{item.title}</Link>
              {['SHOP BY COLLECTION', 'LUXURY PRET', 'FORMALS'].includes(
                item.title,
              ) && (
                <div className="ws-mega">
                  {content.features
                    .filter(
                      (f) =>
                        item.title === 'SHOP BY COLLECTION' ||
                        f.title.toUpperCase() === item.title,
                    )
                    .map((f) => (
                      <Link to={f.href} key={f.href}>
                        <Photo src={f.image} alt={f.title} />
                        <span>{f.title}</span>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="ws-header-actions">
          <button
            className="ws-icon"
            aria-label="Search"
            onClick={() => open('search')}
          >
            <Icon name="search" />
          </button>
          <Link
            className="ws-icon ws-account"
            to="/account"
            aria-label="My account"
          >
            <Icon name="user" />
          </Link>
          <button
            className="ws-icon"
            aria-label="Shopping bag"
            onClick={() => open('cart')}
          >
            <Icon name="bag" />
          </button>
        </div>
      </header>
      {menu && (
        <div className="ws-menu-backdrop">
          <button
            className="ws-menu-overlay"
            aria-label="Close menu"
            onClick={() => setMenu(false)}
          />
          <div
            className="ws-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
          >
            <div>
              MENU
              <button
                ref={closeRef}
                onClick={() => setMenu(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            {content.nav.map((item) => (
              <Link
                onClick={() => setMenu(false)}
                to={item.href}
                key={item.href}
              >
                {item.title}
                <span>›</span>
              </Link>
            ))}
            <Link to="/account" onClick={() => setMenu(false)}>
              My account
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
function Hero() {
  const c = useCarousel(content.heroes.length, 7);
  const touch = useRef<number | null>(null);
  return (
    <section
      className="ws-hero"
      aria-label="Latest collections"
      aria-roledescription="carousel"
      {...c.events}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (
          touch.current !== null &&
          Math.abs(e.changedTouches[0].clientX - touch.current) > 45
        ) {
          if (e.changedTouches[0].clientX < touch.current) c.next();
          else c.previous();
        }
        touch.current = null;
      }}
    >
      {content.heroes.map((slide, i) => (
        <Link
          className={`ws-hero-slide ${i === c.index ? 'is-active' : ''}`}
          to={slide.href}
          key={slide.image}
          aria-hidden={i !== c.index}
          tabIndex={i === c.index ? 0 : -1}
        >
          <picture>
            <source
              media="(max-width:767px)"
              srcSet={asset(slide.mobile, 750)}
            />
            <img
              src={asset(slide.image, 1800)}
              alt={
                [
                  'Velvet collection',
                  'Luxe Edition 26',
                  'Zimal FW26',
                  'Ready to deliver',
                  'Aari Collective 2026',
                ][i]
              }
              width="1836"
              height="801"
              fetchPriority={i === 0 ? 'high' : 'auto'}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </picture>
        </Link>
      ))}
      <Arrow direction="previous" onClick={c.previous} />
      <Arrow direction="next" onClick={c.next} />
      <Dots count={content.heroes.length} active={c.index} select={c.select} />
    </section>
  );
}
export function ProductCard({product}: {product: HomeProduct}) {
  const price = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(product.price);
  return (
    <article className="ws-product">
      <Link to={`/products/${product.handle}`} className="ws-product-image">
        <Photo src={product.image} alt={product.title} />
        {product.hover && (
          <Photo className="ws-product-hover" src={product.hover} alt="" />
        )}
        {product.badge && <span className="ws-fabric">{product.badge}</span>}
        {product.compareAt > product.price && (
          <span className="ws-sale">SALE</span>
        )}
        <span className="ws-product-view">View Product</span>
      </Link>
      <div className="ws-product-info">
        <Link to={`/products/${product.handle}`}>{product.title}</Link>
        <div>
          {product.compareAt > product.price && (
            <del>Rs. {product.compareAt.toLocaleString('en-PK')} </del>
          )}
          {product.currency === 'PKR' ? 'Rs.' : product.currency} {price}
        </div>
        {!product.available && <small>Sold out</small>}
      </div>
    </article>
  );
}
function Rail({
  children,
  className = '',
  label,
  seconds = 0,
}: {
  children: ReactNode;
  className?: string;
  label: string;
  seconds?: number;
}) {
  const paused = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const move = (direction: number) => {
    const el = ref.current;
    if (!el) return;
    const step = el.clientWidth;
    if (direction === 1 && el.scrollLeft + step >= el.scrollWidth - 2)
      el.scrollTo({left: 0, behavior: 'smooth'});
    else el.scrollBy({left: step * direction, behavior: 'smooth'});
  };
  useEffect(() => {
    if (
      !seconds ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const timer = window.setInterval(() => {
      const el = ref.current;
      if (!el || paused.current || !el.clientWidth) return;
      const step =
        (el.firstElementChild?.getBoundingClientRect().width ||
          el.clientWidth) + Number.parseFloat(getComputedStyle(el).gap || '0');
      el.scrollTo({
        left:
          el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
            ? 0
            : el.scrollLeft + step,
        behavior: 'smooth',
      });
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);
  return (
    <div
      className={`ws-rail-wrap ${className}`}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onFocusCapture={() => {
        paused.current = true;
      }}
      onBlurCapture={() => {
        paused.current = false;
      }}
    >
      <div ref={ref} className="ws-rail" aria-label={label}>
        {children}
      </div>
      <Arrow direction="previous" onClick={() => move(-1)} />
      <Arrow direction="next" onClick={() => move(1)} />
    </div>
  );
}
function NewArrivals({
  products,
  mobileProducts,
}: {
  products: HomeProduct[];
  mobileProducts: HomeProduct[];
}) {
  const [tab, setTab] = useState(0);
  const fetcher = useFetcher<{products: HomeProduct[]}>();
  const activeProducts =
    tab === 0 ? mobileProducts : fetcher.data?.products || [];
  return (
    <>
      <section className="ws-new-desktop ws-container">
        <div className="ws-new-copy">
          <h2>
            <Link to="/collections/new-in">NEW ARRIVALS</Link>
          </h2>
          <p>{content.features[2].description}</p>
          <ViewAll href="/collections/new-in" />
        </div>
        <Rail className="ws-product-rail" label="New arrivals">
          {products.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </Rail>
      </section>
      <section className="ws-new-mobile ws-container">
        <h2>New Arrivals</h2>
        <div
          className="ws-tabs"
          role="tablist"
          aria-label="New arrivals collections"
        >
          {content.tabs.map((t, i) => (
            <button
              id={`ws-tab-${i}`}
              role="tab"
              aria-selected={tab === i}
              aria-controls="ws-tab-products"
              key={t.handle}
              onClick={() => {
                setTab(i);
                if (i !== 0)
                  void fetcher.load(
                    `/resources/home-collection?handle=${t.handle}`,
                  );
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
        <div
          id="ws-tab-products"
          role="tabpanel"
          aria-labelledby={`ws-tab-${tab}`}
          aria-busy={fetcher.state !== 'idle'}
        >
          {fetcher.state !== 'idle' && tab !== 0 ? (
            <p>Loading collection…</p>
          ) : activeProducts.length ? (
            <Rail
              key={tab}
              className="ws-product-rail"
              label={content.tabs[tab].title}
            >
              {activeProducts.map((p) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </Rail>
          ) : (
            <ViewAll href={`/collections/${content.tabs[tab].handle}`} />
          )}
        </div>
      </section>
    </>
  );
}
function FeaturedCollections() {
  const c = useCarousel(content.features.length, 7);
  const f = content.features[c.index];
  return (
    <section
      className="ws-features ws-container"
      aria-label="Featured collections"
      {...c.events}
    >
      <h2 className="ws-feature-mobile-title">{f.title}</h2>
      <div className="ws-feature-main">
        <div className="ws-feature-photo">
          <Link to={f.href}>
            <Photo src={f.image} alt={f.title} />
          </Link>
          <Arrow direction="previous" onClick={c.previous} />
          <Arrow direction="next" onClick={c.next} />
        </div>
        <div className="ws-feature-copy">
          <h2>
            <Link to={f.href}>{f.title}</Link>
          </h2>
          <p>{f.description}</p>
          <div className="ws-feature-link">
            <ViewAll href={f.href} />
          </div>
          <div className="ws-feature-tiles">
            {f.tiles.map((tile) => (
              <Link to={tile.href} key={tile.href}>
                <Photo src={tile.image} alt={tile.title} />
                <span>{tile.title}</span>
              </Link>
            ))}
          </div>
          <Dots
            count={content.features.length}
            active={c.index}
            select={c.select}
          />
        </div>
      </div>
    </section>
  );
}
const footerGroups = [
  {
    title: 'About the Brand',
    links: [
      ['About Us', '/pages/about-us'],
      ['Store Locator', '/pages/store-locator'],
    ],
  },
  {
    title: 'Online Information',
    links: [
      ['My Account', '/account/login'],
      ['Order and Tracking', '/pages/order-tracking'],
      ['Privacy Policy', '/pages/privacy-policy'],
      ['Track Your Order', 'https://track.siardigital.com/wardhasaleem'],
    ],
  },
  {
    title: 'Customer Service',
    links: [
      ['Contact Us', '/pages/contact'],
      ['Shipping Policy', '/pages/shipping-policy'],
      ['Returns & Exchanges', '/pages/returns-exchanges'],
      ['Terms and Conditions', '/pages/terms-conditions'],
    ],
  },
];
function Footer() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches)
      ref.current?.querySelectorAll('details').forEach((detail) => {
        detail.open = false;
      });
  }, []);
  return (
    <footer className="ws-footer" ref={ref}>
      <Link to="/" className="ws-footer-logo">
        <Photo src={content.footerLogo} alt="Wardha Saleem" />
      </Link>
      <div className="ws-footer-grid ws-container">
        {footerGroups.map((group) => (
          <details key={group.title} open>
            <summary>{group.title}</summary>
            <div>
              {group.links.map(([label, href]) => (
                <Link key={href} to={href}>
                  {label}
                </Link>
              ))}
            </div>
          </details>
        ))}
        <div className="ws-newsletter">
          <p>Sign up to receive the latest updates from Wardha Saleem</p>
          <form
            method="post"
            action="https://wardhasaleem.com/contact#contact_form"
          >
            <input type="hidden" name="form_type" value="customer" />
            <input type="hidden" name="utf8" value="✓" />
            <input type="hidden" name="contact[tags]" value="newsletter" />
            <label className="ws-sr" htmlFor="ws-email">
              Your email address
            </label>
            <input
              id="ws-email"
              type="email"
              name="contact[email]"
              placeholder="Your email address"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          <div className="ws-social">
            Follow Us{' '}
            <a
              aria-label="Wardha Saleem Facebook"
              href="https://www.facebook.com/wardhasaleemofficial/"
            >
              f
            </a>
            <a
              aria-label="Wardha Saleem Instagram"
              href="https://www.instagram.com/wardhasaleemofficial/"
            >
              ◎
            </a>
          </div>
        </div>
      </div>
      <div className="ws-copyright">
        <span>
          © {new Date().getFullYear()} Wardha Saleem. All Rights Reserved.
        </span>
        <span>
          Powered by{' '}
          <a href="https://siardigital.com">
            <img
              src="https://cdn.shopify.com/s/files/1/0633/0715/3565/files/Siar_logo.png?v=1776148317"
              alt="Siar Digital"
              width="38"
              height="13"
            />
          </a>
        </span>
        <div>
          {['visa-b614b878', 'master-f5a74105'].map((icon) => (
            <img
              key={icon}
              src={`https://wardhasaleem.com/cdn/shopifycloud/storefront/assets/payment_icons/${icon}.svg`}
              alt={icon.startsWith('visa') ? 'Visa' : 'Mastercard'}
              width="38"
              height="24"
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  function close() {
    setVisible(false);
    try {
      localStorage.setItem('ws-hydrogen-newsletter', String(Date.now()));
    } catch {
      /* Storage is optional. */
    }
  }
  useEffect(() => {
    try {
      if (
        Date.now() -
          Number(localStorage.getItem('ws-hydrogen-newsletter') || 0) <
        7 * 86400000
      )
        return;
    } catch {
      /* Storage is optional. */
    }
    const show = () => {
      if (window.scrollY > 800) {
        setVisible(true);
        window.removeEventListener('scroll', show);
      }
    };
    window.addEventListener('scroll', show, {passive: true});
    return () => window.removeEventListener('scroll', show);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('keydown', escape);
      previous?.focus();
    };
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="ws-popup-backdrop">
      <button
        className="ws-popup-overlay"
        aria-label="Close newsletter"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ws-newsletter-title"
        className="ws-popup"
      >
        <Photo
          src="https://wardhasaleem.com/cdn/shop/files/Newsletter_Popup_9d66c7ec-6871-40a8-bb55-1fa50ed8898b.webp"
          alt="Wardha Saleem collection"
        />
        <div className="ws-newsletter">
          <h2 id="ws-newsletter-title">Sign Up For Our Newsletter</h2>
          <p>
            Stay in the loop with the new arrivals, latest trends, and special
            offers.
          </p>
          <form
            method="post"
            action="https://wardhasaleem.com/contact#contact_form"
          >
            <input type="hidden" name="form_type" value="customer" />
            <input type="hidden" name="utf8" value="✓" />
            <input type="hidden" name="contact[tags]" value="newsletter" />
            <label className="ws-sr" htmlFor="ws-popup-email">
              Your email address
            </label>
            <input
              id="ws-popup-email"
              type="email"
              name="contact[email]"
              placeholder="Your email address"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          <p className="ws-popup-privacy">
            Your Information will never be shared with any third party.
          </p>
        </div>
        <button
          ref={closeButton}
          className="ws-popup-close"
          aria-label="Close newsletter"
          onClick={close}
        >
          ×
        </button>
      </div>
    </div>
  );
}
export function WardhaHomepage({
  products,
  mobileProducts,
}: {
  products: HomeProduct[];
  mobileProducts: HomeProduct[];
}) {
  return (
    <div className="wardha-home">
      <Header />
      <main className="ws-main">
        <h1 className="ws-sr">
          Wardha Saleem — Luxury Pret, Formals and Bridals
        </h1>
        <Hero />
        <NewArrivals products={products} mobileProducts={mobileProducts} />
        <hr className="ws-divider ws-container" />
        <FeaturedCollections />
        <hr className="ws-divider ws-divider-short ws-container" />
        <section className="ws-bestsellers ws-container">
          <h2>Bestselling Collections</h2>
          <p>{content.bestsellerDescription}</p>
          <Rail label="Bestselling collections" seconds={5}>
            {content.bestsellers.map((b, i) => (
              <Link to={b.href} key={b.href}>
                <Photo
                  src={b.image}
                  alt={
                    [
                      'Luxe Edition',
                      'Zimal Silk Edition',
                      'Luxe Edition Resort',
                      'Meeram Festive Formals',
                    ][i]
                  }
                />
              </Link>
            ))}
          </Rail>
        </section>
        <Link className="ws-heritage" to={content.heritage.href}>
          <picture>
            <source
              media="(max-width:767px)"
              srcSet={asset(content.heritage.mobile, 900)}
            />
            <img
              src={asset(content.heritage.image, 2200)}
              alt="Heritage Heirloom Bridals"
              loading="lazy"
              width="2808"
              height="1223"
            />
          </picture>
        </Link>
        <section className="ws-festive ws-container">
          <div>
            <h2>
              <Link to="/collections/festive-bridals">FESTIVE BRIDALS</Link>
            </h2>
            <p>{content.features[3].description}</p>
            <ViewAll href="/collections/festive-bridals" />
          </div>
          <Link to="/collections/festive-bridals">
            <Photo src={content.festive} alt="Festive Bridals" />
          </Link>
        </section>
        <section className="ws-brides ws-container">
          <h2 className="ws-feature-mobile-title">Wardha Saleem Brides</h2>
          <Link
            className="ws-bride-photo"
            to="/collections/wardha-saleem-brides"
          >
            <Photo src={content.bride} alt="Wardha Saleem bride Bakhtawar" />
          </Link>
          <div className="ws-bride-product">
            <h2>Wardha Saleem Brides</h2>
            <Link to="/products/bakhtawar" className="ws-bride-card">
              <Photo
                src={content.brideProduct}
                alt="Bakhtawar bridal ensemble"
              />
              <span>View Products</span>
            </Link>
            <Link to="/products/bakhtawar">BAKHTAWAR</Link>
            <a
              className="ws-call-price"
              href="https://api.whatsapp.com/send?phone=923252599929"
            >
              Call for Price
            </a>
          </div>
        </section>
        <section className="ws-celebrities ws-container">
          <h2>CELEBRITY SPOTTED</h2>
          <Rail label="Celebrity spotted" seconds={7}>
            {content.celebrities.map((b, i) => (
              <Link to={b.href} key={b.href}>
                <Photo
                  src={b.image}
                  alt={`Wardha Saleem celebrity look ${i + 1}`}
                />
              </Link>
            ))}
          </Rail>
        </section>
      </main>
      <Footer />
      <NewsletterPopup />
      <a
        className="ws-whatsapp"
        href="https://api.whatsapp.com/send?phone=923252599929&text=Hello%20I%20have%20a%20question%20regarding%20Wardha%20Saleem%3F"
        aria-label="Chat on WhatsApp"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M26 16a10 10 0 0 1-15 8.7L5 27l2-6A10 10 0 1 1 26 16Z" />
          <path d="M12 10c-3 2 1 9 6 11 2 1 4-2 3-3l-3-1-1 2c-2-1-4-3-4-5l1-1-2-3Z" />
        </svg>
      </a>
      <div className="ws-currency" aria-label="Prices in Pakistani rupees">
        🇵🇰 <span>PKR</span>
      </div>
    </div>
  );
}

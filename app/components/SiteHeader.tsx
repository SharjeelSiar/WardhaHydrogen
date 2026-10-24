import {Suspense, useState, useEffect} from 'react';
import {Await, Link, useLocation} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from './Aside';
import {Modal} from './Modal';
import {localHref, type SiteData, type SiteMenuItem} from '~/lib/site';

export function SiteIcon({name}: {name: 'search' | 'bag' | 'user' | 'menu'}) {
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
function BagCount({cart}: {cart: CartApiQueryFragment | null}) {
  const optimistic = useOptimisticCart(cart);
  return <span className="ws-bag-count">{optimistic?.totalQuantity || 0}</span>;
}
function MenuLinks({
  items,
  onNavigate,
}: {
  items: SiteMenuItem[];
  onNavigate: () => void;
}) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`}>
          {item.items?.length ? (
            <details>
              <summary>{item.title}</summary>
              <Link onClick={onNavigate} to={localHref(item.url)}>
                View all {item.title}
              </Link>
              <MenuLinks items={item.items} onNavigate={onNavigate} />
            </details>
          ) : (
            <Link onClick={onNavigate} to={localHref(item.url)}>
              {item.title}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
export function SiteHeader({
  items,
  site,
  cart,
}: {
  items: SiteMenuItem[];
  site: SiteData;
  cart: Promise<CartApiQueryFragment | null>;
}) {
  const {open} = useAside();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => setMenu(false), [location.pathname, location.search]);
  const {settings, images} = site;
  return (
    <>
      {settings.announcement_text && (
        <div className="ws-announcement">
          <Link to={localHref(settings.announcement_link)}>
            {settings.announcement_text}
          </Link>
        </div>
      )}
      <header className="ws-header">
        <button
          className="ws-mobile-menu ws-icon"
          aria-label="Open menu"
          aria-expanded={menu}
          onClick={() => setMenu(true)}
        >
          <SiteIcon name="menu" />
        </button>
        <Link className="ws-logo" to="/" aria-label="Wardha Saleem home">
          <picture>
            <source
              media="(max-width:767px)"
              srcSet={settings.mobile_logo || settings.logo}
            />
            <img
              src={settings.logo}
              alt="Wardha Saleem"
              width="175"
              height="33"
            />
          </picture>
        </Link>
        <nav className="ws-nav" aria-label="Main navigation">
          {items.map((item, i) => (
            <div className="ws-nav-item" key={`${item.title}-${i}`}>
              <Link to={localHref(item.url)}>{item.title}</Link>
              {!!item.items?.length && (
                <div className="ws-mega">
                  {item.items.map((child, j) => (
                    <div className="ws-mega-item" key={`${child.title}-${j}`}>
                      <Link to={localHref(child.url)}>
                        {images[localHref(child.url)] && (
                          <img
                            src={images[localHref(child.url)]}
                            alt=""
                            loading="lazy"
                          />
                        )}
                        <span>{child.title}</span>
                      </Link>
                      {!!child.items?.length && (
                        <MenuLinks
                          items={child.items}
                          onNavigate={() => undefined}
                        />
                      )}
                    </div>
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
            <SiteIcon name="search" />
          </button>
          <Link
            className="ws-icon ws-account"
            to="/account"
            aria-label="My account"
          >
            <SiteIcon name="user" />
          </Link>
          <button
            className="ws-icon ws-bag"
            aria-label="Shopping bag"
            onClick={() => open('cart')}
          >
            <SiteIcon name="bag" />
            <Suspense fallback={<span className="ws-bag-count">0</span>}>
              <Await resolve={cart}>{(cart) => <BagCount cart={cart} />}</Await>
            </Suspense>
          </button>
        </div>
      </header>
      <Modal
        open={menu}
        onClose={() => setMenu(false)}
        title="Menu"
        className="ws-menu-dialog"
      >
        <MenuLinks items={items} onNavigate={() => setMenu(false)} />
        <Link onClick={() => setMenu(false)} to="/account">
          My account
        </Link>
      </Modal>
    </>
  );
}

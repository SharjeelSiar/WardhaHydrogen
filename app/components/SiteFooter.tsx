import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import {localHref, type SiteMenuItem, type SiteSettings} from '~/lib/site';
export function SiteFooter({
  items,
  settings,
}: {
  items: SiteMenuItem[];
  settings: SiteSettings;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const query = window.matchMedia('(max-width:767px)');
    const update = () =>
      ref.current?.querySelectorAll('details').forEach((el) => {
        el.open = !query.matches;
      });
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return (
    <footer className="ws-footer" ref={ref}>
      <Link to="/" className="ws-footer-logo">
        <img src={settings.footer_logo} alt="Wardha Saleem" loading="lazy" />
      </Link>
      <div className="ws-footer-grid ws-container">
        {items.map((group, i) => (
          <details key={`${group.title}-${i}`} open>
            <summary>{group.title}</summary>
            <div>
              {group.items?.length ? (
                group.items.map((link, j) => (
                  <Link key={`${link.title}-${j}`} to={localHref(link.url)}>
                    {link.title}
                  </Link>
                ))
              ) : (
                <Link to={localHref(group.url)}>{group.title}</Link>
              )}
            </div>
          </details>
        ))}
        <div className="ws-newsletter">
          <p>{settings.newsletter_text}</p>
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
              name="contact[email]"
              type="email"
              placeholder="Your email address"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          <div className="ws-social">
            Follow Us{' '}
            {settings.facebook_url && (
              <a
                href={settings.facebook_url}
                aria-label="Wardha Saleem Facebook"
              >
                f
              </a>
            )}{' '}
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                aria-label="Wardha Saleem Instagram"
              >
                ◎
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="ws-copyright">
        <span>
          © {new Date().getFullYear()} {settings.copyright_text}
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
export function SiteUtilities({settings}: {settings: SiteSettings}) {
  return (
    <>
      {settings.whatsapp_url && (
        <a
          className="ws-whatsapp"
          href={settings.whatsapp_url}
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
      )}
      <div className="ws-currency" aria-label="Prices in Pakistani rupees">
        🇵🇰 <span>PKR</span>
      </div>
    </>
  );
}

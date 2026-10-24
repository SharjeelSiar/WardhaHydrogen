import type {HydrogenRouterContextProvider} from '@shopify/hydrogen';
import defaults from '~/content/site-defaults.json';
import home from '~/content/homepage.json';

export type SiteMenuItem = {
  title: string;
  url?: string | null;
  items?: SiteMenuItem[];
};
export type SiteSettings = Record<string, string>;
export type SiteData = {settings: SiteSettings; images: Record<string, string>};
export function localHref(url: string | null | undefined, storeDomain = '') {
  if (!url) return '/';
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol))
      return '/';
    const known = [
      'wardhasaleem.com',
      'www.wardhasaleem.com',
      'wardha-saleem-sd.myshopify.com',
      storeDomain,
    ];
    return known.includes(parsed.hostname)
      ? parsed.pathname + parsed.search + parsed.hash
      : url;
  } catch {
    return '/';
  }
}
export const defaultSettings: SiteSettings = {
  ...defaults.settings,
  logo: home.logo,
  mobile_logo: home.mobileLogo,
  footer_logo: home.footerLogo,
  size_chart:
    'https://cdn.shopify.com/s/files/1/0633/0715/3565/files/Wardha_Size_Chart_5c4c043c-06e8-4baa-933b-bf1bd876d721.png',
};
export const defaultSite: SiteData = {
  settings: defaultSettings,
  images: Object.fromEntries(
    defaults.images.map((x) => [localHref(x.link), x.image_url]),
  ),
};
export const fallbackHeader: SiteMenuItem[] = defaults.header;
export const fallbackFooter: SiteMenuItem[] = defaults.footer;

export async function loadSiteData(
  context: Readonly<HydrogenRouterContextProvider>,
): Promise<SiteData> {
  const result = await context.storefront.query(SITE_QUERY, {
    cache: context.storefront.CacheShort(),
  });
  const settings: SiteSettings = {...defaultSettings};
  for (const field of result.site?.fields || [])
    settings[field.key] =
      field.reference?.__typename === 'MediaImage'
        ? field.reference.image?.url || ''
        : field.value || '';
  const images: Record<string, string> = {...defaultSite.images};
  for (const entry of result.navigationImages.nodes) {
    const fields = Object.fromEntries(entry.fields.map((f) => [f.key, f]));
    const image = fields.image?.reference;
    const url =
      image?.__typename === 'MediaImage'
        ? image.image?.url
        : fields.image_url?.value;
    if (fields.link?.value) images[localHref(fields.link.value)] = url || '';
  }
  return {settings, images};
}
const SITE_QUERY = `#graphql
  fragment SiteField on MetaobjectField {
    key value reference { __typename ... on MediaImage { image { url altText width height } } }
  }
  query HydrogenSiteSettings {
    site: metaobject(handle:{type:"hydrogen_site_settings",handle:"wardha-hydrogen"}) {fields {...SiteField}}
    navigationImages: metaobjects(type:"hydrogen_navigation_image",first:50) {nodes {fields {...SiteField}}}
  }
` as const;

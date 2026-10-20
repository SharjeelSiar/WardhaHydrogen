import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {WardhaHomepage} from '~/components/WardhaHomepage';
import {homeProducts} from '~/lib/homepage';
import stylesheet from '~/styles/wardha-home.css?url';
export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: stylesheet},
];
export const meta: Route.MetaFunction = () => [
  {title: 'Wardha Saleem | Luxury Pret, Formals & Bridals'},
  {
    name: 'description',
    content:
      'Discover Wardha Saleem luxury pret, exquisite formals and heritage heirloom bridals.',
  },
  {name: 'robots', content: 'noindex, nofollow'},
];
export async function loader({context}: Route.LoaderArgs) {
  const [products, mobileProducts] = await Promise.all([
    homeProducts(context, 'new-in'),
    homeProducts(context, 'aari-vol-2'),
  ]);
  return {products, mobileProducts};
}
export default function Homepage() {
  const {products, mobileProducts} = useLoaderData<typeof loader>();
  return <WardhaHomepage products={products} mobileProducts={mobileProducts} />;
}

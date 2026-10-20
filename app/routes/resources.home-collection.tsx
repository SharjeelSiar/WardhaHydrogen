import type {Route} from './+types/resources.home-collection';
import {homeProducts} from '~/lib/homepage';
import content from '~/content/homepage.json';
export async function loader({request, context}: Route.LoaderArgs) {
  const handle = new URL(request.url).searchParams.get('handle') || '';
  if (!content.tabs.some((tab) => tab.handle === handle))
    throw new Response('Collection not found', {status: 404});
  return Response.json({products: await homeProducts(context, handle)});
}

import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
export function useRootLoaderData() {
  return useRouteLoaderData<RootLoader>('root');
}

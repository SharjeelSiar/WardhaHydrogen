import {useEffect, useRef} from 'react';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
type CartResult = {
  errors?: Array<{message: string}>;
  cart?: {id: string} | null;
};
function SubmitButton({
  fetcher,
  disabled,
  children,
  onClick,
  onSuccess,
}: {
  fetcher: FetcherWithComponents<CartResult>;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  onSuccess?: () => void;
}) {
  const submitted = useRef(false);
  useEffect(() => {
    if (fetcher.state !== 'idle') {
      submitted.current = true;
      return;
    }
    if (submitted.current) {
      submitted.current = false;
      if (fetcher.data?.cart?.id && !fetcher.data.errors?.length) onSuccess?.();
    }
  }, [fetcher.state, fetcher.data, onSuccess]);
  return (
    <>
      <button
        type="submit"
        onClick={onClick}
        disabled={!!disabled || fetcher.state !== 'idle'}
      >
        {fetcher.state === 'idle' ? children : 'Adding…'}
      </button>
      {!!fetcher.data?.errors?.length && (
        <div role="alert" className="ws-cart-errors">
          {fetcher.data.errors.map((error, i) => (
            <p key={i}>{error.message}</p>
          ))}
        </div>
      )}
    </>
  );
}
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  onSuccess,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  onSuccess?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <SubmitButton
            fetcher={fetcher}
            disabled={disabled}
            onClick={onClick}
            onSuccess={onSuccess}
          >
            {children}
          </SubmitButton>
        </>
      )}
    </CartForm>
  );
}

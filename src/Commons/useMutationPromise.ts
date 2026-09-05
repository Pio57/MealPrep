import type { SmartMaybePromise } from './deferProperties';

/** Minimal shape shared by TanStack Query's mutation/query result objects. */
export interface MutationLikeState<TData> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: TData | undefined;
  error: unknown;
}

export interface MapMutationToPromiseOptions {
  /** Resolve to `undefined` instead of the mutation payload (fire-and-forget actions). */
  ignorePayload?: boolean;
}

/**
 * Converts a TanStack Query mutation/query state into a `SmartMaybePromise`:
 * the resolved value once settled, or a pending `Promise` while in flight.
 * ViewModels use this to hand the View a single awaitable prop instead of
 * separate `isPending` / `data` / `error` fields.
 */
export function mapMutationToPromise<TData>(
  state: MutationLikeState<TData>,
  options: MapMutationToPromiseOptions = {},
): SmartMaybePromise<TData | undefined> {
  switch (state.status) {
    case 'success':
      return options.ignorePayload ? undefined : state.data;
    case 'error':
      return Promise.reject(state.error);
    case 'pending':
    case 'idle':
    default:
      return new Promise<TData | undefined>(() => {
        // Intentionally never settles: this tick's render is still waiting
        // on the underlying mutation/query, which will re-render the
        // subscriber (via useAtomValue) once it settles.
      });
  }
}

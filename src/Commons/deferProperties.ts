/**
 * A value that is either already resolved or still resolving.
 * Consumed with React's `use()` hook so a screen can suspend on it
 * without threading loading/error booleans through every prop.
 */
export type SmartMaybePromise<T> = T | Promise<T>;

/**
 * Wraps a `SmartMaybePromise` so the same reference is returned across
 * re-renders while it is still pending. React's `use()` hook requires a
 * stable promise identity — passing a freshly created Promise on every
 * render would re-trigger Suspense in a loop.
 */
export function deferProperties<T>(value: SmartMaybePromise<T>): SmartMaybePromise<T> {
  if (!(value instanceof Promise)) {
    return value;
  }

  if (!pendingPromiseCache.has(value)) {
    pendingPromiseCache.set(value, value);
  }

  return pendingPromiseCache.get(value) as Promise<T>;
}

const pendingPromiseCache = new WeakMap<Promise<unknown>, Promise<unknown>>();

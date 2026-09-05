import { atom } from 'jotai';

/** Keyed by `${productId}|${unit}` — the same aggregation key the ViewModel produces. */
export const checkedShoppingItemsAtom = atom<ReadonlySet<string>>(new Set<string>());

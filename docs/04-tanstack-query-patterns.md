# 💎 Pattern TanStack Query Avanzati

Questo documento descrive i pattern avanzati usati con **Jotai + TanStack Query** per paginazione server-side, infinite scroll e background refetching, applicati nella feature Invoices.

---

## Sincronizzazione dei QueryClient (React Provider ⇄ Jotai Engine)

Per fare in modo che le invalidazioni effettuate nel Controller (lato React) rinfreschino correttamente gli atomi di Jotai Query, le due istanze di QueryClient devono essere sincronizzate.

### 1. Sincronizzazione in `App.tsx`
```typescript
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { queryClientAtom } from "jotai-tanstack-query";

// All'interno di App():
const queryClient = useQueryClient();
const setJotaiQueryClient = useSetAtom(queryClientAtom);
React.useEffect(() => {
  setJotaiQueryClient(queryClient);
}, [queryClient, setJotaiQueryClient]);
```

### 2. Utilizzo dell'atom sincronizzato nelle query
```typescript
export const invoicesQueryAtom = atomWithQuery<PaginatedInvoicesResponse>((get) => {
  const page = get(currentPageAtom);
  const limit = get(itemsPerPageAtom);
  const queryClient = get(queryClientAtom); // Ottiene il client allineato!
  
  return {
    queryKey: ["invoicesList", page, limit],
    queryFn: () => fetchInvoicesApi(page, limit),
    queryClient,
  };
});
```

---

## Paginazione Server-Side Reattiva

Anziché scaricare l'intera lista ed effettuare lo slicing a livello client, il caricamento di rete è paginato reattivamente legando l'atomo query a `currentPageAtom` e `itemsPerPageAtom`.

Ogni variazione indotta dal Controller su `currentPageAtom` fa scattare automaticamente una nuova chiamata di rete tramite il rinfresco della `queryKey: ["invoicesList", page, limit]`.

---

## UX Ottimistica e Invalidazione nel Controller

A seguito dell'avvenuta sottomissione (mutazione) di una nuova fattura PDF:

1. **Ripristino UX**: Impostare la pagina corrente a `1` (`setCurrentPage(1)`) per portare l'utente a vedere immediatamente il nuovo elemento inserito in cima.
2. **Invalidazione Cache**: Invocare `queryClient.invalidateQueries({ queryKey: ["invoicesList"] })` per forzare TanStack Query a ri-scaricare la pagina 1 aggiornata.

```typescript
await uploadInvoiceMutation.mutateAsync(file.name);
setCurrentPage(1);
queryClient.invalidateQueries({ queryKey: ["invoicesList"] });
queryClient.invalidateQueries({ queryKey: ["invoicesInfiniteList"] });
```

---

## Distinzione tra "Loading" e "Background Refetching"

* **`isLoading`**: La cache è vuota al primo avvio. Richiede un indicatore bloccante (Spinner o Skeleton centrale).
* **`isFetching && !isLoading`**: I dati sono già visualizzati in cache ma stiamo effettuando il rinfresco silenzioso in background.
* **Resa Visiva**: Mostrare un micro-indicatore non invasivo (es. una shimmering progress bar sfumata a gradiente posizionata sul bordo superiore del pannello).

Con il pattern `LoadableState` questa distinzione è già incorporata nel campo `isFetching` dello stato `success`. Non occorre calcolarla manualmente nello ScreenLoader.

---

## Infinite Scroll con IntersectionObserver

L'implementazione dello scroll infinito deve evitare calcoli di altezze empirici su eventi `onScroll`. Il pattern ottimale usa un **Sentinel Element** gestito tramite **`IntersectionObserver`**.

### Definizione dell'atom (`atomWithInfiniteQuery`)

```typescript
export const invoicesInfiniteQueryAtom = atomWithInfiniteQuery<PaginatedInvoicesResponse>((get) => {
  const queryClient = get(queryClientAtom);
  return {
    queryKey: ["invoicesInfiniteList"],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => fetchInvoicesApi(pageParam as number, 3),
    getNextPageParam: (lastPage, allPages) => {
      const loadedItems = allPages.length * 3;
      if (loadedItems >= lastPage.totalItems) return undefined; // nessuna pagina successiva
      return allPages.length + 1;
    },
    queryClient,
  };
});
```

`getNextPageParam` viene chiamata solo dopo che la prima pagina è caricata: restituisce `undefined` se non ci sono altre pagine (→ `hasNextPage = false`), oppure il numero della prossima pagina. **`hasNextPage` e `isFetchingNextPage` sono quindi disponibili solo dopo la prima chiamata** e vanno incapsulati nel payload `success` del `LoadableState` (vedi [05-loadable-state.md](./05-loadable-state.md)).

### Componente View con IntersectionObserver

```typescript
const scrollContainerRef = useRef<HTMLDivElement>(null);
const sentinelRef = useRef<HTMLDivElement>(null);

React.useEffect(() => {
  if (!hasNextPage || isFetchingNextPage) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) onFetchNextPage();
    },
    {
      root: scrollContainerRef.current,
      rootMargin: "30px", // Margine di pre-fetch
      threshold: 0.01,
    }
  );

  const sentinel = sentinelRef.current;
  if (sentinel) observer.observe(sentinel);
  return () => { if (sentinel) observer.unobserve(sentinel); };
}, [hasNextPage, isFetchingNextPage, onFetchNextPage]);
```

Nel JSX, il sentinel va posizionato subito dopo la lista degli elementi:

```tsx
<div ref={scrollContainerRef} className="max-h-[300px] overflow-y-auto">
  {invoices.map((invoice) => (
    <div key={invoice.id}>{/* ... */}</div>
  ))}
  {/* Sentinel invisibile di fine lista */}
  <div ref={sentinelRef} className="h-0.5 w-full pointer-events-none opacity-0" />
</div>
```

### Indicatore di Background Refresh Infinito

Quando una mutazione invalida la query dello scroll infinito, TanStack Query rinfresca le pagine correnti in background. Il campo `isFetching` dello stato `success` del `LoadableState` copre questo caso: se `true` mentre ci sono già dati, mostrare un indicatore non bloccante:

```tsx
<div className="relative">
  {isFetching && (
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse" />
  )}
  {/* Lista... */}
</div>
```

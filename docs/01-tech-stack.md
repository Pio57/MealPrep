# 🛠️ Tech Stack & Setup del Progetto

Questo documento descrive le tecnologie usate nel progetto, la loro versione, scopo e come configurare un progetto simile da zero.

---

## Bundler & Toolchain

| Strumento | Versione | Scopo |
|---|---|---|
| **Vite** | `^8` | Bundler e dev server ultra-rapido |
| **TypeScript** | `~6` | Type-safety statica a compile-time |
| **ESLint** | `^10` | Linting con plugin per React Hooks e React Refresh |

**Configurazione Vite** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }, // alias @ → src/
  },
})
```

**Path alias `@`**: Tutti gli import assoluti usano `@/` come alias per `src/`. Questo evita percorsi relativi lunghi come `../../../../Commons/...`. Va configurato sia in `vite.config.ts` che in `tsconfig.app.json`:
```json
// tsconfig.app.json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**Opzioni TypeScript rilevanti** (`tsconfig.app.json`):
- `noUnusedLocals` / `noUnusedParameters`: errore se ci sono variabili o parametri inutilizzati
- `noFallthroughCasesInSwitch`: errore se uno `switch` ha un `case` senza `break` o `return` — garantisce l'esaustività
- `erasableSyntaxOnly`: abilita la cancellazione sicura di sintassi TypeScript-only (es. `type`, `interface`)
- `verbatimModuleSyntax`: forza l'uso di `import type` per i tipi, riducendo il bundle

---

## Librerie Core

| Libreria | Versione | Scopo |
|---|---|---|
| **React** | `^19` | UI framework |
| **react-dom** | `^19` | Rendering nel DOM |
| **react-router-dom** | `^7` | Routing client-side con URL reali |
| **jotai** | `^2` | State management atomico, leggero e composable |
| **jotai-tanstack-query** | `^0.11` | Bridge tra Jotai e TanStack Query (`atomWithQuery`, `atomWithInfiniteQuery`, `atomWithMutation`) |
| **jotai-family** | `^1` | Atomi parametrizzati (famiglia di atomi) |
| **@tanstack/react-query** | `^5` | Server-state management: caching, invalidazione, refetching |

### Perché Jotai + TanStack Query insieme?

- **Jotai** gestisce lo stato client (form, UI state, selezioni) con atom primitivi e derivati.
- **TanStack Query** gestisce il server-state (fetch, cache, sincronizzazione) tramite `queryKey`.
- **`jotai-tanstack-query`** unisce i due: gli atom di tipo `atomWithQuery` combinano la reattività di Jotai con le capabilities di caching/invalidazione di TanStack Query. Il risultato è uno stato server reattivo che si aggiorna automaticamente senza boilerplate.
- Per sincronizzare le due istanze di `QueryClient` (React Provider e motore Jotai), si usa `queryClientAtom` di `jotai-tanstack-query` + `useSetAtom` al mount della root.

---

## Librerie UI & Stile

| Libreria | Versione | Scopo |
|---|---|---|
| **tailwindcss** | `^4` | Utility-first CSS (integrato via plugin Vite) |
| **@tailwindcss/vite** | `^4.3` | Plugin Vite per Tailwind v4 (niente `postcss.config.js`) |
| **tw-animate-css** | `^1.4` | Animazioni Tailwind (`animate-in`, `fade-in`, `zoom-in-95`, ecc.) |
| **lucide-react** | `^1` | Icone SVG tree-shakeable come componenti React |
| **radix-ui** | `^1` | Componenti headless accessibili (base per shadcn) |
| **shadcn** | `^4` | Sistema di componenti UI basato su Radix + Tailwind |
| **class-variance-authority** | `^0.7` | Utility per varianti di classe (usata internamente da shadcn) |
| **clsx** | `^2` | Utility per unire classi condizionalmente |
| **tailwind-merge** | `^3` | Merge intelligente di classi Tailwind (risolve conflitti) |
| **@fontsource-variable/geist** | `^5` | Font Geist (variable) self-hosted senza Google Fonts CDN |
| **react-error-boundary** | `^6` | Componente `<ErrorBoundary>` per catturare errori React a runtime |

---

## Client API & OpenAPI Integration

Il frontend comunica con il server backend tramite un client HTTP fortemente tipizzato autogenerato a partire dalla specifica OpenAPI del backend.

* **Tecnologia**: `openapi-fetch` come client HTTP leggero e type-safe nativo.
* **Generatore di Tipi**: `openapi-typescript` per generare le definizioni dei tipi statici TypeScript da file JSON/YAML OpenAPI.
* **Atom Derivato**: Il client API non viene utilizzato direttamente come istanza globale statica, bensì esposto tramite un atomo di Jotai derivato da `tokenAtom`: `mioCfoOpenApiClientAtom` (definito in `@/Core/features/ApiClient/Client/MioCfoOpenApiClient.ts`). In questo modo, qualsiasi variazione del token di autenticazione aggiorna reattivamente gli header `Authorization` del client OpenAPI per tutte le richieste successive.

### Linee Guida per gli Sviluppatori:
1. **Sempre Type-Safe**: Non utilizzare chiamate fetch o axios grezze o non tipizzate. Utilizza sempre il client generato tramite l'atomo `mioCfoOpenApiClientAtom`.
2. **Divieto di `any` e Cast Insicuri**: **Non deve mai essere usato `any` né type cast insicuri (`as any`, `as unknown as Type`, ecc.)**. Se si riscontra un problema o un'incompatibilità di tipi, **non cercare di aggirarlo** con cast di comodo. Bisogna invece investigare il motivo per cui i tipi non corrispondono, capire l'incongruenza strutturale, e adeguare il codice in modo da mantenere l'intera base di codice rigorosamente type-safe.
   * *Nota*: È parimenti vietato l'uso di scorciatoie di deep-cloning non type-safe come `JSON.parse(JSON.stringify(obj)) as Type`. Se si deve clonare o trasformare un oggetto, utilizzare operatori di spread (`...`) nativi o funzioni di mapping esplicito per preservare la verifica dei tipi a compile-time.
3. **Integrità delle Interfacce Locali e Mapping**: **Non si deve cercare di allineare rapidamente la firma delle interfacce locali** a quella dei DTO generati dall'API per risolvere conflitti di tipo. Le piccole discrepanze (es. gestione di `null`/`undefined`, o l'uso di enums locali rispetto a string literal unions) sono intenzionali e presenti per un motivo preciso (separazione di responsabilità o requisiti di UI). Tali discrepanze non vanno ignorate o annullate allineando le interfacce locali, ma devono essere risolte implementando funzioni di **mapping esplicito e type-safe** nel livello dello stato (atomi) o dei servizi.
4. **Rigenerazione dei Tipi**: Ogni volta che la specifica del backend cambia, ricordati di aggiornare il file locale `src/Core/OpenApi/MioCfo_Openapi.json` e rigenerare le definizioni TypeScript tramite lo script dedicato:
   ```bash
   npm run openapi:generate
   ```
5. **Controllo Tipi (Typecheck)**: A causa della configurazione multi-progetto (TypeScript References) di Vite, il semplice comando `tsc --noEmit` alla radice non esegue il controllo dei file sorgenti dell'app. Per effettuare un typecheck corretto ed equivalente a quello dell'editor, utilizza lo script dedicato:
   ```bash
   npm run typecheck
   ```

---

## Setup Iniziale di un Progetto Simile

```bash
# 1. Crea il progetto con Vite + React + TypeScript
npm create vite@latest my-app -- --template react-ts
cd my-app

# 2. Installa le dipendenze core
npm install jotai jotai-tanstack-query jotai-family @tanstack/react-query react-router-dom

# 3. Installa Tailwind v4 (via plugin Vite, niente postcss)
npm install tailwindcss @tailwindcss/vite tw-animate-css

# 4. Installa UI e utility
npm install lucide-react radix-ui react-error-boundary clsx tailwind-merge class-variance-authority

# 5. Font self-hosted
npm install @fontsource-variable/geist
```

Aggiungere in `vite.config.ts`:
```typescript
import tailwindcss from '@tailwindcss/vite'
// e aggiungere tailwindcss() nell'array plugins
```

Aggiungere in `src/index.css`:
```css
@import "@fontsource-variable/geist";
@import "tw-animate-css";
@import "tailwindcss";
```

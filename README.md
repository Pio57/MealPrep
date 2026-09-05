# MealPrep


Take-home per la posizione di Mobile Software Engineer @ Blackboard Studio.

MealPrep è un'app React Native (bare CLI, TypeScript) che guida l'utente attraverso un flusso di 5 schermate per generare, tramite un workflow LLM, un piano pasti settimanale su misura in base a budget, esigenze dietetiche e obiettivi nutrizionali.

## Indice

- [Cosa fa l'app](#cosa-fa-lapp)
- [Come si avvia](#come-si-avvia)
- [Dipendenze principali](#dipendenze-principali)
- [Architettura](#architettura)
- [Flusso e feature richieste dall'assegno](#flusso-e-feature-richieste-dallassegno)
- [Feature extra (oltre l'assegno)](#feature-extra-oltre-lassegno)
- [Struttura del progetto](#struttura-del-progetto)
- [Documentazione aggiuntiva](#documentazione-aggiuntiva)

## Cosa fa l'app

L'utente apre l'app, sceglie un budget settimanale, eventuali esigenze dietetiche (es. vegetariano, senza glutine) e obiettivi nutrizionali (es. ricco di proteine, povero di zuccheri), e riceve un piano pasti di 7 giorni — colazione, pranzo e cena per ogni giorno — generato da un LLM (OpenAI) a partire dal catalogo prodotti Esselunga fornito. Ogni pasto mostra ingredienti, ricetta passo-passo, tempo di preparazione e costo. Da lì l'utente può anche generare la lista della spesa aggregata di tutta la settimana.

## Come si avvia

Requisiti: Node.js ≥ 22.11, un ambiente React Native funzionante (Android SDK + emulatore, oppure Xcode + simulatore iOS).

```bash
npm install
```

Poi creare un file `.env` nella root del progetto (ignorato da git) con la propria chiave OpenAI, necessaria per generare il piano pasti via LLM:

```
OPENAI_API_KEY=sk-...
```

Infine avviare l'app:

```bash
npm run android        # oppure: npm run ios
```

Per il bundler in isolamento: `npm start`. Per i test: `npm test`. Per il lint: `npm run lint`.

## Dipendenze principali

| Libreria | Scopo |
|---|---|
| `react` / `react-native` | Framework UI e runtime nativo (bare CLI, non Expo) |
| `@react-navigation/native` + `native-stack` | Navigazione tra le 5 schermate del flusso + modale Lista della spesa |
| `jotai` | State management atomico (stato client) |
| `@tanstack/react-query` + `jotai-tanstack-query` | Server-state: chiamata LLM come query cacheata/reattiva, esposta come atomo |
| `jotai-family` | Atomi parametrizzati dove serve |
| `react-native-svg` | Grafica vettoriale (es. testo con gradiente nella schermata Budget) |
| `@react-native-community/slider` | Base dello slider budget (con traccia personalizzata sopra, vedi decisioni sotto) |
| `react-native-safe-area-context` | Gestione corretta degli insets su Android edge-to-edge / iOS notch |
| `react-native-gesture-handler` / `react-native-screens` | Richiesti da React Navigation per gesture e performance nativa |
| `react-native-html-to-pdf` + `react-native-share` | Esportazione della lista della spesa in PDF e condivisione tramite lo share sheet nativo |

Il catalogo prodotti (`product_catalog_en.json`, ~3.2 MB) è incluso in `src/Assets/data/` e caricato interamente client-side, come indicato nel brief ("everything can be done client-side").

## Architettura

Il codice segue un pattern **MVVM a 5 livelli**, applicato in modo identico a ogni feature sotto `src/Core/features/<NomeFeature>/`:

```
features/NomeFeature/
├── State/          → atomi Jotai (stato primitivo + query/mutation)
├── Controller/      → hook use*Controller: solo callback (handleX), nessun dato in output
├── ViewModel/        → classe con funzione statica pura *ViewModel.create(): input → DTO
├── ScreenLoader/     → orchestratore: legge gli atomi, chiama il ViewModel, inietta le props
└── View/
    ├── Components/  → componenti presentazionali isolati
    └── Screens/     → schermata principale, riceve tutto via props (nessun atomo, nessun useEffect di fetch)
```

Punti chiave:
- **ViewModel puro**: non è un hook né un atomo, quindi è testabile in isolamento senza montare React.
- **Query LLM come atomo**: la generazione del piano pasti è un `atomWithQuery` (`mealPlanQueryAtom`), quindi si attiva automaticamente alla sottoscrizione e viene cacheata; non serve nessun `useEffect` per lanciarla.
- **Navigazione**: uno stack di `@react-navigation/native-stack` con header nascosto (`headerShown: false`, ogni schermata gestisce la propria UI), definito in `src/Core/Navigation/RootNavigator.tsx`.

Documentazione di dettaglio in `docs/` (vedi sezione [Documentazione aggiuntiva](#documentazione-aggiuntiva)).

## Flusso e feature richieste dall'assegno

Le 5 schermate del flusso core, come da specifica:

1. **Lander** (`Lander`) — schermata di apertura; asset ed emoji al centro personalizzati con un'animazione di rotazione a orbita (parte lasciata libera dal brief).
2. **Budget Selection** (`BudgetSelection`) — slider per il budget settimanale, range **25–150 €**. Lo slider nativo non permette di controllare lo spessore della traccia, quindi sopra a uno slider reso trasparente (solo per thumb/touch) è disegnata una traccia personalizzata (due `View` assolute: sfondo + riempimento proporzionale al valore).
3. **Dietary Needs** (`DietaryNeeds`) — esigenze dietetiche: Nessuna, Vegetariano, Vegano, Pescetariano, Senza glutine, Senza lattosio. Ogni opzione è mappata su un filtro reale del catalogo (`src/Core/Catalog/dietaryNeeds.ts`): label positive del prodotto (es. "Vegetarian"), allergeni da escludere (es. "Glutine", "Latte"), o reparti da escludere (es. Pescetariano esclude i reparti carne/salumi ma include il pesce).
4. **Nutritional Goals** (`NutritionalGoals`) — obiettivi nutrizionali: Ricco di proteine, Povero di zuccheri/grassi/carboidrati/sale. Anche qui ogni opzione è una soglia reale sui valori nutrizionali per 100g del prodotto (`src/Core/Catalog/nutritionalGoals.ts`).
5. **Weekly Meal Plan** (`MealPlan`) — piano di 7 giorni generato via LLM (OpenAI, workflow in `src/Core/Llm/mealPlanWorkflow.ts`). Il catalogo viene prima filtrato lato client secondo le esigenze/obiettivi selezionati, poi ridotto a un sottoinsieme rappresentativo (max 25 prodotti per reparto, 220 totali) per stare in un budget di token ragionevole; il prompt impone: piano interamente in italiano, uso esclusivo di `productId` reali dal sottoinsieme, `totalPrice` entro il budget scelto, e **3 pasti a giorno** (colazione/pranzo/cena, oltre il minimo di 1/giorno richiesto dal brief) con convenzioni italiane (niente pasta a colazione). Ogni pasto mostra nome, tipo pasto, tempo di preparazione, porzioni, prezzo, ingredienti e ricetta passo-passo. La navigazione tra i pasti dello stesso giorno avviene con swipe orizzontale sulla card; le linguette in alto cambiano giorno, con selezione automatica del giorno corrente all'apertura.

## Feature extra (oltre l'assegno)

Non richieste dal brief, aggiunte come miglioramento del flusso:

- **Lista della spesa aggregata** (`ShoppingList`, icona 🛒 in alto a destra su MealPlan): somma automaticamente le quantità dello stesso ingrediente usato in più ricette della settimana (es. salmone in 2 pasti → un'unica riga in grammi totali), raggruppata per reparto del supermercato nell'ordine tipico di percorrenza (frutta e verdura → panetteria → latticini → carne → ... → infanzia). Ogni riga è spuntabile, con testo barrato alla selezione.
- **Esportazione PDF della lista della spesa** (pulsante "PDF" nella schermata Lista della spesa): genera un PDF via `react-native-html-to-pdf` e apre lo share sheet nativo (`react-native-share`) per salvarlo o inviarlo.
- **Mi piace / Non mi piace su ogni pasto**: due pulsanti toggle sotto ogni ricetta. **Stato attuale: solo mock/UI** — il feedback è tenuto in un atomo locale (`mealFeedbackMapAtom`) e mostrato visivamente, ma non viene ancora usato per influenzare la generazione del piano. È pensato come base per una futura funzione di raccomandazione: l'idea è che una ricetta segnata "non mi piace" non venga più riproposta nelle generazioni successive del piano (passandola come vincolo di esclusione al prompt LLM), ma questa logica non è ancora implementata.

## Struttura del progetto

```
src/Core/
├── features/          → una cartella per schermata/feature, pattern MVVM a 5 livelli (vedi sopra)
│   ├── Lander/
│   ├── BudgetSelection/
│   ├── DietaryNeeds/
│   ├── NutritionalGoals/
│   ├── MealPlan/
│   └── ShoppingList/
├── Navigation/         → RootNavigator, definizione rotte (routes.ts)
├── Catalog/            → accesso al catalogo prodotti + filtri per esigenze dietetiche/obiettivi nutrizionali
├── Llm/                → client OpenAI, schema JSON del piano pasti, prompt/workflow di generazione
└── Theme/              → colori, spaziature, tipografia condivisi
```

## Documentazione aggiuntiva

- `docs/02-mvvm-architecture.md` — dettaglio del pattern MVVM a 5 livelli e delle convenzioni sui form (linee guida architetturali generali del team, non tutte specifiche a questo progetto: es. gli esempi di validazione form non si applicano qui, non essendoci form con Zod in MealPrep).
- `docs/04-tanstack-query-patterns.md`, `docs/05-loadable-state.md`, `docs/06-view-file-organization.md` — convenzioni correlate (query, stati di caricamento, organizzazione dei file di View).
- `log/CONVERSATION_LOG.md` — log delle sessioni di sviluppo assistito da Claude Code su questo progetto.
- `utilsDoc/README.pdf` — il brief originale dell'assegno.

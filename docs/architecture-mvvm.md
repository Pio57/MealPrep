# Architettura MVVM — MealPrep (Frontend-only)

Questo progetto è un'app React Native (CLI bare, TypeScript) client-side, senza backend proprio: la persistenza è locale/in-memory e l'unica dipendenza esterna è l'API di OpenAI per la generazione del piano pasti.

## Principio generale

- **Model**: tipi di dominio e accesso ai dati grezzi (catalogo prodotti, preferenze utente, piano pasti). Nessuna logica di presentazione.
- **ViewModel**: hook custom che incapsulano stato e logica di una schermata/flusso, esponendo alla View solo dati già pronti da renderizzare e funzioni di intenzione utente (es. `selectBudget(value)`).
- **View**: componenti React puramente di presentazione. Ricevono dati e callback dal ViewModel, non contengono logica di business, non chiamano direttamente servizi.

## Struttura cartelle

```
src/
  models/           → tipi TS di dominio (Product, UserPreferences, DietaryNeed, NutritionalGoal, MealPlan, Recipe, DayPlan)
  viewmodels/        → un hook per schermata/flusso (useBudgetViewModel, useDietaryNeedsViewModel, useMealPlanViewModel, ...)
  views/             → una cartella per schermata (LanderScreen, BudgetScreen, DietaryNeedsScreen, NutritionalGoalsScreen, MealPlanScreen)
  components/        → componenti UI riutilizzabili e "dumb" (BudgetSlider, ChipSelector, DayTabs, MealCard...)
  services/          → accesso a dati/esterni: ProductRepository (legge/filtra product_catalog_en.json), LLMService (chiamata OpenAI)
  navigation/        → stack di navigazione e tipi delle rotte
  theme/             → colori, tipografia, spacing derivati dal design Figma
  context/           → eventuale stato condiviso tra schermate (le scelte di budget/dietary/goals accumulate lungo il flusso)
  assets/            → font, immagini, icone
```

## Regole pratiche

1. **Le View non chiamano mai `fetch`/SDK OpenAI direttamente.** Passano sempre da un ViewModel → Service.
2. **Ogni ViewModel ha una firma di ritorno esplicita e tipata** (niente `any`), es:
   ```ts
   function useBudgetViewModel(): {
     budget: number;
     setBudget: (value: number) => void;
     minBudget: number;
     maxBudget: number;
   }
   ```
3. **I Service sono stateless** dove possibile: ricevono input, restituiscono dati, non tengono stato interno oltre a semplici cache.
4. **Lo stato condiviso del flusso** (budget, dietary needs, nutritional goals selezionati man mano) vive in un Context dedicato (`FlowContext`) o in un unico ViewModel "di flusso" che orchestra le sotto-selezioni, evitando prop-drilling tra le 5 schermate.
5. **Divieto di `any`** e di casting non sicuri, come da convenzione standard: ogni funzione/hook ha tipi di parametro e ritorno espliciti.
6. **Naming**: `use<Nome>ViewModel` per gli hook, `<Nome>Screen` per le view, `<Nome>Service`/`<Nome>Repository` per i servizi.

## Gestione della API key OpenAI

La chiave non è mai hardcoded nel codice sorgente né committata. Viene letta da variabile d'ambiente tramite `.env` (ignorato da git, con `.env.example` come riferimento) e iniettata nel `LLMService` a runtime.

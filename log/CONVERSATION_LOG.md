# Log della sessione — MealPrep

Riassunto cronologico delle sessioni di sviluppo assistito (Claude Code) sul progetto **MealPrep** (React Native). Data: 2026-09-05.

---

# Sessione 1 — Setup, bug fix iniziali e feature Shopping List

## 1. Setup iniziale: build e avvio sul simulatore

**Richiesta:** installare la build e avviare il simulatore.

- Individuato Android SDK in `C:\Users\Utente\AppData\Local\Android\Sdk`, emulatore `Medium_Phone` già in esecuzione.
- Creato `android/local.properties` con `sdk.dir`.
- Riscontrato bug del CLI React Native su Windows/Git Bash (`gradlew.bat` non trovato) → build lanciata direttamente con `gradlew.bat` da PowerShell/Bash.
- Riscontrato errore Gradle `SdkLocator` dovuto a backslash mal escapati in `local.properties` → risolto usando slash forward (`C:/Users/...`).
- Riscontrato errore Windows **"Filename longer than 260 characters"** nella build nativa CMake/ninja di `react-native-gesture-handler` (il progetto vive in un path molto annidato: `Desktop\Commigo_Project\MealPrep`).
  - Fix: creata una unità virtuale `subst M: "C:\Users\...\MealPrep"` per accorciare il path assoluto usato dal build system nativo, e ripulita la cache `.cxx` per forzare la riconfigurazione.
- Build completata con successo (`installDebug`), app installata e avviata sull'emulatore.

---

## 2. Bug fix — Day pills troppo alte (MealPlan screen)

**Segnalazione:** le pillole dei giorni sopra erano troppo alte e coprivano la card del pasto.

- Causa: `DayTabs` (ScrollView orizzontale) non aveva un vincolo di altezza → si espandeva riempiendo lo spazio verticale disponibile.
- Fix in `DayTabs.tsx`: aggiunto `flexGrow: 0` sulla ScrollView e altezza fissa (40) sulle singole pillole.

---

## 3. Tap poco reattivi

**Segnalazione:** i click nell'app non erano molto reattivi.

- Causa: `react-native-gesture-handler` non era importato come prima riga assoluta dell'entry point (`index.js`), solo dentro `App.tsx` — problema noto che degrada la reattività dei touch su Android.
- Fix: aggiunta `import 'react-native-gesture-handler';` come primissima riga di `index.js`.

---

## 4. Lander screen — icone e animazione

**Richiesta:** icone del cibo più grandi, disposte in un cerchio preciso attorno alla busta, con animazione di rotazione.

- Riscritto `FloatingIngredients.tsx`:
  - 7 emoji posizionate a angoli equidistanti (`360° / 7`) su un raggio fisso attorno al centro della busta.
  - Animazione di rotazione continua e lineare tramite `Animated.loop` + `Animated.timing` (API nativa RN, nessuna nuova dipendenza).
  - Ogni icona applica una contro-rotazione (`-angle`) per restare sempre dritta mentre orbita.

---

## 5. Header/back button non visibili (bug sistemico)

**Segnalazione (schermata Budget):** la barra di avanzamento in alto e il pulsante indietro non si vedevano.

- Causa root: tutte le schermate (`Lander`, `BudgetSelection`, `DietaryNeeds`, `NutritionalGoals`, `MealPlan`) importavano `SafeAreaView` dal core `react-native` (deprecato, non gestisce correttamente gli insets su Android edge-to-edge) invece che da `react-native-safe-area-context` (già installato e usato in `App.tsx` tramite `SafeAreaProvider`).
- Fix: sostituito l'import di `SafeAreaView` in tutte e 5 le schermate con quello di `react-native-safe-area-context`.

---

## 6. Redesign schermata Budget

Serie di iterazioni guidate da screenshot/riferimenti forniti dall'utente:

1. Importo (`€NN`) ingrandito (SVG gradiente, font size aumentato).
2. Slider spostato subito sotto il prezzo (invece che in fondo alla schermata) e reso più stretto (`78%` di larghezza) invece che a tutta larghezza.
3. Aggiunto un pallino (thumb) verde ben visibile (`thumbTintColor: colors.primary`, `thumbSize` aumentato) — prima era quasi invisibile (bianco su sfondo chiaro).
4. Traccia dello slider resa visibilmente più spessa: poiché la libreria `@react-native-community/slider` non espone il controllo dello spessore nativo, è stata implementata una **traccia personalizzata** (due `View` assolute: sfondo + riempimento proporzionale al valore) sotto uno slider reso trasparente (solo per il thumb/touch).

---

## 7. Feature MealPlan — richieste multiple in un'unica sessione

**Richiesta (riassunta):**
1. Selezionare automaticamente il giorno corrente all'apertura dell'app.
2. Intestazione con il nome del giorno sopra le card dei pasti (già presente).
3. Ogni card pasto deve mostrare: immagine, costo (sempre per una persona), tempo di preparazione, ingredienti, istruzioni, e pulsanti mi piace/non mi piace (solo UI, base per un futuro sistema di raccomandazione — non implementato ora).
4. Un'icona carrello in alto a destra che apre una lista della spesa aggregata (es. salmone in 2 ricette → totale in grammi), con caselle spuntabili (barrato alla spunta), raggruppata per reparto del supermercato nell'ordine tipico di percorrenza (frutta e verdura prima di tutto).

**Implementazione:**

- **Giorno corrente di default**
  - `selectedDayIndexAtom` cambiato da `atom<number>(0)` a `atom<number | null>(null)` (stato "nessuna selezione esplicita").
  - `MealPlanViewModel.create` risolve l'indice: se `null`, cerca nel piano il giorno della settimana corrente (`new Date().getDay()`, convertito da Sunday-first a Monday-first); fallback a indice 0 se non trovato.

- **MealCard**
  - Aggiunta un'emoji come "immagine" del pasto (`mealEmoji.ts`, mappa parole chiave → emoji: chicken→🍗, salmon/fish→🐟, pasta→🍝, ecc.; nessuna foto disponibile nel catalogo prodotti, quindi scelta un'icona coerente con lo stile emoji già usato altrove nell'app).
  - Aggiunti due pulsanti 👍/👎 (`mealFeedbackMapAtom`, mappa singola invece di `atomFamily` per non violare le regole degli hook con liste di lunghezza variabile); toggle: ripremere lo stesso pulsante lo disattiva.

- **Shopping List (nuova feature completa, pattern MVVM a 5 livelli)**
  - `Core/Catalog/catalogService.ts`: aggiunta `getProductById()` per risalire al reparto (`department`) di ogni ingrediente tramite `productId`.
  - `ShoppingListViewModel.ts`: aggrega gli ingredienti di tutti i giorni/pasti del piano corrente:
    - parsing delle quantità testuali libere (es. "125 g", "1 x 200 g", "a few crackers") con normalizzazione unità (g/kg/ml/l);
    - somma le quantità con stessa unità per lo stesso prodotto (es. salmone in 2 ricette → totale grammi);
    - raggruppa per reparto (`department.id` del catalogo) secondo un ordine tipico di supermercato: **Frutta e verdura → Panetteria → Latticini → Carne → Salumi → Pesce → Surgelati → Pasta/Riso → Dispensa → Conserve → Condimenti → Colazione → Snack → Dietetici → Bevande → Vini/Birre → Infanzia**.
  - `shoppingListAtoms.ts`: `checkedShoppingItemsAtom` (Set di chiavi `productId|unit`) per lo stato delle spunte.
  - Nuova rotta `ShoppingList` (presentazione modale) in `RootNavigator.tsx` / `routes.ts`.
  - `MealPlanScreen.tsx`: aggiunto pulsante carrello 🛒 in alto a destra (header bilanciato con spacer simmetrico).
  - `ShoppingListScreen.tsx` + `ShoppingListItemRow.tsx`: lista con sezioni per reparto, riga con cerchio spuntabile che applica testo barrato alla selezione.

- **Verifica**: `npx tsc --noEmit` eseguito senza errori dopo tutte le modifiche.

---

## 8. Problema di build/Metro incontrato durante il testing

Dopo l'aggiunta della feature Shopping List, Metro (bundler JS, già in esecuzione da inizio sessione) ha restituito un errore `UnableToResolveModule` per `ShoppingListViewModel` nonostante il file esistesse e TypeScript compilasse senza errori — sintomo di cache Metro non aggiornata (haste map non ha rilevato i nuovi file creati in blocco).

- Fix: terminato il processo Metro esistente (porta 8081) e riavviato con `npx react-native start --reset-cache`.
- Il rebuild completo del bundle (cache azzerata) era in corso quando la sessione è stata interrotta dall'utente.

> Nota: alcuni file (`MealPlanScreen.tsx`, `MealCard.tsx`, `ShoppingListItemRow.tsx`, `ShoppingListScreen.tsx`) sono stati modificati **dopo** le ultime modifiche fatte in questa sessione (es. componente `CartIcon` dedicato, campo `mealType`, hint di swipe, ristrutturazione del layout con giorno singolo invece di ScrollView orizzontale multi-day) — nella sessione successiva (Sessione 2, sotto).

**File toccati in questa sessione:**

- `android/local.properties`
- `index.js`
- `src/Core/features/MealPlan/View/Components/DayTabs.tsx`
- `src/Core/features/Lander/View/Components/FloatingIngredients.tsx`
- `src/Core/features/Lander/View/Screens/LanderScreen.tsx`
- `src/Core/features/BudgetSelection/View/Screens/BudgetSelectionScreen.tsx`
- `src/Core/features/BudgetSelection/View/Components/GradientAmountText.tsx`
- `src/Core/features/NutritionalGoals/View/Screens/NutritionalGoalsScreen.tsx`
- `src/Core/features/DietaryNeeds/View/Screens/DietaryNeedsScreen.tsx`
- `src/Core/features/MealPlan/View/Screens/MealPlanScreen.tsx`
- `src/Core/features/MealPlan/View/Components/MealCard.tsx`
- `src/Core/features/MealPlan/View/Components/mealEmoji.ts` (nuovo)
- `src/Core/features/MealPlan/State/mealPlanAtoms.ts`
- `src/Core/features/MealPlan/State/mealFeedbackAtoms.ts` (nuovo)
- `src/Core/features/MealPlan/ViewModel/MealPlanViewModel.ts`
- `src/Core/features/MealPlan/Controller/useMealPlanController.ts`
- `src/Core/features/MealPlan/ScreenLoader/MealPlanScreenLoader.tsx`
- `src/Core/features/ShoppingList/**` (feature nuova, tutti i file)
- `src/Core/Catalog/catalogService.ts`
- `src/Core/Navigation/routes.ts`
- `src/Core/Navigation/RootNavigator.tsx`

---

# Sessione 2 — Rifiniture UI, fix 3 pasti/giorno e problema di connessione Metro

## 1. Riavvio del progetto

Nuovo avvio dell'app React Native (bare CLI, TypeScript) in una sessione successiva.

- Ritrovato Android SDK già installato in `C:\Users\Utente\AppData\Local\Android\Sdk` con l'AVD "Medium_Phone" già in esecuzione (`emulator-5554`).
- Avviato Metro bundler (`npx react-native start`) e verificato che il bundle JS Android si compilasse correttamente.
- Tentativo di `npx react-native run-android`: fallito per due problemi distinti:
  1. La CLI invocava `gradlew.bat` senza percorso assoluto e la shell (git-bash/MSYS) non lo risolveva nella cartella corrente → risolto lanciando Gradle con il percorso assoluto tramite `cmd.exe`.
  2. **Errore di path troppo lungo di Windows** (limite 260 caratteri) ripresentatosi durante la build nativa C++ di `react-native-gesture-handler` (path di ~388 caratteri) — la `subst M:` della sessione precedente non era più attiva. La chiave di registro `LongPathsEnabled` risultava già attiva, ma `ninja.exe` (incluso nel Android SDK/CMake) non la rispetta comunque.
  - **Soluzione adottata questa volta**: creata una *junction* di cartella permanente `C:\dev\MealPrep` → puntata alla cartella reale del progetto (`C:\Users\Utente\Desktop\Commigo_Project\MealPrep`), e build lanciata passando per il percorso corto. Ha funzionato: build riuscita, APK installato, app avviata e funzionante (schermata iniziale "MealPrep" con logo Esselunga confermata via screenshot).

## 2. Richieste di modifica UI/UX (prima serie)

L'utente ha mostrato screenshot di due schermate (Shopping list e vista giornaliera "Bon appétit!") con richieste di design:

**Shopping list** (`src/Core/features/ShoppingList/...`):
- L'elemento selezionato doveva essere coerente con l'app (sfondo verde, testo nero) invece di diventare tutto grigio, con una riga (strikethrough) solo sul nome dell'ingrediente.

**Vista giornaliera / MealPlan** (`src/Core/features/MealPlan/...`):
- Aprire di default sul giorno corrente (verificato che la logica in `MealPlanViewModel.ts` lo faceva già correttamente tramite `resolveSelectedDayIndex`/`todaysWeekdayName`).
- Spostare il nome del giorno fuori dalla card, centrato, con sotto un testo più piccolo di istruzione ("scorri per vedere i pasti del giorno") e i pulsanti like/dislike centrati invece che a sinistra.
- **Punto di design chiarito con l'utente**: lo swipe orizzontale, che prima cambiava GIORNO (ridondante con le linguette Mon/Tue/...), è stato ridefinito per scorrere tra i PASTI dello stesso giorno; le linguette in alto restano l'unico modo per cambiare giorno.
- Colore grigio dei testi secondari (`colors.textSecondary`) scurito da `#8E8E93` a `#6E6E76` per miglior leggibilità.

Modifiche implementate e verificate con screenshot sull'emulatore:
- `src/Core/Theme/colors.ts`: nuovo `textSecondary`, aggiunto poi rimosso `checkedTint`, aggiunto `onPrimaryMuted`.
- `ShoppingListItemRow.tsx`: strikethrough sul nome, checkbox verde invariato.
- `MealCard.tsx`: pulsanti feedback centrati, aggiunta etichetta `mealType` (breakfast/lunch/dinner).
- `MealPlanScreen.tsx`: ristrutturata la vista — intestazione giorno centrata fuori dalla card, testo guida, ScrollView ora pagina tra i pasti del giorno selezionato (keyed su `selectedDay.day` per resettare lo scroll ad ogni cambio giorno).

## 3. Correzioni successive (seconda serie di feedback)

Dopo aver visto la Shopping list con lo sfondo ancora bianco e l'evidenziazione verde sulle righe selezionate, l'utente ha chiesto:
1. **Sfondo della pagina Shopping list sempre verde** (coerente con il resto dell'app) → `ShoppingListScreen.tsx` ristrutturata: contenitore esterno verde (`colors.primary`), header con testo bianco, contenuto in un "foglio" bianco arrotondato sotto (stesso pattern della vista MealPlan).
2. **Rimuovere l'evidenziazione verde tenue sulle righe selezionate**, mantenendo solo la riga (strikethrough) sul nome → rimosso lo stile `rowChecked`/`checkedTint`.
3. **Il piano pasti deve dare colazione, pranzo e cena** (almeno per un giorno) invece di un solo pasto al giorno → causa individuata: lo schema JSON inviato all'LLM (`mealPlanSchema.ts`) richiedeva `minItems: 1` sui pasti e il prompt (`mealPlanWorkflow.ts`) diceva solo "at least one meal per day". Corretto:
   - `mealPlanSchema.ts`: `meals` ora richiede `minItems: 3, maxItems: 3`, aggiunto campo `mealType` (enum breakfast/lunch/dinner) come required.
   - `mealPlanTypes.ts`: aggiunto tipo `MealType` e campo `mealType` su `MealPlanMeal`.
   - `mealPlanWorkflow.ts`: prompt aggiornato per richiedere esplicitamente 3 pasti (colazione/pranzo/cena) in quell'ordine.
   - `MealCard.tsx`: aggiunta etichetta visiva del tipo di pasto sopra il nome.
4. Testo guida sotto il nome del giorno reso sempre visibile (non più condizionato al numero di pasti), con testo: *"Swipe the cards left or right to discover the day's meals"*.

Tutte le modifiche sono passate senza errori TypeScript (`npx tsc --noEmit`).

## 4. Problema bloccante: connessione Metro↔emulatore instabile

Per verificare le modifiche al piano pasti (che richiede una nuova chiamata reale a OpenAI, dato che la query ha `staleTime: Infinity`), è stato necessario un **reload completo dell'app** (force-stop + relaunch), non bastava il Fast Refresh.

Da quel momento, il download del bundle JS dall'emulatore si blocca sistematicamente (spesso fermo a "Downloading 99.9%/100%…" senza mai completare il mount di React), con questo errore ricorrente nei log:

```
okhttp.OkHttpClient: java.net.ProtocolException: Expected leading [0-9a-fA-F] character but was 0x2d / 0xd
```

cioè una corruzione nel parsing della *chunked transfer encoding* HTTP tra Metro (Node.js) e il client OkHttp del dispositivo/emulatore.

**Diagnosi svolta:**
- Il bundle si scarica perfettamente **dal PC** via `curl` (200 OK, ~9.4 MB) → Metro stesso non è il problema.
- Riprovato con: riavvio dell'app più volte, riavvio di Metro con `--reset-cache`, impostazione di `adb reverse tcp:8081 tcp:8081` (mancante perché la CLI `run-android` di solito lo imposta automaticamente, saltato per via del workaround "junction"), persino con **un nuovo emulatore creato da zero dall'utente** ("Medium_Phone_2") — stesso errore identico si ripresenta.
- Osservati nei log anche errori di rete reali e transitori (`ENONET`, DNS fail) e persino errori SSL su download di sistema (Google Play services) nello stesso periodo.
- L'utente ha verificato che la normale navigazione (YouTube via browser sull'emulatore, HTTPS) funziona bene — quindi il problema è specifico al traffico **HTTP non cifrato** verso la porta 8081, non alla connettività di rete in generale.
- Ipotesi iniziale (poco convincente, giustamente contestata dall'utente): software di sicurezza che ispeziona/corrompe il traffico HTTP in chiaro. Contro-argomento valido dell'utente: se fosse un blocco permanente, non avrebbe funzionato all'inizio della sessione.
- Ipotesi più probabile al momento dell'interruzione: **accumulo di processi in background** nel corso della sessione (più istanze Metro riavviate, gradle daemon, processi jest-worker, processi di debug Chrome headless crashati) che degradano le risorse di sistema e causano corruzione dello stream sotto stress, in modo intermittente. Era in corso la verifica/pulizia dei processi Node.js superflui quando la conversazione è stata interrotta per salvare questo log.

**Stato al momento del salvataggio di questo log:**
- Codice sorgente: tutte le modifiche richieste sono implementate e type-check pulito.
- Build Gradle: riuscita e installata sia sul vecchio emulatore che sul nuovo.
- Bloccante aperto: il bundle JS non riesce a completare il caricamento sull'emulatore per un problema di trasferimento di rete intermittente, non ancora risolto in modo definitivo.

## 5. Prossimi passi suggeriti

1. Terminare i processi Node.js/Gradle/debugger superflui rimasti aperti da tentativi precedenti (visti tramite `Get-CimInstance Win32_Process -Filter "Name='node.exe'"`).
2. Riavviare Metro una volta sola, pulito, e rilanciare l'app.
3. Se il problema persiste, considerare: riavvio del PC (per azzerare completamente lo stato di rete/processi), oppure provare a servire il bundle in modalità diversa (es. disabilitare temporaneamente eventuali software di sicurezza con ispezione del traffico web, solo come test, non come soluzione definitiva).
4. Una volta che l'app si carica stabilmente, verificare visivamente: piano pasti con 3 pasti/giorno generati dalla nuova chiamata LLM, e stile della shopping list (sfondo verde fisso, riga solo sul nome, nessuna evidenziazione).


# 🏗️ Architettura MVVM dei Componenti di Feature

Questo documento descrive il pattern **MVVM modificato** adottato per strutturare ogni feature del progetto.

---

## Struttura delle Cartelle

Ogni feature all'interno di `src/Core/features/` deve essere organizzata secondo i seguenti strati logici:

```
features/MyFeature/
├── State/          → *Atoms.ts
├── Controller/     → use*Controller.ts
├── ViewModel/      → *ViewModel.ts
├── ScreenLoader/   → *ScreenLoader.tsx
└── View/
    ├── Components/ → componenti isolati
    └── Screens/    → pagina principale
```

---

## I 5 Strati

### 1. State (`/State/*Atoms.ts`)
* Contiene gli atomi primitivi di Jotai (es. dati dei form, credenziali) ed eventuali atomi derivati elementari di puro calcolo sincrono (es. errori di validazione dei campi).
* Contiene atomi di mutazione o query asincrone (es. `atomWithMutation` di TanStack Query) che gestiscono il ciclo di vita delle API.

### 2. Controller (`/Controller/use*Controller.ts`)
* Implementato come React Hook personalizzato (custom hook).
* Contiene esclusivamente **azioni/callbacks** (funzioni come `handleChange`, `handleSubmit`) che manipolano lo stato (atomi) o innescano mutazioni/richieste.
* **Regola**: Il controller non espone dati o DTO per la view, ma solo callback per mutare lo stato o avviare operazioni.

### 3. ViewModel (`/ViewModel/*ViewModel.ts`)
* **Regola fondamentale**: Il ViewModel **non deve essere un atomo di Jotai, né un React Hook**.
* Deve essere implementato come una **classe o modulo contenente una funzione statica pura** (es. `create`) che accetta in input i vari dati elementari dello stato/mutazione e restituisce in output un **DTO** (Data Transfer Object) consolidato, tipizzato e pronto per il consumo da parte della UI (`*ViewModelDTO`).
* *Perché questa scelta?*
  * **Decoupling totale**: Il calcolo del DTO è una funzione pura deterministica. Rende i calcoli di trasformazione dei dati facilissimi da testare in isolamento tramite unit test, senza necessità di montare React o simulare l'ambiente dei React Hooks / Jotai atoms.
  * **Trasparenza**: Lo ScreenLoader è l'unico responsabile di effettuare la lettura degli atomi reattivi, mantenendo il ViewModel una struttura computazionale pura.

### 4. ScreenLoader (`/ScreenLoader/*ScreenLoader.tsx`)
* Il puro orchestratore (Container).
* Legge gli atomi necessari dallo *State* usando `useAtomValue`.
* Chiama la funzione statica pura del *ViewModel* passando i dati letti per ottenere il DTO.
* Inizializza il *Controller* per ottenere le callbacks.
* Passa tutti i dati del DTO e le callbacks del Controller allo *Screen* presentazionale tramite props.
* **Avvio automatico delle query**: Gli atomi di tipo `atomWithQuery` / `atomWithInfiniteQuery` si attivano automaticamente nel momento in cui vengono sottoscritti tramite `useAtomValue`. Non è necessario né corretto chiamare esplicitamente alcuna funzione di "load" al mount. Il caricamento iniziale avviene come effetto collaterale implicito della lettura dell'atom.

### 5. View (`/View/*Screen.tsx` e componentistica)
* Componente presentazionale stupido e puro.
* Riceve i dati formattati dal DTO e le funzioni dal controller esclusivamente tramite props.
* Non legge direttamente atomi globali né usa hook di chiamata API.
* **Nessun `useEffect` per il caricamento dati**: La View non deve mai usare `useEffect` per avviare il caricamento iniziale dei dati. Questo è responsabilità esclusiva del layer State tramite `atomWithQuery`. Le callback di tipo "load" passate alla View devono essere utilizzate esclusivamente per azioni esplicite dell'utente, come il pulsante "Riprova" su un errore.

---

## Esempio Pratico: Pattern ViewModel Statica

### ViewModel (`loginViewModel.ts`)
```typescript
import { deferProperties, type SmartMaybePromise } from "@/Commons/deferProperties";
import { mapMutationToPromise } from "@/Commons/useMutationPromise";
import type { LoginData } from "../State/loginAtoms";

export interface LoginViewModelDTO {
  email: string;
  emailError: string | null;
  password: string;
  passwordError: string | null;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  loginResult: SmartMaybePromise<void>;
}

export class LoginViewModel {
  public static create(
    credentials: LoginData,
    emailError: string | null,
    passwordError: string | null,
    isSubmitDisabled: boolean,
    mutationState: any
  ): LoginViewModelDTO {
    const rawMaybePromise = mapMutationToPromise(mutationState, { ignorePayload: true });

    return {
      email: credentials.email.trim(),
      emailError,
      password: credentials.password,
      passwordError,
      isSubmitDisabled,
      isSubmitting: mutationState.isPending,
      loginResult: deferProperties(rawMaybePromise),
    };
  }
}
```

### ScreenLoader (`LoginScreenLoader.tsx`)
```typescript
export function LoginScreenLoader() {
  // 1. Lettura atomi reattivi
  const credentials = useAtomValue(loginDataAtom);
  const emailError = useAtomValue(emailErrorAtom);
  const passwordError = useAtomValue(passwordErrorAtom);
  const isSubmitDisabled = useAtomValue(isSubmitDisabledAtom);
  const mutationState = useAtomValue(loginMutationAtom);

  // 2. Calcolo DTO reattivo tramite funzione pura statica
  const viewModel = LoginViewModel.create(
    credentials,
    emailError,
    passwordError,
    isSubmitDisabled,
    mutationState
  );

  // 3. Callback dal Controller
  const { handleEmailChange, handlePasswordChange, handleSubmit } = useLoginController();

  // 4. Iniezione nella View
  return (
    <LoginScreen
      {...viewModel}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
    />
  );
}
```

---

## 📝 Linee Guida Form e Validazione

Per garantire uniformità architetturale nell'implementazione di moduli e form all'interno dell'applicazione:

### 1. Sede e Gestione dello Stato dei Form
* **Nessun `useState` locale**: I valori inseriti dall'utente nei moduli non devono essere memorizzati tramite `useState` nel componente React o nel Controller.
* **Uso di Jotai Atoms**: Tutti i campi del form devono essere definiti come proprietà all'interno di un atomo Jotai dedicato nel layer `State` (es. `loginFormAtom`).

### 2. Validazione e Calcolo degli Errori nel ViewModel
* **Sede degli Schemi di Validazione**: Gli schemi Zod (o altre librerie di validazione) devono essere dichiarati esclusivamente nel **ViewModel** (es. `authViewModel.ts`).
* **Calcolo Dinamico degli Errori**: Il ViewModel deve validare i dati dei form ricavati dagli atomi e restituire un dizionario di errori (es. `{ email?: string }`) ed il flag globale di validità (`isLoginFormValid`).
* **Nessun Atomo per gli Errori**: Gli errori di validazione non devono essere memorizzati in atomi ad-hoc; sono sempre derivati in modo sincrono e deterministico all'interno del ViewModel a partire dallo stato corrente del form.

### 3. Controller Specifici per Form
* **Separazione dei Controller**: Nel caso di schermate complesse che ospitano form differenti (es. una schermata con schede Login e Signup), ogni form deve avere il proprio controller specifico (es. `useLoginFormController.ts` e `useSignupFormController.ts`). Il controller principale si limita a gestire azioni globali di sessione.

### 4. Presentazione Stupida della View
* **Errori Inline**: La View si limita a mostrare graficamente i messaggi di errore ricevuti dal ViewModel sotto i relativi campi di input.
* **Pulsanti Disabilitati**: I pulsanti di invio dei form devono essere disabilitati a livello visivo se il flag di validità del ViewModel è falso (`disabled={isSubmitting || !isValid}`).

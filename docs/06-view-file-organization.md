# 📁 Organizzazione dei File nella View

Questo documento definisce le convenzioni di struttura dei file all'interno della cartella `View/` di ogni feature.

---

## Struttura delle Cartelle

La cartella `View/` di ogni feature deve essere suddivisa in due sottocartelle distinte:

```
View/
├── Components/     ← componenti riutilizzabili e isolati
│   ├── StatsSection.tsx
│   ├── InvoicesTable.tsx
│   └── InfiniteInvoicesList.tsx
└── Screens/        ← solo la pagina principale che li compone
    └── InvoiceScreen.tsx
```

---

## Regola: un componente logico = un file

Ogni componente logico distinto (con i suoi `*View`, `*Skeleton`, `*Error` e orchestratore) deve risiedere in un **file dedicato** dentro `View/Components/`.

Il file `*Screen.tsx` in `View/Screens/` deve contenere **esclusivamente** il componente radice della pagina, che si limita a:
- importare i sotto-componenti da `../Components/`
- definire la logica di orchestrazione di livello pagina (es. derivazione delle `statsState` da `invoicesState`, gestione della modale)
- comporre il layout della pagina

**Non è accettabile** definire componenti UI significativi direttamente all'interno del file `*Screen.tsx`. Se un blocco JSX merita un nome e un `switch` sul proprio stato, deve diventare un file separato in `Components/`.

---

## Struttura interna di ogni file in `Components/`

Ogni file di componente segue questa convenzione di sezioni, separate da commenti divisori:

```typescript
// ── Skeleton ──────────────────────────────────────────────────────────────────
export const MyComponentSkeleton: React.FC = () => { /* ... */ };

// ── Error (opzionale, solo per LoadableState completo) ────────────────────────
export const MyComponentError: React.FC<{ error: string }> = ({ error }) => { /* ... */ };

// ── View ──────────────────────────────────────────────────────────────────────
export const MyComponentView: React.FC<{ data: MyData; isFetching: boolean }> = ({ data, isFetching }) => { /* ... */ };

// ── Orchestrator ──────────────────────────────────────────────────────────────
export const MyComponent: React.FC<{ state: LoadableState<MyData> }> = ({ state }) => {
  switch (state.status) {
    case 'loading': return <MyComponentSkeleton />;
    case 'error':   return <MyComponentError error={state.error} />;
    case 'success': return <MyComponentView data={state.data} isFetching={state.isFetching} />;
  }
};
```

---

## Scomposizione dei Componenti per la Riusabilità

Si raccomanda di **scindere sempre** lo skeleton di caricamento e la UI di successo in componenti separati:

1. **Il Presentatore Pulito (`*View`)**:
   Un componente puramente presentazionale che accetta i dati nudi e crudi (`data: T`, `isFetching?: boolean`). È riusabile ovunque, anche al di fuori del pattern asincrono (es. con dati statici o mockati).

2. **Lo Skeleton (`*Skeleton`)**:
   Il componente stupido che renderizza gli scheletri pulsanti (`animate-pulse`). Riusabile anche all'interno di liste generiche o animazioni di caricamento iniziali.

3. **L'Error (`*Error`)** *(opzionale per `SafeLoadableState`)*:
   Il componente che mostra il messaggio di errore con eventuale pulsante "Riprova".

4. **L'Orchestratore (`*Component`)**:
   Esegue lo `switch` esaustivo su `LoadableState` o `SafeLoadableState` per decidere quale componente montare.

---

## Percorsi Relativi

Quando si importa da `View/Screens/` verso altri layer:

| Destinazione | Percorso relativo |
|---|---|
| `View/Components/` | `../Components/MyComponent` |
| `ViewModel/` | `../../ViewModel/myViewModel` |
| `State/` | `../../State/myAtoms` |
| `Commons/` | `@/Commons/...` (alias assoluto) |

> Usare sempre l'alias `@/` per import da `Commons/` ed evitare percorsi relativi profondi.

# MealPrep

Take-home per la posizione di Mobile Software Engineer @ Blackboard Studio.

MealPrep è un'app React Native (CLI, TypeScript) che guida l'utente attraverso un flusso di 5 schermate per generare un piano pasti settimanale su misura, in base a budget, esigenze dietetiche e obiettivi nutrizionali. Il piano viene generato tramite un workflow LLM (OpenAI) a partire dal catalogo prodotti fornito.

## Stack

- React Native (bare CLI) + TypeScript
- Architettura MVVM (vedi `docs/architecture-mvvm.md`)
- OpenAI API per la generazione del piano pasti

## Setup

```bash
npm install
cp .env.example .env   # inserire la OPENAI_API_KEY
npm run android
```

## Struttura del progetto

Vedi `docs/architecture-mvvm.md` per i dettagli sull'architettura e sulla struttura delle cartelle (`src/models`, `src/viewmodels`, `src/views`, `src/services`, ...).

## Documentazione consegna

- `docs/architecture-mvvm.md` — architettura MVVM adottata
- `docs/decisions.md` — decisioni prese lungo il percorso (in arrivo)

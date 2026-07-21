# MakerPath

MakerPath è una web app mobile-first per organizzare roadmap, progetti, risorse e sessioni di studio da maker.

## Avvio locale

```bash
npm install
npm run dev
```

## Verifiche

```bash
npm run typecheck
npm run lint
npm run build
```

Senza account, i dati personali e i progressi vengono conservati nel `localStorage`
del browser. Con Supabase configurato, l’app aggiunge autenticazione e sincronizzazione
cloud per utente, mantenendo anche la copia locale.

## Supabase

1. Crea un progetto Supabase.
2. Esegui nel SQL Editor il file
   `supabase/migrations/20260719000000_create_user_data.sql`.
3. Copia `.env.example` in `.env.local` e inserisci URL e anon key del progetto.

La tabella usa Row Level Security: ogni utente autenticato può leggere e modificare
esclusivamente il proprio documento MakerPath.

# Lume Fitness Club — Sito Web

Stack: **Astro 4** · **Tailwind CSS** · **React islands** · **TypeScript** · **Supabase**

## Avvio rapido

```bash
cd lume-fitness
npm install
cp .env.example .env    # compila le variabili Supabase
npm run dev             # http://localhost:4321
```

## Struttura

```
src/
├── layouts/Layout.astro          # Layout base (SEO, font, scroll animations)
├── components/
│   ├── Header.astro              # Navigazione sticky con mobile menu
│   ├── Footer.astro              # Footer con info sedi
│   └── react/
│       ├── BookingForm.tsx       # Form prenotazione (React island)
│       └── MemberCheck.tsx       # Verifica membro + proposta piano (React island)
├── pages/
│   ├── index.astro               # Homepage
│   ├── corsi.astro               # Corsi + calendario interattivo
│   ├── abbonamenti.astro         # Piani con toggle mensile/annuale
│   ├── prenota.astro             # Prenotazione sessione gratuita
│   ├── blog/index.astro          # Blog & News
│   ├── sedi/
│   │   ├── macerata.astro
│   │   └── montecassiano.astro
│   └── api/
│       ├── check-member.ts       # POST /api/check-member
│       └── bookings.ts           # POST /api/bookings
├── lib/
│   ├── data.ts                   # Dati mock (corsi, piani, sedi)
│   ├── supabase.ts               # Client Supabase
│   └── types.ts                  # Tipi TypeScript condivisi
└── styles/global.css             # Tailwind + variabili CSS + animazioni
supabase/schema.sql               # Schema DB da eseguire su Supabase
```

## Collegare Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Vai su **SQL Editor** e incolla il contenuto di `supabase/schema.sql`
3. Copia l'URL e le chiavi API in `.env`
4. In `src/pages/api/check-member.ts` e `bookings.ts` decommentare le righe Supabase e cancellare i mock

## Deploy

Aggiungi l'adapter corretto in `astro.config.mjs`:

| Piattaforma | Pacchetto |
|---|---|
| Vercel | `@astrojs/vercel/serverless` |
| Netlify | `@astrojs/netlify` |
| Node.js | `@astrojs/node` |

```bash
npm install @astrojs/vercel
```

```js
// astro.config.mjs
import vercel from '@astrojs/vercel/serverless';
export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  ...
});
```

## Aggiungere contenuti reali

- **Logo**: sostituisci l'SVG inline in `Header.astro` e `Footer.astro`
- **Foto**: aggiungi in `public/` e usale nelle pagine sedi
- **Corsi & piani**: modifica `src/lib/data.ts`
- **Blog**: aggiungi post in `BLOG_POSTS` in `data.ts` oppure integra un CMS (Contentful, Sanity, Notion)

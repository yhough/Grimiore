# Grimoire

An AI-powered worldbuilding tool for writers, game designers, and storytellers. Build entire fictional worlds incrementally through natural language. Grimoire turns your narration into structured, persistent lore while reasoning across everything you've established to surface ripple effects, flag contradictions, and make proactive suggestions.

## What it does

- **Chat-driven worldbuilding** — narrate events and facts in plain English; the AI extracts structured lore automatically
- **Ripple effects** — after each entry, the AI surfaces 2–3 logical consequences grounded in your existing world state
- **Contradiction detection** — if you contradict established lore, Grimoire flags it before logging anything and asks how to resolve it
- **Living lore panel** — a persistent sidebar organizes everything into Characters, Factions, Locations, History, and Lore & Misc
- **Question mode** — ask anything about your world; the AI answers using only confirmed canon and labels any speculation
- **Multiple worlds** — each world is a fully isolated knowledge base

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | SQLite (`better-sqlite3`) + Drizzle ORM |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| State | Zustand |

## Getting started

```bash
npm install
```

Copy the environment template and add your Anthropic API key:

```bash
cp .env.local.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY
```

Run the database migration:

```bash
npm run db:migrate
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── page.tsx          # Home: world cards
│   ├── worlds/
│   │   ├── new/          # Create world
│   │   └── [id]/         # World view: chat + lore panel
│   └── api/worlds/       # REST API
├── components/           # React components
├── db/                   # Drizzle schema and connection
├── lib/                  # Claude integration, prompts, utilities
├── store/                # Zustand store
└── types/                # Shared TypeScript types
```

## Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Required. Your Anthropic API key. |

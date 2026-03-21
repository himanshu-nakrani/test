# NeuralAtlas

An **AI models directory** web app: browse, filter, compare, and explore models with benchmarks, pricing, and enterprise-style UI. Built with **React 19**, **TypeScript**, and **Vite**.

## Requirements

- **Node.js** (LTS recommended)
- **pnpm** (`npm install -g pnpm`)

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) (default Vite port).

## Scripts

| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `pnpm dev`     | Start dev server with HMR                        |
| `pnpm build`   | Typecheck + generate API assets + production build |
| `pnpm preview` | Preview production build locally                 |
| `pnpm lint`    | Run ESLint                                       |
| `pnpm test`    | Run Vitest (jsdom + Testing Library)             |
| `pnpm test:watch` | Vitest in watch mode                          |
| `pnpm generate-api` | Generate `public/api/` JSON + sitemap from model data |

`prebuild` runs `generate-api` automatically before `build`.

## Tech stack

- **Vite 8** — build tooling
- **React Router 7** — SPA routing (`BrowserRouter`, `basename` from `import.meta.env.BASE_URL`)
- **Framer Motion** — page transitions
- **Bootstrap 5** — baseline utilities (custom CSS in `App.css`)
- **Lucide React** — icons
- **Vitest** + **Testing Library** — unit/component tests

## Project layout

```
src/
  App.tsx          # Routes, home (filters + grid/table), compare, etc.
  main.tsx         # Entry + Router shell
  components/      # UI (Header, Hero, ModelCard, Filters, …)
  data/models.ts   # Model catalog (source of truth for the UI)
  hooks/           # Auth, favorites, page title, …
public/            # Static assets; generated API files from `generate-api` (gitignored)
backend/           # Optional FastAPI + SQLite API (see below)
```

## Features (high level)

- **Discover** — search, multi-filter, sort (including trending), grid/table views, pagination (scroll stays on results when changing page).
- **Compare** — side-by-side table, differences-only, pin rows, export CSV/JSON.
- **Analytics** — charts and derived insights from the catalog.
- **Presets & UX** — saved filter presets, recent searches, density toggle (comfortable/compact), light/dark theme.

## Deployment (Vercel)

- Connect the Git repo and use the **Vite** preset (build: `pnpm build`, output: `dist`).
- To use **`Develop` as the production branch**: **Project → Settings → Git → Production Branch** → set to `Develop` (exact branch name as in Git).
- SPA routing: Vercel `rewrites` in `vercel.json` should send unknown paths to `index.html` (already configured if present in repo).

## Optional: Python backend

The `backend/` folder is a **FastAPI** app with SQLite for a separate API workflow. The main UI works **without** it (static data in `src/data/models.ts`).

```bash
pip3 install -r backend/requirements.txt
pnpm generate-api   # ensures public/api data if needed
python3 backend/seed.py
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

See **`AGENTS.md`** for auth, DB paths, and test notes (e.g. `MemoryRouter` in tests, lazy routes).

## License

Private project (`"private": true` in `package.json`). Adjust as needed.

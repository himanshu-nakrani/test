## Cursor Cloud specific instructions

Single-service React + TypeScript app built with Vite. All commands are in `package.json`:

- **Dev server:** `pnpm dev` (port 5173 by default)
- **Lint:** `pnpm lint` (ESLint)
- **Test:** `pnpm test` (Vitest with jsdom + @testing-library/react)
- **Build:** `pnpm build` (TypeScript check + Vite production build)

No external services, databases, or Docker containers are required.

The app uses React Router (BrowserRouter) with `basename` from `import.meta.env.BASE_URL`. Tests must wrap `<App />` in `<MemoryRouter>` (see `App.test.tsx`). The Vite dev server handles SPA fallback for client-side routing automatically.

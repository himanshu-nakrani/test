# NeuralAtlas — Improvement Checklist

Track progress on making NeuralAtlas a production-grade AI models directory.
See [ROADMAP.md](./ROADMAP.md) for detailed descriptions of each feature.

---

## High Priority ✅

- [ ] Fix Vercel deployment (set correct production branch or merge PR) — *user action required*
- [x] Add URL-based routing with React Router (`/models/gpt-4o`, `/leaderboard`, `/calculator`)
- [x] Add deep-linkable comparison URLs (`/compare?models=gpt-4o,claude-4-sonnet`)
- [x] Add shareable filter URLs (`/?provider=openai&category=reasoning`)
- [x] Add OpenGraph meta tags for rich social previews
- [x] Add `<title>` per page (model name on detail pages, etc.)
- [ ] Move model data to a JSON file (`public/models.json`) with fetch-based loading — *deferred: low impact for static site*
- [x] Add loading skeletons / suspense boundaries
- [x] Add 404 page for unknown routes

## Data & Content ✅

- [x] Add more models (GitHub Copilot, Amazon Titan, Baidu ERNIE, Yi, Gemma, Flux, Aya, Reka, Qwen Max, Mistral Saba — 65 total)
- [x] Add benchmark scores to all chat/reasoning/code models
- [x] Add code snippets (Python, JS, cURL) to all models with API endpoints
- [x] Add JavaScript/TypeScript code snippets alongside Python and cURL
- [x] Add `lastUpdated` field to track data freshness
- [x] Add model version history (e.g. GPT-4o → GPT-4o-2024-08-06)
- [x] Add real-world latency data (TTFB, tokens/sec)
- [x] Add rate limit information per model
- [x] Add model size / download size for open-weight models
- [x] Write comparison guides (GPT-4o vs Claude 4 Sonnet, GPT-4.1 vs Gemini 2.5 Pro, o3 vs DeepSeek R1, Claude 4 Opus vs o3, Llama 4 Maverick vs GPT-4o)

## UI/UX ✅

- [x] Add interactive benchmark radar chart on model detail pages
- [ ] Add price-vs-performance scatter plot — *deferred*
- [ ] Add model release timeline visualization — *deferred*
- [x] Add pagination for model grid (12 per page, URL-synced)
- [x] Add keyboard navigation for model grid (arrow keys, Enter to open)
- [x] Add "Back to top" floating button
- [x] Add breadcrumb navigation on detail pages
- [x] Add search result highlighting (bold matched text)
- [x] Add category quick-filter pills on hero section
- [x] Add smooth page transitions / animations between views
- [ ] Add tooltip previews on hover for model cards — *deferred*
- [x] Improve mobile filter UX (slide-in drawer with backdrop)

## Developer Features

- [ ] Build API playground (send prompts, see responses in real-time)
- [ ] Add multi-model prompt testing (same prompt → multiple models side-by-side)
- [ ] Add SDK code generators (auto-generate boilerplate for selected model)
- [ ] Add integration guides (LangChain, Vercel AI SDK, LlamaIndex, etc.)
- [ ] Add "Quick copy" for model ID strings
- [ ] Add OpenAPI schema viewer for each model's API
- [ ] Add webhook/RSS feed for new model announcements

## Performance & SEO

- [ ] Migrate to Next.js or Astro for SSR/SSG and per-page SEO
- [ ] Add sitemap.xml generation
- [ ] Add JSON-LD structured data for models
- [ ] Add code splitting / lazy loading for detail pages and leaderboard
- [ ] Optimize bundle size (currently 335 kB JS)
- [ ] Add image optimization for any future provider logos
- [ ] Target Lighthouse score > 95 on all metrics
- [ ] Add service worker for offline support

## Authentication & Personalization

- [ ] Add user accounts (OAuth via GitHub / Google)
- [ ] Persist favorites and comparisons server-side
- [ ] Add user reviews and ratings for models
- [ ] Add "My workspace" with saved comparisons and notes
- [ ] Add notification preferences for price changes / new models

## Infrastructure & DevOps

- [ ] Set up CI/CD pipeline (GitHub Actions for lint, test, build on PR)
- [ ] Add E2E tests with Playwright
- [ ] Add error monitoring (Sentry)
- [ ] Add privacy-friendly analytics (Plausible or PostHog)
- [ ] Add automated data validation (schema checks for model entries)
- [ ] Add dependency update automation (Renovate or Dependabot)
- [ ] Add preview deployments on PRs (Vercel handles this automatically)

## Monetization (optional)

- [ ] Add affiliate links to provider sign-up pages
- [ ] Add sponsored/featured model placements
- [ ] Add Pro tier with advanced features (API access, saved workspaces)
- [ ] Add provider self-service dashboard for managing listings

---

## Completed ✅

- [x] 55 AI models from 21 providers
- [x] Search with text matching across names, providers, descriptions, tags
- [x] Filter by provider, category, pricing tier, license, context length, MMLU score
- [x] Grid and table view toggle
- [x] Model comparison (select 2+ models, side-by-side specs)
- [x] Favorites with localStorage persistence
- [x] Dark / light mode with persistence
- [x] Leaderboard with MMLU, HumanEval, GSM8K, MT-Bench tabs
- [x] Cost calculator with per-request, daily, monthly estimates
- [x] Benchmark scores with bar chart visualization on detail pages
- [x] Code snippets with Prism.js syntax highlighting and copy button
- [x] Input/output modality display
- [x] Capability tags on models
- [x] Related models on detail pages
- [x] Responsive mobile layout
- [x] Keyboard shortcut (⌘K) to focus search
- [x] GitHub Pages deployment
- [x] Vercel deployment config
- [x] GitHub Actions workflow for auto-deploy
- [x] Animated hero stats with IntersectionObserver
- [x] Featured and Recently Released showcase sections
- [x] Navigation bar with Models / Leaderboard / Pricing
- [x] Sort by name, provider, date, context window, price

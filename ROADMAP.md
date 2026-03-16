# NeuralAtlas — Production Roadmap

Features and improvements to make NeuralAtlas production-grade.

---

## 1. Backend & Data Infrastructure

| Feature | Why It Matters |
|---|---|
| **Headless CMS or database** (Supabase, Contentful, Sanity) | Models are currently hardcoded in `models.ts`. A CMS lets non-devs add/update models without code deploys. |
| **API layer** (Next.js API routes, or serverless functions) | Enables server-side filtering, pagination, and future integrations like live pricing. |
| **Automated data ingestion** | Scrape provider pages or consume APIs to auto-update pricing, context windows, and benchmark scores. |
| **Versioned model history** | Track when pricing changes, new versions release, or benchmarks update over time. |

## 2. Authentication & User Features

| Feature | Why It Matters |
|---|---|
| **User accounts** (OAuth via GitHub/Google) | Persist favorites, comparisons, and preferences across devices. |
| **User reviews & ratings** | Let developers rate models based on real-world experience — massive trust signal. |
| **Saved comparisons** | Let users save and share comparison URLs (e.g. `/compare?models=gpt-4o,claude-4-sonnet`). |
| **API key vault** | Let users store keys (encrypted) and test models directly from the hub. |

## 3. API Playground

| Feature | Why It Matters |
|---|---|
| **Interactive API playground** | Let users send test prompts to models and see responses in real-time — the single highest-value feature for developers. |
| **Multi-model prompt testing** | Send the same prompt to 2-3 models side-by-side and compare outputs. |
| **Response latency measurement** | Show actual TTFB and tokens/sec for each model during playground use. |
| **Streaming response display** | Show tokens arriving in real-time, matching real API behavior. |

## 4. Advanced Analytics & Visualization

| Feature | Why It Matters |
|---|---|
| **Interactive benchmark charts** (Recharts, D3, or Chart.js) | Radar charts, scatter plots for price vs. performance, timeline charts for model evolution. |
| **Price/performance ratio ranking** | Automatically calculate and rank models by benchmark-per-dollar. |
| **Model timeline** | Visual timeline showing release dates across providers — shows the pace of innovation. |
| **Token cost heatmap** | Visualize cost at different usage volumes (1K, 10K, 100K, 1M requests/day). |

## 5. SEO, Performance & Accessibility

| Feature | Why It Matters |
|---|---|
| **SSR/SSG with Next.js or Astro** | Each model gets a real URL (`/models/gpt-4o`) that Google indexes. Currently it's a SPA with no routes. |
| **URL-based routing** | Deep-linkable pages: `/leaderboard`, `/compare?models=...`, `/calculator`. |
| **OpenGraph meta tags** | Rich link previews when shared on Twitter/LinkedIn/Slack. |
| **Sitemap + structured data** (JSON-LD) | Google rich results for AI model searches. |
| **Lighthouse optimization** | Code splitting, lazy loading, image optimization, preloading critical CSS. |
| **WCAG 2.1 AA accessibility** | Screen reader labels, keyboard navigation, focus management, color contrast. |

## 6. Content & Community

| Feature | Why It Matters |
|---|---|
| **Blog/changelog** | "New model added: GPT-4.1" posts drive organic traffic and inform users. |
| **Model comparison guides** | Editorial content: "GPT-4o vs Claude 4 Sonnet: Which is better for coding?" |
| **Email newsletter** | Notify subscribers when new models launch or pricing changes. |
| **Discord/community** | Build a community of AI developers around the hub. |
| **Contribution system** | Let users submit PRs to add/correct model data via GitHub. |

## 7. Developer Experience

| Feature | Why It Matters |
|---|---|
| **SDK code generators** | Auto-generate boilerplate for Python, JS, Go, Rust based on selected model. |
| **Integration guides** | Step-by-step guides: "Use GPT-4o with LangChain", "Use Claude with Vercel AI SDK". |
| **Webhook notifications** | Alert users when a model they track gets a price change or new version. |
| **npm/pip package** | Publishable model metadata package: `npm install ai-models-data`. |
| **REST API for model data** | Let other tools query your model catalog: `GET /api/models?provider=openai`. |

## 8. Monetization (if applicable)

| Feature | Why It Matters |
|---|---|
| **Affiliate links** | Earn referral fees when users sign up for providers through your links. |
| **Sponsored placements** | Providers pay for "Featured" badges or top placement. |
| **Pro tier** | Advanced comparison features, API access, saved workspaces behind a paywall. |
| **Provider dashboards** | Let AI companies manage their own model listings. |

## 9. Infrastructure & DevOps

| Feature | Why It Matters |
|---|---|
| **CI/CD pipeline** | Automated testing, linting, and deployment on every push. |
| **Error monitoring** (Sentry) | Catch and fix runtime errors in production. |
| **Analytics** (Plausible, PostHog) | Understand which models users search for, compare, and click. |
| **CDN + edge caching** | Fast global load times via Vercel/Cloudflare. |
| **E2E tests** (Playwright) | Automated browser tests for critical flows. |

---

## Recommended Next Steps (in order of impact)

1. **Migrate to Next.js with file-based routing** — gives you SSR, SEO, API routes, and real URLs in one move.
2. **Add an API playground** — the single most valuable feature for developer users.
3. **Move model data to a CMS or JSON API** — makes the catalog maintainable without deploys.
4. **Add URL-based routing** — deep-linkable model pages, comparisons, and filters.
5. **Interactive benchmark charts** — radar/scatter plots make comparison visual and compelling.

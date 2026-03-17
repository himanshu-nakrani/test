import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { models } from '../src/data/models.ts'

const BASE_URL = 'https://test-olive-pi-98.vercel.app'
const publicDir = join(import.meta.dirname, '..', 'public')

// --- API JSON files ---
const apiDir = join(publicDir, 'api')
const modelsDir = join(apiDir, 'models')

mkdirSync(modelsDir, { recursive: true })

writeFileSync(join(apiDir, 'models.json'), JSON.stringify(models, null, 2))

for (const model of models) {
  writeFileSync(join(modelsDir, `${model.id}.json`), JSON.stringify(model, null, 2))
}

console.log(`Generated API: ${models.length} models written to public/api/`)

// --- Sitemap ---
const staticRoutes = ['/', '/leaderboard', '/calculator', '/guides', '/analytics']

const urls = [
  ...staticRoutes.map((r) => `  <url><loc>${BASE_URL}${r}</loc></url>`),
  ...models.map((m) => `  <url><loc>${BASE_URL}/models/${m.id}</loc></url>`),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

writeFileSync(join(publicDir, 'sitemap.xml'), sitemap)

console.log(`Generated sitemap.xml with ${urls.length} URLs`)

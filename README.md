# Zytrix Leads

Private personal lead-research workspace. No mock leads, automated cold messages or required paid APIs.

React 19 / TypeScript, Next-compatible App Router on Vinext, Cloudflare Workers, D1 persistent storage, MapLibre. Discovery: bounded manual OSM/Overpass; Geoapify optional. Verification: Tavily optional, human evidence review available. No direct third-party URL fetching. Outreach works with templates in pt-BR/en/es.

## Setup

Requires Node >=22.13 and pnpm. `pnpm install`, `pnpm db:generate` after schema edits, `pnpm test`, `pnpm test:integration` after build, `pnpm exec tsc --noEmit`, `pnpm build`. Local D1 requires migrations applied with Wrangler before API tests; deployed Sites applies versioned Drizzle migrations. `pnpm dev` outside managed environment. Managed image uses `sites-preview start "$PWD"`.

Keep `.openai/hosting.json` D1 binding DB. Secrets listed in `.env.example` are optional and server-only. Use Free accounts without card; never turn on paid plans. Geoapify registration is adults-only. Account quotas must include usage outside this application; adjust conservative budgets downward. No secrets in Git or client.

Production must remain behind owner-private Sites authentication. APIs require gateway identity and same-origin JSON mutations. Standalone hosting needs its own trustworthy authentication before deployment; do not expose raw Worker ingress accepting arbitrary identity headers.

Architecture, official source comparison, exclusions and limitations: [docs/architecture.md](docs/architecture.md). Test/validation evidence: [docs/validation.md](docs/validation.md).

V1 limitations: network autocomplete not enabled; full geographic dataset not imported; OSM search is radius sample (may include neighboring cities); broad country/region queries need Geoapify; website technical audit and LLM deferred; reminders need panel open; exact free provider account quotas/phone correctness and precision unmeasured. Interface starts pt-BR; outreach languages supported, full UI en/es future. History/dashboard return bounded records and explicitly report truncation.

# Decision — 2026-10-06

Private personal V1. React/TypeScript with Next-compatible App Router (Vinext) on Cloudflare Workers through Sites; D1 instead of Neon because the managed deployment provisions persistent storage without an additional external account. Provider interfaces decouple discovery and outreach. Geoapify is preferred when a lawful account/key is configured; optional Tavily for verification; manual low-volume OSM/Overpass fallback. MapLibre uses OSM raster tiles only when map view is open, with attribution. No LLM, paid API, domain purchase or payment details.

Geoapify registration explicitly excludes minors. A responsible adult must manage any new account. Do not bypass eligibility. Pricing FAQ permits commercial production with attribution; older terms say contact Geoapify for production limitations and reserve overage charges. Therefore do not activate without Free account confirmation; locally capped to 250/day (official 3,000/day), no payment method, include external account usage in budget.

Overpass public instances explicitly discourage becoming a production app backend. Here it is a private, manually triggered research tool, capped to 30/day, no cron/bulk harvesting, 1–10 km and 100 results. Not a scalable production guarantee. Broad region/country search requires Geoapify; no pretending that radius equals city boundary.

Nominatim is explicit-submit geocoding, not network autocomplete: maximum 60/day and minimum 1.5 s between calls, cache location choices for one hour, never periodic polling. Users select a disambiguated address before searching. Country codes + native select type-ahead and editable administrative area/city allow global input; no comprehensive countries/states/cities dataset imported. Full local autocomplete dataset is future (ODbL database sharing obligations must be preserved separately).

Persistence: users; leads JSON aggregate (contacts, sources, sites, socials, verification, scores); searches (result IDs + 24h persistent cache); activities (pipeline/event history); scheduled_contacts (follow-ups/messages); settings; usage; location_choices. FECHADO represents client conversion in this V1; separate clients/messages tables deferred until independently useful. Prepared SQL and owner filters throughout. Usage counters reserve before outbound calls (including failures), atomically bounded; local estimates do not reflect external key usage.

Website absence in provider -> UNVERIFIED. URL in source -> POSSIBLE_WEBSITE. Tavily search -> evidence-scored candidate, CONFIRMED only at >=80/100 with name and contact/address signal plus corroboration of the domain already supplied by the discovery source. Newly searched domains stay POSSIBLE pending human ownership review. This is a heuristic index, not calibrated accuracy. No search proves website absence. Manual review notes retained. Direct website fetch, speed/mobile/CTA health audits and BROKEN detection are not automatically implemented: fixed provider endpoints eliminate arbitrary URL fetching and SSRF in our infrastructure. CSP needs inline styles/scripts for framework hydration; no raw source HTML is rendered, all external snippets are untrusted plain text. No model consumes external prompts.

Private Sites gateway authenticates user and protects pages/APIs; app also requires trusted gateway identity on API calls and verifies Origin on mutations. Never expose Worker origin outside trusted gateway or trust user-supplied auth headers in an independent deployment. No leads embedded in public HTML; noindex/noarchive headers + robots disallow. All reminders require user review; no outbound messaging automation. Alerts require open panel. WhatsApp requires explicit +DDI; do not infer country or commercial ownership from phone tags.

## Official sources compared

| Source | Coverage/fields/quality | Free/rate/card/future | Storage/commercial/terms | Decision/replacement |
|---|---|---|---|---|
| Geoapify Places | Global OSM-derived POIs, categories, address/coordinates; optional website/phone/email/hours, incomplete. No verified count for our niches. | 3,000 credits/day, up to 5 req/s, no card; 10k/day paid $59/month. Places credit cost must follow response size/product. | Cache/store allowed (Places docs); Geoapify + OSM attribution. Pricing permits commercial production; age eligibility and overage clause noted. | Implemented optional adapter, no key available. Easy replace via interface. |
| OSM / Overpass | Global community POIs; all contact tags optional. Hairdresser includes salons and barbers; no complete business registry. | No card/key; public resource sharing, approximately 10k requests/1GB day guideline not guaranteed quota; local V1 30/day. | ODbL, attribution and database share-alike obligations for public distributions. Public backend discouraged. | Bounded manual fallback; dumps/self-hosted index needed for scale. |
| Foursquare API / FSQ OS Places | Global 100m+ advertised POIs (not measured), API rich contacts/categories; open dataset fields differ. | Pro: 500 free calls from Jun 1 2026, then $15/1k up to 100k. Card hard-cap not verified. Premium separate. | API retention/licensing restrictions require account-specific review; cannot assume open-data license covers API. FSQ OS separate open dataset, license must be bundled with selected release. | Disabled API stub; no charge-bearing configuration. Open dataset future due size. |
| LocationIQ | Global geocoding/maps/nearby from open data, address/categories; commercial contacts not guaranteed. | Free 5k/day, 2/s, 60/min. Free registration card condition not independently completed. Paid Developer $100/month. | Commercial with prominent attribution. Response data stored forever per FAQ, raw request-response cache <=48h free; no server-side tile cache. | Not integrated; less direct than Places. Easy adapter replacement. |
| Google Places | Global proprietary POIs, phone/website/address/categories; no general email field. Coverage not benchmarked. | Billing required, pay-as-you-go, SKU free caps vary by fields; $200 monthly credit expired 2025. | Storage/caching restrictions; place IDs exception. Google Maps/attribution obligations. | Excluded: billing and retention conflict with V1. |
| Tavily | Global web search URLs/snippets, not a company registry or verified contact source. | Free 1k credits/month without card. Basic search 1 credit; rate limit depends account, local 2s; PAYG $0.008/credit. | Search evidence links, do not copy pages or assume source ownership/license. Terms govern usage; source copyright survives. | Optional search-only verification; 200/month conservative budget, no key available. |
| Nominatim | Global OSM address geocoding, not POI lead harvesting. | No card; public service max 1 req/s, no client network autocomplete, no SLA. | ODbL attribution; identifying UA, cache and ability to swap backend. | Manual locality resolution, never per-keystroke calls. |
| Countries States Cities DB | Community geographical hierarchy, not company leads. | Offline public dataset, no API quota/card. | ODbL attribution + share-alike database obligations. | Reviewed, not imported in this V1. |
| Workers AI | Optional LLM, quality not measured for leads. | 10k neurons/day generally, some models now paid-only; external plan confirmation necessary. | Cloudflare terms. | Deferred: deterministic outreach stays functional at R$0. |
| Neon | PostgreSQL; no company data. | Current storage documentation changing (1GB announcement Oct 2 vs older 0.5GB docs), 100 CU-hours/project. No account plan inspected. | Account quotas and Free status must be checked before provisioning. | Deferred; D1 available with managed host. |

Official references:
- https://www.geoapify.com/pricing/
- https://www.geoapify.com/terms-and-conditions/
- https://apidocs.geoapify.com/docs/places/
- https://dev.overpass-api.de/overpass-doc/en/preface/commons.html
- https://www.openstreetmap.org/copyright
- https://operations.osmfoundation.org/policies/nominatim/
- https://operations.osmfoundation.org/policies/tiles/
- https://docs.foursquare.com/developer/reference/upcoming-changes
- https://docs.foursquare.com/data-products/docs/fsq-places-open-source
- https://foursquare.com/legal/terms/apilicenseagreement/
- https://locationiq.com/pricing
- https://eu1.locationiq.com/tos
- https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
- https://developers.google.com/maps/documentation/places/web-service/policies
- https://www.tavily.com/pricing
- https://docs.tavily.com/documentation/api-reference/endpoint/search
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://github.com/dr5hn/countries-states-cities-database
- https://neon.com/blog/neon-free-plan-1-gb-per-project

Not benchmarked: exact business counts, correctness of phones, false positive/negative rates, provider-specific account rate/quota headers, permanent FSQ API retention rights. Never imply these are measured.

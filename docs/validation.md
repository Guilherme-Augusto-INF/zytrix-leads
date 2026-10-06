# Validation — 2026-10-06

## PASS

- 22 domain unit tests: normalization, website statuses, evidence heuristics, confidence, separated/configurable scores, conservative deduplication, homonyms, cache geography/scope/provider, templates and WhatsApp suppression/DDI.
- 30 integration checks against compiled Cloudflare Worker + isolated D1 + fixture outbound responses: auth rejection, empty state, validation, locality selection, persistence, cache without repeated source call, owner isolation/IDOR, save, pipeline/event history, scheduling, suppression, deletion, unavailable verification key, CSRF, response/body bounds, API 429, partial results, zero results, private redirect rejection, 20-second timeout, atomic quotas, server-rendered HTML and noindex headers.
- 5 optional-provider fixture checks: country without region, Geoapify pagination 45 results/3 pages, Tavily evidence score with uncorroborated domains kept POSSIBLE, inert external prompt text, recent evidence prevents repeat spend. No live keys/costs used.
- TypeScript noEmit, targeted ESLint, production Worker build.
- SQL prepared/owner-scoped; source identities unique per owner; concurrent mutations use independent version token and preserve actual updated_at timestamps; event/schedule batch conditional on successful update.
- No secret values committed, no credential files, no paid services/plans/billing activated. Provider fixture keys are clearly fictitious test strings, isolated from production.

Commands: `pnpm test`; `pnpm exec tsc --noEmit`; targeted ESLint; `pnpm build`; `pnpm test:integration` after build. Integration tests manually enumerate built ES modules and isolate D1. Do not confuse fixtures with live provider validation.

## Live-data results (outside deployed database)

| Case | Measured outcome | Conclusion |
|---|---|---|
| Osasco, São Paulo, BR | Nominatim HTTP 200 with 2 locality objects. Overpass queries at 3km/30 and smaller 1km/10 returned HTTP 504. | Locality works; company search FAIL in tested attempts. No claim of complete Brazilian coverage. |
| Barueri, São Paulo, BR | Overpass at 1km returned HTTP 200, 0 records. A 3km/30 query returned HTTP 504. | Honest empty sample; requested company discovery not validated successfully. |
| Lisboa, PT | Overpass at 1km returned HTTP 200, 10 named hairdresser records; 8 phone tags, 2 website tags (verify exact counts in captured sample). | International source returned actual companies. Hairdresser includes salons, not guaranteed barbers. |

Manual sample: Slash's official https://www.slash.pt/ lists Rua Dona Estefânia 87A, Lisboa and +351 21 584 16 97, matching OSM name/address/phone. OSM already provides its website, so classification begins POSSIBLE_WEBSITE, not missing. Lena's source includes a website URL but it could not be independently opened; cannot call broken. Vasco.Lx/Moments had no website tag in the sample; kept UNVERIFIED. Third-party listings are not independent ground truth when they reuse OSM. No phone calls or messages sent.

Precision not measured: no definitive absence-of-site ground truth, no false-positive/negative rates, no comprehensive duplicate or relevance audit. One corroborated phone/address is not a population accuracy estimate. Live data not seeded into production or shipped as demo leads.

## /devil fixes

1. Empty website field must remain UNVERIFIED; template missing-site claim only after search state or human review.
2. Cache keys include coordinate/geometry identity, country/admin/city, scope, radius, provider and result limit. Locality tokens are owner-scoped, expire and bind the exact search hierarchy/scope.
3. Country/region resolution ignores disabled narrower fields; worldwide input supports absent administrative areas.
4. Never merge chains on domain/telephone alone: require same normalized name + city and contact/address/proximity.
5. Unique source index + version-checked mutation prevents duplicate source rows and lost pipeline updates.
6. Worker fetch does not support redirect:error: changed to manual, reject non-2xx before reading. No arbitrary business-domain fetch, so DNS/private-IP SSRF paths never reach application egress.
7. Atomic conservative reservations, hard free-budget ceilings, Geoapify pagination delay, reject partial/oversized/redirected responses and bounded timeout.
8. Explicit +DDI required for WhatsApp; commercial ownership not inferred; suppression cancels reminders and blocks stage/contact operations.
9. Fixed invalid guessed Geoapify categories after official-doc comparison; broader mappings carry coverage warning.
10. Edited website/identity invalidates automated status; metadata/body/URL lengths bounded; public data rendered as text, no model instruction handling.
11. New domains found in search stay POSSIBLE until ownership is corroborated; a directory with matching contact details is not automatically the official website. Same-name franchise branches with distinct addresses do not merge just because of shared telephone.
12. Cap collection to 1,500 leads per private workspace and bound raw fields before persistence, avoiding unbounded Worker memory during deduplication.
13. Separate version token from updated_at timestamp to preserve sorting and compare-and-swap.

## NOT VERIFIED / incomplete

- Live Geoapify/Tavily key/account activation, precise external quotas and actual billed-usage reconciliation.
- Browser E2E, mobile/desktop visual QA, keyboard focus behavior, MapLibre rendering/tiles and WebMCP execution: permitted control-browser skill unavailable; supervised preview not reachable from shell. Code implemented, browser behavior not certified.
- Full UI en/es, full offline geographic autocomplete dataset, automatic website technical audit, AI/objection/package agent and notifications while panel closed: future.
- GitHub source publication: PASS. Repository Guilherme-Augusto-INF/zytrix-leads was subsequently created and 138 files imported through merged PR #1; main commit 9aa9a0c5168447d89bcf1617aca3540b289d812b. Site source remains separately versioned privately.
- Production functional smoke test and auth/API/browser calls must be recorded separately from successful deployment status. A successful publish status proves publication, not every external API function.
- Complete V1 Definition of Done: NOT satisfied until live Brazilian discovery, browser checks and missing integrations are validated. This is a published initial implementation, not a certified production-complete V1.

## Mobile PWA — 2026-10-06

Implemented: standalone manifest, PNG 192/512 icons, maskable and Apple icons, installation instructions/native prompt when supported, mobile bottom navigation, native dialog menu, cards initially on small screens, safe areas, 44px touch targets, 16px form text, table scrolling, full-width details and offline notice. No extra paid service activated.

Privacy /devil: public-asset allowlist only; gateway login HTML cannot enter offline cache; API/RSC/auth/external/map requests and writes bypass service worker; online pages never cached; HTTP auth denials never replaced by offline view; no queued mutations, automatic messages or background notifications. Old caches are cleaned only under this app's prefix. Mobile navigation uses native modal focus behavior, and zoom remains enabled.

Validation: 15 service-worker/manifest/icon behavior checks, 22 domain checks, 31 built Worker/D1 integration checks (including rendered PWA metadata) and 5 optional-provider checks; TypeScript, targeted ESLint, diff check and build. These are automated isolated checks, not real-phone installation certification.

NOT VERIFIED: Android/iOS installation and service-worker registration through production authentication gateway; actual standalone login session; mobile visual QA/touch/keyboard; real offline device transitions. The Cloudflare account migration and Sites deletion are not part of this PWA change and remain pending. Keep current private hosting until replacement is validated.

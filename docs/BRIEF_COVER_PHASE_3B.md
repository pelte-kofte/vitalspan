# The Vitalspan Brief — Phase 3B local design package

Status: local design and validation only. Nothing in this package deploys, publishes, generates an image, enables a schedule, or reads/writes production Supabase.

The visual constitution is `.claude/VITALSPAN_ART_BIBLE.md`, version 1.0, “The Living Still.” Provider model names, request syntax, seeds, and render settings remain outside that document as required by its governance section.

## 1. Image-provider audit

The primary recommendation is OpenAI `gpt-image-2`. It is the best current fit for the Art Bible’s long, nuanced direction, exact portrait dimensions, and a later workflow that may use approved reference images for controlled visual calibration. The adapter uses a 3:4 `1152x1536` PNG plan and is inert in this phase. OpenAI documents direct generation/editing, flexible dimensions, quality controls, and the current GPT Image 2 model in its [image generation guide](https://developers.openai.com/api/docs/guides/image-generation) and [model reference](https://developers.openai.com/api/docs/models/gpt-image-2).

Google Gemini 3.1 Flash Image is the benchmark provider. Google now recommends it as the all-around image model; it supports exact 3:4 output at 1K/2K/4K, editing and multiple references, and applies SynthID. Search grounding is not part of the request plan, so outside imagery cannot silently enter the concept. See the current [Gemini image-generation guide](https://ai.google.dev/gemini-api/docs/image-generation) and [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).

Stability Stable Image Ultra is the fallback where an explicit negative prompt or seed is useful. It costs eight credits per successful generation and supports controlled aspect ratios and output formats, but not native 3:4. Its plan therefore requests 4:5 and records a later center crop inside the Art Bible’s crop-safe zone. See the [Stable Image API reference](https://platform.stability.ai/docs/api-reference) and [credit pricing](https://platform.stability.ai/pricing).

Imagen 4 is not proposed because Google now says Imagen models will shut down on August 17, 2026. Amazon Nova Canvas is also excluded because AWS gives it a September 30, 2026 end-of-support date. Both dates are too near for a new editorial dependency.

| Provider | Role | Strength | Material limitation | Conservative adapter estimate |
| --- | --- | --- | --- | ---: |
| GPT Image 2 | Primary | Instruction following, editing, custom 3:4 size | No documented deterministic seed/negative-prompt field | $0.05 medium / $0.20 high |
| Gemini 3.1 Flash Image | Benchmark | 3:4 at 1K–4K, editing, references, SynthID | No documented deterministic seed/negative-prompt field | $0.067 1K / $0.101 2K |
| Stable Image Ultra | Fallback | Seed and negative-prompt controls | 1 MP, no native 3:4; requires a crop from 4:5 | $0.08/image |

The OpenAI budget is intentionally conservative for `1152x1536`. As a reference point, the official table currently prices GPT Image 2 at $0.041 medium and $0.165 high for `1024x1536`, before small text-input charges.

The abstraction in `supabase/functions/_shared/briefCover.ts` separates:

- the permanent Art Bible blocks;
- deterministic weekly editorial direction;
- provider descriptors and cost assumptions; and
- provider-specific request plans.

Every current request plan carries `executionEnabled: false`, `networkAllowed: false`, `credentialsIncluded: false`, and `imageGenerated: false`. There is deliberately no provider execution function.

## 2. Issue 1 cover concept

The local fixture is `fixtures/brief/issue-1-draft.json`. Its five PMIDs and source metadata represent the documented Issue 1 selection; local IDs are visibly non-production identifiers. The builder does not infer that the papers share a mechanism.

The preview resolves to:

- Title: “The Gut, the Heart, and the Aging Brain”
- Confidence: low
- Theme type: no unifying theme
- Composition family: constellation
- Central tension: five useful observations share one week of attention without resolving into one biological explanation
- Physical world: five separate weathered forms on a shallow tabletop in cool morning light
- Controlled impossibility: only the seed pod’s shadow stops just short of its caster
- Principal uncertainty: populations, interventions, outcomes, and evidentiary contexts differ
- Explicit non-claims: no shared mechanism, causal bridge, recommendation, cross-population generalization, or visual hierarchy of evidence

The five forms are unified only by paper, light, palette, scale, and composition. The generated prompt expressly forbids roots, threads, pathways, bridges, network lines, and shared-mechanism imagery.

Run the read-only preview with:

```sh
npm run brief:cover -- preview
```

This command runs under Node's permission model with filesystem read permission only. It has no network/write permission and does not read environment variables.

## 3. Proposed metadata migration

Phase 3B originally kept the proposal outside the deployable sequence. Phase 3C audited and superseded it with `supabase/migrations/20260715000000_brief_cover_pipeline.sql`; see `docs/BRIEF_COVER_PHASE_3C.md`. The production migration remains unapplied pending explicit approval.

It proposes two private editorial tables:

- `editorial_cover_concepts` stores versioned editorial intent, Art Bible and prompt hashes, evidence restraint, palette, approval state, and minimal render provenance.
- `editorial_cover_concept_sources` stores normalized candidate/source-phrase evidence with an explicit order.

Published `issues` would gain a restrictive foreign key to the selected concept plus a relative asset path, alt text, and content hash. It stores no image bytes.

Safety properties:

- Admin-only `SELECT` through the existing `is_brief_admin()` gate; no direct client write policy.
- No service key, API key, access token, refresh token, credential, image bytes, or provider response body.
- Rendered state requires model, provider, relative storage path, content hash, and dimensions.
- Confidence constrains composition at the database layer.
- Asset paths reject absolute paths, traversal, and URLs.
- Only one approved/rendered concept may be selected per draft.

The dry-run command is:

```sh
npm run brief:cover:migration:dry-run
```

It statically validates transaction boundaries, referenced baseline objects, balanced SQL structure, RLS, grants, credential exclusions, path constraints, and provenance constraints. It does not contact a linked project. There is no local PostgreSQL server or container runtime in this environment, so engine execution is explicitly reported as skipped; the SQL must still be replayed against a disposable local Postgres before promotion.

## 4. Admin CLI design

The implemented Phase 3B CLI supports only:

- `preview`: concise Issue 1 concept and audit;
- `concept`: complete deterministic concept and prompt;
- `providers`: local capability/cost catalog; and
- `plan --provider ...`: an inert, credential-free request envelope.

`generate`, `publish`, and `deploy` fail closed. The CLI contains no Supabase client and accepts no JWT.

A later, separately authorized admin CLI should split state changes into narrow commands: `concept-save`, `concept-approve`, `render-request`, `asset-attach`, and `concept-reject`. Each command should use a short-lived admin session, call a dedicated RPC rather than write a table directly, print only identifiers and hashes, require an explicit confirmation for provider spend, and keep rendering separate from publishing. No such commands are implemented here.

## 5. Secrets and weekly cost

No secret is required for the current local fixture, builder, audit, preview, tests, or migration dry run.

If rendering is authorized later:

- OpenAI: `OPENAI_API_KEY`
- Google: `GEMINI_API_KEY`
- Stability: `STABILITY_API_KEY`

Secrets belong in the platform secret store or an outside-repository mode-600 local file. They must never enter the fixture, prompt, migration, CLI output, request-plan artifact, repository `.env`, or database metadata.

At the proposed baseline of three medium concepts plus one high final per week:

- GPT Image 2 budget: approximately $0.35/week, plus negligible prompt-input charges
- Gemini 3.1 Flash Image benchmark: approximately $0.30/week
- Stable Image Ultra: $0.32/week

Six medium concepts plus one high final would budget approximately $0.50/week for GPT Image 2, $0.50/week for Gemini 3.1 Flash Image, or $0.56/week for Stable Image Ultra. Current Phase 3B spend is exactly $0 because no image was generated.

## Separate diagnosis: Expo resolver and `node_modules/.deno`

The repository’s `package.json` points `main` at `node_modules/expo/AppEntry.js`. Expo’s entry file imports the app using `../../App`, which is correct only when that file is resolved from the conventional top-level `node_modules/expo` location.

This installation also contains a complete duplicate at `node_modules/.deno/expo@54.0.35/node_modules/expo/AppEntry.js`. The two entry files have identical content but different inodes. If Metro selects or canonicalizes the `.deno` copy, `../../App` resolves inside `node_modules/.deno` instead of at the repository root, producing the reported resolver error. No top-level packages are symlinks, so deleting or rebuilding dependencies is not necessary for a source-level workaround.

The minimal safe fix is a conventional root entry point:

```js
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

Save it as `index.js`, change `package.json` `main` to `index.js`, then restart Metro with `npx expo start --clear`. This makes app resolution relative to the repository, not Expo’s physical package location. It does not modify dependencies and is not applied in this phase.

The later canonical dependency cleanup is to preserve the current folder as a backup and recreate `node_modules` from `package-lock.json` with npm, ensuring no Deno store is mixed into Metro’s graph. That is a dependency-tree change and was intentionally not performed.

# The Vitalspan Brief — Phase 3C production design

Status: implemented and tested, but not deployed. No migration has been applied, no Edge Function has been deployed or invoked, no image has been generated, no secret has been set, and no schedule has been enabled.

## Runtime boundary

`brief-cover` is a server-only Edge Function. It accepts `POST { "draftId": "<uuid>" }` only when both the Supabase service credential and `x-brief-pipeline-secret` match the existing `BRIEF_PIPELINE_SECRET` pattern. `OPENAI_API_KEY` is read only inside the function.

The function:

1. atomically claims the newest `concept_ready` record through a service-role-only RPC;
2. confirms the editorial draft is still `ready_for_review`;
3. reloads normalized evidence phrases belonging to the selected draft candidates;
4. reconstructs the prompt from the unchanged permanent Art Bible blocks;
5. requests exactly one GPT Image 2 `1152x1536` medium-quality PNG;
6. validates PNG signature, IHDR dimensions, and the 15 MiB size cap;
7. uploads with `upsert: false` to `brief-covers/private/{draftId}/{generationId}/master.png`;
8. stores hashes and safe provenance, then transitions to `ready_for_review`; or
9. records a bounded failure code/message and transitions to `failed`.

It never approves or publishes.

## State and history

Each concept/render attempt is a new `editorial_cover_generations` row:

```text
concept_ready → generating → ready_for_review → approved
                          ↘ failed             ↘ rejected
```

The database serializes claims with a per-draft advisory lock and partial unique indexes. A draft cannot have concurrent `generating` or duplicate `ready_for_review` rows. Regeneration clones the latest rejected/failed concept into a new version; it does not overwrite history. Approved records are immutable.

Editorial draft approval and cover approval remain independent. `publish_editorial_draft` requires both. Existing published issues—including issue 0—retain nullable cover fields and continue using the bundled static artwork. New issue rows initially retain that static rendering fallback until a separately authorized promotion step writes a stable public cover path.

## Privacy and Storage

The `brief-covers` bucket is private. Service-role code is the only writer. Authenticated users can read objects only when `is_brief_admin()` succeeds; ordinary authenticated and anonymous users cannot read prompts, generations, rejected images, or private objects.

`inspect-cover` creates a five-minute signed review URL. Rejected and failed records remain private. Approved image bytes are never overwritten. A future promotion service may copy an approved asset to a stable issue path; that copy step is deliberately not coupled to review or publication in this phase.

Stored metadata is limited to provider/model, prompt and Art Bible versions/hashes, output dimensions/bytes/MIME, duration, safe request ID, estimated cost, private storage coordinates, asset hash, and review audit fields. API keys, access/refresh tokens, image bytes, and provider response bodies are never stored.

## Admin workflow

```sh
npm run brief:admin -- create-cover-concept <draftId> --fixture fixtures/brief/issue-1-draft.json
npm run brief:admin -- generate-cover <draftId>
npm run brief:admin -- inspect-cover <draftId>
npm run brief:admin -- approve-cover <draftId>
npm run brief:admin -- reject-cover <draftId> --reason "composition is too literal"
npm run brief:admin -- regenerate-cover <draftId>
```

Concept creation and review use admin-gated RPCs. Generation additionally requires server-side `SUPABASE_SERVICE_ROLE_KEY` and `BRIEF_PIPELINE_SECRET` in the operator environment; neither is accepted as a CLI argument. The current Apple session issue therefore does not affect fixture/mocked tests and does not justify weakening production authentication.

## Provider configuration and secret

The only new server secret is:

```text
OPENAI_API_KEY
```

Do not prefix it with `EXPO_PUBLIC_`, put it in the mobile app, commit it, print it, or store it in database metadata.

Provider configuration remains outside the Art Bible:

- provider: `openai`
- model: `gpt-image-2`
- size: `1152x1536` (exact 3:4)
- quality: `medium`
- output format: `png`
- outputs per request: `1`
- conservative estimated cost: `$0.05`

GPT Image 2 does not expose a negative-prompt request field. The exact permanent exclusion block is appended unchanged to the final prompt and is also shown separately in the no-generation preview.

## Verification commands

```sh
npm run brief:cover -- preview
npm run brief:cover:migration:dry-run
npx tsc --noEmit
npm test -- --runInBand --watchman=false
npx --yes deno check supabase/functions/brief-cover/index.ts
supabase db push --linked --dry-run
git diff --check
```

The Supabase command is a linked dry run only. Applying the migration and deploying the function require separate explicit approval.

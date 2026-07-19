# PHASE 8.0C IMPLEMENTATION SPECIFICATION

# Persistence Runtime Integration

**Version:** 1.0.0
**Status:** Approved — Inactive Implementation
**Architecture:** Approved Phase 8.0C Architecture Blueprint
**Production activation:** Not authorized
**Public-contract impact:** None

---

## 1. Purpose

Phase 8.0C implements the approved persistence infrastructure beneath the existing Phase 8.0B `PersistencePort`.

It introduces one inactive Supabase PostgreSQL adapter capable of preserving one complete `PersistenceEnvelope` as one append-only, owner-isolated storage record.

This phase does not change scientific behavior, Phase 8.0A contracts, Phase 8.0B contracts, application behavior, or production activation.

The implementation must remain removable without affecting any existing scientific or application path.

---

## 2. Governing Authority

The following artifacts govern Phase 8.0C:

1. `docs/VITALSPAN_ENGINEERING_STANDARD.md`
2. `docs/SCIENTIFIC_BASELINE_V1_0.md`
3. `docs/PHASE_8_0A_PRODUCTION_CONTRACT_ACTIVATION_ARCHITECTURE.md`
4. `docs/specifications/PHASE_8_0B_IMPLEMENTATION_SPECIFICATION_v2.0.0.md`
5. `docs/architecture/PHASE_8_0C_ARCHITECTURE_BLUEPRINT.md`
6. The completed Phase 8.0B implementation

The stricter applicable requirement controls.

The approved Phase 8.0C Architecture Blueprint is authoritative for architecture, ownership, dependency direction, storage technology, activation boundaries, and non-goals.

This specification may define implementation details only where required to implement that approved architecture. It must not introduce another architectural boundary.

---

## 3. VES Change Classification

**Primary classification:** Backward-compatible behavioral

**Rationale:** Phase 8.0C adds a concrete persistence capability behind an existing approved port while preserving all existing scientific, persistence-contract, application, and production behavior.

The capability remains inactive and unreferenced by existing production paths.

### 3.1 Affected layers

- Persistence infrastructure
- Supabase PostgreSQL schema
- Storage mapping
- Concrete `PersistencePort` implementation
- Inactive runtime composition
- Storage-security validation
- Persistence runtime tests

### 3.2 Unaffected layers

- Scientific calculations
- Scientific eligibility
- Scientific interpretations
- Scientific confidence
- Scientific status
- Scientific reasons and warnings
- Scientific evidence
- Scientific provenance
- Scientific safety candidates
- Scientific trends
- Scientific-domain registries
- Phase 8.0A public contracts
- Phase 8.0A serializer semantics
- Phase 8.0B public contracts
- Phase 8.0B public barrel
- Existing application services
- UI
- Advisor
- AI
- HealthKit
- Existing production activation
- Existing feature flags

### 3.3 Version impact

- Scientific versions: unchanged
- Scientific Baseline: unchanged
- Phase 8.0A versions: unchanged
- Phase 8.0B versions: unchanged
- New implementation identity: required
- New storage schema identity: required
- New storage model identity: required

---

## 4. Scope

Phase 8.0C shall implement only:

- one concrete Supabase PostgreSQL implementation of the existing `PersistencePort`;
- one private lossless mapper from `PersistenceEnvelope` to a storage record;
- use of the approved Phase 8.0A request and result serializers;
- one versioned append-only PostgreSQL storage schema;
- one initial forward migration;
- one authenticated, owner-bound storage insertion operation;
- database-generated persistence identity;
- database-generated persistence timestamp;
- preservation of complete Phase 8.0B metadata, lineage, and audit;
- fixed Phase 8.0C `PersistenceMetadata`;
- inactive composition of the concrete port with `PersistenceService`;
- focused unit, architecture, schema, and security tests;
- isolated database validation evidence;
- dependency and activation audits; and
- the required VES review evidence.

Phase 8.0C begins at `PersistencePort.save`.

It ends when the concrete adapter either:

- returns a structurally valid existing `PersistenceResult`; or
- throws the existing `PersistencePortException`.

---

## 5. Out of Scope

Phase 8.0C shall not implement:

- new public contracts;
- changes to the Phase 8.0A contracts;
- changes to the Phase 8.0A serializers;
- changes to any Phase 8.0B contract;
- changes to the Phase 8.0B public barrel;
- a second persistence port;
- a repository;
- a storage gateway;
- a public storage DTO;
- a public runtime facade;
- read operations;
- list operations;
- update operations;
- delete operations;
- upsert behavior;
- deserialization runtime;
- history queries;
- history reconstruction;
- scientific correction history;
- lineage discovery;
- lineage lookup;
- synchronization;
- conflict resolution;
- offline queues;
- automatic retries;
- idempotency;
- duplicate detection;
- caching;
- compression;
- application-level encryption;
- key management;
- replication;
- event sourcing;
- analytics;
- telemetry;
- monitoring;
- import;
- export;
- retention workflows;
- deletion workflows;
- data backfills;
- historical payload rewrites;
- destructive down migrations;
- multi-record transaction orchestration;
- query-oriented scientific projections;
- scientific search indexes;
- domain-specific production adapters;
- application evaluation wiring;
- feature-flag wiring;
- minimum application-version policy;
- UI integration;
- Advisor integration;
- AI integration;
- safety-message activation; or
- production activation.

The use of one database-atomic insert does not introduce a transaction API.

Preserving `parentPersistenceId` does not introduce a history feature.

---

## 6. Public Contract Impact

**Public-contract impact must remain none.**

The exact Phase 8.0B public exports remain:

- `PersistenceBoundary`
- `ValidationOutcome`
- `ValidatedPersistenceInput`
- `PersistenceMetadata`
- `PersistenceLineage`
- `PersistenceAudit`
- `PersistenceEnvelope`
- `PersistenceService`
- `PersistencePort`
- `PersistenceResult`
- `PersistencePortException`

The following requirements are mandatory:

- `src/domain/scientificPersistence/index.ts` remains byte-for-byte unchanged.
- No export is added to the `scientificPersistence` barrel.
- No Phase 8.0C implementation type is exported through a public domain barrel.
- No Supabase type appears in a Phase 8.0A or Phase 8.0B public signature.
- No storage record type becomes an application DTO.
- No database insertion operation becomes a scientific or persistence-domain contract.
- The concrete adapter implements the existing `PersistencePort` exactly.
- The concrete adapter exposes only the existing `contractVersion` and `save` requirements through that port.

Internal exports required between Phase 8.0C infrastructure files are package-internal implementation details. They are not stable public contracts and must not be re-exported through a public barrel.

---

## 7. Frozen Architecture Boundaries

### 7.1 Scientific authority

Phase 8.0C must not:

- calculate scientific output;
- validate scientific correctness;
- interpret a status;
- translate confidence;
- inspect evidence quality;
- infer missing provenance;
- weaken or remove a block;
- create a warning;
- infer safety action;
- calculate trend;
- reconstruct scientific audit metadata; or
- replace a scientific version.

### 7.2 Persistence-boundary authority

Phase 8.0B remains the sole owner of:

- `ValidatedPersistenceInput`;
- `PersistenceMetadata`;
- `PersistenceLineage`;
- `PersistenceAudit`;
- `PersistenceEnvelope`;
- pre-construction validation;
- post-construction validation;
- `PersistenceService`;
- `PersistencePort`;
- `PersistenceResult`; and
- `PersistencePortException`.

Phase 8.0C shall consume these contracts unchanged.

### 7.3 Storage authority

Phase 8.0C owns only:

- private storage mapping;
- concrete adapter behavior;
- storage schema;
- storage model;
- database identity generation;
- database time generation;
- authenticated ownership binding;
- append-only storage enforcement; and
- infrastructure composition.

### 7.4 Activation boundary

The Phase 8.0C composition must not be imported by:

- scientific domains;
- existing production adapters;
- screens;
- UI components;
- application services;
- Advisor;
- AI;
- HealthKit; or
- existing runtime startup modules.

No Phase 8.0C operation may execute merely because the implementation is present.

---

## 8. Implementation Identities

The Phase 8.0C infrastructure shall supply one immutable `PersistenceMetadata` value with exactly these identities:

| Field | Required value |
|---|---|
| `contractVersion` | `scientific-persistence-metadata/1.0.0` |
| `implementationId` | `supabase_postgresql_scientific_persistence` |
| `implementationVersion` | `supabase-scientific-persistence/1.0.0` |
| `schemaVersion` | `scientific-persistence-schema/1.0.0` |
| `modelVersion` | `scientific-persistence-storage-model/1.0.0` |

These identities shall:

- remain outside scientific objects;
- remain outside Phase 8.0A contracts;
- use the existing Phase 8.0B metadata fields;
- be immutable;
- contain no environment-specific values;
- contain no storage-generated values;
- contain no user identity;
- contain no persistence identity; and
- contain no persistence timestamp.

Any future change to adapter behavior, physical schema, or mapping semantics must review and increment the applicable identity.

---

## 9. Storage Record Contract

The stored record is a private Phase 8.0C infrastructure representation.

It is not a public TypeScript contract.

It shall preserve the following logical fields:

| Stored field | Source |
|---|---|
| `persistence_id` | Generated by PostgreSQL |
| `owner_id` | Derived from the authenticated Supabase principal |
| `persisted_at` | Generated by PostgreSQL |
| `parent_persistence_id` | `PersistenceEnvelope.lineage.parentPersistenceId` or database null |
| `envelope_contract_version` | `PersistenceEnvelope.contractVersion` |
| `input_contract_version` | `PersistenceEnvelope.input.contractVersion` |
| `request_payload` | Approved serialization of `PersistenceEnvelope.input.request` |
| `result_payload` | Approved serialization of `PersistenceEnvelope.input.result` |
| `metadata_contract_version` | `PersistenceEnvelope.metadata.contractVersion` |
| `implementation_id` | `PersistenceEnvelope.metadata.implementationId` |
| `implementation_version` | `PersistenceEnvelope.metadata.implementationVersion` |
| `schema_version` | `PersistenceEnvelope.metadata.schemaVersion` |
| `model_version` | `PersistenceEnvelope.metadata.modelVersion` |
| `lineage_contract_version` | `PersistenceEnvelope.lineage.contractVersion` |
| `audit_contract_version` | `PersistenceEnvelope.audit.contractVersion` |
| `boundary_version` | `PersistenceEnvelope.audit.boundaryVersion` |
| `validation_version` | `PersistenceEnvelope.audit.validationVersion` |
| `audit_input_contract_version` | `PersistenceEnvelope.audit.inputContractVersion` |
| `request_contract_version` | `PersistenceEnvelope.audit.requestContractVersion` |
| `result_contract_version` | `PersistenceEnvelope.audit.resultContractVersion` |
| `validation_status` | `PersistenceEnvelope.audit.validationStatus` |
| `validation_issue_codes` | Complete `PersistenceEnvelope.audit.validationIssueCodes` |

No additional scientific column is authorized.

The schema shall not create columns representing:

- domain status;
- confidence;
- measurements;
- interpretations;
- blocked outputs;
- warnings;
- evidence;
- provenance completeness;
- safety candidates;
- trends;
- limitations; or
- scientific component versions.

Those values remain exclusively inside the authoritative serialized payloads.

---

## 10. Serialization Requirements

The private mapper shall use only:

- `serializeScientificEvaluationRequest`; and
- `serializeScientificEvaluationResult`

from the public `scientificProduction` boundary.

The mapper shall not call `JSON.stringify` directly on either scientific request or scientific result.

The mapper shall not:

- deserialize during the save path;
- normalize scientific values;
- reorder scientific collections;
- omit null values;
- omit empty arrays;
- copy selected scientific fields into storage columns;
- derive scientific index values;
- reinterpret any string code;
- alter a timestamp;
- change a number;
- convert a unit;
- replace an opaque object; or
- reconstruct audit metadata.

The serializer-produced strings shall be stored without subsequent transformation.

A serialization failure must cause no storage operation.

The adapter shall not convert a serialization failure into a scientific validation result.

---

## 11. PostgreSQL Schema Requirements

The initial migration shall create one append-only table:

`public.scientific_persistence_records`

### 11.1 Required physical behavior

The table shall provide:

- a database-generated primary persistence identity;
- a database-generated `timestamptz` persistence timestamp;
- an authenticated owner identifier;
- optional immediate-parent lineage;
- non-null authoritative request payload;
- non-null authoritative result payload;
- all Phase 8.0B persistence version metadata;
- all Phase 8.0B persistence audit fields;
- non-empty checks for required textual identities;
- an empty validation-issue collection for successfully constructed envelopes;
- protection against a record naming itself as its parent;
- same-owner lineage enforcement where a parent exists;
- Row Level Security;
- no application update path;
- no application delete path; and
- no application read API.

### 11.2 Owner binding

The authenticated principal shall be the sole owner authority.

The client shall not provide:

- `owner_id`;
- `persistence_id`; or
- `persisted_at`.

The database insertion boundary shall derive the owner from the authenticated Supabase context.

An absent authenticated principal shall fail before insertion.

A caller must not be able to persist a record for another owner.

### 11.3 Lineage integrity

When `parent_persistence_id` is present:

- it must differ from the new record identity;
- it must reference an existing immediate predecessor;
- it must belong to the same authenticated owner; and
- it must not mutate the predecessor.

Absence represents a root record.

No scientific meaning may be assigned to the relationship.

### 11.4 Insert-only database operation

The migration shall provide one narrowly scoped authenticated insertion operation used only by the concrete adapter.

That operation shall:

- accept the private mapped persistence fields;
- accept no caller-supplied owner identity;
- accept no caller-supplied current persistence identity;
- accept no caller-supplied persistence timestamp;
- execute exactly one insert;
- return only the database-created persistence identity and timestamp;
- perform no read, update, delete, upsert, retry, or history operation;
- expose no scientific interpretation; and
- remain internal to the storage adapter.

If a database function is required to preserve insert-only privileges while returning generated values, it shall:

- use a fixed and safe search path;
- revoke execution from `public` and unauthenticated roles;
- permit only the authenticated application role;
- derive ownership from the authenticated context;
- expose no service-role credential;
- perform exactly one insert; and
- return only the generated identity and timestamp.

This database operation is an internal schema implementation detail governed by the schema and model versions. It is not a new public scientific or persistence-domain contract.

### 11.5 Row Level Security

The migration shall:

- enable Row Level Security;
- restrict insertion to the authenticated owner;
- deny cross-owner access;
- define no application update policy;
- define no application delete policy;
- avoid a general payload-select policy; and
- preserve owner isolation for lineage.

No service-role key or privileged credential may be embedded in application code, tests, migrations, fixtures, or reports.

### 11.6 Migration behavior

The migration shall be forward-only and safe to apply to an environment with no Phase 8.0C table.

It shall not:

- backfill records;
- read existing biomarker data;
- copy AsyncStorage data;
- rewrite scientific output;
- change an existing table;
- delete an existing table;
- change existing RLS policies;
- activate an application path; or
- include a destructive rollback.

Migration execution against a linked or production Supabase project is not authorized by implementation alone.

---

## 12. Concrete Port Requirements

The concrete adapter shall implement the existing `PersistencePort`.

Its `contractVersion` shall remain:

`scientific-persistence-port/1.0.0`

Its only persistence operation shall remain:

`save(envelope: PersistenceEnvelope): Promise<PersistenceResult>`

### 12.1 Success behavior

On durable storage success, the adapter shall return one immutable `PersistenceResult` with:

- `contractVersion` equal to `scientific-persistence-result/1.0.0`;
- `status` equal to `succeeded`;
- `persistenceId` equal to the database-returned identity;
- `persistedAt` equal to the database-returned timestamp;
- an empty immutable issue collection; and
- `portOperationInvoked` equal to `true`.

The adapter shall not generate or replace the returned identity or timestamp.

### 12.2 Expected storage refusal

When storage returns an expected refusal that can safely be represented, the adapter may return one immutable failed result with:

- `contractVersion` equal to `scientific-persistence-result/1.0.0`;
- `status` equal to `failed`;
- `persistenceId` equal to null;
- `persistedAt` equal to null;
- one generic existing `port_failure` issue; and
- `portOperationInvoked` equal to `true`.

The issue shall contain no scientific payload, storage credential, raw SQL, raw Supabase response, owner identity, or vendor-sensitive detail.

### 12.3 Exception behavior

The adapter shall throw `PersistencePortException` when it cannot return a structurally valid existing result.

This includes:

- a thrown storage-client failure;
- a malformed success response;
- a missing database-generated persistence identity;
- a missing database-generated persistence timestamp;
- an unsafe or unclassifiable response; or
- a mapping or serialization failure that prevents a safe result.

The exception shall:

- use the existing `port_failure` code;
- use a fixed non-sensitive persistence-only message;
- include no health data;
- include no raw vendor error;
- include no credentials or tokens;
- include no database details; and
- preserve the Phase 8.0B exception contract.

### 12.4 Invocation limits

For each call to `save`, the adapter shall:

- perform at most one storage-client operation;
- never retry;
- never queue;
- never fall back to AsyncStorage;
- never call a second storage provider;
- never update or upsert;
- never read a prior record;
- never infer lineage; and
- never mutate the supplied envelope.

---

## 13. Inactive Runtime Composition

Phase 8.0C shall add one package-internal composition module that:

- imports the existing Supabase client;
- constructs the concrete Supabase persistence adapter;
- injects that adapter into the existing `PersistenceService`;
- provides the fixed Phase 8.0C `PersistenceMetadata`; and
- introduces no new wrapper or public facade.

The composition module shall not:

- invoke `PersistenceBoundary.validate`;
- invoke `PersistenceService.persist`;
- construct `PersistenceLineage`;
- discover a parent;
- import a scientific domain;
- register a scientific adapter;
- import a screen or component;
- wire a feature flag;
- execute during application startup;
- export through a public barrel; or
- activate persistence.

The composed service remains dormant until a separately authorized application-integration phase imports and invokes it.

---

## 14. Dependency Requirements

The mandatory dependency direction is:

```text
Scientific domains
    → no persistence or storage dependency

scientificPersistence
    → public scientificProduction boundary only
    → persistence-local modules only

Phase 8.0C mapper
    → existing PersistenceEnvelope type
    → public Phase 8.0A serializers

Phase 8.0C concrete adapter
    → existing PersistencePort contract
    → private mapper
    → injected Supabase client seam

Phase 8.0C composition
    → existing Supabase client
    → concrete adapter
    → existing PersistenceService
    → fixed PersistenceMetadata

Supabase PostgreSQL
    → no TypeScript or scientific-module dependency
```

Prohibited dependencies include:

- science importing Phase 8.0C;
- Phase 8.0B importing Phase 8.0C;
- UI importing Phase 8.0C;
- the concrete adapter importing scientific internals;
- the mapper importing scientific registries;
- public contracts importing Supabase;
- storage records becoming application DTOs; and
- circular dependencies.

---

## 15. File Creation Plan

Phase 8.0C shall create only the following implementation files.

| File | Purpose |
|---|---|
| `supabase/migrations/20260719000000_scientific_persistence_records.sql` | Initial append-only schema, authenticated insertion boundary, database identity/time generation, lineage constraints, and RLS |
| `src/infrastructure/scientificPersistence/metadata.ts` | Immutable Phase 8.0C `PersistenceMetadata` identities |
| `src/infrastructure/scientificPersistence/storageMapper.ts` | Private lossless mapping from `PersistenceEnvelope` to the storage insertion representation |
| `src/infrastructure/scientificPersistence/supabasePersistencePort.ts` | Concrete implementation of the existing `PersistencePort` |
| `src/infrastructure/scientificPersistence/runtimeComposition.ts` | Inactive construction of the adapter and existing `PersistenceService` |
| `src/__tests__/scientificPersistenceRuntime.test.ts` | Mapper, metadata, port, composition, failure, immutability, dependency, and activation tests |
| `src/__tests__/scientificPersistenceStorageMigration.test.ts` | Static migration, schema, RLS, append-only, and no-backfill architecture tests |

No infrastructure `index.ts` barrel shall be created.

No new application-facing export file shall be created.

If a required implementation cannot fit within this file plan without changing the approved architecture, implementation must stop for architecture review.

---

## 16. File Modification Plan

No existing production or test file is planned for modification.

The following files and areas must remain unchanged:

- `src/domain/scientificProduction/**`
- `src/domain/scientificPersistence/**`
- `src/domain/scientificDomains/**`
- `src/domain/scientificModels/**`
- `src/domain/scientificPersistence/index.ts`
- `src/lib/supabase.ts`
- `src/lib/storageKeys.ts`
- existing Supabase migrations
- `package.json`
- `tsconfig.json`
- `jest.config.js`
- application screens
- components
- services
- navigation
- feature flags
- activation registries
- Scientific Baseline artifacts
- existing scientific tests

No existing SQL file shall be edited.

No generated database artifact shall be committed unless separately authorized.

If implementation discovers that an existing file must change, work shall stop and the proposed change must receive explicit scope and architecture review.

---

## 17. Sprint Breakdown

Each sprint is small, bounded, independently reviewable, and must preserve the inactive architecture.

A sprint completion does not authorize a commit, migration, deployment, or activation.

### Sprint 0 — Contract and Repository Freeze

**Purpose:** Establish the exact starting state.

**Work:**

- record branch and commit;
- record modified and untracked files;
- preserve unrelated user work;
- hash or otherwise record the Phase 8.0A and Phase 8.0B public surfaces;
- record the eleven Phase 8.0B exports;
- record Scientific Baseline identity;
- confirm Supabase dependency already exists;
- confirm no Phase 8.0C runtime path exists; and
- confirm no migration with the planned identity exists.

**Exit criteria:**

- repository state is documented;
- no file has been modified;
- public-contract baseline is recorded;
- unrelated work is identified; and
- implementation can proceed without changing approved contracts.

### Sprint 1 — Storage Schema and Migration

**Purpose:** Establish the private append-only PostgreSQL storage boundary.

**Files:**

- `supabase/migrations/20260719000000_scientific_persistence_records.sql`
- `src/__tests__/scientificPersistenceStorageMigration.test.ts`

**Work:**

- create the versioned table;
- create database-generated identity and time;
- create owner binding;
- create same-owner lineage integrity;
- create non-empty persistence metadata constraints;
- enable RLS;
- create authenticated insertion control;
- deny update and delete paths;
- provide the narrow insertion operation required to return identity and time;
- add static migration architecture tests; and
- verify no existing schema is changed.

**Exit criteria:**

- migration is forward-only;
- no backfill exists;
- no destructive statement exists;
- no public read model exists;
- owner identity is not caller supplied;
- one insert returns database-generated identity and time;
- RLS and append-only static checks pass; and
- no migration is applied to a linked or production environment.

### Sprint 2 — Metadata and Lossless Storage Mapper

**Purpose:** Implement the private mapping boundary.

**Files:**

- `src/infrastructure/scientificPersistence/metadata.ts`
- `src/infrastructure/scientificPersistence/storageMapper.ts`
- `src/__tests__/scientificPersistenceRuntime.test.ts`

**Work:**

- define the fixed immutable metadata value;
- define the private storage insertion representation;
- invoke the approved request serializer;
- invoke the approved result serializer;
- map every Phase 8.0B envelope field;
- represent absent parent lineage as database null;
- exclude generated owner, identity, and time from client input;
- add blocked, unavailable, null, audit, provenance, and lineage fixtures; and
- prove the mapper performs no scientific projection.

**Exit criteria:**

- both serializer outputs are preserved exactly;
- every required persistence field is mapped;
- no scientific derived column exists;
- no current identity, time, or owner is generated;
- no direct scientific `JSON.stringify` alternative exists;
- input objects remain unchanged; and
- focused mapper tests pass.

### Sprint 3 — Concrete Supabase Persistence Port

**Purpose:** Implement the existing port without changing its contract.

**Files:**

- `src/infrastructure/scientificPersistence/supabasePersistencePort.ts`
- `src/__tests__/scientificPersistenceRuntime.test.ts`

**Work:**

- implement `PersistencePort`;
- inject a narrow package-internal Supabase client seam;
- call the mapper;
- invoke the storage operation exactly once;
- construct immutable succeeded and failed results;
- validate storage-returned identity and time;
- throw the existing exception for unsafe or malformed outcomes;
- sanitize all failure messages;
- add no retry or fallback; and
- add focused success, refusal, exception, and malformed-response tests.

**Exit criteria:**

- exact existing port contract is implemented;
- one save causes no more than one storage call;
- database identity and time are transported unchanged;
- expected refusal uses only `port_failure`;
- unsafe responses throw the existing exception;
- no raw vendor error crosses the boundary;
- no payload is logged;
- no retry, queue, cache, read, update, delete, or upsert exists; and
- focused port tests pass.

### Sprint 4 — Inactive Runtime Composition

**Purpose:** Compose the concrete adapter beneath the existing service without activation.

**Files:**

- `src/infrastructure/scientificPersistence/runtimeComposition.ts`
- `src/__tests__/scientificPersistenceRuntime.test.ts`

**Work:**

- construct the adapter using the existing Supabase client;
- inject it into `PersistenceService`;
- expose only package-internal composition values;
- supply the fixed metadata;
- avoid a new public facade;
- avoid calling the persistence operation;
- add import and activation audits; and
- prove no existing runtime module imports the composition.

**Exit criteria:**

- the existing service is used unchanged;
- no new public contract exists;
- no domain or application path imports the composition;
- no persistence call occurs at module load;
- no feature flag or production adapter is wired;
- no scientific domain is activated; and
- focused composition and dependency tests pass.

### Sprint 5 — Database Security and Integrity Evidence

**Purpose:** Prove the migration’s runtime security behavior in an isolated Supabase/PostgreSQL environment.

**Work:**

- apply the migration only to an isolated test database;
- verify authenticated insertion succeeds;
- verify missing authentication fails;
- verify owner identity cannot be supplied or overridden;
- verify cross-owner access fails;
- verify direct update fails;
- verify direct delete fails;
- verify a same-owner parent succeeds;
- verify a cross-owner parent fails;
- verify the database creates identity and time;
- verify exactly one row is inserted;
- verify stored payloads equal approved serializer output;
- verify all persistence metadata and audit fields survive; and
- remove or reset the isolated test database without touching linked environments.

**Exit criteria:**

- executable RLS evidence exists;
- executable append-only evidence exists;
- database identity/time authority is proven;
- same-owner lineage is proven;
- no secret or health payload appears in logs; and
- no linked, staging, or production data is changed.

If an isolated database environment cannot be provided, security and data-governance gates cannot receive PASS.

### Sprint 6 — Full Regression and VES Review

**Purpose:** Validate final implementation and prepare governance evidence.

**Work:**

- run all focused Phase 8.0C tests;
- rerun Phase 8.0B boundary tests;
- run Phase 8.0A production-contract tests;
- run Scientific Baseline governance tests;
- run all affected scientific regressions;
- run the complete repository suite;
- run strict TypeScript;
- run configured lint and build checks where available;
- audit imports and public exports;
- audit migration and RLS behavior;
- audit production references and activation;
- run diff, whitespace, and final-newline checks;
- document all modified and untracked files;
- prepare the VES gate report; and
- obtain actual required review without inventing approval.

**Exit criteria:**

- every required check passes or is reported with an allowed, evidence-backed outcome;
- no scientific behavior changed;
- no public contract changed;
- no production path is active;
- repository state is accurately reported;
- VES findings are resolved or explicitly governed; and
- no commit, migration, deployment, or activation occurs without authority.

---

## 18. Implementation Order

Implementation shall proceed in this exact order:

1. Record repository and contract baselines.
2. Create the isolated schema migration.
3. Add static migration tests.
4. Establish fixed Phase 8.0C metadata.
5. Implement the private mapper.
6. Validate lossless serializer-based mapping.
7. Implement the concrete port.
8. Validate success, failure, exception, and single-call behavior.
9. Add inactive runtime composition.
10. Audit public contracts and inactive imports.
11. Validate the migration in an isolated database.
12. Run focused Phase 8.0C tests.
13. Run Phase 8.0B and Phase 8.0A contract regressions.
14. Run all scientific regressions.
15. Run the full repository suite.
16. Run TypeScript and configured quality checks.
17. Run dependency, schema, RLS, activation, diff, whitespace, and repository audits.
18. Prepare the VES report.
19. Obtain required review before any commit or next phase.

A later sprint must not be used to conceal or defer a blocking defect from an earlier sprint.

---

## 19. Acceptance Criteria

Phase 8.0C is accepted only if every applicable criterion below is satisfied.

### 19.1 Scope

- exactly one concrete Supabase PostgreSQL `PersistencePort` implementation exists;
- exactly one approved storage model is implemented;
- the adapter remains inactive;
- no out-of-scope capability is introduced; and
- implementation is confined to the planned files.

### 19.2 Public contracts

- Phase 8.0A public contracts are unchanged;
- Phase 8.0A contract versions are unchanged;
- Phase 8.0B public contracts are unchanged;
- Phase 8.0B contract versions are unchanged;
- the `scientificPersistence` barrel still exports exactly eleven approved names;
- no Phase 8.0C infrastructure type is publicly re-exported;
- no public repository exists;
- no public read API exists;
- no new runtime facade exists; and
- no Supabase type leaks into an approved public contract.

### 19.3 Storage mapping

- the complete request is serialized with the approved request serializer;
- the complete result is serialized with the approved result serializer;
- serializer output is stored unchanged;
- every metadata field is preserved;
- every lineage field is preserved;
- every persistence audit field is preserved;
- blocked outputs survive unchanged;
- provenance survives unchanged;
- scientific audit metadata survives unchanged;
- scientific versions survive unchanged;
- nulls and empty arrays survive unchanged;
- no scientific projection column is created;
- no scientific field is recalculated; and
- no supplied object is mutated.

### 19.4 Storage schema

- the schema is versioned;
- the storage model is versioned;
- one operation produces one record;
- records are append-only;
- the application has no update path;
- the application has no delete path;
- no upsert exists;
- no backfill exists;
- no destructive rollback exists;
- persistence identity is database generated;
- persistence time is database generated;
- owner identity is authenticated and database controlled;
- RLS is enabled;
- cross-owner access is denied;
- same-owner lineage is enforced; and
- current records cannot name themselves as their parent.

### 19.5 Concrete port

- the adapter implements the existing `PersistencePort`;
- `contractVersion` remains unchanged;
- `save` remains the only operation;
- at most one storage call occurs per save;
- success returns a valid immutable existing result;
- expected refusal returns a valid immutable failed result;
- malformed or unsafe responses throw the existing exception;
- only the existing `port_failure` code is used;
- database identity and time are returned unchanged;
- no identifier or timestamp is generated by TypeScript;
- no retry exists;
- no offline queue exists;
- no fallback exists;
- no caching exists;
- no read exists;
- no update exists;
- no delete exists; and
- no raw failure details cross the port boundary.

### 19.6 Runtime composition

- the existing Supabase client is injected;
- the existing `PersistenceService` is used unchanged;
- fixed metadata is supplied;
- lineage is not inferred;
- the composition performs no persistence operation at import time;
- no active application module imports the composition;
- no scientific module imports Phase 8.0C;
- no UI imports Phase 8.0C;
- no feature flag is wired;
- no standardized scientific adapter is registered; and
- no production activation changes.

### 19.7 Scientific integrity

- Scientific Baseline is unchanged;
- all scientific-domain files remain unchanged;
- scientific outputs remain unchanged;
- scientific status remains unchanged;
- confidence remains unchanged;
- references remain unchanged;
- interpretations remain unchanged;
- reasons and warnings remain unchanged;
- blocked outputs remain unchanged;
- safety remains unchanged;
- trend behavior remains unchanged;
- no parent score is introduced; and
- no cross-domain composite is introduced.

### 19.8 Security and privacy

- no secret is added;
- no service-role key is used in application code;
- no health payload is logged;
- no raw vendor error is exposed;
- no unauthenticated insertion succeeds;
- no cross-owner access succeeds;
- owner identity cannot be forged;
- storage configuration failure fails closed;
- AsyncStorage is not used as authoritative fallback; and
- production activation remains blocked pending later privacy-lifecycle authorization.

### 19.9 Repository integrity

- only planned files are created;
- no existing file is modified;
- no unrelated user work is changed;
- no migration is applied to a linked or production project;
- no commit is created without authorization;
- no push is performed;
- no tag is created;
- no release is performed;
- no production deployment occurs; and
- modified and untracked files are reported accurately.

Failure of any mandatory criterion means Phase 8.0C is not complete.

---

## 20. Test Strategy

### 20.1 Focused TypeScript tests

The focused runtime suite shall cover:

- exact metadata identities;
- metadata immutability;
- complete request serialization;
- complete result serialization;
- exact serializer output preservation;
- complete envelope mapping;
- root lineage mapping;
- parent lineage mapping;
- absence of generated owner, identity, and time in client input;
- blocked result preservation;
- unknown provenance preservation;
- null field preservation;
- empty-array preservation;
- scientific audit preservation;
- no scientific projection;
- no input mutation;
- successful port outcome;
- expected failed port outcome;
- thrown storage-client outcome;
- malformed success response;
- missing persistence identity;
- missing persistence timestamp;
- one storage call per save;
- no retry;
- no fallback;
- no payload logging;
- immutable results and issues;
- existing exception use;
- fixed generic failures;
- composition using the existing service;
- no operation at composition import;
- no public export;
- no active runtime import; and
- acyclic infrastructure dependencies.

### 20.2 Static migration tests

The migration suite shall verify:

- exactly one new persistence table;
- database-generated primary identity;
- database-generated timestamp;
- owner column is required;
- request and result payloads are required;
- every persistence metadata field is represented;
- every persistence audit field is represented;
- RLS is enabled;
- authenticated owner control exists;
- no update policy exists;
- no delete policy exists;
- no general payload-read policy exists;
- no upsert statement exists;
- no update statement exists;
- no delete statement exists;
- no backfill statement exists;
- no reference to existing biomarker tables exists;
- no service-role secret exists;
- no scientific status or confidence column exists;
- lineage is optional;
- same-owner lineage protection exists;
- insert operation returns only identity and time; and
- the migration contains no destructive down behavior.

Static SQL inspection is not sufficient by itself for security approval.

### 20.3 Isolated database tests

The final implementation evidence shall execute the migration against an isolated Supabase/PostgreSQL environment and prove:

- migration succeeds from a clean database;
- authenticated owner insertion succeeds;
- unauthenticated insertion fails;
- forged owner insertion fails;
- a second owner cannot access the first owner’s record;
- update fails;
- delete fails;
- same-owner parent insertion succeeds;
- cross-owner parent insertion fails;
- database identity is non-empty;
- database timestamp is non-empty;
- exactly one row is created;
- request payload equals approved request serialization;
- result payload equals approved result serialization;
- persistence versions are retained;
- audit fields are retained; and
- repeated migration validation does not mutate scientific data.

No linked, staging, or production project may be used for this evidence without separate authorization.

### 20.4 Required focused commands

At minimum, run the equivalent of:

```text
npm test -- --runInBand \
  src/__tests__/scientificPersistenceRuntime.test.ts \
  src/__tests__/scientificPersistenceStorageMigration.test.ts \
  src/__tests__/scientificPersistenceBoundary.test.ts \
  src/__tests__/scientificProductionContract.test.ts
```

### 20.5 Required scientific regression commands

Run the applicable suites including:

```text
npm test -- --runInBand \
  src/__tests__/scientificBaseline.test.ts \
  src/__tests__/clinicalPhenoAgeCalculation.test.ts \
  src/__tests__/clinicalPhenoAgeScientificValidation.test.ts \
  src/__tests__/clinicalPhenoAgeProductCutover.test.ts \
  src/__tests__/vo2maxScientificDomain.test.ts \
  src/__tests__/functionalCapacityScientificDomain.test.ts \
  src/__tests__/cardiometabolicScientificDomain.test.ts
```

### 20.6 Full repository validation

Run:

```text
npm test -- --runInBand
npx tsc --noEmit
git diff --check
```

Also perform:

- configured lint checks;
- configured build checks;
- dependency and circular-import audit;
- public-export audit;
- production-reference audit;
- migration isolation audit;
- RLS evidence review;
- tracked and untracked trailing-whitespace audit;
- final-newline audit;
- secrets audit;
- changed-file audit; and
- repository-state verification.

If lint, build, or isolated database tooling is unavailable, the completion report must state:

- the unavailable check;
- why it could not run;
- the resulting risk;
- substitute evidence; and
- the applicable VES outcome.

A missing executable RLS test is blocking for owner-isolation approval.

---

## 21. Compliance Checklist

### 21.1 VES-01 Architecture Integrity

- [ ] Approved Phase 8.0C architecture is followed.
- [ ] Phase 8.0A authority is unchanged.
- [ ] Phase 8.0B authority is unchanged.
- [ ] No new public contract exists.
- [ ] No second storage abstraction exists.
- [ ] Concrete adapter depends on the existing port.
- [ ] Supabase remains below the port.
- [ ] No circular dependency exists.
- [ ] No storage DTO leaks upward.
- [ ] No active application import exists.
- [ ] Removal leaves existing behavior unchanged.

### 21.2 VES-02 Scientific Integrity

- [ ] Scientific Baseline is unchanged.
- [ ] Scientific-domain files are unchanged.
- [ ] Approved serializers are used.
- [ ] Scientific outputs are stored without reinterpretation.
- [ ] Blocked outputs are preserved.
- [ ] Provenance is preserved.
- [ ] Scientific audit metadata is preserved.
- [ ] Scientific versions are preserved.
- [ ] No scientific validation is added.
- [ ] Required scientific regressions pass.

### 21.3 VES-03 Engineering Quality

- [ ] Strict TypeScript passes.
- [ ] Focused success tests pass.
- [ ] Focused failure tests pass.
- [ ] Boundary tests pass.
- [ ] Full repository tests pass.
- [ ] Configured lint passes or is accurately reported.
- [ ] Configured build passes or is accurately reported.
- [ ] Results and issues are immutable.
- [ ] Errors fail closed.
- [ ] No unsafe logging exists.
- [ ] Diff and whitespace checks pass.
- [ ] Final newlines are present.
- [ ] Files match the approved creation plan.

### 21.4 VES-04 Production Safety

- [ ] Adapter remains inactive.
- [ ] No feature flag is wired.
- [ ] No production caller exists.
- [ ] No migration is applied to a linked environment.
- [ ] One operation creates at most one record.
- [ ] No retry or fallback exists.
- [ ] No update or upsert exists.
- [ ] Database identity and time are authoritative.
- [ ] RLS behavior is executed in an isolated database.
- [ ] Rollback does not delete stored data.
- [ ] Activation remains separately governed.

### 21.5 VES-05 AI Governance

**Applicability:** Not applicable if no AI module, prompt, tool, read model, or explanation path is changed.

- [ ] Written not-applicable reason is included.
- [ ] No AI dependency exists.
- [ ] No AI-facing data flow exists.

### 21.6 VES-06 Product Experience

**Applicability:** Not applicable if no UI, user copy, accessibility behavior, entitlement, or presentation state is changed.

- [ ] Written not-applicable reason is included.
- [ ] No UI dependency exists.
- [ ] No user-visible persistence state is introduced.

### 21.7 VES-07 Release Readiness

- [ ] Migration artifact is reviewed.
- [ ] Migration execution remains unauthorized.
- [ ] Rollback boundary preserves stored records.
- [ ] No activation is inferred from code or schema presence.
- [ ] Required test evidence identifies the reviewed commit or working tree.
- [ ] No release approval is invented.
- [ ] Production privacy prerequisites remain documented.

### 21.8 VES-08 Scalability and Extensibility

- [ ] Storage is domain neutral.
- [ ] No domain-specific scientific column exists.
- [ ] New domains can persist without changing the port.
- [ ] Historical records retain their original versions.
- [ ] No hard-coded domain ordering exists.
- [ ] No parent score exists.
- [ ] No cross-domain composite exists.
- [ ] No speculative read abstraction exists.

### 21.9 VES-09 Data Governance and Provenance

- [ ] Records are append-only.
- [ ] Complete request payload is retained.
- [ ] Complete result payload is retained.
- [ ] Original and canonical scientific values remain inside authoritative payloads.
- [ ] Provenance remains intact.
- [ ] Audit metadata remains intact.
- [ ] Contract and scientific versions remain intact.
- [ ] Storage identity and time are explicit.
- [ ] Owner identity is authenticated.
- [ ] Cross-owner access is denied.
- [ ] Historical records are not silently mutated.
- [ ] Retention, deletion, and export remain explicit activation blockers.

### 21.10 Security and secrets

- [ ] No API key is added.
- [ ] No service-role key is added.
- [ ] No token is logged.
- [ ] No health payload is logged.
- [ ] No raw database error crosses the port.
- [ ] No client-supplied owner is trusted.
- [ ] Database insertion is least privilege.
- [ ] Storage failure has no local fallback.

### 21.11 Repository discipline

- [ ] Initial repository state is recorded.
- [ ] Unrelated user work is preserved.
- [ ] Only planned files are created.
- [ ] No existing file is modified.
- [ ] No file is staged without instruction.
- [ ] No commit is created without instruction.
- [ ] No push is performed.
- [ ] No tag is created.
- [ ] No migration is applied externally.
- [ ] Final repository state is reported accurately.

---

## 22. Final Architecture Conformance Checklist

Phase 8.0C conforms to the approved architecture only when all statements below are true.

### Ownership

- [ ] Science remains the sole scientific authority.
- [ ] Phase 8.0A remains the sole request/result serialization authority.
- [ ] Phase 8.0B remains the sole persistence-boundary contract authority.
- [ ] Phase 8.0C owns only concrete storage infrastructure.
- [ ] PostgreSQL owns persistence identity and storage time.
- [ ] Authenticated Supabase context owns row identity binding.

### Boundaries

- [ ] The concrete adapter is below `PersistencePort`.
- [ ] No storage dependency points into science.
- [ ] No Phase 8.0C dependency points into scientific internals.
- [ ] No Supabase type leaks above the adapter.
- [ ] No private storage record leaks above the adapter.
- [ ] No second port, repository, or gateway exists.
- [ ] No new public contract exists.

### Mapping and preservation

- [ ] Request serialization uses the approved Phase 8.0A serializer.
- [ ] Result serialization uses the approved Phase 8.0A serializer.
- [ ] Serializer outputs are stored unchanged.
- [ ] Complete Phase 8.0B metadata is stored.
- [ ] Complete lineage is stored.
- [ ] Complete persistence audit is stored.
- [ ] No scientific field is normalized into a storage-owned interpretation.
- [ ] No historical scientific result is rewritten.

### Storage behavior

- [ ] One save produces at most one insert.
- [ ] Records are append-only.
- [ ] No update exists.
- [ ] No delete exists.
- [ ] No upsert exists.
- [ ] No automatic retry exists.
- [ ] No offline queue exists.
- [ ] No cache exists.
- [ ] No fallback exists.
- [ ] RLS enforces owner isolation.
- [ ] Same-owner lineage is enforced.
- [ ] Database identity and time are returned unchanged.

### Runtime behavior

- [ ] The existing `PersistenceService` is used unchanged.
- [ ] The existing `PersistencePort` is implemented unchanged.
- [ ] The existing `PersistenceResult` is returned unchanged in shape and meaning.
- [ ] The existing `PersistencePortException` is used unchanged.
- [ ] Failures expose no scientific or vendor-sensitive data.
- [ ] Composition performs no operation at import time.
- [ ] No existing application path imports the composition.
- [ ] No scientific domain is activated.

### Non-goals

- [ ] No read API exists.
- [ ] No deserialization runtime exists.
- [ ] No synchronization exists.
- [ ] No conflict resolution exists.
- [ ] No history feature exists.
- [ ] No event sourcing exists.
- [ ] No analytics or telemetry exists.
- [ ] No custom encryption or compression exists.
- [ ] No privacy lifecycle is implied.
- [ ] No production activation is implied.

### Governance

- [ ] Scientific Baseline remains unchanged.
- [ ] Phase 8.0A and Phase 8.0B contracts remain unchanged.
- [ ] Focused tests pass.
- [ ] Isolated database security tests pass.
- [ ] Scientific regressions pass.
- [ ] Full repository tests pass.
- [ ] TypeScript passes.
- [ ] Repository audits pass.
- [ ] Every applicable VES gate has evidence and an allowed outcome.
- [ ] Reviewer approval is real or explicitly pending.
- [ ] No commit, migration, deployment, release, or activation occurs without authority.

Failure of any final architecture-conformance item requires rework or explicit architecture review. It must not be resolved by silently weakening the approved boundary.

---

## 23. Required Completion Report

The Phase 8.0C implementation completion report shall include:

### Repository

- branch;
- reviewed commit or working-tree identity;
- files created;
- files modified;
- files removed;
- modified files;
- untracked files;
- unrelated work preserved;
- commit created;
- push performed;
- tag created; and
- migration execution status.

### Architecture

- concrete adapter identity;
- implementation version;
- schema version;
- model version;
- exact storage table;
- exact database insertion boundary;
- dependency direction;
- public export audit;
- confirmation of no new public contracts;
- confirmation of inactive composition;
- confirmation of no read, update, delete, upsert, retry, queue, cache, or fallback; and
- rollback boundary.

### Storage integrity

- database-generated identity evidence;
- database-generated timestamp evidence;
- append-only evidence;
- one-insert evidence;
- RLS evidence;
- unauthenticated denial;
- cross-owner denial;
- same-owner lineage evidence;
- cross-owner lineage denial;
- serialized request preservation;
- serialized result preservation;
- metadata preservation;
- audit preservation; and
- migration isolation evidence.

### Scientific verification

- scientific behavior changed: expected no;
- Scientific Baseline changed: expected no;
- scientific-domain files changed: expected no;
- scientific outputs changed: expected no;
- confidence changed: expected no;
- interpretation changed: expected no;
- references changed: expected no;
- safety changed: expected no;
- Phase 8.0A contracts changed: expected no;
- Phase 8.0B contracts changed: expected no; and
- production activation changed: expected no.

### Validation

- focused test commands and exact results;
- isolated database test evidence;
- Phase 8.0B regression result;
- Phase 8.0A production-contract result;
- domain regression results;
- full repository test result;
- TypeScript result;
- configured lint result;
- configured build result;
- dependency audit;
- secrets audit;
- production-reference audit;
- `git diff --check`;
- trailing-whitespace audit; and
- final-newline audit.

### VES review

- phase;
- date;
- reviewer;
- scope;
- change classification;
- affected layers;
- evidence reviewed;
- outcome for every VES gate;
- findings;
- blocking issues;
- recommendations;
- deferred items and owners;
- final outcome; and
- approval or pending approval.

### Remaining risks

- unresolved security or privacy risks;
- unavailable validation;
- production prerequisites;
- retention, deletion, and export blockers;
- monitoring blocker;
- release blocker;
- activation blocker; and
- recommended next authorized action.

No completion report may claim PASS, approval, deployment, migration, or activation without the required evidence and authority.

---

## 24. Final Implementation Boundary

Phase 8.0C may implement one inactive Supabase PostgreSQL adapter beneath the existing Phase 8.0B `PersistencePort`.

It may preserve authoritative scientific results.

It may not reinterpret them.

It may create one append-only storage schema.

It may not create a repository or read model.

It may use the approved Phase 8.0A serializers.

It may not replace them.

It may compose the existing persistence service.

It may not connect that service to an active application path.

It may generate persistence identity and time through PostgreSQL.

It may not generate them in application code.

It may enforce authenticated owner isolation.

It may not implement the later privacy lifecycle.

It may not change Phase 8.0A.

It may not change Phase 8.0B.

It may not change scientific behavior.

It may not activate production.

**END OF DOCUMENT**

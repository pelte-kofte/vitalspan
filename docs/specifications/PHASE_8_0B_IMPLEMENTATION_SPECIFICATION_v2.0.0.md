# PHASE 8.0B IMPLEMENTATION SPECIFICATION

# Persistence Boundary Architecture

Version: 2.0.0

Status: Draft – Architecture Review Required

Repository: Vitalspan

Depends On:

- VITALSPAN_ENGINEERING_STANDARD.md
- SCIENTIFIC_BASELINE_V1_0.md
- PHASE_8_0A_PRODUCTION_CONTRACT_ACTIVATION_ARCHITECTURE.md

---

# 1. Purpose

Phase 8.0B establishes the persistence boundary for the Vitalspan scientific architecture.

Its purpose is not to implement storage.

Its purpose is not to implement repositories.

Its purpose is not to implement databases.

Its purpose is not to implement synchronization.

Instead, Phase 8.0B defines the architecture by which authoritative Phase 8.0A scientific contracts may later be preserved by storage technology without changing scientific truth.

This phase introduces no production behavior.

No scientific calculation changes.

No reference updates.

No interpretation changes.

No scientific-domain changes.

No Phase 8.0A public-contract changes.

No storage implementation.

No networking.

No synchronization.

No infrastructure.

Only persistence-boundary contracts, structural validation, orchestration semantics, and architecture tests.

---

# 2. Governing Authority

The following documents govern this phase:

1. Vitalspan Engineering Standard Version 1.0.0
2. Scientific Baseline Version 1.0.0
3. Phase 8.0A Production Contract & Activation Architecture
4. This Phase 8.0B specification

The stricter applicable requirement controls.

ScientificEvaluationRequest,

ScientificEvaluationResult,

and

ScientificSnapshot

remain authoritative exactly as defined by Phase 8.0A.

Phase 8.0B SHALL NOT:

- add fields to those contracts
- remove fields from those contracts
- reinterpret those contracts
- replace those contracts
- extend their scientific meaning
- require scientific domains to construct new public objects
- change any Phase 8.0A contract version

No new public scientific aggregate is authorized.

---

# 3. VES Change Classification

Primary VES classification:

Backward-compatible behavioral

Rationale:

Phase 8.0B introduces new persistence-only contracts, structural validation behavior, and orchestration behavior while preserving every existing scientific and product behavior.

Affected layers:

- Persistence Boundary
- Persistence Service contract
- Persistence Port contract
- Persistence-only validation
- Persistence architecture tests
- Scientific Production Contract as a read-only dependency

Unaffected layers:

- Clinical Biological Age scientific domain
- VO₂max scientific domain
- Functional Capacity scientific domain
- Cardiometabolic Health scientific domain
- Scientific calculations
- Scientific registries
- Scientific references
- Scientific interpretations
- Scientific confidence
- Scientific safety
- Production activation
- UI
- Advisor
- AI
- HealthKit
- Supabase
- Networking

Scientific Baseline impact:

None.

No scientific version increment is authorized.

No Phase 8.0A version increment is authorized.

---

# 4. Scope

Phase 8.0B SHALL define and implement only:

- persistence-only contract types
- persistence-only contract versions
- PreConstructionValidation before ValidatedPersistenceInput construction
- ValidatedPersistenceInput construction
- PostConstructionValidation after PersistenceAudit and PersistenceEnvelope construction
- structural persistence validation outcomes
- PersistenceEnvelope construction
- PersistenceService orchestration
- PersistencePort abstraction
- PersistenceResult semantics
- append-only persistence-lineage structure
- dependency boundaries
- the explicit Public Module API
- architecture and contract tests

The phase establishes persistence architecture.

It does not establish persistence infrastructure.

Successful completion of the existing Phase 8.0A evaluation and validation flow is solely an orchestration-level caller precondition.

Phase 8.0B documents that caller precondition but SHALL NOT implement,

enforce,

detect,

or represent it at runtime.

Phase 8.0B declares persistence contract identities and versions as public contract metadata.

PersistenceBoundary and PreConstructionValidation SHALL NOT perform runtime validation of those persistence contract versions.

---

# 5. Explicit Non-Goals

The following are intentionally excluded.

They SHALL NOT be implemented during Phase 8.0B:

- SQLite
- Supabase
- cloud persistence
- REST
- GraphQL
- local databases
- filesystems
- repositories
- synchronization
- retry
- rollback
- transactions
- conflict resolution
- repository semantics
- serializer implementation
- canonical JSON
- encryption
- UUID generation
- clock policy
- timestamp authority
- background persistence
- offline persistence
- import
- export
- privacy workflows
- retention workflows
- deletion workflows
- telemetry
- analytics
- caching
- production wiring
- feature-flag wiring
- domain adapters
- scientific aggregate construction

These exclusions are deliberate.

Implementations SHALL NOT introduce local substitutes or hidden policies for them.

---

# 6. Architectural Principles

Principle 1

Science owns scientific truth.

Persistence owns preservation boundaries.

---

Principle 2

Persistence never creates scientific information.

---

Principle 3

Persistence never modifies scientific information.

---

Principle 4

Persistence never interprets scientific information.

---

Principle 5

Persistence depends only on the public Scientific Production Contract.

Scientific domains never depend on persistence.

---

Principle 6

Infrastructure is replaceable.

Scientific truth is not.

---

Principle 7

Persistence contracts remain technology independent.

Their declared versions are contract identities,

not runtime validation inputs to PersistenceBoundary.

---

Principle 8

Unknown,

unavailable,

unsupported,

invalid,

and blocked scientific states remain persistable when they are valid Phase 8.0A results.

Persistence SHALL NOT upgrade them.

---

Principle 9

The caller owns the requirement to complete the existing Phase 8.0A evaluation and validation flow successfully before invoking Phase 8.0B.

That requirement is not a Phase 8.0B validation invariant,

failure condition,

or runtime outcome.

---

# 7. Authoritative Scientific Inputs

Phase 8.0B consumes only existing Phase 8.0A public contracts.

The authoritative inputs are:

- ScientificEvaluationRequest
- ScientificEvaluationResult

ScientificSnapshot remains unchanged and authoritative wherever Phase 8.0A already carries it.

ScientificEvaluationRequest and ScientificEvaluationResult remain ordinary,

unchanged Phase 8.0A public contracts.

The persistence integration caller SHALL invoke Phase 8.0B only after the applicable Phase 8.0A evaluation and validation flow for the request,

result,

and any optional prior ScientificSnapshot already carried by ScientificEvaluationRequest has completed successfully.

Prior successful Phase 8.0A validation is solely an orchestration-level caller precondition.

This caller precondition is outside the Phase 8.0B runtime validation surface.

Phase 8.0B SHALL NOT verify,

prove,

inspect,

or repeat Phase 8.0A scientific or structural validation.

Phase 8.0B SHALL NOT introduce validated request wrappers,

validated result wrappers,

validation proof objects,

validation markers,

validation tokens,

trusted identities,

trust flags,

or additional scientific contracts.

Phase 8.0B has no authorized runtime mechanism for proving that the Phase 8.0A validation flow completed successfully.

Violation of this caller precondition is an integration defect outside the defined PersistenceBoundary ValidationOutcome.

Such a violation SHALL NOT produce a ValidationOutcome defined by Phase 8.0B.

Phase 8.0B defines no runtime behavior for an invocation that violates this caller precondition.

Phase 8.0B SHALL validate only:

- request-result relationship consistency required for persistence
- persistence-owned structural preconditions evaluable from ScientificEvaluationRequest and ScientificEvaluationResult

Declared persistence contract versions are outside the PersistenceBoundary.validate runtime validation surface.

The Persistence Boundary SHALL NOT be used to detect the absence of,

or as a substitute for,

Phase 8.0A validation.

In the current Phase 8.0A request contract,

an applicable prior ScientificSnapshot is already preserved through the request.

Phase 8.0B SHALL NOT add a second snapshot field or duplicate it elsewhere.

The current scientific evaluation is represented by ScientificEvaluationResult.

The persistence architecture SHALL NOT create a new scientific representation of that result.

The persistence architecture SHALL NOT create:

- any new scientific aggregate
- any new scientific subject wrapper
- any new scientific evaluation-context wrapper
- any standalone scientific-version wrapper
- any standalone scientific-provenance wrapper
- any replacement scientific snapshot

All scientific versions,

provenance,

observations,

measurements,

interpretations,

warnings,

evidence,

confidence,

blocked outputs,

audit metadata,

safety candidates,

trend status,

and limitations

remain inside their existing Phase 8.0A contracts.

---

# 8. Persistence Module Boundary

Phase 8.0B SHALL introduce one isolated persistence module at:

src/domain/scientificPersistence/

The module SHALL expose its approved public contracts through:

src/domain/scientificPersistence/index.ts

The module may import only:

- the public scientificProduction barrel
- its own persistence-local modules
- platform-neutral TypeScript or standard-library types required for structural logic

The module SHALL NOT import:

- scientific-domain internal modules
- scientific registries
- scientific policies
- scientific references
- scientific calculators
- UI
- application services
- networking
- Supabase
- HealthKit
- storage engines
- database packages

No existing scientific module may import scientificPersistence.

No existing production path may import scientificPersistence during Phase 8.0B.

The focused test location SHALL be:

src/__tests__/scientificPersistenceBoundary.test.ts

This repository placement is part of the architecture contract.

---

# Public Module API

The public scientificPersistence barrel SHALL export exactly these public contracts:

- PersistenceBoundary
- ValidationOutcome
- ValidatedPersistenceInput
- PersistenceMetadata
- PersistenceLineage
- PersistenceAudit
- PersistenceEnvelope
- PersistenceService
- PersistencePort
- PersistenceResult
- PersistencePortException

No alternative public operation,

constructor,

wrapper,

or duplicate contract is authorized.

All signatures below are logical and language independent.

## PersistenceBoundary

**Purpose:** Performs request-result relationship validation and persistence-owned structural validation evaluable from those inputs, then produces the only ValidatedPersistenceInput authorized for persistence orchestration.

**Owner:** Persistence Boundary.

**Inputs:** ScientificEvaluationRequest and ScientificEvaluationResult only. No persistence contract version, PersistenceMetadata, or PersistenceLineage input is accepted.

**Output:** ValidationOutcome.

**Required fields or members:** boundaryVersion equal to scientific-persistence-boundary/1.0.0 and validate as the single public operation.

**Optional fields or members:** None.

**Preconditions:** The caller has completed the applicable Phase 8.0A evaluation and validation flow successfully before invocation. This caller precondition is outside the Phase 8.0B runtime validation surface. No separate ScientificSnapshot input is accepted.

**Postconditions:** Phase 8.0B relationship or evaluable structural-validation failure returns ValidationOutcome with no ValidatedPersistenceInput and constructs no PersistenceAudit or PersistenceEnvelope. Phase 8.0B relationship and evaluable structural-validation success returns ValidationOutcome containing one ValidatedPersistenceInput. No persistence contract version is validated. ValidationOutcome represents only Phase 8.0B persistence-owned validation. No ValidationOutcome is defined for violation of the orchestration-level caller precondition.

**Throws:** None.

**Logical signature:** PersistenceBoundary.validate receives ScientificEvaluationRequest and ScientificEvaluationResult and returns ValidationOutcome.

## ValidationOutcome

**Purpose:** Represents the deterministic result of PreConstructionValidation or PostConstructionValidation.

**Owner:** Persistence Boundary.

**Inputs:** The applicable validation phase, ordered validation issues, and the applicable ValidatedPersistenceInput state.

**Output:** One immutable ValidationOutcome.

**Required fields:** validationVersion, validationPhase, valid, issues, and validatedInput.

**Optional fields:** None.

**Preconditions:** The outcome is constructed only by boundary-owned validation logic.

**Postconditions:** Issues use deterministic ordering. Pre-construction failure has null validatedInput; pre-construction success contains the newly constructed ValidatedPersistenceInput; every post-construction outcome contains the existing ValidatedPersistenceInput.

**Throws:** None.

## ValidatedPersistenceInput

**Purpose:** Carries one authoritative Phase 8.0A request-result pair that passed Phase 8.0B PreConstructionValidation into PersistenceService.

**Owner:** Persistence Boundary.

**Inputs:** ScientificEvaluationRequest and ScientificEvaluationResult that passed PreConstructionValidation.

**Output:** One immutable ValidatedPersistenceInput.

**Required fields:** contractVersion, request, and result.

**Optional fields:** None.

**Preconditions:** PreConstructionValidation succeeded and the request-result relationship is valid.

**Postconditions:** The original request and result are preserved unchanged; no persistence identifier or persistence timestamp is present. ValidatedPersistenceInput represents only successful Phase 8.0B PreConstructionValidation and provides no evidence about the orchestration-level caller precondition.

**Throws:** None.

## PersistenceMetadata

**Purpose:** Carries persistence implementation, schema, and model metadata known before port invocation.

**Owner:** Persistence Boundary contract; values are supplied by the persistence integration caller.

**Inputs:** Caller-supplied contractVersion, implementationId, implementationVersion, schemaVersion, and modelVersion.

**Output:** One immutable PersistenceMetadata value.

**Required fields:** contractVersion, implementationId, implementationVersion, schemaVersion, and modelVersion.

**Optional fields:** None.

**Preconditions:** Every value is known before PersistencePort.save is invoked.

**Postconditions:** No new record persistenceId, final persistedAt, storage-generated value, or database-generated value is present.

**Throws:** None.

## PersistenceLineage

**Purpose:** Carries the optional immediate-predecessor relationship known before persistence.

**Owner:** Persistence Boundary contract; values are supplied by the persistence integration caller.

**Inputs:** contractVersion and, when applicable, parentPersistenceId.

**Output:** One immutable PersistenceLineage value.

**Required fields:** contractVersion.

**Optional fields:** parentPersistenceId.

**Preconditions:** A supplied parentPersistenceId is a non-empty opaque reference to the immediate predecessor.

**Postconditions:** Absence of parentPersistenceId represents a root record; the identifier of the current record is not present.

**Throws:** None.

## PersistenceAudit

**Purpose:** Records successful PreConstructionValidation and observed contract identities without duplicating scientific audit metadata.

**Owner:** Persistence Boundary contract; constructed by PersistenceService.

**Inputs:** ValidatedPersistenceInput, PersistenceMetadata, and PersistenceLineage.

**Output:** One immutable PersistenceAudit.

**Required fields:** contractVersion, boundaryVersion, validationVersion, inputContractVersion, requestContractVersion, resultContractVersion, validationStatus, and validationIssueCodes.

**Optional fields:** None.

**Preconditions:** ValidatedPersistenceInput exists and PreConstructionValidation succeeded.

**Postconditions:** validationStatus is passed, validationIssueCodes is empty, and no persistenceId or persistedAt is present.

**Throws:** None.

## PersistenceEnvelope

**Purpose:** Carries the complete pre-port persistence representation to PersistencePort.save.

**Owner:** Persistence Boundary contract; constructed by PersistenceService.

**Inputs:** ValidatedPersistenceInput, PersistenceMetadata, PersistenceLineage, and PersistenceAudit.

**Output:** One immutable PersistenceEnvelope.

**Required fields:** contractVersion, input, metadata, lineage, and audit.

**Optional fields:** None.

**Preconditions:** All four construction inputs exist and are preserved unchanged.

**Postconditions:** The envelope contains no new record persistenceId, no persistedAt, no serialized scientific representation, and no added scientific field.

**Throws:** None.

## PersistenceService

**Purpose:** Coordinates audit construction, envelope construction, PostConstructionValidation, and one port invocation.

**Owner:** Persistence Boundary service contract.

**Inputs:** ValidatedPersistenceInput, PersistenceMetadata, and PersistenceLineage.

**Output:** PersistenceResult.

**Required fields or members:** contractVersion equal to scientific-persistence-service/1.0.0 and persist as the single public operation.

**Optional fields or members:** None.

**Preconditions:** ValidatedPersistenceInput was produced by successful PersistenceBoundary.validate; metadata and lineage are supplied by the persistence integration caller.

**Postconditions:** Post-construction failure returns rejected PersistenceResult without invoking the port. Post-construction success invokes PersistencePort.save exactly once and returns its structurally valid PersistenceResult unchanged.

**Throws:** PersistencePortException, propagated unchanged from PersistencePort.save.

**Logical signature:** PersistenceService.persist receives ValidatedPersistenceInput, PersistenceMetadata, and PersistenceLineage and returns PersistenceResult or throws PersistencePortException.

## PersistencePort

**Purpose:** Persists one complete PersistenceEnvelope through future persistence infrastructure.

**Owner:** Persistence Boundary port contract; implemented by future persistence infrastructure.

**Input:** PersistenceEnvelope.

**Output:** Structurally valid PersistenceResult.

**Required fields or members:** contractVersion equal to scientific-persistence-port/1.0.0 and save as the single public operation.

**Optional fields or members:** None.

**Preconditions:** PostConstructionValidation succeeded for the supplied envelope.

**Postconditions:** The port returns one structurally valid PersistenceResult containing port-created persistenceId and persistedAt where required by its status invariants, or it returns no result.

**Throws:** PersistencePortException when no valid PersistenceResult is returned.

**Logical signature:** PersistencePort.save receives PersistenceEnvelope and returns PersistenceResult or throws PersistencePortException.

## PersistenceResult

**Purpose:** Represents the persistence-only outcome returned by PersistenceService or PersistencePort.

**Owner:** Persistence Boundary contract; rejected results are constructed by PersistenceService and succeeded or failed results are constructed by PersistencePort.

**Inputs:** PostConstructionValidation issues for rejected status, or the port-owned persistence outcome for succeeded or failed status.

**Output:** One immutable PersistenceResult.

**Required fields:** contractVersion, status, persistenceId, persistedAt, issues, and portOperationInvoked.

**Optional fields:** None.

**Preconditions:** Status-specific construction authority and invariants are satisfied.

**Postconditions:** Rejected status has null persistenceId and persistedAt and false portOperationInvoked; non-null persistenceId or persistedAt on port-returned results was created exclusively by the port.

**Throws:** None.

## PersistencePortException

**Purpose:** Represents the sole thrown failure outcome of PersistencePort.save.

**Owner:** PersistencePort implementation.

**Inputs:** A non-scientific persistence failure code and explanation owned by the port implementation.

**Output:** One PersistencePortException thrown by PersistencePort.save.

**Required properties:** code equal to port_failure and a non-empty persistence-only message.

**Optional properties:** None.

**Preconditions:** PersistencePort cannot return a structurally valid PersistenceResult.

**Postconditions:** No PersistenceResult is produced, no scientific information is added, and PersistenceService propagates the same exception instance unchanged.

**Throws:** PersistencePortException is itself the thrown public failure contract; it declares no additional thrown failure.

---

# 9. Persistence Contract Versions

The following persistence-only contract identities are authoritative for Phase 8.0B:

| Contract | Version |
|---|---|
| Persistence boundary | scientific-persistence-boundary/1.0.0 |
| Validated persistence input | scientific-persistence-input/1.0.0 |
| Persistence envelope | scientific-persistence-envelope/1.0.0 |
| Persistence metadata | scientific-persistence-metadata/1.0.0 |
| Persistence lineage | scientific-persistence-lineage/1.0.0 |
| Persistence audit | scientific-persistence-audit/1.0.0 |
| Persistence service | scientific-persistence-service/1.0.0 |
| Persistence port | scientific-persistence-port/1.0.0 |
| Persistence result | scientific-persistence-result/1.0.0 |
| Persistence validation | scientific-persistence-validation/1.0.0 |

These are persistence versions.

They are not scientific versions.

They are declared contract identities,

not runtime inputs to PersistenceBoundary.validate.

PreConstructionValidation SHALL NOT validate them.

Existing version metadata recorded after boundary validation remains governed by its owning persistence contract.

They SHALL NOT be written into,

or substituted for,

scientific version metadata.

Changing a required field,

field meaning,

operation meaning,

invariant,

or compatibility obligation

requires the applicable persistence contract version to increment under VES.

---

# 10. ValidatedPersistenceInput Contract

## Purpose

ValidatedPersistenceInput is the persistence-only assembly produced after PreConstructionValidation succeeds for one authoritative Phase 8.0A request and result.

It is not a scientific object.

It is not a public scientific contract.

It is owned exclusively by the Persistence Boundary.

---

## Required Fields

| Field | Type authority | Requirement |
|---|---|---|
| contractVersion | Persistence input contract | Must equal scientific-persistence-input/1.0.0 |
| request | Phase 8.0A ScientificEvaluationRequest | Required and preserved unchanged |
| result | Phase 8.0A ScientificEvaluationResult | Required and preserved unchanged |

---

## Optional Fields

None.

---

## Invariants

- request and result are the exact objects supplied to the Persistence Boundary
- request.requestId equals result.requestId
- request.domainId equals result.domainId
- result.domainVersion.domainId equals result.domainId
- the request remains unchanged
- the result remains unchanged
- the request's prior snapshot remains inside the request
- no scientific field is copied into a persistence-specific duplicate
- no persistence identifier or persistence timestamp is added to ValidatedPersistenceInput
- blocked and unavailable results remain valid persistence inputs

Persistence SHALL NOT compare scientific values,

evaluate scientific completeness,

or determine whether a scientific conclusion is correct.

---

## Construction Rules

The Persistence Boundary SHALL complete PreConstructionValidation before ValidatedPersistenceInput construction.

The fixed ValidatedPersistenceInput contractVersion is assigned during construction after PreConstructionValidation succeeds.

It is not supplied to or validated by PreConstructionValidation.

ValidatedPersistenceInput records only successful Phase 8.0B persistence validation.

It SHALL NOT prove,

mark,

or otherwise represent whether the caller satisfied the caller-owned orchestration condition.

ValidatedPersistenceInput SHALL be constructed only by the Persistence Boundary after PreConstructionValidation succeeds.

Construction occurs after the authoritative request and result already exist.

Construction performs no calculation,

normalization,

inference,

version creation,

provenance creation,

or scientific validation.

If the structural relationship between request and result is invalid,

processing SHALL terminate before construction.

ValidatedPersistenceInput SHALL never exist in an invalid structural state.

---

# 11. PersistenceMetadata Contract

## Purpose

PersistenceMetadata records only persistence metadata known before a persistence operation begins.

It contains no scientific information.

The contract is owned by the Persistence Boundary.

Every field value is supplied by the persistence integration caller before PersistenceService is invoked.

Phase 8.0B does not generate any value in this contract.

---

## Required Fields

| Field | Requirement |
|---|---|
| contractVersion | Must equal scientific-persistence-metadata/1.0.0 |
| implementationId | Non-empty opaque implementation identity supplied by the future persistence implementation |
| implementationVersion | Non-empty opaque implementation version supplied by the future persistence implementation |
| schemaVersion | Non-empty opaque storage-schema version supplied by the future persistence implementation |
| modelVersion | Non-empty opaque persistence-model version supplied by the future persistence implementation |

---

## Optional Fields

None.

---

## Invariants

- no field is derived from scientific content
- no field changes a scientific version
- no field is inferred by the Persistence Boundary
- Phase 8.0B validates presence only
- Phase 8.0B does not define clock authority
- Phase 8.0B does not define storage state
- PersistenceMetadata contains no persistence identifier
- PersistenceMetadata contains no persistence timestamp
- PersistenceMetadata contains no storage-generated value
- PersistenceMetadata contains no database-generated value

---

## Construction Rules

PersistenceMetadata SHALL be supplied complete to PersistenceService by the persistence integration caller.

PersistenceService and the Persistence Boundary SHALL never generate,

repair,

or default its fields.

---

# 12. PersistenceLineage Contract

## Purpose

PersistenceLineage records an append-only relationship between persistence records.

It describes persistence history only.

It does not describe scientific evolution.

The contract is owned by the Persistence Boundary.

Its values are supplied by the persistence integration caller.

---

## Required Fields

| Field | Requirement |
|---|---|
| contractVersion | Must equal scientific-persistence-lineage/1.0.0 |

---

## Optional Fields

| Field | Requirement |
|---|---|
| parentPersistenceId | Non-empty opaque immediate-predecessor identifier when a parent exists |

parentPersistenceId is an existing predecessor reference known before the current persistence operation.

It is not the persistenceId created for the current persistence operation.

---

## Invariants

- absence of parentPersistenceId represents a root persistence record
- when present, parentPersistenceId references only the immediate predecessor
- prior records are never mutated to add descendants
- lineage grows only by creating a later envelope
- lineage does not imply scientific correction, improvement, worsening, or supersession

---

## Construction Rules

The persistence integration caller supplies parentPersistenceId when an immediate predecessor exists.

For a root record,

the persistence integration caller omits parentPersistenceId.

Phase 8.0B defines no identifier-generation,

lookup,

conflict,

or repository policy.

The Persistence Boundary preserves the supplied value unchanged through PostConstructionValidation.

---

# 13. PersistenceAudit Contract

## Purpose

PersistenceAudit records only the successful PreConstructionValidation applied before ValidatedPersistenceInput construction.

It contains no scientific interpretation.

It does not replace or duplicate ScientificAuditMetadata inside ScientificEvaluationResult.

The contract and its values are owned by the Persistence Boundary.

---

## Required Fields

| Field | Requirement |
|---|---|
| contractVersion | Must equal scientific-persistence-audit/1.0.0 |
| boundaryVersion | Must equal scientific-persistence-boundary/1.0.0 |
| validationVersion | Must equal scientific-persistence-validation/1.0.0 |
| inputContractVersion | Exact ValidatedPersistenceInput contract version observed |
| requestContractVersion | Exact Phase 8.0A request contract version observed |
| resultContractVersion | Exact Phase 8.0A result contract version observed |
| validationStatus | Must equal passed for every constructed envelope |
| validationIssueCodes | Must be an empty collection for every constructed envelope |

---

## Optional Fields

None.

---

## Invariants

- audit records structural validation only
- audit contains no timestamp
- audit contains no generated identifier
- audit contains no biomarker
- audit contains no scientific status
- audit contains no scientific confidence
- audit contains no scientific interpretation
- audit does not inspect or reconstruct the result's scientific audit metadata
- failed PreConstructionValidation produces no ValidatedPersistenceInput, PersistenceAudit, or PersistenceEnvelope

---

## Construction Rules

PersistenceService SHALL construct PersistenceAudit from ValidatedPersistenceInput, PersistenceMetadata, and PersistenceLineage after PreConstructionValidation succeeds.

Its values are deterministic consequences of the successful PreConstructionValidation, observed contract identities, and the persistence validation version.

PersistenceAudit SHALL NOT require persistenceId or persistedAt.

---

# 14. PersistenceEnvelope Contract

## Purpose

PersistenceEnvelope is the complete persistence-specific representation submitted to a future persistence port.

It is not a scientific object.

It is not visible to scientific domains.

The contract is owned by the Persistence Boundary.

---

## Required Fields

| Field | Requirement |
|---|---|
| contractVersion | Must equal scientific-persistence-envelope/1.0.0 |
| input | Complete ValidatedPersistenceInput |
| metadata | Complete PersistenceMetadata |
| lineage | Complete PersistenceLineage |
| audit | Complete PersistenceAudit |

---

## Optional Fields

None.

---

## Invariants

- input.request contents remain unchanged
- input.result contents remain unchanged
- scientific objects are nested, not copied field by field
- persistence metadata remains outside scientific objects
- audit contract identities match the contained contracts
- the envelope contains no UI field
- the envelope contains no AI field
- the envelope contains no storage payload
- the envelope contains no serialized scientific representation
- the envelope is immutable after construction

Object contents remain scientifically unchanged.

No byte-identity or serialization claim is made.

---

## Construction Rules

PersistenceService SHALL construct an envelope only from:

- a ValidatedPersistenceInput
- complete PersistenceMetadata supplied by the persistence integration caller
- complete PersistenceLineage supplied by the persistence integration caller
- a complete PersistenceAudit constructed by PersistenceService

Envelope construction SHALL add no scientific field and modify no supplied scientific object.

PersistenceEnvelope SHALL NOT require persistenceId or persistedAt.

---

# 15. Persistence Validation Contract

## Purpose

Persistence validation protects the persistence boundary structurally.

It never evaluates scientific correctness.

The validation contract is owned by the Persistence Boundary.

---

## Validation Phases

Persistence validation has exactly two ordered phases:

1. PreConstructionValidation
2. PostConstructionValidation

PreConstructionValidation SHALL finish before ValidatedPersistenceInput, PersistenceAudit, or PersistenceEnvelope is constructed.

PostConstructionValidation SHALL begin only after PersistenceAudit and PersistenceEnvelope have been constructed.

Both phases return ValidationOutcome.

Neither phase performs Phase 8.0A scientific-contract validation or scientific validation.

---

## PreConstructionValidation

PreConstructionValidation receives exactly:

- ScientificEvaluationRequest
- ScientificEvaluationResult

It SHALL NOT receive a separate ScientificSnapshot.

Any optional prior ScientificSnapshot remains nested inside ScientificEvaluationRequest and is preserved unchanged.

PreConstructionValidation SHALL NOT inspect or validate that snapshot's scientific or structural content.

PreConstructionValidation owns only:

- request-result relationship consistency required for persistence
- persistence-owned structural preconditions that can be evaluated from ScientificEvaluationRequest and ScientificEvaluationResult before ValidatedPersistenceInput construction

Prior successful Phase 8.0A validation is a caller precondition outside PreConstructionValidation and outside the Phase 8.0B runtime validation surface.

PreConstructionValidation SHALL NOT verify,

prove,

inspect,

or repeat Phase 8.0A scientific or structural validation.

PreConstructionValidation SHALL NOT validate scientific correctness.

PreConstructionValidation SHALL NOT validate Phase 8.0A contract versions.

PreConstructionValidation SHALL NOT validate persistence contract versions.

PreConstructionValidation SHALL NOT inspect PersistenceMetadata or PersistenceLineage because they are not inputs to PersistenceBoundary.validate.

PreConstructionValidation SHALL NOT inspect any marker,

flag,

token,

wrapper,

proof object,

validation identity,

or external trust state.

It SHALL NOT produce a validation proof,

marker,

token,

trust flag,

validated request wrapper,

or validated result wrapper.

Violation of the caller precondition is an integration defect outside the defined PersistenceBoundary ValidationOutcome.

Such a violation SHALL NOT produce a ValidationOutcome defined by Phase 8.0B.

PreConstructionValidation SHALL NOT reject inputs because evidence of completed Phase 8.0A validation is absent.

On success, ValidationOutcome contains the newly constructed ValidatedPersistenceInput.

On failure:

- ValidationOutcome reports failure
- ValidatedPersistenceInput is not constructed
- PersistenceAudit is not constructed
- PersistenceEnvelope is not constructed
- processing terminates immediately

---

## PostConstructionValidation

PostConstructionValidation receives exactly:

- constructed PersistenceAudit
- constructed PersistenceEnvelope

It owns only constructed persistence-invariant validation, including:

- PersistenceAudit completeness
- PersistenceEnvelope completeness
- persistence-owned structural invariants

PostConstructionValidation SHALL NEVER perform scientific validation.

PostConstructionValidation SHALL NOT mutate any constructed or nested object.

On success, processing may continue to PersistencePort.save.

On failure:

- PersistencePort is not invoked
- PersistenceService returns a rejected PersistenceResult
- the rejected result carries the PostConstructionValidation issues unchanged
- persistenceId is null
- persistedAt is null
- portOperationInvoked is false

---

## Required Validation Outcome Fields

| Field | Requirement |
|---|---|
| validationVersion | Must equal scientific-persistence-validation/1.0.0 |
| validationPhase | Must equal pre_construction or post_construction |
| valid | Boolean structural result |
| issues | Ordered collection of persistence validation issues |
| validatedInput | ValidatedPersistenceInput or null |

## Optional Validation Outcome Fields

None.

Each validation issue SHALL contain:

| Field | Requirement |
|---|---|
| code | Stable persistence-only issue code |
| path | Persistence contract path or null |
| message | Persistence-only structural explanation |

Validation issues SHALL contain no scientific conclusion.

For a failed PreConstructionValidation outcome,

validatedInput SHALL be null.

For a successful PreConstructionValidation outcome,

validatedInput SHALL contain the newly constructed ValidatedPersistenceInput.

For every PostConstructionValidation outcome,

validatedInput SHALL contain the existing ValidatedPersistenceInput from the constructed envelope.

---

## Required Issue Codes

The Phase 8.0B validator SHALL support:

- missing_request
- missing_result
- request_id_mismatch
- domain_id_mismatch
- result_domain_version_mismatch
- missing_persistence_metadata
- invalid_persistence_metadata
- missing_persistence_lineage
- invalid_persistence_lineage
- invalid_persistence_audit
- invalid_persistence_envelope

Issue ordering SHALL follow the order above.

---

## Structural Validation Rules

Phase 8.0B validation SHALL validate:

- PreConstructionValidation validates only request-result relationship consistency required for persistence and persistence-owned structural preconditions evaluable from ScientificEvaluationRequest and ScientificEvaluationResult
- PostConstructionValidation validates only PersistenceAudit completeness, PersistenceEnvelope completeness, and persistence-owned structural invariants

Validation SHALL NOT verify:

- Phase 8.0A request-contract validity
- Phase 8.0A result-contract validity
- Phase 8.0A snapshot-contract validity
- Phase 8.0A scientific-contract versions
- persistence contract versions during PreConstructionValidation
- whether prior Phase 8.0A validation occurred
- biomarkers
- measurements
- units
- references
- interpretations
- evidence quality
- scientific status
- scientific confidence
- scientific reason meaning
- scientific warnings
- provenance completeness
- safety meaning
- trend meaning

Unknown,

null,

blocked,

unsupported,

unavailable,

and incomplete scientific content

SHALL remain valid when accepted by the Phase 8.0A contract.

---

## Validation Failure

If validation fails:

- a PreConstructionValidation failure constructs no ValidatedPersistenceInput, PersistenceAudit, or PersistenceEnvelope
- PersistencePort is not invoked for either failure phase
- scientific objects remain unchanged
- PreConstructionValidation returns ValidationOutcome failure
- PersistenceService returns a rejected PersistenceResult for PostConstructionValidation failure
- no missing value is inferred
- no default is introduced

Violation of the orchestration-level caller precondition is not a Phase 8.0B validation failure.

It SHALL NOT produce a Phase 8.0B ValidationOutcome,

PersistenceResult,

or persistence validation issue.

---

# 16. Persistence Boundary Responsibilities

The Persistence Boundary owns:

- PreConstructionValidation rules
- PostConstructionValidation rules
- ValidatedPersistenceInput construction
- declaration and governance of persistence-only contract versions
- persistence-only invariants

The Persistence Boundary does not own:

- runtime persistence contract-version validation
- verification, proof, or inspection of the caller-owned orchestration condition
- enforcement of or rejection for violation of that caller precondition
- a runtime outcome for violation of that caller precondition
- Phase 8.0A scientific or structural validation
- service orchestration
- port execution
- storage
- identifiers
- timestamps
- scientific information
- serialization
- retries
- transactions

The boundary exposes pure,

deterministic,

storage-independent contract operations.

PersistenceBoundary.validate is the only exported Persistence Boundary operation.

PostConstructionValidation is a persistence-module internal boundary operation invoked by PersistenceService after construction.

---

# 17. PersistenceService Contract

## Purpose

PersistenceService coordinates one persistence attempt.

It owns orchestration only.

It owns no validation rules,

scientific logic,

metadata generation,

or storage behavior.

The service contract version is:

scientific-persistence-service/1.0.0

---

## Service Operation

Logical operation:

persist

Required operation inputs:

- ValidatedPersistenceInput
- PersistenceMetadata
- PersistenceLineage

Required operation output:

- asynchronous completion with PersistenceResult
- or unchanged propagation of PersistencePortException thrown by PersistencePort

Required injected dependency:

- exactly one PersistencePort

---

## Execution Order

PersistenceService SHALL execute exactly:

1. receive ValidatedPersistenceInput, PersistenceMetadata, and PersistenceLineage
2. construct PersistenceAudit from those three inputs
3. construct PersistenceEnvelope from ValidatedPersistenceInput, PersistenceMetadata, PersistenceLineage, and PersistenceAudit
4. request PostConstructionValidation of the constructed PersistenceAudit and PersistenceEnvelope
5. if PostConstructionValidation fails, do not invoke the port and return a rejected PersistenceResult containing the validation issues unchanged
6. if PostConstructionValidation succeeds, invoke PersistencePort.save exactly once with the PersistenceEnvelope
7. if the port returns, return the structurally valid PersistenceResult supplied by the port unchanged
8. if the port throws PersistencePortException, propagate the same PersistencePortException unchanged

PersistenceService SHALL NOT:

- perform structural-validation logic itself
- repeat Phase 8.0A scientific-contract validation
- accept a raw request-result pair instead of ValidatedPersistenceInput
- infer, generate, or retrieve PersistenceMetadata
- infer, generate, or retrieve PersistenceLineage
- invoke a port after validation failure
- invoke a port more than once
- transform a port result
- validate a returned port result
- normalize, wrap, convert, or reinterpret a PersistencePortException
- normalize, wrap, convert, or reinterpret any port failure
- calculate
- normalize
- serialize
- retry
- rollback
- synchronize
- repair
- infer
- generate identifiers
- generate timestamps

---

## Construction Rules

PersistenceService SHALL be constructed only with a PersistencePort dependency.

It may depend at compile time on persistence contracts and boundary operations.

It SHALL NOT depend on:

- scientific internals
- storage implementations
- UI
- networking
- application state

---

# 18. PersistencePort Contract

## Purpose

PersistencePort is the storage-independent operation implemented by future persistence infrastructure.

It isolates storage implementations from scientific and persistence-boundary architecture.

The port contract is owned by the Persistence Boundary.

A future persistence implementation owns only its implementation of that contract.

The port contract version is:

scientific-persistence-port/1.0.0

---

## Required Members

| Member | Requirement |
|---|---|
| contractVersion | Must equal scientific-persistence-port/1.0.0 |
| save | The single asynchronous persistence operation |

---

## Optional Members

None.

---

## Port Operation

Logical operation:

save

Required operation input:

- one complete PersistenceEnvelope

Required operation output:

- asynchronous completion with one valid PersistenceResult

PersistencePort has exactly two outcomes:

1. return one valid PersistenceResult
2. throw PersistencePortException

No third outcome is authorized.

A returned PersistenceResult may have succeeded or failed status but SHALL satisfy every applicable PersistenceResult invariant.

A returned failed PersistenceResult remains a valid returned PersistenceResult under this two-outcome port contract.

An invalid PersistenceResult is a PersistencePort contract violation and SHALL NOT be returned.

PersistencePortException is a persistence-only exception type constructed and thrown by a PersistencePort implementation.

It SHALL contain no scientific information.

It is not a PersistenceResult and produces no PersistenceResult.

PersistencePortException SHALL be exposed through the public persistence-module boundary as part of the PersistencePort contract.

---

## Port Invariants

- the port receives no raw scientific object outside the envelope
- the port never mutates the envelope
- the port never mutates nested scientific objects
- the port performs no scientific validation
- the port performs no scientific calculation
- the port performs no scientific interpretation
- the port returns a PersistenceResult for expected persistence outcomes
- the port implementation exclusively creates persistence identifiers and persistence timestamps
- the port returns created persistence identifiers and persistence timestamps only through PersistenceResult
- the port never writes a persistence identifier or persistence timestamp into PersistenceMetadata
- the port never requires persistenceId or persistedAt in PersistenceLineage, PersistenceAudit, or PersistenceEnvelope
- a returned PersistenceResult is valid
- a non-returning port operation throws only PersistencePortException
- the port contains no contract for retry, transaction, rollback, or synchronization in Phase 8.0B

---

## Construction Rules

Phase 8.0B SHALL define the port interface.

Phase 8.0B SHALL NOT provide a production implementation.

Test doubles are permitted only inside focused tests.

A test double SHALL NOT be exported from the production persistence module.

---

# 19. PersistenceResult Contract

## Purpose

PersistenceResult represents the persistence-only outcome of one service operation.

It contains no scientific information.

The contract is owned by the Persistence Boundary.

The result contract version is:

scientific-persistence-result/1.0.0

---

## Required Fields

| Field | Requirement |
|---|---|
| contractVersion | Must equal scientific-persistence-result/1.0.0 |
| status | succeeded, rejected, or failed |
| persistenceId | Opaque identifier or null |
| persistedAt | Opaque timestamp or null |
| issues | Ordered collection of persistence-only issues |
| portOperationInvoked | Boolean |

---

## Optional Fields

None.

---

## Status Invariants

For succeeded:

- portOperationInvoked is true
- persistenceId is non-null
- persistedAt is non-null
- issues is empty
- persistenceId and persistedAt were created exclusively by the PersistencePort implementation
- persistenceId differs from submitted lineage.parentPersistenceId when that optional field is present

For rejected:

- PostConstructionValidation failed
- portOperationInvoked is false
- persistenceId is null
- persistedAt is null
- issues is non-empty
- PersistenceService constructs the result

For failed:

- portOperationInvoked is true
- issues is non-empty
- persistenceId may be null
- persistedAt may be null
- the future port constructs the result
- every non-null persistenceId or persistedAt was created exclusively by the PersistencePort implementation

---

## Issue Contract

Each issue SHALL contain:

| Field | Requirement |
|---|---|
| code | Stable persistence-only code |
| path | Persistence contract path or null |
| message | Persistence-only explanation |

Issues SHALL NOT contain:

- biomarkers
- scientific measurements
- scientific interpretations
- scientific confidence
- scientific recommendations
- scientific evidence

Phase 8.0B defines one non-validation result issue code:

- port_failure

All rejected-result issue codes SHALL come from the Persistence Validation Contract.

Future phases may add storage-specific issue codes only through an explicit PersistenceResult contract-version change.

---

## Construction Rules

PersistenceService constructs only rejected results caused by PostConstructionValidation failure.

Future port implementations construct succeeded or failed results.

PersistenceService returns a port result unchanged.

If a PersistencePort implementation throws PersistencePortException,

PersistenceService propagates the same exception instance unchanged.

PersistenceService does not construct a PersistenceResult for a thrown PersistencePortException.

---

# 20. Dependency Direction

The mandatory compile-time dependency graph is:

Scientific domains

have no dependency on

Scientific Persistence

---

Scientific Persistence

depends only on

the public scientificProduction barrel

---

PersistenceService

depends on

Persistence Boundary operations,

Persistence contracts,

and PersistencePort

---

PersistencePort

depends only on

PersistenceEnvelope

and

PersistenceResult

and

PersistencePortException

---

Future storage adapters

may depend on

PersistencePort

but SHALL NOT be introduced in Phase 8.0B.

No dependency may point from science toward persistence.

No persistence module may import scientific internals.

No production module may reference the persistence module during this phase.

---

# 21. Operation Sequence

Before Phase 8.0B is invoked,

the caller is responsible for completing the existing Phase 8.0A evaluation and validation flow successfully.

That caller-owned activity is outside the Phase 8.0B operation sequence and runtime validation surface.

The Phase 8.0B logical sequence begins only when the caller invokes PersistenceBoundary.validate with:

Existing Phase 8.0A request

↓

Existing Phase 8.0A result

↓

PersistenceBoundary.validate performs only request-result relationship validation

and persistence-owned structural validation evaluable from those two inputs

↓

PreConstructionValidation failure returns ValidationOutcome failure,

constructs no ValidatedPersistenceInput,

PersistenceAudit,

or PersistenceEnvelope,

and terminates processing

or

PreConstructionValidation success produces ValidatedPersistenceInput

↓

PersistenceService.persist receives ValidatedPersistenceInput,

PersistenceMetadata,

and PersistenceLineage

↓

PersistenceService constructs PersistenceAudit

↓

PersistenceService constructs PersistenceEnvelope

↓

PostConstructionValidation validates the constructed audit and envelope

↓

PostConstructionValidation failure returns rejected PersistenceResult

without invoking the port

or

PostConstructionValidation success

↓

PersistencePort.save

↓

Valid PersistenceResult returned unchanged

or

PersistencePortException propagated unchanged

No scientific domain invokes persistence.

No persistence component participates before the Phase 8.0A result exists.

No production caller is wired during Phase 8.0B.

---

# 22. Immutability Rules

Persistence SHALL preserve supplied scientific objects unchanged.

The Persistence Boundary SHALL NOT mutate:

- ScientificEvaluationRequest
- ScientificEvaluationResult
- ScientificSnapshot nested in an existing request
- nested observations
- nested measurements
- scientific provenance
- scientific audit metadata
- scientific versions
- blocked outputs
- confidence
- warnings
- evidence
- interpretations
- safety candidates
- trend status
- limitations

ValidatedPersistenceInput and PersistenceEnvelope SHALL be immutable after construction.

Immutability means their object contents cannot be changed through the persistence API.

No serialization,

hashing,

or byte-equivalence policy is defined by this phase.

---

# 23. Backward Compatibility

Phase 8.0B is additive.

It SHALL NOT change:

- Phase 8.0A public contracts
- Phase 8.0A contract versions
- Phase 8.0A exact result fields
- Scientific Baseline versions
- scientific-domain imports
- scientific-domain outputs
- existing production paths
- activation metadata
- feature flags

The persistence module has no production consumer in this phase.

Removing the persistence module SHALL leave all existing application and scientific behavior unchanged.

Future persistence-contract changes SHALL use explicit persistence version increments.

Future storage implementations SHALL conform to these contracts rather than modifying science.

---

# 24. Deferred Decisions

The following decisions remain intentionally deferred.

Phase 8.0B SHALL NOT decide them.

## Serialization

- canonical JSON
- key ordering
- whitespace
- Unicode normalization
- number formatting
- binary representation
- serializer implementation
- migration of serialized payloads

## Identity

- UUID strategy
- collision policy
- identifier format
- identifier migration

## Time

- clock policy
- timestamp format
- timezone
- monotonic time

## Storage

- database technology
- repository behavior
- transactions
- idempotency
- retries
- rollback
- duplicate handling
- query semantics
- publication lifecycle
- visibility

## Security and Privacy

- encryption
- key management
- authorization
- retention
- deletion
- export
- regulatory workflow

## Integration

- production caller
- application-version policy
- production feature flag
- synchronization
- background work
- monitoring

These deferrals are not Phase 8.0B omissions.

PersistenceMetadata,

and PersistenceLineage

are supplied by the persistence integration caller before the port operation.

Persistence identifiers and persistence timestamps are absent from PersistenceMetadata.

They are created exclusively by the future PersistencePort implementation and returned only through PersistenceResult.

Their generation format and clock policy remain deferred.

---

# 25. Required Architecture Tests

Phase 8.0B SHALL add focused tests proving:

## Scientific Isolation

- no scientific-domain module imports scientificPersistence
- scientificPersistence imports no scientific-domain internal module
- scientificPersistence imports only the public scientificProduction barrel
- existing scientific-domain files remain unchanged

## Public Contract Preservation

- Phase 8.0A request fields remain unchanged
- Phase 8.0A result fields remain unchanged
- ScientificSnapshot remains unchanged
- Phase 8.0A contract versions remain unchanged
- PersistenceBoundary.validate accepts exactly the unchanged ScientificEvaluationRequest and ScientificEvaluationResult contracts
- PersistenceBoundary.validate accepts no parameter or field representing caller-precondition satisfaction
- no Phase 8.0A validation proof, marker, token, trust flag, trusted identity, validated request wrapper, validated result wrapper, or additional scientific contract is introduced

## Persistence Contract Completeness

- the public barrel exports exactly the eleven contracts listed in Public Module API
- PersistenceBoundary.validate accepts only ScientificEvaluationRequest and ScientificEvaluationResult
- PersistenceBoundary.validate accepts no separate ScientificSnapshot
- PersistenceService.persist accepts exactly ValidatedPersistenceInput, PersistenceMetadata, and PersistenceLineage
- PersistencePort exposes save and does not expose persist
- every persistence contract exposes its required version
- required contract fields are present
- no empty persistence contract version exists
- no persistence contract contains UI or AI fields
- ValidatedPersistenceInput contains only request, result, and its persistence contract version
- PersistenceMetadata contains no persistenceId, createdAt, persistedAt, or other persistence identifier or persistence timestamp
- PersistenceMetadata contains no storage-generated or database-generated value
- PersistenceLineage requires only its contract version and permits optional parentPersistenceId
- root PersistenceLineage omits parentPersistenceId
- PersistencePortException is exposed only as part of the PersistencePort contract
- PersistencePortException has exactly the required public properties

## PreConstructionValidation

- PreConstructionValidation validates only request-result relationship consistency required for persistence and persistence-owned structural preconditions evaluable from ScientificEvaluationRequest and ScientificEvaluationResult
- PreConstructionValidation validates no Phase 8.0A or persistence contract version
- PreConstructionValidation inspects no PersistenceMetadata or PersistenceLineage
- PreConstructionValidation inspects no marker, flag, token, wrapper, proof object, validation identity, or external trust state
- PreConstructionValidation does not reject inputs because evidence of caller-condition satisfaction is absent
- no ValidationOutcome issue code represents violation of the caller-owned orchestration condition
- a matching request and result that satisfy Phase 8.0B persistence validation produce ValidatedPersistenceInput
- the optional prior snapshot remains nested inside ScientificEvaluationRequest and is not inspected or validated
- request ID mismatch fails before ValidatedPersistenceInput construction
- domain mismatch fails before ValidatedPersistenceInput construction
- result domain-version mismatch fails before ValidatedPersistenceInput construction
- every pre-construction failure returns ValidationOutcome failure
- every pre-construction failure produces no ValidatedPersistenceInput, PersistenceAudit, or PersistenceEnvelope
- blocked scientific results remain structurally acceptable
- unknown scientific provenance remains structurally acceptable
- validation issues use deterministic ordering

## PostConstructionValidation

- PersistenceAudit and PersistenceEnvelope are constructed before PostConstructionValidation
- missing or malformed metadata is rejected after construction
- root lineage without parentPersistenceId is accepted
- a non-empty opaque parentPersistenceId is accepted
- audit completeness is validated
- envelope completeness is validated
- persistence-owned structural invariants are validated
- post-construction failure does not invoke the port
- post-construction failure returns rejected PersistenceResult containing the validation issues

## Envelope Integrity

- envelope construction preserves request contents
- envelope construction preserves result contents
- scientific audit metadata survives unchanged
- blocked outputs survive unchanged
- confidence survives unchanged
- versions survive unchanged
- envelope construction adds no scientific field
- envelope is immutable after construction

## Service and Port Semantics

- PersistenceService infers, generates, or retrieves no metadata or lineage
- post-construction validation failure returns rejected
- post-construction validation failure does not invoke the port
- post-construction validation success invokes PersistencePort.save exactly once
- the port receives only PersistenceEnvelope
- the port creates persistence identifiers and persistence timestamps exclusively
- the port returns created persistence identifiers and persistence timestamps only through PersistenceResult
- the service returns a valid port result unchanged
- a returned succeeded or failed PersistenceResult satisfies its status invariants
- PersistencePortException is propagated as the same exception instance
- PersistencePortException is not wrapped, normalized, converted, or reinterpreted
- no PersistenceResult is constructed for a thrown PersistencePortException
- no production port implementation exists
- test doubles are test-local

## Dependency Direction

- no circular dependency is introduced
- no persistence import appears in scientific domains
- no storage technology appears in the persistence module
- no application or production module imports scientificPersistence

## Activation and Baseline

- all standardized Phase 8 production paths remain inactive
- Cardiometabolic safety remains inactive
- no parent score or cross-domain composite is introduced
- Scientific Baseline manifest hash remains unchanged

---

# 26. Required Regression Validation

Before completion,

run:

- focused scientificPersistence boundary tests
- Scientific Baseline governance tests
- Clinical PhenoAge calculation tests
- Clinical PhenoAge scientific-validation tests
- Clinical PhenoAge product-cutover tests
- VO₂max scientific-domain tests
- Functional Capacity scientific-domain tests
- Cardiometabolic scientific-domain tests
- the full repository test suite
- strict TypeScript validation
- governance and production-reference audits
- git diff --check
- trailing-whitespace checks including untracked files
- final-newline checks

If a configured lint or build check is unavailable,

the completion report SHALL state that fact,

the reason,

and the substitute evidence.

No failed required check may be reported as PASS.

---

# 27. Phase 8.0B Acceptance Criteria

Phase 8.0B is accepted only if every criterion below is satisfied.

## Scientific Integrity

- Scientific Baseline is unchanged
- no scientific-domain file is modified
- no scientific output changes
- no scientific confidence changes
- no reference policy changes
- no interpretation policy changes
- no safety policy changes
- no reason-code changes
- no blocked-output changes

## Phase 8.0A Compatibility

- ScientificEvaluationRequest remains unchanged
- ScientificEvaluationResult remains unchanged
- ScientificSnapshot remains unchanged
- all Phase 8.0A public-contract versions remain unchanged
- no new public scientific aggregate exists
- successful Phase 8.0A evaluation and validation is solely an orchestration-level caller precondition
- that caller precondition is outside the Phase 8.0B runtime validation surface and the defined PersistenceBoundary ValidationOutcome
- violation of that caller precondition is an integration defect
- no Phase 8.0B ValidationOutcome is defined for violation of that caller precondition
- Phase 8.0B does not verify, prove, inspect, or repeat Phase 8.0A scientific or structural validation
- no Phase 8.0A validation proof, marker, token, trust flag, trusted identity, validated request wrapper, validated result wrapper, or additional scientific contract exists

## Persistence Boundary

- all persistence contracts in this specification are implemented
- all persistence contract versions match this specification
- all required fields and invariants are enforced
- the Public Module API exports exactly its eleven authorized contracts
- PreConstructionValidation and PostConstructionValidation are distinct and ordered
- neither validation phase performs scientific validation
- PreConstructionValidation validates only request-result relationship consistency required for persistence and persistence-owned structural preconditions evaluable from ScientificEvaluationRequest and ScientificEvaluationResult
- PreConstructionValidation validates no Phase 8.0A or persistence contract version
- PreConstructionValidation inspects no PersistenceMetadata or PersistenceLineage
- no persistence validation issue code represents absence of prior Phase 8.0A validation
- PostConstructionValidation validates only PersistenceAudit completeness, PersistenceEnvelope completeness, and persistence-owned structural invariants
- PreConstructionValidation succeeds before ValidatedPersistenceInput construction
- pre-construction failure constructs no ValidatedPersistenceInput, PersistenceAudit, or PersistenceEnvelope
- ValidatedPersistenceInput never exists in an invalid structural state
- ValidatedPersistenceInput is persistence-owned
- PersistenceService receives exactly ValidatedPersistenceInput, PersistenceMetadata, and PersistenceLineage
- PersistenceService constructs PersistenceAudit and PersistenceEnvelope before PostConstructionValidation
- post-construction failure returns rejected PersistenceResult without invoking the port
- PersistenceMetadata contains only values known before persistence
- PersistenceMetadata contains no persistence identifier or persistence timestamp
- PersistenceMetadata contains no storage-generated or database-generated value
- PersistenceLineage contains only its contract version and optional parentPersistenceId
- root PersistenceLineage omits parentPersistenceId
- PersistenceService and the Persistence Boundary never generate identifiers or timestamps
- persistence identifiers and persistence timestamps are created exclusively by the future PersistencePort implementation
- created persistence identifiers and persistence timestamps are returned only through PersistenceResult
- PersistencePort has exactly two outcomes: return a valid PersistenceResult or throw PersistencePortException
- PersistencePort exposes save as its single operation
- PersistenceService propagates PersistencePortException unchanged
- no scientific metadata is duplicated
- no serializer is implemented

## Dependency Direction

- science has zero persistence dependency
- persistence imports only the public scientificProduction boundary
- production has zero persistence dependency in this phase
- storage has no implementation in this phase

## Production Safety

- no standardized domain is activated
- no feature flag is wired
- no production port exists
- no UI is changed
- no Advisor or AI integration is added
- no HealthKit or Supabase integration is added
- no networking is added

## Validation

- every required focused architecture test passes
- every required scientific regression passes
- full repository tests pass
- TypeScript passes
- governance audits pass
- production-reference audits pass
- diff and whitespace checks pass

Failure of any criterion means the phase is not complete.

---

# 28. VES Review Requirements

The completion review SHALL assess every VES gate.

At minimum:

- VES-01 Architecture Integrity is applicable
- VES-02 Scientific Integrity is applicable
- VES-03 Engineering Quality is applicable
- VES-04 Production Safety is applicable
- VES-08 Scalability and Extensibility is applicable
- VES-09 Data Governance and Provenance is applicable

VES-05,

VES-06,

and

VES-07

may be marked not applicable only with written reasons consistent with VES.

The implementer may prepare the report.

The implementer SHALL NOT invent reviewer approval.

---

# 29. Required Deliverables

Phase 8.0B SHALL deliver only:

- the scientificPersistence persistence-boundary module
- the exact eleven-contract Public Module API
- documentation of the orchestration-level Phase 8.0A caller precondition as outside the Phase 8.0B implementation, operation sequence, runtime validation surface, and outcomes
- ValidatedPersistenceInput construction
- PreConstructionValidation
- PostConstructionValidation
- ValidationOutcome semantics for both validation phases
- PersistenceService orchestration
- PersistencePort save interface
- PersistencePortException contract
- no production PersistencePort implementation
- focused scientificPersistence architecture tests
- Phase 8.0B architecture documentation
- a completion report

No application architecture,

storage infrastructure,

production integration,

or scientific-domain change

is authorized.

---

# 30. Required Completion Report

The final report SHALL include:

## Repository

- files created
- files modified
- files removed
- public APIs introduced
- branch
- working-tree state
- modified files
- untracked files
- commit created: expected NO
- push performed: expected NO
- tag created: expected NO

## Architecture

- contracts introduced
- contract versions
- module boundary
- exact public exports and logical signatures
- PreConstructionValidation result and construction behavior
- PostConstructionValidation result and port-blocking behavior
- ValidationOutcome phase semantics
- service operation
- PersistencePort.save operation
- PersistencePortException propagation
- persistence identifier and persistence timestamp ownership
- orchestration-level Phase 8.0A caller precondition and its exclusion from the Phase 8.0B implementation, operation sequence, runtime validation surface, and outcomes
- confirmation that Phase 8.0B introduced no parameter, mechanism, issue code, rejection, or outcome representing satisfaction or violation of that caller precondition
- confirmation that PersistenceBoundary and PreConstructionValidation perform no runtime persistence contract-version validation and introduce no version-validation failure code
- dependency direction
- deferred decisions preserved

## Scientific Verification

- scientific behavior changed: expected NO
- Scientific Baseline changed: expected NO
- scientific outputs changed: expected NO
- scientific confidence changed: expected NO
- reference policies changed: expected NO
- interpretation policies changed: expected NO
- Phase 8.0A public contracts changed: expected NO
- Phase 8.0A scientific-contract validation repeated: expected NO
- production activation changed: expected NO

## Validation

- focused tests
- domain regressions
- full repository tests
- TypeScript
- configured lint
- architecture tests
- governance audits
- production-reference audits
- git diff --check
- trailing-whitespace check
- final-newline check

## VES Review

- phase
- date
- reviewer
- commit SHA or reviewed working-tree state
- change classification
- affected layers
- every VES gate and applicability
- evidence
- findings
- blocking issues
- recommendations
- deferred items
- final outcome
- approval or pending approval

## Remaining Risks

- unresolved risks
- future-phase dependencies
- recommended next authorized action

---

# 31. Final Implementation Boundary

Phase 8.0B may implement persistence-boundary architecture only.

It may not persist user data.

It may not alter science.

It may not alter Phase 8.0A.

It may not activate production.

It may not select storage.

It may not define serializer policy.

It may not define identity generation.

It may not define clock policy.

It may not create repositories.

The completed phase must be removable without changing any existing scientific or application behavior.

END OF DOCUMENT

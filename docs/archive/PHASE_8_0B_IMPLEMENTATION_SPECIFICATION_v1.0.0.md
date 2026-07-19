# PHASE 8.0B
# Scientific Provenance & Persistence Architecture

## Implementation Specification

Version: 1.0.0

Status: Approved for Implementation

Author: OpenAI ChatGPT

Target: Codex

Repository: Vitalspan

Depends On:

- VITALSPAN_ENGINEERING_STANDARD.md

- SCIENTIFIC_BASELINE_V1_0.md

- PHASE_8_0A_PRODUCTION_CONTRACT_ACTIVATION_ARCHITECTURE.md

Depends On:

- Scientific Baseline v1.0.0
- VES 1.0
- Phase 8.0A Production Contract & Activation Architecture

Must Not Modify:

- Scientific behavior
- Scientific calculations
- Scientific registries
- Scientific reference policies
- Scientific thresholds
- Scientific interpretation rules
- Production activation state

---

# 1. Purpose

This specification establishes the complete persistence and provenance architecture for the Vitalspan Scientific Platform.

Its purpose is not to activate scientific domains.

Its purpose is not to connect Supabase.

Its purpose is not to build user interfaces.

Its purpose is to define how scientific information is represented, preserved, versioned, audited, serialized and prepared for future persistence without changing scientific behavior.

This specification introduces the permanent scientific data architecture that every current and future scientific domain will use.

Examples include but are not limited to:

- Clinical Biological Age
- Cardiorespiratory Fitness (VO₂max)
- Functional Capacity
- Cardiometabolic Health
- Recovery
- Frailty
- Kidney Health
- Liver Health
- Nutrition
- Hormonal Health

Every future scientific domain MUST conform to this architecture.

---

# 2. Goals

The architecture SHALL provide:

- deterministic scientific persistence
- immutable scientific history
- complete provenance
- reproducible evaluations
- version-aware storage
- auditability
- future synchronization capability
- future cloud persistence capability
- future offline capability
- future HealthKit integration
- future laboratory import
- future manual entry
- future wearable integration

without requiring modification of existing scientific domains.

---

# 3. Explicit Non-Goals

This phase SHALL NOT:

activate any inactive scientific domain

change any scientific output

change scientific confidence

change reference intervals

change guideline interpretation

change production wiring

connect Supabase

connect HealthKit

connect Apple Health

connect Google Health Connect

perform cloud synchronization

perform offline synchronization

introduce Advisor integration

introduce AI integration

change repository architecture established in Phase 8.0A

modify Scientific Baseline

modify production activation metadata

introduce background workers

introduce caching

introduce analytics

introduce telemetry

introduce networking

---

# 4. Architectural Philosophy

The Scientific Platform is responsible for scientific reasoning.

The Persistence Layer is responsible for preserving scientific truth.

The Persistence Layer never performs science.

The Scientific Platform never performs persistence.

The Production Layer never modifies scientific truth.

The Presentation Layer never interprets scientific truth.

The AI Layer never calculates scientific truth.

Each layer has exactly one responsibility.

Cross-layer responsibilities are prohibited.

---

# 5. Core Principles

The following principles are mandatory.

## Principle 1

Science owns scientific truth.

Nothing else may redefine it.

---

## Principle 2

Persistence preserves.

Persistence never decides.

---

## Principle 3

History is immutable.

Scientific history must never silently change.

---

## Principle 4

Every evaluation is reproducible.

If an evaluation cannot be reproduced from its scientific inputs and versions, the architecture has failed.

---

## Principle 5

Unknown is preferable to fabricated certainty.

Missing provenance must remain missing.

The system must never invent provenance.

---

## Principle 6

Every scientific output must be explainable.

Explanation begins with provenance.

---

## Principle 7

Every scientific output belongs to exactly one scientific version.

Outputs must never exist without version identity.

---

## Principle 8

Future domains must require no architectural redesign.

The architecture must grow horizontally rather than recursively.

---

# 6. Scientific Provenance Philosophy

Scientific provenance answers a single question:

"Why does this scientific conclusion exist?"

Every scientific conclusion must be traceable back to:

- observations
- measurements
- measurement source
- collection method
- timestamps
- scientific version
- reference version
- interpretation version
- evaluation version

No scientific output may exist without provenance.

---

# 7. Scientific Truth Lifecycle

Scientific truth progresses through distinct stages.

Observation

↓

Measurement

↓

Scientific Evaluation

↓

Scientific Interpretation

↓

Scientific Snapshot

↓

Persistence

↓

Future Presentation

↓

Future AI Explanation

The order above is immutable.

No stage may bypass another stage.

---

# 8. Scientific Record Philosophy

A scientific record is not merely stored data.

A scientific record is evidence.

Therefore every record must remain:

- reproducible
- explainable
- versioned
- attributable
- timestamped
- immutable after publication

Editing historical scientific records is prohibited.

Corrections generate new records.

They never mutate existing scientific history.

---

# 9. Immutable Snapshot Philosophy

A Scientific Snapshot represents the complete scientific state at one evaluation instant.

A snapshot is permanent.

A snapshot never changes after publication.

If science changes tomorrow:

the previous snapshot remains valid because it accurately represents what the scientific platform concluded at that time.

Historical scientific snapshots are never rewritten.

---

# 10. Separation of Concerns

Scientific Domains

↓

Scientific Contract

↓

Persistence Contract

↓

Storage Adapter

↓

Future Database

↓

Future Synchronization

↓

Presentation

↓

AI

Every layer communicates only through explicit contracts.

No layer may access another layer's internal implementation.

---

# 11. Repository Expectations

This phase must preserve the repository's architectural integrity.

New code must remain:

- deterministic
- isolated
- testable
- version-aware
- serialization-safe
- persistence-agnostic

The repository must remain production inactive after completion.

---

# 12. Compatibility Requirements

The resulting architecture must support future integration with:

- Supabase
- SQLite
- IndexedDB
- Secure Storage
- CloudKit
- HealthKit
- Health Connect
- Laboratory APIs
- CSV import
- PDF lab parsing
- Manual Entry
- Wearables
- Future scientific domains

without modifying existing scientific domain behavior.

---

# 13. Success Definition

This phase is considered successful only if:

- no scientific outputs change
- no scientific calculations change
- no production activation occurs
- no UI changes occur
- no networking is introduced
- every scientific result becomes persistable
- every scientific result becomes version traceable
- every scientific result becomes provenance traceable
- every scientific result becomes serialization-ready
- every scientific result remains fully deterministic

Failure of any requirement above constitutes failure of the phase.

---

# 14. Scientific Observation Architecture

## 14.1 Purpose

Scientific observations represent the lowest governed layer of scientific evidence.

An observation is not a scientific conclusion.

An observation is simply evidence collected from a source.

Scientific domains evaluate observations.

They never own observations.

This separation is mandatory.

---

## 14.2 Observation Definition

Every observation SHALL represent one and only one measurable fact.

Examples:

- Body Weight
- Height
- HbA1c
- LDL Cholesterol
- Resting Heart Rate
- VO₂max
- Grip Strength
- Walking Speed

Composite observations are prohibited.

For example:

❌ Cardiometabolic Health

❌ Biological Age

❌ Longevity Score

These are scientific evaluations.

Not observations.

---

## 14.3 Observation Identity

Every observation SHALL have a globally unique immutable identifier.

Observation identity SHALL NEVER depend on:

- storage backend
- synchronization
- database primary key
- cloud identifier
- local identifier

Scientific identity must exist independently from persistence.

---

## 14.4 Observation Ownership

Observations belong to users.

Scientific domains consume observations.

Scientific domains never own observations.

Persistence stores observations.

Presentation displays observations.

AI explains observations.

Only scientific domains evaluate observations.

---

# 15. Measurement Architecture

Measurements represent standardized scientific values derived directly from observations.

Every measurement SHALL contain exactly one canonical scientific value.

Measurements SHALL NEVER contain scientific interpretation.

Measurements SHALL NEVER contain recommendations.

Measurements SHALL NEVER contain risk.

Measurements SHALL NEVER contain explanations.

Those belong to later layers.

---

## 15.1 Canonical Representation

Every measurement SHALL define one canonical representation.

Example:

Weight

Allowed input:

- kilograms
- pounds

Canonical storage:

kilograms

Example:

Height

Allowed input:

- meters
- centimeters
- feet
- inches

Canonical storage:

meters

Canonical representation is permanent.

Scientific domains SHALL consume only canonical values.

---

## 15.2 Original Value Preservation

Original user values SHALL NEVER be discarded.

Every measurement SHALL preserve:

Original Value

Original Unit

Canonical Value

Canonical Unit

Conversion Method

Conversion Version

Conversion Timestamp

This guarantees future reproducibility.

---

## 15.3 Missing Values

Missing values SHALL remain missing.

The architecture SHALL NEVER:

estimate

interpolate

guess

fill

invent

scientific measurements.

---

# 16. Provenance Model

Every persisted scientific artifact SHALL contain complete provenance.

Minimum provenance requirements:

Source Identity

Collection Method

Collection Timestamp

Scientific Version

Reference Version

Interpretation Version

Evaluation Version

Policy Version

Creation Timestamp

Record Identifier

Nothing may bypass provenance.

---

## 16.1 Source Identity

Every scientific value SHALL identify its source.

Examples:

Manual Entry

HealthKit

Health Connect

Laboratory

Wearable

Imported File

Clinician

Research Dataset

Future sources may be added.

Existing sources must remain backward compatible.

---

## 16.2 Verification Status

Every source SHALL expose verification status.

Examples:

Verified

User Reported

Estimated

Imported

Unknown

Verification status SHALL NEVER be inferred.

---

## 16.3 Collection Method

Collection method SHALL remain independent from source.

Example:

Source:

HealthKit

Collection:

Automatic Background Sync

Example:

Laboratory

Collection:

Manual PDF Import

Example:

Manual Entry

Collection:

User Keyboard Input

---

# 17. Scientific Snapshot Model

Scientific Snapshot is the primary persistence artifact.

Everything else exists to support snapshot generation.

Scientific Snapshot SHALL represent one complete scientific evaluation event.

Nothing less.

Nothing more.

---

## Snapshot Requirements

Every snapshot SHALL include:

Snapshot Identifier

Snapshot Timestamp

Scientific Baseline Version

Scientific Domain Version

Reference Version

Interpretation Version

Policy Version

Scientific Inputs

Scientific Outputs

Scientific Warnings

Scientific Confidence

Scientific Status

Blocked Outputs

Reason Codes

Supporting Measurements

Supporting Observations

Provenance

Audit Metadata

Activation Metadata

Serialization Version

Every field above is mandatory.

---

## Snapshot Immutability

Snapshots SHALL NEVER be updated.

Snapshots SHALL NEVER be edited.

Snapshots SHALL NEVER be overwritten.

Corrections generate new snapshots.

Historical snapshots remain permanently available.

---

## Snapshot Lineage

Every snapshot SHALL know:

its parent

its successor (when applicable)

its baseline

its scientific domain version

its evaluation generation

This creates a complete scientific lineage.

---

# 18. Persistence Contracts

Scientific domains SHALL NOT know:

SQLite

Supabase

Firestore

Realm

CloudKit

REST

GraphQL

Filesystem

Scientific domains communicate only through persistence contracts.

Adapters communicate with storage.

Scientific domains never communicate with storage.

---

## Persistence Adapter Philosophy

Storage is replaceable.

Science is not.

Changing database technology SHALL require adapter changes only.

Scientific code SHALL remain untouched.

---

# 19. Serialization Philosophy

Every persisted scientific artifact SHALL be serializable.

Serialization SHALL preserve:

precision

versions

timestamps

identifiers

provenance

scientific status

reason codes

blocked outputs

confidence

No serialization format may lose scientific meaning.

---

## Forward Compatibility

Older snapshots SHALL remain readable.

Future versions SHALL support migration without changing historical scientific truth.

Backward compatibility is mandatory.

---


# 20. Repository Architecture

## Purpose

This phase introduces the persistence architecture of the Scientific Platform.

It SHALL NOT modify existing scientific domains.

Instead, it SHALL provide the infrastructure every scientific domain will eventually use.

The repository architecture must remain layered.

No layer may bypass another layer.

---

# 21. Persistence Module Structure

A dedicated persistence module SHALL be introduced.

Its responsibility is limited to scientific persistence.

It SHALL NOT:

- perform scientific calculations
- interpret scientific output
- communicate with UI
- communicate with AI
- communicate with networking
- contain business logic

It SHALL only preserve scientific state.

---

## Required Responsibilities

The persistence layer SHALL provide:

- snapshot persistence
- observation persistence
- measurement persistence
- serialization
- deserialization
- provenance preservation
- version preservation
- audit metadata
- storage abstraction
- migration entry points

Nothing else.

---

# 22. Storage Independence

Scientific persistence SHALL remain storage-agnostic.

No class may assume:

SQLite

Supabase

Realm

Firestore

Filesystem

CloudKit

HealthKit

Health Connect

or any specific storage implementation.

Persistence SHALL communicate only through abstract storage contracts.

Concrete storage implementations belong to future phases.

---

# 23. Repository Layering

The architecture SHALL remain:

Scientific Domains

↓

Scientific Production Contract

↓

Persistence Contract

↓

Persistence Services

↓

Storage Adapter

↓

Storage Engine

↓

Database

No layer may skip another.

No layer may access storage directly.

---

# 24. Scientific Snapshot Lifecycle

Every scientific snapshot SHALL follow exactly the same lifecycle.

Observation

↓

Measurement

↓

Scientific Evaluation

↓

Scientific Interpretation

↓

Snapshot Construction

↓

Snapshot Validation

↓

Snapshot Serialization

↓

Persistence Request

↓

Storage Adapter

↓

Storage Engine

↓

Future Synchronization

Every snapshot SHALL pass through every stage.

No shortcuts are permitted.

---

# 25. Snapshot Construction Rules

Snapshot construction SHALL be deterministic.

Given identical:

inputs

scientific versions

reference versions

interpretation versions

policy versions

the produced snapshot SHALL be byte-equivalent except for explicitly time-dependent metadata.

Hidden randomness is prohibited.

---

# 26. Snapshot Validation

Every snapshot SHALL be validated before persistence.

Validation SHALL include at minimum:

required identifiers

required timestamps

required provenance

required versions

required measurements

required observations

required outputs

required confidence

required reason codes

required serialization version

required activation metadata

If validation fails:

Persistence SHALL fail.

Partial persistence is prohibited.

---

# 27. Correction Policy

Historical scientific records SHALL NEVER be edited.

Corrections SHALL generate new scientific records.

The previous record SHALL remain available.

The architecture SHALL preserve:

original record

correction record

correction timestamp

correction reason

relationship between records

Scientific history must remain reconstructable.

---

# 28. Version Lineage

Every persisted artifact SHALL explicitly preserve:

Scientific Baseline Version

Scientific Domain Version

Reference Version

Interpretation Version

Evaluation Version

Persistence Version

Serialization Version

Migration Version

No version may be implicit.

---

# 29. Migration Strategy

Future migrations SHALL preserve scientific truth.

Allowed:

schema migration

serialization migration

storage migration

adapter migration

database migration

Forbidden:

changing historical scientific meaning

changing scientific conclusions

changing scientific confidence

changing interpretation history

changing blocked outputs

changing provenance

Migration SHALL transform storage only.

Never science.

---

# 30. Serialization Contracts

Serialization SHALL preserve every scientific property.

Required preservation:

Identifiers

Timestamps

Precision

Units

Canonical values

Original values

Scientific outputs

Reason codes

Warnings

Confidence

Blocked outputs

Scientific versions

Policy versions

Provenance

Audit metadata

Nothing may be dropped.

---

# 31. Deserialization Contracts

Deserialization SHALL recreate an equivalent scientific object.

Scientific meaning SHALL remain unchanged.

Loading a snapshot and serializing it again SHALL produce equivalent output.

Round-trip consistency is mandatory.

---

# 32. Audit Metadata

Every persisted scientific artifact SHALL include audit metadata.

Minimum audit fields:

Record Identifier

Creation Timestamp

Persistence Timestamp

Serialization Version

Repository Version

Scientific Version

Baseline Version

Policy Version

Migration Version

Audit metadata SHALL NOT contain scientific interpretation.

It exists only for traceability.

---

# 33. Repository Invariants

The following invariants SHALL always hold.

Scientific truth is immutable.

Scientific history is append-only.

Persistence never performs science.

Storage never performs science.

Presentation never performs science.

AI never performs science.

Synchronization never performs science.

Migration never performs science.

Only scientific domains perform science.

Violation of any invariant constitutes an architectural defect.

---

# 34. Future Integration Readiness

The architecture SHALL be ready for future integration with:

Supabase

Offline Storage

Cloud Sync

Conflict Resolution

Multi-device Synchronization

Background Synchronization

HealthKit

Health Connect

FHIR

Laboratory APIs

CSV Import

Manual Entry

Clinical Integrations

without requiring redesign of scientific domains.

---

# 35. Repository Boundaries

Scientific Domains SHALL remain completely unaware of:

database schemas

network requests

REST

GraphQL

SQL

authentication

storage locations

cloud synchronization

retry logic

offline queues

All infrastructure concerns belong outside science.

---


# 36. Validation Strategy

## Purpose

The persistence architecture shall be considered complete only after demonstrating that it preserves scientific behavior without altering scientific meaning.

Validation shall prioritize scientific correctness over implementation completeness.

No implementation convenience shall justify loss of scientific integrity.

---

# 37. Required Test Categories

The implementation SHALL include automated tests covering the following categories.

## Architecture Tests

Verify:

- layer isolation
- dependency direction
- storage abstraction
- adapter boundaries
- contract integrity
- absence of circular dependencies

---

## Observation Tests

Verify:

- immutable identity
- original value preservation
- canonical conversion
- missing value handling
- timestamp preservation
- provenance completeness

---

## Measurement Tests

Verify:

- canonical representation
- original unit retention
- conversion reproducibility
- precision preservation
- serialization stability

---

## Snapshot Tests

Verify:

- snapshot construction
- snapshot immutability
- version recording
- lineage recording
- audit metadata
- serialization
- deserialization
- round-trip equivalence

---

## Provenance Tests

Verify:

- source identity
- collection method
- verification status
- timestamps
- policy versions
- scientific versions

Missing provenance SHALL fail validation.

---

## Serialization Tests

Verify:

serialize

↓

deserialize

↓

serialize

produces equivalent scientific content.

---

## Migration Tests

Future migration entry points SHALL be tested even if no migrations currently exist.

Migration must preserve:

scientific outputs

reason codes

warnings

confidence

versions

provenance

audit metadata

---

## Persistence Contract Tests

Verify:

Scientific Domains depend only on persistence contracts.

Storage implementations remain replaceable.

No storage technology leaks into scientific code.

---

## Regression Tests

Run all previously established repository regression suites.

No scientific outputs may change.

Scientific Baseline fingerprints SHALL remain identical.

---

# 38. Forbidden Behaviors

The following behaviors are strictly prohibited.

Scientific domains accessing databases directly.

Scientific domains reading storage engines.

Scientific domains writing storage engines.

Persistence interpreting scientific results.

Persistence generating recommendations.

Persistence changing confidence.

Persistence changing scientific status.

Persistence changing reason codes.

Persistence inventing provenance.

Persistence filling missing measurements.

Persistence modifying blocked outputs.

Serialization dropping scientific information.

Migration modifying scientific conclusions.

Presentation changing scientific interpretation.

AI calculating scientific results.

AI changing scientific confidence.

AI generating scientific measurements.

AI inventing provenance.

Cloud synchronization changing scientific history.

Offline synchronization changing scientific history.

Storage adapters performing scientific calculations.

Repositories silently correcting historical data.

Deleting historical snapshots.

Overwriting scientific history.

Mutating immutable records.

Ignoring version mismatches.

Ignoring provenance failures.

Silent fallbacks.

Hidden defaults that affect scientific behavior.

Violation of any forbidden behavior SHALL fail VES review.

---

# 39. Acceptance Criteria

The phase is accepted only if ALL conditions below are satisfied.

✓ Scientific behavior unchanged

✓ Scientific Baseline unchanged

✓ Repository tests pass

✓ Focused persistence tests pass

✓ TypeScript passes

✓ Serialization tests pass

✓ Round-trip tests pass

✓ Version preservation verified

✓ Provenance preservation verified

✓ Layer isolation verified

✓ Storage independence verified

✓ No production activation

✓ No UI changes

✓ No networking

✓ No AI integration

✓ No synchronization

✓ No HealthKit integration

✓ No Supabase integration

✓ No regression failures

If any condition fails:

The phase SHALL NOT be considered complete.

---

# 40. Required Deliverables

The implementation SHALL provide documentation describing:

Persistence architecture

Repository layering

Persistence contracts

Snapshot model

Observation model

Measurement model

Version lineage

Serialization strategy

Migration strategy

Testing strategy

The implementation SHALL remain fully aligned with:

Scientific Baseline v1.0

VES v1.0

Phase 8.0A Production Contract

---

# 41. Required Completion Report

At completion the implementation SHALL report:

## Repository

Files Created

Files Modified

Files Removed

Public APIs Introduced

---

## Architecture

New Contracts

New Models

New Services

New Adapters

Dependency Changes

Repository Layer Changes

---

## Scientific Verification

Scientific Behavior Changed?

Expected Answer:

NO

Scientific Baseline Changed?

Expected Answer:

NO

Scientific Outputs Changed?

Expected Answer:

NO

Scientific Confidence Changed?

Expected Answer:

NO

Reference Policies Changed?

Expected Answer:

NO

Interpretation Policies Changed?

Expected Answer:

NO

---

## Validation

Focused Tests

Full Repository Tests

TypeScript

Lint

Serialization Tests

Round-trip Tests

Architecture Tests

Regression Tests

git diff --check

Trailing whitespace check

Final newline check

---

## VES Review

Applicable Gates:

VES-01

VES-02

VES-03

VES-08

VES-09

Final Result:

PASS

PASS WITH RECOMMENDATIONS

REWORK REQUIRED

BLOCKED

---

## Repository Status

Working Tree

Branch

Modified Files

Untracked Files

Commit Created?

Expected Answer:

NO

Push Performed?

Expected Answer:

NO

Tag Created?

Expected Answer:

NO

---

# 42. Success Definition

This phase succeeds only if it establishes the permanent scientific persistence foundation for the Vitalspan platform without modifying any scientific behavior.

After successful completion:

Every current scientific domain SHALL be capable of producing persistence-ready scientific artifacts.

Every future scientific domain SHALL inherit the same persistence architecture.

No scientific truth SHALL depend on any storage technology.

No storage technology SHALL redefine scientific truth.

Scientific provenance SHALL become a first-class architectural concept throughout the platform.

This specification intentionally prepares the platform for future cloud synchronization, offline persistence, laboratory integration, HealthKit integration, Health Connect integration, Advisor integration, and additional governed scientific domains without requiring architectural redesign.

END OF DOCUMENT
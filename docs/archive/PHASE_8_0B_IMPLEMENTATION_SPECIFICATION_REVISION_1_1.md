# PHASE 8.0B IMPLEMENTATION SPECIFICATION
# REVISION 1.1

Scientific Provenance & Persistence Architecture

Architecture Patch

Version: 1.1.0

Status: Approved After Architecture Review

Supersedes:
- PHASE_8_0B_IMPLEMENTATION_SPECIFICATION_v1.0.0

Depends On:
- VITALSPAN_ENGINEERING_STANDARD.md
- SCIENTIFIC_BASELINE_V1_0.md
- PHASE_8_0A_PRODUCTION_CONTRACT_ACTIVATION_ARCHITECTURE.md

---

# 1. Purpose

This document records all architectural corrections identified during the independent
architecture review performed prior to implementation.

Revision 1.1 does not replace Phase 8.0B.

Instead, it modifies, clarifies and constrains specific portions of the original
implementation specification.

Unless explicitly replaced by this document, every requirement contained in
Phase 8.0B Version 1.0 remains fully valid.

No scientific behavior is changed.

No production behavior is activated.

No implementation details outside the scope of the identified review findings
are introduced.

---

# 2. Review Summary

The Architecture Review concluded that Phase 8.0B is fundamentally sound but
contains several architectural ambiguities that could lead to inconsistent
implementations.

The review therefore resulted in:

Status:

REWORK REQUIRED

This revision resolves every blocking architectural issue before implementation
may begin.

Implementation SHALL NOT begin until both:

• Phase 8.0B
and

• Revision 1.1

are treated together as the complete implementation specification.

---

# 3. Authority

If any requirement in Revision 1.1 conflicts with Version 1.0,
Revision 1.1 SHALL take precedence.

This document is normative.

It is not informative.

---

# 4. Design Philosophy

Revision 1.1 introduces no new product functionality.

Its purpose is exclusively to:

• eliminate architectural ambiguity

• preserve scientific isolation

• strengthen repository boundaries

• preserve backward compatibility

• prevent future implementation assumptions

No scientific algorithm,

reference,

interpretation,

policy,

clinical rule,

or production behavior

may be modified by this revision.

---

# 5. Change Classification

This revision is classified as:

Architecture Clarification

Behavior Preservation

Backward Compatible

No Scientific Impact

No User Visible Changes

No Production Activation

---

# 6. Resolved Architecture Issues

The following sections replace or clarify the corresponding sections
inside Phase 8.0B Version 1.0.

# 7. Architecture Resolution 01

Scientific Snapshot Identity

---

## Previous Ambiguity

Version 1.0 could be interpreted as expanding the existing
ScientificSnapshot contract defined during Phase 8.0A.

Doing so would violate backward compatibility and change the
public scientific contract.

This interpretation is now explicitly prohibited.

---

## New Requirement

The public ScientificSnapshot defined in Phase 8.0A SHALL remain
unchanged.

No persistence-related metadata may be added to the public
scientific contract.

Persistence SHALL introduce a separate persistence envelope.

Example conceptual relationship:

ScientificPersistenceSnapshot

contains

• ScientificSnapshot

• PersistenceMetadata

• ProvenanceMetadata

• AuditMetadata

• LineageMetadata

ScientificSnapshot remains the scientific truth.

ScientificPersistenceSnapshot represents persistence state.

These two concepts SHALL never be merged.

---

## Scientific Ownership

ScientificSnapshot

belongs exclusively to the scientific domain.

ScientificPersistenceSnapshot

belongs exclusively to the persistence architecture.

Neither layer may assume ownership of the other's lifecycle.

---

## Compatibility Guarantee

Existing scientific components,

validators,

calculators,

interpreters,

reports,

and future scientific modules

must continue to consume the original ScientificSnapshot
without modification.

Revision 1.1 therefore guarantees complete compatibility with
Phase 8.0A.

# 8. Architecture Resolution 02

Dependency Direction

---

## Previous Ambiguity

Version 1.0 could be interpreted as allowing scientific
domains to depend upon persistence contracts.

This interpretation violates clean architecture principles
defined by VES.

---

## Correct Dependency Graph

Scientific Domain

↓

ScientificSnapshot

↓

Persistence Service

↓

Persistence Contracts

↓

Persistence Adapter

↓

Concrete Storage

The dependency direction is strictly one-way.

Scientific domains SHALL NOT import:

• persistence contracts

• persistence services

• storage interfaces

• serialization

• migrations

• repositories

• adapters

Persistence architecture depends upon scientific contracts.

Scientific architecture never depends upon persistence.

This rule is absolute.

---

## Enforcement

Architecture tests SHALL verify that no scientific module
contains compile-time dependencies on persistence packages.

Any such dependency SHALL fail validation.

# 9. Architecture Resolution 03

Canonical Value Ownership

---

## Previous Ambiguity

Version 1.0 could be interpreted as allowing persistence
components to normalize or convert measurements.

This interpretation is prohibited.

---

## Ownership

Measurement normalization,

canonical conversion,

unit conversion,

clinical interpretation,

and scientific validation

belong exclusively to scientific policies.

Persistence SHALL NEVER:

• normalize

• convert

• infer

• repair

• approximate

• reinterpret

• calculate

Persistence may only preserve values already authorized
by scientific domains.

---

## Preservation Rule

If both

Original Value

and

Canonical Value

exist,

both SHALL be preserved exactly.

If only the Original Value exists,

Persistence SHALL preserve only the Original Value.

Persistence SHALL NOT create Canonical Values.

Canonical Values originate exclusively from scientific
measurement policy.

# 10. Architecture Resolution 04

Mandatory Version Representation

---

## Previous Ambiguity

Version 1.0 required every persisted snapshot to contain
reference versions,
interpretation versions,
policy versions,
and component versions.

However, not every scientific domain maintains independently
versioned references or registries.

The Scientific Baseline explicitly prohibits inventing version
identifiers where no authoritative version exists.

---

## Resolution

Persistence SHALL preserve only authoritative version information.

If an authoritative version does not exist,
Persistence SHALL NOT fabricate one.

Instead, one of the following explicit states SHALL be used:

• NotApplicable

• NotSeparatelyVersioned

• Unknown

These states are semantic values,
not generated version identifiers.

---

## Scientific Integrity

Persistence SHALL never transform:

Unknown

into

Version 1

or any other artificial version.

Likewise,

NotSeparatelyVersioned

shall never be replaced with fabricated identifiers.

Scientific provenance always has priority over version completeness.

---

## Version Ownership

Version values originate exclusively from:

• Scientific registries

• Clinical references

• Scientific policies

• Approved component metadata

Persistence only preserves these values.

Persistence never creates them.

---

# 11. Architecture Resolution 05

Provenance Preservation

---

## Previous Ambiguity

Version 1.0 simultaneously required provenance to be preserved
while also implying that missing provenance should fail validation.

These statements are now clarified.

---

## Structural Requirement

Every persisted snapshot SHALL contain a Provenance section.

However,

individual provenance fields may explicitly contain:

• Unknown

• NotAvailable

• NotCollected

• NotApplicable

This distinction is critical.

The Provenance object itself is mandatory.

Its contents may legitimately express incomplete knowledge.

---

## Validation Rule

Validation SHALL reject:

• missing provenance structure

• malformed provenance

• invalid provenance schema

Validation SHALL NOT reject:

• unknown provenance values

• intentionally unavailable provenance

• incomplete but structurally valid provenance

---

## Scientific Preservation

Scientific evidence shall never be discarded merely because
its provenance is incomplete.

Unknown provenance remains scientifically meaningful
when explicitly represented.

---

# 12. Architecture Resolution 06

Immutable Lineage

---

## Previous Ambiguity

Version 1.0 implied that immutable snapshots should reference
their future successors.

This is impossible because successor snapshots do not exist
at creation time.

---

## Resolution

Each snapshot SHALL contain:

ParentSnapshotId

pointing only to the immediately preceding snapshot.

Future relationships SHALL never be stored by mutating
previous snapshots.

---

## Lineage Construction

Snapshot lineage SHALL be reconstructed by traversing:

ParentSnapshotId

rather than updating historical records.

Historic snapshots therefore remain permanently immutable.

---

## Immutability Rule

Once persisted,

a snapshot may never be modified,

even to append future relationships.

Lineage is append-only.

Historical records remain untouched forever.

---

# 13. Architecture Resolution 07

Retention and Privacy

---

## Previous Ambiguity

Version 1.0 prohibited deletion of persisted scientific snapshots.

VES simultaneously requires compliance with privacy,
user deletion,
and applicable data protection obligations.

These statements are clarified below.

---

## Scientific Immutability

Immutable means:

Scientific content may never be silently modified.

Immutable does not mean:

Data can never be deleted.

---

## Authorized Deletion

Deletion is permitted only through an explicitly authorized
retention policy.

Examples include:

• user-requested deletion

• legal erasure

• regulatory compliance

• account removal

• approved retention expiration

---

## Audit Preservation

Deletion policy shall be defined independently
from scientific persistence.

Deletion shall never silently rewrite
historical scientific conclusions.

Where legally permitted,

audit metadata may preserve deletion events
without preserving deleted scientific content.

---

## Future Policy

Concrete privacy,
retention,
export,
and deletion workflows
are intentionally deferred to Phase 8.0C.

---

# 14. Architecture Resolution 08

Storage Scope

---

## Previous Ambiguity

Version 1.0 simultaneously deferred concrete storage adapters
while requiring complete persistence behavior.

The implementation scope is clarified below.

---

## Phase 8.0B Scope

Phase 8.0B SHALL implement:

• persistence contracts

• persistence models

• persistence validation

• serialization contracts

• persistence service

• dependency injection boundaries

• storage interfaces

• test doubles

No production storage implementation
shall be introduced.

---

## Explicitly Out Of Scope

The following remain prohibited during Phase 8.0B:

• SQLite

• Supabase

• Cloud storage

• REST APIs

• GraphQL

• HealthKit persistence

• local databases

• synchronization engines

• production repositories

• distributed storage

These components belong to later implementation phases.

---

## Architecture Goal

Phase 8.0B establishes persistence architecture.

It does not establish persistence infrastructure.

# 15. Deferred Architectural Decisions

---

## Purpose

The following topics were intentionally excluded from
Phase 8.0B.

Their exclusion is deliberate.

They are not implementation omissions.

They are architectural decisions deferred to Phase 8.0C
to preserve the limited scope of Persistence Architecture.

Until formally specified,
implementations SHALL NOT invent local policies for
any deferred topic.

---

# Deferred Group A

Serialization Standard

Phase 8.0C SHALL define:

• canonical JSON representation

• deterministic key ordering

• whitespace policy

• Unicode normalization

• numeric formatting

• floating point precision

• null handling

• timestamp serialization

• timezone normalization

• locale independence

• binary serialization policy

• forward compatibility strategy

• backward compatibility strategy

No serialization implementation may assume any of these rules
before Phase 8.0C.

---

# Deferred Group B

Identity Policy

Phase 8.0C SHALL define:

• SnapshotId ownership

• ObservationId ownership

• MeasurementId ownership

• ProvenanceId ownership

• UUID generation strategy

• deterministic identifier policy

• collision handling

• identifier lifecycle

• identifier stability

• identifier migration

No identifier generation strategy shall be implemented
before these rules are approved.

---

# Deferred Group C

Clock Policy

Phase 8.0C SHALL define:

• clock ownership

• timestamp authority

• UTC policy

• monotonic time usage

• creation timestamp

• persistence timestamp

• publication timestamp

• migration timestamp

• audit timestamp

• correction timestamp

No persistence component shall define its own
time authority.

---

# Deferred Group D

Storage Infrastructure

Phase 8.0C SHALL define:

• SQLite support

• Supabase support

• Cloud persistence

• local storage

• encrypted storage

• synchronization

• replication

• backup

• recovery

• distributed persistence

• storage replacement strategy

---

# Deferred Group E

Security

Phase 8.0C SHALL define:

• encryption requirements

• encryption ownership

• key management

• key rotation

• secure deletion

• integrity verification

• confidentiality requirements

• access control

• authorization model

• authentication boundaries

---

# Deferred Group F

Privacy

Phase 8.0C SHALL define:

• GDPR workflows

• user deletion

• export

• import

• legal retention

• retention expiration

• anonymization

• pseudonymization

• audit retention

• regulatory compliance

---

# Deferred Group G

Repository Behavior

Phase 8.0C SHALL define:

• idempotency

• duplicate requests

• retry policy

• optimistic locking

• conflict resolution

• version mismatch handling

• rollback strategy

• transactional guarantees

• publication lifecycle

• snapshot visibility states

---

# Deferred Group H

Scientific Evolution

Future scientific domains SHALL define:

• future biomarker versioning

• future policy registries

• future reference evolution

• future interpretation evolution

• migration governance

Persistence SHALL remain independent from these decisions.

---

# 16. Updated Acceptance Criteria

Implementation SHALL satisfy ALL original acceptance
criteria defined by Phase 8.0B Version 1.0.

In addition,

Revision 1.1 introduces the following mandatory criteria.

---

The implementation SHALL NOT modify
ScientificSnapshot.

---

Scientific domains SHALL have zero compile-time
dependencies on persistence packages.

---

Persistence SHALL preserve scientific outputs
without modification.

---

Persistence SHALL never create
scientific information.

---

Persistence SHALL never generate
canonical values.

---

Persistence SHALL preserve unknown provenance
without failure.

---

Persistence SHALL preserve
NotApplicable
and
NotSeparatelyVersioned
exactly as provided.

---

Historical snapshots shall remain immutable.

---

Lineage shall be append-only.

---

No production storage shall exist.

---

Architecture tests SHALL verify dependency direction.

---

Serialization SHALL remain abstract.

---

All deferred topics SHALL remain deferred.

---

No implementation may silently introduce policy
decisions reserved for Phase 8.0C.

---

# 17. Updated Completion Report

The completion report defined in
Phase 8.0B Version 1.0
remains mandatory.

The following additional sections SHALL be included.

---

Architecture Compatibility

• ScientificSnapshot unchanged

• Public contracts preserved

• Dependency direction verified

• Backward compatibility verified

---

Revision Compliance

List every Revision 1.1 requirement
and whether it was satisfied.

---

Deferred Decision Verification

Confirm that no Phase 8.0C decision
was implemented prematurely.

---

# 18. Architecture Review Result

Independent Architecture Review Status

PASS AFTER REVISION

---

The review identified architectural ambiguities.

Revision 1.1 resolves every blocking issue.

Implementation may proceed only when both
documents are treated as a single specification:

• PHASE_8_0B_IMPLEMENTATION_SPECIFICATION_v1.0.0.md

and

• PHASE_8_0B_IMPLEMENTATION_SPECIFICATION_REVISION_1.1.md

Neither document is complete without the other.

---

# 19. Future Development Process

Beginning with Phase 8.0B,
all future implementation phases SHALL follow
the engineering workflow below.

Implementation Specification

↓

Architecture Review (Read Only)

↓

Revision (if required)

↓

Implementation

↓

Validation

↓

VES Review

↓

Repository Review

↓

Commit Approval

↓

Commit

↓

Next Phase

Implementation SHALL NEVER begin
before Architecture Review has completed.

This workflow is mandatory for
all future architecture phases.

---

END OF DOCUMENT
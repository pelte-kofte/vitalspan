# Multimodal Biological Age scientific foundation

This package contains the scientific registry, the calculation-free eligibility
gate, and one isolated versioned calculation engine: Clinical Phenotypic Age v1.0.0.
It contains no model combination, imputation, UI integration, AI, diagnosis,
recommendation, lifespan estimate, or global health score.

## Boundary

```text
Peer-reviewed evidence
        ↓
Structured evidence references
        ↓
Canonical model registry + aliases
        ↓
Classification and use decision
        ↓
Input / failure / uncertainty policies
        ↓
Internal unscored review rubric
```

The registry and eligibility layers do not calculate an output. The only calculation
path is a separate versioned package below a mandatory authorization boundary.

The mandatory, calculation-free execution gate is documented in
[`ELIGIBILITY.md`](./ELIGIBILITY.md).

The Clinical Phenotypic Age equation, units, validation boundaries, precision,
provenance, exclusions, and golden-fixture method are documented in
[`clinicalPhenoAge/VALIDATION.md`](./clinicalPhenoAge/VALIDATION.md).

The independent verification methodology, reference agreement, runtime matrix,
sensitivity observations, regression locks, and remaining production gates are in
[`docs/CLINICAL_PHENOAGE_V1_SCIENTIFIC_VALIDATION.md`](../../../docs/CLINICAL_PHENOAGE_V1_SCIENTIFIC_VALIDATION.md).

The production adapter, cutover decisions, safe failure mapping, and intentional
remaining references are documented in
[`docs/CLINICAL_PHENOAGE_PRODUCTION_CUTOVER.md`](../../../docs/CLINICAL_PHENOAGE_PRODUCTION_CUTOVER.md).

## Calculation boundary

```text
Scientific registry + exact model version
        ↓
Eligibility result and evidence metadata
        ↓
Integrity-bound ScientificExecutionAuthorization
        ↓
Exact normalization contract + authorized measurement identifiers
        ↓
Runtime numeric and computational-domain validation
        ↓
Locked Clinical PhenoAge v1.0.0 equation
        ↓
Unrounded, provenance-complete result
```

The calculation engine reads no raw health store or other domain. It receives only
its typed request, performs no unit conversion, and cannot execute from conditional,
expired, cloned, altered, or mismatched authorization.

## Production execution boundary

```text
User measurements
        ↓
Explicit allowlisted unit normalization
        ↓
Scientific Eligibility Engine
        ↓
Integrity-bound ScientificExecutionAuthorization
        ↓
Clinical PhenoAge v1.0.0 engine
        ↓
Typed, unrounded scientific result
        ↓
Presentation-only formatting adapter
        ↓
Product UI
```

`src/lib/clinicalPhenoAgePresentation.ts` is the product-facing entry point.
`src/lib/clinicalPhenoAgeProduct.ts` is the only production module permitted to
invoke the calculation engine. There is no compatibility layer, imputation path,
or alternate calculator.

## Classification audit

| Candidate requested | Canonical registry entry | Classification | Decision |
| --- | --- | --- | --- |
| Levine PhenoAge / Phenotypic Age | Levine Clinical Phenotypic Age | Core Biological Age Model | Accepted candidate |
| Klemera–Doubal Method | KDM | Core Biological Age Model | Accepted candidate with versioned calibration |
| Biological Age (Levine original) | Levine 2013 NHANES III KDM | Research Only | Deferred historical implementation |
| DNAm PhenoAge | DNAm PhenoAge | Research Only | Deferred |
| DunedinPACE | DunedinPACE | Research Only | Deferred; output is pace, not age |
| GrimAge | DNAm GrimAge | Research Only | Deferred |
| Frailty Index | Deficit-Accumulation Frailty Index | Context Only | Excluded from age influence |
| VO2max normative ageing models | FRIEND-compatible VO2max references | Candidate Modifier | Accepted for future evaluation only |
| Heart-rate variability ageing literature | Generic HRV-derived age | Rejected | Excluded |
| Resting heart-rate literature | Resting heart-rate literature | Context Only | Excluded from age influence |
| Sleep duration literature | Sleep duration literature | Context Only | Excluded from age influence |
| Sleep consistency literature | Sleep regularity literature | Research Only | Deferred |
| Cardiorespiratory fitness literature | CRF outcome literature | Context Only | Supports VO2max review only |
| Nutrition-related longevity literature | Nutrition longevity literature | Context Only | Excluded from age influence |
| Inflammation markers | Inflammation literature | Context Only | Excluded as independent modifier |
| Cardiometabolic risk literature | Cardiometabolic risk literature | Context Only | Excluded from age influence |
| Emerging cardiometabolic age model | CardioMetAge | Research Only | Deferred pending replication |

“Phenotypic Age” and “Levine PhenoAge” intentionally resolve to one canonical
clinical model. DNAm PhenoAge is separate. The Levine 2013 biological-age entry is
a historical KDM implementation, not another independent modality. These alias and
relationship rules prevent accidental double counting.

## Accepted-candidate requirements

### Clinical Phenotypic Age

Requires chronological age at specimen collection and all nine published blood
measurements from one source-attributed, compatible collection window. Missing,
stale, invalid, or unit-incompatible inputs exclude the model. No value is imputed.
One visit supports only cross-sectional eligibility, never a longitudinal claim.

### KDM

Requires a versioned, peer-reviewed reference-population calibration and its exact
biomarker panel. KDM is a method, not a universal equation. Substituting a biomarker,
changing the reference population, or omitting a stratifier creates a different
model that requires its own registry entry and validation.

### VO2max normative context

Requires a directly measured, quality-controlled maximal cardiopulmonary exercise
test compatible with a versioned normative reference. Wearable estimates are not
interchangeable. Normative standing is not age in years; candidate status only
permits future scientific evaluation of a modifier.

## Explicit exclusion policy

The following must not influence biological age under this registry:

- HRV-derived age, because no canonical validated transformation exists and results
  are highly protocol-, device-, artifact-, medication-, and context-dependent.
- Resting heart rate, sleep duration, nutrition, frailty, and broad cardiometabolic
  risk, because their outcome associations do not establish an age model.
- Sleep consistency, until evidence extends beyond emerging observational cohorts
  and a validated biological-age construct exists.
- Inflammation as an independent modifier, because markers are nonspecific and CRP
  and WBC already appear inside clinical PhenoAge, creating double-counting risk.
- Epigenetic clocks and pace measures until assay, preprocessing, licensing,
  population, reproducibility, and output-meaning requirements are production-ready.
- CardioMetAge until independent replication, exact implementation review, population
  assessment, and overlap analysis are complete.

Clinical or monitoring importance does not imply eligibility for age estimation.

## Uncertainty policy

- Never estimate, substitute, or impute missing model inputs.
- A single laboratory visit can satisfy only a published cross-sectional model.
- Sparse or irregular wearable history remains context only.
- Conflicting models retain separate provenance and limitations; they are never
  averaged, ranked, rescaled, or silently reconciled.
- No repeated evidence means no trend, pace, persistence, or treatment-effect claim.
- Unsupported population, specimen, protocol, unit, or assay means exclusion.
- Unavailable future integrations remain deferred rather than receiving a proxy.

The machine-readable policy is `SCIENTIFIC_UNCERTAINTY_POLICY`.

## Internal rubric

`SCIENTIFIC_EVALUATION_RUBRIC` defines ten unscored review dimensions: evidence
quality, external validation, clinical adoption, reproducibility, population
diversity, longevity relevance, interpretability, implementation feasibility,
maintenance cost, and future expandability. It provides evidence requirements and
review questions only. Adding ratings, weights, thresholds, or a total requires a
later explicitly authorized scientific phase.

## Evidence audit

Registry references use DOI, PMID, and an authoritative HTTPS link. Key foundations:

- [Clinical Phenotypic Age and DNAm PhenoAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/)
- [Klemera–Doubal method](https://pubmed.ncbi.nlm.nih.gov/16318865/)
- [Levine 2013 KDM comparison](https://pubmed.ncbi.nlm.nih.gov/23213031/)
- [DunedinPACE](https://pmc.ncbi.nlm.nih.gov/articles/PMC8853656/)
- [DNAm GrimAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC6366976/)
- [Frailty Index construction](https://pubmed.ncbi.nlm.nih.gov/18826625/)
- [FRIEND VO2max reference standards](https://pubmed.ncbi.nlm.nih.gov/26455884/)
- [HRV normative-method limitations](https://pubmed.ncbi.nlm.nih.gov/20663071/)
- [Resting heart-rate meta-analysis](https://pubmed.ncbi.nlm.nih.gov/26598376/)
- [Sleep duration meta-analysis](https://pubmed.ncbi.nlm.nih.gov/20469800/)
- [Objective sleep regularity cohort](https://pubmed.ncbi.nlm.nih.gov/37738616/)
- [Dietary patterns systematic review](https://pubmed.ncbi.nlm.nih.gov/34463743/)
- [Inflammatory marker index cohort](https://pubmed.ncbi.nlm.nih.gov/23689826/)
- [CardioMetAge](https://pmc.ncbi.nlm.nih.gov/articles/PMC12947333/)

## Architectural risks and open questions

- Product calculation now has one eligibility-authorized implementation. CI should
  retain the static boundary test so future call sites cannot invoke the engine
  directly or reintroduce a parallel calculator.
- Execution authorization identity is process-local and deliberately short-lived;
  it cannot be serialized and replayed after an app restart. Persisted calculation
  results remain reproducible from their immutable provenance snapshot.
- Measurement identifiers are the authorization binding. The upstream evidence
  store must guarantee that a measurement id is immutable and never reassigned to a
  changed numeric payload.
- Clinical biomarker models share inputs, so future combination could double count
  the same physiology.
- Mortality-calibrated age, epigenetic age, pace of aging, frailty, and normative
  fitness are different constructs and cannot be merged by unit conversion.
- Reference-population transportability and subgroup calibration remain unresolved.
- Laboratory drift, acute illness, device changes, and assay preprocessing can break
  longitudinal comparability.
- Independent replication and test-retest reliability are uneven across models.
- A future multimodal method needs prospective validation of its full architecture;
  evidence for individual components does not validate their combination.
- Scientific ownership, evidence-update cadence, version migration, and model
  retirement rules require formal governance before production calculation.

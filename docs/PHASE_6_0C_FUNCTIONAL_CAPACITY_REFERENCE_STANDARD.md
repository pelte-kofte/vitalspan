# Phase 6.0C — Functional Capacity reference standard

| Document field | Value |
| --- | --- |
| Document type | Official scientific reference specification |
| Scientific platform | Vitalspan |
| Domain | Functional Capacity |
| Standard version | `Vitalspan-FC-RS-1.0.0` |
| Reference registry | `Vitalspan-FC-REFERENCE-1.0.0` |
| Matching policy | `Vitalspan-FC-REFERENCE-MATCH-1.0.0` |
| Interpretation policy | `Vitalspan-FC-INTERPRETATION-1.0.0` |
| Review date | 18 July 2026 |
| Governing documents | Phase 6.0A and Phase 6.0B |
| Scope | Scientific reference selection and interpretation policy only |
| Final production recommendation | **Production Ready, with fail-closed reference matching** |

## 1. Decision

Vitalspan may interpret a validated Functional Capacity measurement only when an
authorized reference dataset matches the measurement's test identity, endpoint,
protocol, population, and required demographic variables. Measurement acceptance
under Phase 6.0B does not create reference eligibility.

The official decisions are:

- **No single global reference is scientifically valid for all eight tests.**
  Hand Grip Strength has a defensible international pooled benchmark. The other
  tests require protocol- and population-specific references.
- **Age and sex are the minimum normative grouping when the selected publication
  stratifies by them.** They must not be omitted merely because a pooled threshold
  is clinically familiar.
- **Percentiles are preferred** when a sufficiently representative study publishes
  them and the record matches the study. Percentiles describe position in a
  reference distribution; they are not diagnoses, risk probabilities, or scores.
- **Published reference intervals or curves are conditionally appropriate for
  6MWT.** Locally validated, protocol-matched references take precedence over an
  international pooled or multicentre comparison.
- **Named categories and criterion cut points are not authorized as normative
  interpretation.** Sarcopenia, frailty, falls, disability, or disease thresholds
  answer different questions from age- and sex-referenced performance.
- **Standalone Five Times Sit-to-Stand and SPPB receive no normative interpretation
  in version 1.0.0.** The strongest recent chair-rise datasets stop at full standing
  on the fifth rise, while Phase 6.0B's standalone test ends after return to sitting.
  Phase 6.0B also prohibits Vitalspan from calculating or interpreting an SPPB total.
- **Unsupported populations receive no interpretation, never a fallback.** There
  is no nearest-country, nearest-region, nearest-age, sex, protocol, endpoint,
  equipment, healthy-population, or disease-population fallback.
- **Raw, accepted measurements remain available when reference matching fails.**
  Lack of a reference does not invalidate a correctly measured result.

This standard creates no formula, calculation, Functional Capacity score,
cross-test composite, biological age, fitness age, mortality estimate, diagnosis,
or treatment recommendation. It does not authorize implementation or UI.

## 2. Primary questions

| Question | Official answer |
| --- | --- |
| Which reference population should Vitalspan adopt? | A versioned, test-specific registry. iGRIPS is the preferred international Hand Grip Strength benchmark. All other authorized references are country-, region-, and protocol-specific. |
| Which measurements have internationally accepted normative values? | Grip has the strongest geographically broad adult norms. Gait, chair-rise, TUG, 6MWT, and SPPB have important national, regional, or multicentre datasets, but no universally transportable norm. |
| Should percentiles or categories be preferred? | Published percentiles are preferred. Published reference intervals or curves may be used for 6MWT. Generic labels and diagnostic thresholds are not normative outputs. |
| Which measurements intentionally remain uninterpreted? | Standalone 5xSTS and SPPB under this version. Other tests also remain raw-only whenever no exact authorized match exists. |
| Should unsupported populations receive fallback interpretation? | **No.** The measurement may be retained, but normative interpretation is unavailable. |
| Is this standard production ready? | **Yes as a scientific governance standard.** Production use is conditional on exact matching, version exposure, provenance, and the blocked-output rules in this document. |

## 3. Scope and authority

### 3.1 Tests reviewed independently

1. Hand Grip Strength.
2. Usual Gait Speed.
3. Four-Meter Walk at usual pace.
4. 30-Second Chair Stand.
5. Standalone Five Times Sit-to-Stand.
6. Timed Up and Go.
7. Six-Minute Walk Test.
8. Short Physical Performance Battery.

The Four-Meter Walk is a named usual-gait-speed protocol, not a second physiological
measurement from the same observed walk. It is reviewed separately because its
short static-start course has its own normative evidence.

### 3.2 Governing hierarchy

This document is subordinate to:

- Phase 6.0A for domain and test scientific authorization; and
- Phase 6.0B for test identity, protocol, endpoint, validity, source confidence,
  provenance, and measurement acceptance.

If a Phase 6.0B condition is absent or invalid, this standard cannot restore or
upgrade the measurement. Reference matching always fails closed.

### 3.3 Terms

| Term | Meaning in this standard |
| --- | --- |
| **Normative reference** | A distribution describing performance in a defined reference population under a defined measurement protocol |
| **Percentile** | The published relative position of a result within that reference distribution |
| **Reference interval** | A published range describing the central or otherwise stated distribution in the reference population |
| **Criterion cut point** | A value selected for association with, or discrimination of, an outcome or clinical state; not a normative percentile |
| **Reference eligible** | All mandatory dataset and measurement matching conditions are satisfied |
| **Raw value only** | The accepted test result may be shown with provenance, but no normative position is authorized |
| **No interpretation** | No percentile, interval, category, threshold label, or cross-test conclusion is authorized |

## 4. Review method and evidence quality

This is a rapid structured scientific review updated through 18 July 2026. Searches
covered official WHO, NIA, CDC, AHA, ESC, ACSM, ICFSR, and EWGSOP resources;
PubMed and PubMed Central; systematic reviews; major population cohorts; and
international or national normative datasets. Reference chaining was used where
official protocols cited original normative studies.

This was not a prospectively registered PRISMA review and does not claim exhaustive
enumeration of every country-specific table. It is designed for defensible platform
governance and conservative reference authorization. A dataset omitted from this
version is not automatically invalid; it is unauthorized until reviewed and
versioned.

### 4.1 Evidence hierarchy

Greater weight was given to:

1. Large nationally representative or international pooled samples with published
   age- and sex-specific distributions.
2. Exact protocol documentation and compatibility with Phase 6.0B.
3. Population weighting, transparent eligibility criteria, and external or holdout
   validation.
4. Independent adoption or replication in clinical and research settings.
5. Adequate coverage across the relevant age range and both published sex strata.

Sample size cannot compensate for an incompatible endpoint. A very large dataset
measuring a fifth-standing chair endpoint is not a reference for the standalone
fifth-return-to-sitting endpoint.

### 4.2 Evidence grades

| Grade | Meaning |
| --- | --- |
| **High** | Large, representative or broad pooled dataset; standardized or harmonized method; clear stratification; strong internal validation or replication |
| **Moderate** | Useful national, regional, or multicentre dataset with material transportability, protocol, age-range, or sampling limitations |
| **Low** | Small, convenience, narrowly selected, heterogeneous, poorly documented, or insufficiently validated for individual normative interpretation |
| **Not applicable** | An organization recognizes the test clinically but does not publish a normative reference dataset |

Evidence grade describes the reference, not the individual's measurement confidence.

## 5. Guideline and organization review

Major organizations support standardized performance assessment, but none supplies
a single international normative system covering all tests in this standard.

| Authority | Relevant contribution | Normative consequence |
| --- | --- | --- |
| WHO | ICOPE incorporates locomotor and intrinsic-capacity assessment and explicitly expects pathways to be adapted to local context ([WHO ICOPE, 2nd ed.](https://www.who.int/publications/i/item/9789240103726)) | Supports use of performance tests and local adaptation; does not authorize global percentiles for the eight tests |
| NIA | Maintains the official SPPB instrument and protocol resources ([NIA SPPB](https://www.nia.nih.gov/research/labs/leps/short-physical-performance-battery-sppb)) | Protocol authority, not a global normative population |
| CDC | STEADI operationalizes 30CST and TUG for older-adult fall assessment ([CDC STEADI resources](https://www.cdc.gov/steadi/hcp/clinical-resources/index.html)) | Demonstrates clinical adoption; screening thresholds must not be relabelled as normative percentiles |
| AHA | Recognizes functional assessment, including gait, strength, balance, and SPPB, in older adults with cardiovascular disease ([AHA scientific statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC7252210/)) | Supports clinical importance; disease-focused use does not define healthy-population norms |
| ESC | Uses functional and walking assessment in cardiovascular and peripheral arterial disease guidance ([ESC peripheral arterial and aortic diseases guideline](https://academic.oup.com/eurheartj/article/45/36/3538/7738955)) | Supports specialty adoption; does not provide universal norms for the test set |
| ACSM | Provides professional exercise-testing and functional-assessment practice standards ([ACSM Guidelines, 12th ed.](https://acsm.org/education-resources/books/guidelines-exercise-testing-prescription/); [ACSM ageing resources](https://acsm.org/education-resources/trending-topics-resources/aging/)) | Supports standardized administration; no single ACSM dataset supersedes protocol-matched population references |
| ICFSR | Recommends validated instruments appropriate to setting and purpose in physical frailty practice ([ICFSR guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC6800406/)) | Frailty case-finding is not interchangeable with normative ranking |
| EWGSOP2 | Uses grip, chair-rise, gait speed, TUG, SPPB, and 6MWT within a sarcopenia diagnostic/severity framework ([EWGSOP2 consensus](https://academic.oup.com/ageing/article/48/1/16/5126243)) | Its cut points are clinical criteria, not general-population percentile categories; regional norms are preferable where population differences matter |

## 6. Reference-selection principles

### 6.1 One global reference versus multiple references

Vitalspan adopts **multiple versioned references**. One global reference is permitted
only as an explicitly named international benchmark where the source itself was
constructed for international comparison. It must never masquerade as a local
population norm.

This distinction is necessary because:

- grip strength differs materially among world regions, even after accounting for
  age and sex;
- course length, start condition, pace instruction, timing method, chair height,
  endpoint, encouragement, practice, and number of attempts alter test results;
- healthy, independently mobile cohorts systematically outperform unselected,
  clinical, institutionalized, or mobility-limited populations; and
- several reference studies are nationally representative only within a specific
  country and age range.

### 6.2 Reference precedence

When more than one authorized reference matches, precedence is:

1. Exact protocol and endpoint.
2. Exact health-population eligibility.
3. Exact country, or an explicitly authorized multinational reference containing
   that country under a common protocol.
4. Exact region, only where the source publishes and validates a regional stratum.
5. International pooled benchmark, only where this registry explicitly authorizes
   it and the output is labelled international.

Recency does not override better protocol or population fit. No automatic choice
may be made between equally ranked references; the result remains without a
reference until a governance rule resolves the conflict.

## 7. Official reference registry

### 7.1 Selection summary

| Test | Official v1.0 reference decision | Authorized interpretation | Evidence confidence |
| --- | --- | --- | --- |
| Hand Grip Strength | iGRIPS international adult norms as an explicit international benchmark; approved national/regional datasets may take precedence | Published age- and sex-specific percentiles; absolute grip only in v1.0 | High for international benchmark; moderate-to-high for approved regional sources |
| Usual Gait Speed | No universal reference; only exact course-, start-, pace-, and population-specific registry entries | Published percentiles or reference intervals from the matched dataset | Moderate and conditional |
| Four-Meter Walk | NIH Toolbox for the exact U.S. static-start variant; CLSA for the exact Canadian variant | Published age- and sex-specific distributions or percentiles | Moderate; conditional on exact protocol |
| 30-Second Chair Stand | Rikli–Jones/Senior Fitness Test reference for U.S. community-residing adults aged 60–94 under the exact protocol | Published age- and sex-specific percentile range; no fall-risk category | Moderate |
| Standalone 5xSTS | No authorized normative reference | Raw value only; no interpretation | Intentional no-reference decision |
| TUG | CLSA for exact Canadian variant; Tromsø for exact Norwegian variant | Published age- and sex-specific percentiles | Moderate; country- and protocol-specific |
| 6MWT | Locally validated exact-protocol reference first; Casanova multicentre standards only for matching healthy adults and represented settings | Published reference curve or interval; no universal category | Moderate; conditional |
| SPPB | Candidate datasets registered, but no Vitalspan reference interpretation under Phase 6.0B | Raw component observations only; no total or component category through SPPB | Intentional no-reference decision |

### 7.2 Registry status vocabulary

| Status | Meaning |
| --- | --- |
| **Primary** | Preferred reference when every matching condition is met |
| **Conditional** | Authorized only for a named protocol, population, country or region |
| **Benchmark only** | May contextualize a result under its published label, but is not local clinical truth |
| **Candidate** | Scientifically relevant but not authorized for production interpretation in this version |
| **Rejected for this endpoint** | Measures a different endpoint or materially incompatible protocol |
| **No reference** | Deliberate decision to retain raw values without normative interpretation |

### 7.3 Candidate-record completeness rule

The comparison tables in Sections 8–15 combine population, sample size, country,
age, sex, health status, protocol, validation/adoption, strengths, limitations, and
registry decision into compact columns. Where an entry does not identify independent
external validation, none sufficient to establish transportability was located in
this review. Internal model fit, sensitivity analysis, or holdout validation is
reported as such and must not be represented as external validation. Ethnicity is
recorded when the publication reports it; absence or broad aggregation is a stated
transportability limitation, never permission to infer it.

## 8. Hand Grip Strength

### 8.1 Candidate dataset comparison

| Dataset | Population and sample | Protocol and distribution | Adoption / validation | Strengths | Limitations | Registry decision |
| --- | --- | --- | --- | --- | --- | --- |
| Tomkinson et al., iGRIPS, 2025 | 2,405,863 adults; 51.9% female; ages 20–100+; 100 studies; 69 countries/regions across 17 UN subregions | Dynamometry studies from 2000 onward harmonized for method variation; absolute and height-normalized age/sex percentiles | Largest international synthesis; intended for global peer comparison and surveillance ([publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC11863340/)) | Unmatched size, adult age coverage, geographic breadth, published percentile distribution | Mostly non-national samples; input protocol heterogeneity; pseudo-data and harmonization; 69 countries do not represent every population | **Primary international benchmark** for standardized absolute maximum grip; height-normalized interpretation deferred |
| Leong et al., PURE, 2016 | 125,462 healthy adults; ages 35–70; 21 countries; both sexes; urban and rural communities | Jamar dynamometer; age-, sex-, region-, ethnicity-, and body-size analyses | Large prospective international cohort; documented major regional variation ([publication](https://pubmed.ncbi.nlm.nih.gov/27104109/)) | Common protocol and diverse low-, middle-, and high-income settings | Restricted ages; cohort participation is not national representativeness; regional bands remain broad | **Candidate regional corroboration**, not platform default |
| Dodds et al., Great Britain, 2014 | 49,964 participants and 60,803 observations; 26,687 female; ages 4–90; 12 British studies | Mixed dynamometers and seated/standing protocols; sex-age centile curves | Widely cited in sarcopenia and life-course research; sensitivity analyses addressed protocol differences ([publication](https://pubmed.ncbi.nlm.nih.gov/25474696/)) | Large lifespan dataset and mature clinical adoption | Great Britain only; pooled heterogeneous protocols; older data sources | **Conditional British reference** only after exact protocol authorization |
| Mayhew et al., CLSA, 2023 | 23,810 grip participants from a healthy/independent Canadian sample aged 45–85; 48.6% female overall; approximately 90% European ancestry | Dominant hand; Tracker Freedom device; seated, elbow at 90 degrees; three repetitions; maximum; age/sex percentiles | Population weighted; 30% holdout cross-validation repeated in model development ([publication](https://academic.oup.com/ageing/article/52/4/afad054/7127665)) | Large, population-based, transparent protocol, strong internal validation | Canada only; device- and dominant-hand-specific; excludes disability and mobility-aid use | **Conditional Canadian reference** for exact CLSA method |
| Grgic et al., SHARE, 2025 | 58,509 adults aged 50+; 27 European countries; 25,708 men and 32,801 women; community/noninstitutionalized survey | Sitting and standing grip positions reported separately; age/sex/country-region distributions | Large modern European cross-national dataset ([publication](https://link.springer.com/article/10.1007/s11357-025-01919-9)) | Broad European coverage and position-specific reporting | Older adults only; survey participation and country sample differences; not one uniform local norm | **Candidate European registry family** pending protocol-level extraction |

### 8.2 Official selection

iGRIPS is the official international adult **benchmark**, not a claim that all
countries share one physiological norm. It may be used only when:

- the participant is within the published adult age coverage;
- the source-recorded sex matches a published stratum;
- grip was measured by standardized isometric dynamometry;
- the stored endpoint is the protocol-selected maximum absolute grip value;
- device, hand, posture, attempts, and selection rule are complete; and
- the output identifies iGRIPS and its version as an international pooled reference.

Height-normalized iGRIPS values are not authorized in version 1.0 because this phase
does not implement derived measurements and the governing request prohibits
calculations. A future reviewed version may authorize a directly supplied,
auditable normalized endpoint.

Where a versioned national dataset matches the exact country and protocol, it takes
precedence. iGRIPS must not silently replace a missing local reference. A user in an
unrepresented or protocol-incompatible population receives raw grip only.

### 8.3 Interpretation

Authorized: published percentile and reference identity. Blocked: weak/normal/
strong labels, sarcopenia diagnosis, mortality meaning, and cross-device bridging.

## 9. Usual Gait Speed

### 9.1 Candidate dataset comparison

| Dataset | Population and sample | Protocol and distribution | Adoption / validation | Strengths | Limitations | Registry decision |
| --- | --- | --- | --- | --- | --- | --- |
| Bohannon & Andrews, 2011 meta-analysis | 41 articles; 23,111 apparently healthy adults; adult age decades and both sexes | Usual pace over courses ranging approximately 3–30 m; pooled normal values | Widely cited clinical synthesis ([publication](https://pubmed.ncbi.nlm.nih.gov/21820535/)) | Large synthesis and broad age reporting | Major course, start, timing, and study heterogeneity; authors caution against applying to short static-start or turning protocols | **Benchmark candidate only; not an authorized universal reference** |
| Updated systematic review of healthy adults | 51,248 healthy adults across international studies | Normal gait speed summarized by age and sex across heterogeneous protocols | Modern evidence that age and sex matter and protocol variation persists ([publication](https://www.sciencedirect.com/science/article/pii/S1836955322001114)) | Large contemporary synthesis | Heterogeneity prevents exact individual reference matching | **Candidate only** |
| ELSA reference values, 2026 | 7,658 English adults aged 50+ overall; 4,234 women and 3,424 men; nationally representative longitudinal cohort; gait subset aged 60+ | Habitual gait measured over 2.44 m in the home; two attempts; age/sex weighted percentiles | Strong population basis; no independent external validation identified ([publication](https://pubmed.ncbi.nlm.nih.gov/41749014/)) | Modern national percentiles and older-age coverage | Very short course, home surfaces, test-specific complete-case sample smaller than the overall cohort, and not interchangeable with 4 m | **Conditional English 2.44-m variant**, pending protocol registry authorization |
| Multinational Asian pooled cohorts, 2025 | 34,265 adults aged 20+; 16,164 men and 18,101 women; eight cohorts in Japan, Malaysia, and Taiwan | Age/sex centiles for gait and related muscle-health tests | Major regional pooled analysis ([publication](https://pubmed.ncbi.nlm.nih.gov/39971708/)) | Important Asian representation and broad adulthood | Cohort and protocol pooling; not representative of all Asia; country effects may be obscured | **Candidate regional family**, not an Asian fallback |

### 9.2 Official selection and interpretation

There is no official global usual-gait-speed distribution. An authorized future or
current registry entry must match exact distance, static or rolling start, pace
instruction, acceleration/deceleration zones, timing method, surface, footwear,
walking aid, number of trials, and trial-selection rule.

When an exact regional entry matches, its native published percentiles or reference
intervals may be reported. Otherwise the measurement remains raw value only. A
commonly cited gait-speed threshold from frailty or sarcopenia literature is not a
normative substitute.

## 10. Four-Meter Walk

### 10.1 Candidate dataset comparison

| Dataset | Population and sample | Protocol and distribution | Adoption / validation | Strengths | Limitations | Registry decision |
| --- | --- | --- | --- | --- | --- | --- |
| Bohannon & Wang, NIH Toolbox, 2019 | 1,320 U.S. adults aged 18–85, men and women, recruited in 10 geographically dispersed cities | Static-start 4-m walk at usual and maximum pace; age/sex reference values; retest subset of 164 | Part of NIH Toolbox norming evidence ([publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC6363908/)) | Exact 4-m static-start design and broad adult ages | Not a nationally representative probability sample; only fair retest reliability and large detectable change; includes maximal pace as separate endpoint | **Conditional U.S. NIH Toolbox usual-pace reference** |
| Mayhew et al., CLSA, 2023 | 25,302 gait participants; healthy/independent Canadians aged 45–85; 48.6% female overall | One normal-speed 4-m static-start trial; continue beyond finish; age/sex percentiles | Population weighted with holdout cross-validation ([publication](https://academic.oup.com/ageing/article/52/4/afad054/7127665)) | Very large national cohort, exact method, validated percentile modelling | Canada only; healthy/independent selection; single trial differs from preferred NIA two-trial variant; approximately 90% European ancestry | **Conditional Canadian CLSA reference** |
| Tromsø SPPB reference, 2019 | 7,474 community-dwelling Norwegians aged 40+; 53.2% women | SPPB-specific 4-m gait component with age/sex percentile reporting | Large regional cohort ([publication](https://pubmed.ncbi.nlm.nih.gov/31395008/)) | Strong local sample and exact SPPB context | Norway only; SPPB component context; ceiling effects and not necessarily identical to standalone trial selection | **Candidate for SPPB protocol only**, not a standalone fallback |

### 10.2 Official selection

Two distinct references are authorized:

- NIH Toolbox for a record administered under the exact NIH Toolbox usual-pace
  protocol in the covered U.S. adult population; and
- CLSA for a record administered under the exact CLSA one-trial protocol in an
  independently mobile Canadian aged 45–85.

Neither is a global default. Phase 6.0B's preferred NIA/SPPB two-trial, faster-trial
endpoint does not match the CLSA single-trial endpoint and must not inherit CLSA
percentiles. The NIH reference also cannot be used for maximal pace when the record
contains usual pace, or vice versa.

Authorized output is the publication's native age/sex reference distribution or
percentile. No low/average/high label is authorized.

## 11. 30-Second Chair Stand

### 11.1 Candidate dataset comparison

| Dataset | Population and sample | Protocol and distribution | Adoption / validation | Strengths | Limitations | Registry decision |
| --- | --- | --- | --- | --- | --- | --- |
| Rikli & Jones Senior Fitness Test, 1999 | 7,183 community-residing U.S. adults aged 60–94; 5,048 women and 2,135 men; 267 sites in 21 states | 43.2-cm/17-inch armless chair; arms crossed; maximum valid full stands in 30 seconds; age/sex percentile tables | Foundational Senior Fitness Test norms and basis for broad clinical use; no independent external transportability validation identified ([publication](https://doi.org/10.1123/japa.7.2.162); [RehabMeasures summary](https://www.sralab.org/rehabilitation-measures/30-second-sit-stand-test)) | Large test-specific sample, exact protocol, clear age/sex bands | U.S. older adults; historical cohort; community and activity-selection effects; later manual tables derive from the same source sample | **Primary conditional U.S. reference** |
| CDC STEADI | U.S. older-adult clinical fall-prevention program | Exact standardized 30CST protocol and age/sex below-average screening table | High clinical adoption ([CDC assessment sheet](https://www.cdc.gov/steadi/media/pdfs/STEADI-Assessment-30Sec-508.pdf)) | Operational clarity and public-health adoption | Screening interpretation is not a general normative or diagnostic classification; derives from older norms | **Protocol authority; screening labels not authorized** |
| Macfarlane et al., Hong Kong older adults | Community-dwelling Hong Kong Chinese adults aged 60+; sex/age data | 30CST variant with reported age/sex means | Regional validation summarized in the rehabilitation database | Demonstrates population variation | Smaller regional evidence and not a complete internationally validated percentile system | **Candidate Hong Kong reference** |

### 11.2 Official selection

For an exact Rikli–Jones/Senior Fitness Test protocol in a U.S. community-residing
adult aged 60–94, Vitalspan may report the published age- and sex-specific reference
range and reference identity. It must not label a result as a fall-risk diagnosis,
physical dependence, or abnormality.

Chair height, arm use, expiration counting rule, and completion definition are
mandatory. Adults outside the age range and populations outside the authorized U.S.
reference receive raw value only until an exact regional dataset is approved.

## 12. Standalone Five Times Sit-to-Stand

### 12.1 Candidate dataset comparison

| Dataset | Population and sample | Protocol and distribution | Strengths | Limitations | Registry decision |
| --- | --- | --- | --- | --- | --- |
| SHARE pooled European reference, 2025 | 45,470 adults aged 50+ from 14 European countries; population-based cohort; age/sex percentiles | Five chair rises, arms folded, timer stops when fully standing on the fifth rise | Very large, modern, multinational European distribution | Endpoint is fifth standing, not Phase 6.0B standalone return to sitting; chair and cohort variation | **Rejected for standalone 5xSTS endpoint**; candidate for exact chair-component research only ([publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC12972225/)) |
| ELSA, 2026 | 7,658 English adults aged 50+ overall; 4,234 women and 3,424 men; nationally representative; weighted age/sex percentiles | Timer stops at full standing on the fifth rise | Strong national sampling and modern percentiles | Endpoint mismatch; test-specific complete-case sample smaller than the overall cohort; home chair/testing context; cannot be relabelled | **Rejected for standalone endpoint** ([publication](https://pubmed.ncbi.nlm.nih.gov/41749014/)) |
| CLSA, 2023 | 25,046 chair-rise participants; healthy/independent Canadians aged 45–85 | 47-cm chair; timer stops fully standing after the fifth rise | Large, weighted, validated national reference | Endpoint and chair-height mismatch with standalone Phase 6.0B protocol | **Rejected for standalone endpoint** ([publication](https://academic.oup.com/ageing/article/52/4/afad054/7127665)) |
| Bohannon, 2006 descriptive meta-analysis | Older-adult studies summarized by age decade | Five-repetition chair stand across heterogeneous methods | Historically influential | Small heterogeneous studies, inconsistent chair heights and endpoints, limited representativeness | **Candidate only; not authorized** ([publication](https://journals.sagepub.com/doi/10.2466/pms.103.1.215-222)) |

### 12.2 Official selection

**No normative reference is authorized for standalone 5xSTS in version 1.0.0.**

Phase 6.0B defines the endpoint as buttocks contacting the chair after the fifth
full stand. The strongest modern datasets stop at full standing on the fifth rise.
The difference is systematic, not semantic. Vitalspan must retain the raw time and
endpoint identity, report that reference interpretation is unavailable, and never
convert or estimate one endpoint from the other.

## 13. Timed Up and Go

### 13.1 Candidate dataset comparison

| Dataset | Population and sample | Protocol and distribution | Adoption / validation | Strengths | Limitations | Registry decision |
| --- | --- | --- | --- | --- | --- | --- |
| Mayhew et al., CLSA, 2023 | 25,248 TUG participants; independently mobile Canadians aged 45–85; 48.6% female overall | Single trial; rise, walk past 3-m line, turn, return, sit; no pace instruction; age/sex percentiles | Population weighted and holdout cross-validated ([publication](https://academic.oup.com/ageing/article/52/4/afad054/7127665)) | Large, transparent, national reference | Canada only; approximately 90% European ancestry; no pace instruction differs from CDC normal-pace wording | **Conditional Canadian CLSA reference** |
| Svinøy et al., Tromsø Study, 2021 | 5,400 community-dwelling Norwegians aged 60–84; 2,904 women and 2,496 men; includes strata with and without arthritis or non-communicable disease | Original 3-m TUG; 43-cm armchair; regular pace; return to seated; age/sex and disease-status percentiles | Large population-based regional cohort with trained assessment; no independent external validation identified ([publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC7914052/)) | Strong older-adult Norwegian reference and protocol detail | Norway only; restricted age; armrest, chair, instruction, and disease-population stratum must match | **Conditional Norwegian reference** |
| Bohannon, 2006 meta-analysis | 21 studies of apparently healthy adults aged 60+ | Pooled decade-specific descriptive values across TUG variants | Widely cited summary ([publication](https://pubmed.ncbi.nlm.nih.gov/16914068/)) | Broad literature synthesis | Protocol and sample heterogeneity; means and broad bands are not a validated global percentile system | **Candidate only** |
| CDC STEADI TUG threshold | Older adults in fall-assessment workflows | Standard 3-m/10-ft TUG and a screening threshold | High U.S. clinical adoption ([CDC TUG sheet](https://www.cdc.gov/steadi/media/pdfs/STEADI-Assessment-TUG-508.pdf)) | Practical standardized screen | Threshold is not a norm and TUG alone has limited fall-prediction discrimination ([systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC3924230/)) | **Protocol authority; threshold label blocked** |

### 13.2 Official selection

CLSA and Tromsø percentiles are authorized only for their exact country, age,
independence/health population, chair, course, pace instruction, aid status, timing,
and trial protocol. CDC STEADI administration does not automatically match CLSA
because the instructions differ.

TUG remains a mobility test. A percentile must not be described as fall probability,
neurological status, frailty, or treatment need. All unmatched records remain raw
value only.

## 14. Six-Minute Walk Test

### 14.1 Candidate dataset comparison

| Dataset | Population and sample | Protocol and distribution | Adoption / validation | Strengths | Limitations | Registry decision |
| --- | --- | --- | --- | --- | --- | --- |
| Casanova et al., 2011 | 444 healthy, noncompetitive adults, 238 men and 206 women, ages 40–80; 10 centres in Brazil, Chile, Colombia, Spain, Uruguay, the United States, and Venezuela | Two standardized 6MWTs; best distance; age/sex reference curves plus physiologic descriptors | Major international multicentre reference; no independent external transportability validation identified ([publication](https://publications.ersnet.org/content/erj/37/1/150)) | Common protocol, multinational recruitment, age/sex curves | Mostly hospital workers or patients' relatives; only 5% non-White; modest centre samples; large within- and between-country variation; routine use of the pooled prediction model was not recommended | **Conditional multicentre benchmark** only for represented, compatible settings |
| Enright & Sherrill, 1998 | 290 healthy U.S. adults, 117 men and 173 women, ages 40–80 | Standardized corridor walk; age, sex, height, and weight reference relationships | Foundational and widely cited ([publication](https://pubmed.ncbi.nlm.nih.gov/9817683/)) | Transparent healthy-adult reference and long clinical adoption | Older protocol era, modest sample, U.S.-specific, protocol differences from later standards | **Candidate U.S. historical reference** |
| ERS/ATS 2014 systematic review and technical standard | 17 healthy-population reference models reviewed; broad disease and field-test evidence | Standardizes 30-m course, encouragement, repeats, aids, oxygen, and reporting | International professional standard ([systematic review](https://www.thoracic.org/statements/resources/copd/FWT-Syst-Rev.pdf); [technical standard](https://www.thoracic.org/statements/resources/copd/FWT-Tech-Std.pdf)) | Highest protocol authority and explicit analysis of learning and method effects | Demonstrates wide reference variation rather than one global norm; recommends locally verified compatible references | **Governing protocol and selection principle**, not a reference population |
| Otadi & Malmir, 2026 systematic review | 72 older-adult studies across Asia, Europe, the Americas, and Oceania; 28 entered meta-analysis | Pooled mean-distance evidence with subgroup review by age, reported gender, BMI, height, and region | Recent international synthesis; no individual-level external validation ([publication](https://www.sciencedirect.com/science/article/pii/S0167494325002821)) | Broad contemporary map of normative literature and geographic variation | Very high study/protocol heterogeneity; pooled group means do not establish an exact individual reference; countries and methods unevenly represented | **Evidence synthesis only; not an individual reference** |

### 14.2 Official selection

The preferred 6MWT reference is a **locally validated dataset** from the same country
or explicitly defined region, health population, and ERS/ATS-compatible protocol.
It must be added to the versioned registry before use.

Casanova may be used only as an explicitly labelled multicentre benchmark when the
record matches:

- healthy-adult reference eligibility and ages 40–80;
- source-recorded sex;
- height and weight where required by the selected published standard;
- represented country/centre context or an explicitly reviewed transportability
  decision;
- 30-m corridor, standardized encouragement, course and turn configuration;
- practice/repeat policy and selected trial;
- no unrepresented supplemental oxygen or walking-aid condition; and
- completed, supervised Phase 6.0B 6MWT.

The authorized interpretation is a published reference curve or interval. Vitalspan
must not generate a new predicted value, classify mortality or hospitalization
risk, infer VO2max, or substitute a disease-specific prognostic threshold.

## 15. Short Physical Performance Battery

### 15.1 Candidate dataset comparison

| Dataset | Population and sample | Protocol and distribution | Adoption / validation | Strengths | Limitations | Registry decision |
| --- | --- | --- | --- | --- | --- | --- |
| Guralnik et al., EPESE, 1994 | More than 5,000 U.S. community-dwelling adults aged 71+ across established populations | Original balance, gait, and chair components with published SPPB scoring and outcome follow-up | Landmark validation for disability and institutionalization ([publication](https://pubmed.ncbi.nlm.nih.gov/8126356/)) | Foundational clinical validity and outcome prediction | Historical selected older cohort; score categories are instrument/criterion based, not modern age/sex norms | **Validation authority; not a normative reference** |
| Bergland & Strand, Tromsø, 2019 | 7,474 community-dwelling Norwegians aged 40+; 53.2% women | SPPB total, subtests, raw 4-m gait, and chair time; age/sex percentiles | Large regional reference; no independent external transportability validation identified ([publication](https://pubmed.ncbi.nlm.nih.gov/31395008/)) | Detailed modern national/regional distributions | Norway only; substantial ceiling effects; total is an instrument score prohibited by Phase 6.0B | **Candidate only** |
| NSHAP and NHATS U.S. datasets, 2021 | Two nationally representative U.S. older-adult cohorts; NHATS analysis approximately 6,309 and NSHAP older-adult analysis from a larger cohort | Home SPPB variants, including 3-m gait and variable chair/timing conditions | Strong national survey adoption ([publication](https://pmc.ncbi.nlm.nih.gov/articles/PMC8678433/)) | National representativeness and older-adult coverage | Protocol differences between cohorts and from Phase 6.0B; home chair and timing variation | **Candidate only** |
| Yishun Study, Singapore | 538 community-dwelling Singaporeans aged 21–90; 57.8% women | SPPB with 8-ft gait and regional reference reporting | Useful local reference ([study summary](https://www.geri.com.sg/publications/research-publications/sppb-reference-values-and-performance-in-assessing-sarcopenia-in-community-dwelling-singaporeans---yishun-study/)) | Rare Asian lifespan coverage | Small sample and Singapore-specific; 8-ft gait; total score remains prohibited | **Candidate only** |

### 15.2 Official selection

**No SPPB normative interpretation is authorized in version 1.0.0.**

Phase 6.0B accepts raw SPPB component observations but does not authorize Vitalspan
to create, reconstruct, calculate, modify, compare, or interpret an SPPB total.
Accordingly:

- a source-reported official total may remain an external historical artifact with
  its provenance, but Vitalspan does not interpret it;
- SPPB category bands are blocked;
- raw gait or chair observations may obtain interpretation only as independently
  accepted measurements under an exact test-specific reference, never by silently
  borrowing the SPPB total's categories; and
- component endpoint differences, especially fifth-standing chair timing, remain
  explicit.

## 16. Reference matching policy

### 16.1 Universal mandatory fields

Every reference decision requires:

- accepted Phase 6.0B measurement and confidence status;
- test identity and endpoint;
- protocol name and version;
- original and canonical unit;
- date/time of measurement and age at measurement;
- source-recorded sex when used by the reference;
- country and region information at the granularity required by the dataset;
- reference-population compatibility;
- all test-specific protocol and equipment metadata; and
- reference registry, matching-policy, and interpretation-policy versions.

Absence of a required field yields **Measurement Accepted — No Reference**. It must
not be inferred from name, language, device location, account location, or current
residence.

### 16.2 Matching-variable decisions

| Variable | Official requirement | Scientific rationale |
| --- | --- | --- |
| Age | Required within the exact published range and native band or year | Performance changes materially with age; no extrapolation or nearest-band fallback |
| Sex | Required where the reference stratifies by sex; use the source-recorded variable as defined by that dataset | Grip shows large differences and smaller systematic differences can still shift other percentiles; no cross-sex fallback |
| Height | Required only when the selected reference explicitly uses or stratifies by height | Important for 6MWT and some normalized grip references; not a universal adjustment |
| Weight | Required only when the selected reference explicitly uses or stratifies by weight | Relevant to selected 6MWT references; not a default modifier for all tests |
| BMI | Not a default matching variable; allowed only if native to a reviewed reference | BMI cannot replace the separate height and weight variables required by another dataset |
| Ethnicity | Not used as a biological proxy or automatic reference switch | Categories are socially and historically variable; use only if a reviewed dataset explicitly defines, validates, and requires a compatible self-identified variable |
| Country | Mandatory for a country-specific reference | National cohorts are not automatically transportable across borders |
| Region | Mandatory only for an explicitly published and authorized regional stratum | No nearest-region or continent fallback |
| Protocol | Always mandatory | Distance, pace, start, attempts, chair, endpoint, encouragement, and selection rules alter results |
| Equipment | Mandatory where device or dimensions affect comparability | Grip dynamometer, chair height, corridor, timing system, and aids can change the endpoint |
| Health population | Always explicit | Healthy/independent norms must not be applied automatically to clinical, institutionalized, disabled, or aid-using populations, or vice versa |

### 16.3 Additional test-specific requirements

| Test | Required reference-critical metadata |
| --- | --- |
| Grip | Dynamometer model/family, calibration status, handle setting, posture, elbow/wrist position, hand, attempts, rest, encouragement, and selected endpoint |
| Gait / 4 m | Exact distance, static/rolling start, acceleration zone, crossing rule, usual pace wording, surface, footwear, aid, timing method, attempts, and selected trial |
| 30CST | Chair height/type, wall stabilization, arm position/use, full sit/stand criteria, practice, encouragement, expiration rule, and count validity |
| 5xSTS | Chair height, arm use, start posture, pace instruction, endpoint after fifth repetition, attempts, and completion |
| TUG | Chair height/armrests, 3-m/10-ft distance, line-crossing rule, pace instruction, turn, aid, footwear, attempts, and final sitting endpoint |
| 6MWT | Corridor length/shape, lap/turn rule, encouragement, practice/repeat, selected trial, oxygen, walking aid, rests, supervision, and completion |
| SPPB | Official version, component order, balance positions, gait course and trial selection, chair endpoint, and whether any total came from the source |

### 16.4 Prohibited fallback rules

The following are prohibited:

- extrapolating beyond an age range;
- choosing the nearest age band, sex, country, region, ethnicity, or health group;
- treating a continental dataset as local without explicit authorization;
- switching between static and rolling starts, distances, or usual and fast pace;
- switching between a single trial, mean, maximum, faster trial, or other endpoint;
- converting fifth-standing chair norms to fifth-sitting norms;
- applying a no-aid reference to an aid-assisted test;
- applying healthy norms to disease-specific tests or disease norms to general users;
- borrowing SPPB categories for standalone component measurements; or
- using a guideline threshold when a normative reference is missing.

## 17. Interpretation standard

### 17.1 Authorized modes

| Mode | When authorized | Required presentation |
| --- | --- | --- |
| **Published percentile** | Exact reference match and source publishes percentiles | Percentile, reference name/version, population, and limitations |
| **Published reference interval** | Exact match and source publishes an interval | Interval type, reference identity, and population; no invented category |
| **Published reference curve** | Exact 6MWT match and curve is authorized | Reference identity and matching variables; no new prediction model |
| **Raw value only** | Measurement accepted but no exact reference | Test value, protocol, provenance, confidence, and “reference interpretation unavailable” |
| **No interpretation** | Test is intentionally uninterpreted or record fails matching | No percentile, interval, category, threshold, or cross-test claim |

### 17.2 Why percentiles are preferred

Percentiles retain more information than broad categories, respect age- and
sex-specific distributions, and avoid pretending that a small boundary crossing is
a qualitative physiological change. Their limitations must remain visible:

- they depend on the reference population and testing era;
- they do not state health, causality, or prognosis;
- extreme percentiles are less stable, especially in small age/sex strata;
- ceiling and floor effects can compress SPPB and balance distributions; and
- percentile change may reflect measurement error, protocol change, or cohort
  differences rather than biological change.

Vitalspan will expose **percentiles without named performance categories** where
authorized. It will not translate them into Very Poor, Poor, Fair, Average, Good,
Excellent, Superior, or equivalent labels.

### 17.3 Published categories and thresholds

Published diagnostic or screening cut points may be scientifically useful within
their original clinical frameworks. They are not authorized by this normative
standard because:

- EWGSOP2 thresholds contribute to sarcopenia case-finding or severity assessment;
- CDC TUG and chair-stand interpretations contribute to fall-prevention workflows;
- gait and SPPB cut points may be criterion-based for disability, frailty, or
  adverse outcomes; and
- 6MWT thresholds are often disease- and endpoint-specific.

None may be displayed as a general-population norm, a mortality threshold, or a
standalone diagnosis.

## 18. Unsupported populations

Unsupported populations receive **No interpretation**, not fallback interpretation.
Examples include:

- ages outside a publication's range;
- a sex variable unavailable or incompatible with a required stratum;
- countries or regions absent from the authorized reference;
- institutionalized, hospitalized, disease-specific, mobility-limited, or
  aid-using participants when the reference includes only healthy independent
  community dwellers;
- an unrepresented grip device or test posture;
- home or wearable-derived surrogates of an administered test;
- altered course, chair, endpoint, pace, timing, practice, or encouragement; and
- an incomplete or interrupted test.

The platform may state the specific missing or incompatible condition. It must not
describe the person as unclassifiable, abnormal, or healthy merely because the
registry lacks coverage.

## 19. Reference governance

### 19.1 Registry record requirements

Every authorized reference entry must preserve:

- stable reference identifier and version;
- complete publication citation and access date;
- test, endpoint, and protocol identity;
- population, country/region, sampling frame, sample size, age range, published sex
  distribution, ethnicity reporting, health status, exclusions, and setting;
- equipment, course, chair, timing, attempts, and trial-selection method;
- published interpretation type and supported percentile or interval range;
- internal and external validation evidence;
- clinical adoption and evidence grade;
- exact matching fields and exclusions;
- precedence relative to competing references; and
- date, rationale, and reviewers for authorization, amendment, deprecation, or
  withdrawal.

### 19.2 Versioning and reproducibility

Every interpretation must expose:

- `Vitalspan-FC-RS-1.0.0`;
- `Vitalspan-FC-REFERENCE-1.0.0`;
- `Vitalspan-FC-REFERENCE-MATCH-1.0.0`;
- `Vitalspan-FC-INTERPRETATION-1.0.0`;
- the Phase 6.0B measurement/protocol/source/confidence versions; and
- the selected publication and dataset release.

Historical results retain the reference and policy version used at the time. A new
registry version does not silently rewrite an old interpretation. Reinterpretation,
if ever authorized, must create a separate auditable result retaining both versions.

### 19.3 Future update policy

A reference may be added or promoted only after review of:

1. representativeness and sample selection;
2. exact protocol and endpoint compatibility;
3. age/sex coverage and stratum size;
4. country, region, ethnicity, and health-population transportability;
5. equipment and environment;
6. published distributions and uncertainty;
7. internal and external validation;
8. independent clinical or research adoption;
9. conflicts of interest and data accessibility; and
10. whether the change creates a new interpretation mode or calculation.

Full review is required at least every three years, or earlier when a major
international consensus, representative cohort, protocol revision, measurement-
device standard, or material correction appears. Additions are versioned; silent
table replacement is prohibited.

### 19.4 Priority research gaps

Future registry development should prioritize:

- nationally representative, protocol-standardized grip datasets outside heavily
  represented high-income regions;
- exact NIA/SPPB two-trial 4-m gait norms across diverse countries;
- modern 30CST percentiles using the identical 43.2-cm protocol;
- large standalone 5xSTS norms that end after fifth return to sitting;
- harmonized TUG norms with identical chair, instruction, pace, aid, and trial rules;
- locally validated ERS/ATS 6MWT distributions; and
- explicit governance for externally supplied official SPPB totals in a future
  phase, if the governing measurement standard changes.

## 20. Validation summary

The scientific policy is complete only if a later isolated implementation can
demonstrate the following deterministic outcomes. This section specifies expected
behavior; it does not implement it.

| Scenario | Required outcome |
| --- | --- |
| Standardized adult grip with complete iGRIPS-compatible provenance | International percentile eligible; explicitly labelled iGRIPS benchmark |
| Grip with exact authorized Canadian CLSA method and population | CLSA reference takes precedence over international benchmark |
| Grip with unrecorded device or hand-selection rule | Measurement may remain accepted under Phase 6.0B only if allowed there; no reference |
| Exact NIH Toolbox U.S. usual-pace 4-m walk | NIH reference eligible within age range |
| NIA two-trial 4-m walk presented to CLSA single-trial norms | No reference; no trial-selection fallback |
| Exact Rikli–Jones 30CST in a U.S. adult aged 60–94 | Published age/sex reference range eligible; no fall-risk label |
| Standalone fifth-sitting 5xSTS presented to SHARE/ELSA/CLSA fifth-standing norms | No reference; endpoint mismatch reason exposed |
| Exact CLSA TUG in eligible Canadian population | CLSA percentile eligible |
| CDC STEADI TUG presented to CLSA norms | No reference unless an explicit protocol-equivalence review is later versioned |
| Exact Tromsø TUG outside Norway or outside ages 60–84 | No reference; no country or age fallback |
| Exact ERS/ATS 6MWT without a local reference | Raw value only; Casanova used only if every conditional criterion is met |
| 6MWT with oxygen or walking aid absent from the reference | No reference |
| Source-reported official SPPB total | Retained as external artifact only; no Vitalspan interpretation |
| Accepted measurement with no country | No country-specific reference |
| Age outside a reference range | No percentile; no nearest-band mapping |
| Missing required sex stratum | No percentile; no pooled-sex fallback |
| Unsupported region or health population | No interpretation |
| Repeated evaluation with the same record and registry versions | Identical result and reason ordering |
| Registry update | Historical result retains old reference version; new interpretation is separately auditable |

## 21. Scientific limitations

1. Normative distributions describe observed populations, not ideal health and not
   causal determinants of longevity.
2. “Healthy” often means independently mobile or free of selected exclusions; it
   does not mean absence of all disease.
3. High-income countries, European-ancestry participants, and community-dwelling
   older adults remain overrepresented in several major datasets.
4. Sex is usually reported as a binary study variable. The reviewed publications
   generally do not provide validated reference strata for intersex, nonbinary, or
   gender-diverse populations. Missing evidence must lead to no sex-stratified
   interpretation, not inferred assignment.
5. Protocol heterogeneity remains material even when studies use the same test name.
6. Cross-sectional percentiles can reflect cohort, environment, activity, nutrition,
   disease burden, and survival selection as well as biological ageing.
7. Percentile precision at distribution extremes is weaker than near the centre.
8. Internal holdout validation confirms model fit in the source population; it does
   not establish external transportability.
9. Current evidence does not justify converting any test into biological age,
   fitness age, remaining lifespan, or an individual mortality probability.
10. This rapid review should be independently checked before regulated clinical use.

## 22. Final scientific recommendation

### **Production Ready — fail-closed and test-specific**

Phase 6.0C is scientifically ready to serve as Vitalspan's official Functional
Capacity Reference Standard under the following non-negotiable boundaries:

- reference eligibility is separate from measurement acceptance;
- exact test, endpoint, protocol, demographic, geographic, equipment, and health-
  population matching is required;
- iGRIPS is an international Hand Grip Strength benchmark, not universal local
  clinical truth;
- gait, 4-m walk, 30CST, TUG, and 6MWT interpretation is conditional on a named,
  versioned, compatible reference;
- standalone 5xSTS and SPPB remain intentionally uninterpreted in version 1.0.0;
- percentiles or published reference intervals are used without invented category
  labels;
- unsupported populations receive no interpretation and no fallback; and
- no result becomes a score, composite index, diagnosis, mortality threshold,
  biological age, or fitness age.

This recommendation authorizes the scientific standard only. It does not recommend
or authorize production code, calculations, UI, persistence, scoring, or integration.

## 23. Core evidence registry

| Evidence source | Role in this standard |
| --- | --- |
| [Tomkinson et al., international adult grip norms](https://pmc.ncbi.nlm.nih.gov/articles/PMC11863340/) | Primary international Hand Grip Strength benchmark |
| [Leong et al., PURE international grip reference ranges](https://pubmed.ncbi.nlm.nih.gov/27104109/) | Regional variation and transportability evidence |
| [Dodds et al., British life-course grip centiles](https://pubmed.ncbi.nlm.nih.gov/25474696/) | Major national life-course reference |
| [Mayhew et al., CLSA normative values](https://academic.oup.com/ageing/article/52/4/afad054/7127665) | Canadian grip, 4-m gait, TUG, and chair-rise candidate references; endpoint evidence |
| [Bohannon & Wang, NIH Toolbox 4-m gait](https://pmc.ncbi.nlm.nih.gov/articles/PMC6363908/) | U.S. static-start 4-m reference |
| [Bohannon & Andrews, usual gait speed meta-analysis](https://pubmed.ncbi.nlm.nih.gov/21820535/) | Evidence against protocol-free gait norms |
| [Rikli–Jones 30CST evidence summary](https://www.sralab.org/rehabilitation-measures/30-second-sit-stand-test) | U.S. older-adult 30CST reference and protocol evidence |
| [CDC STEADI](https://www.cdc.gov/steadi/hcp/clinical-resources/index.html) | Clinical adoption and screening-versus-norm distinction |
| [ELSA 2026 physical-performance references](https://pubmed.ncbi.nlm.nih.gov/41749014/) | English gait, chair-rise, and grip candidate norms |
| [Multinational Asian muscle-health centiles](https://pubmed.ncbi.nlm.nih.gov/39971708/) | Regional diversity and candidate norms |
| [Tromsø TUG norms](https://pmc.ncbi.nlm.nih.gov/articles/PMC7914052/) | Norwegian TUG reference |
| [TUG fall-risk systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC3924230/) | Evidence against standalone threshold overinterpretation |
| [Casanova et al., seven-country 6MWT standards](https://pubmed.ncbi.nlm.nih.gov/20525717/) | Conditional international 6MWT benchmark |
| [ERS/ATS field-walking systematic review](https://www.thoracic.org/statements/resources/copd/FWT-Syst-Rev.pdf) | 6MWT reference heterogeneity and local-validation principle |
| [ERS/ATS field-walking technical standard](https://www.thoracic.org/statements/resources/copd/FWT-Tech-Std.pdf) | 6MWT protocol authority |
| [Otadi & Malmir, older-adult 6MWT systematic review](https://www.sciencedirect.com/science/article/pii/S0167494325002821) | Recent international normative-literature synthesis and regional heterogeneity |
| [Guralnik et al., original SPPB validation](https://pubmed.ncbi.nlm.nih.gov/8126356/) | SPPB clinical validity, not a global norm |
| [Tromsø SPPB reference values](https://pubmed.ncbi.nlm.nih.gov/31395008/) | Norwegian SPPB candidate reference and ceiling-effect evidence |
| [WHO ICOPE, 2nd edition](https://www.who.int/publications/i/item/9789240103726) | International clinical context and local-adaptation principle |
| [EWGSOP2 consensus](https://academic.oup.com/ageing/article/48/1/16/5126243) | Diagnostic cut-point boundary and regional-population caution |

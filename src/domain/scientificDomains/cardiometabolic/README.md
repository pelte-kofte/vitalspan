# Cardiometabolic Health scientific domain

This isolated Phase 7.0D module converts the approved Phase 7.0A evidence review, Phase 7.0B measurement standard, and Phase 7.0C reference and interpretation standard into deterministic, versioned scientific policy. It is not connected to production ingestion, persistence, APIs, application state, UI, devices, Advisor, Dashboard, Health Overview, Living Sphere, or other scientific domains. Production integration is not authorized before Phase 7.0E.

## Scientific boundary

The module organizes 15 independent identities within Atherogenic Lipids, Glycemic Status, Blood Pressure, and Central Adiposity. It never merges measurements or creates a parent score, composite category, ranking, diagnosis, treatment recommendation, individualized risk prediction, prognosis, biological-age change, or universal optimal range.

Direct and calculated LDL-C, Lp(a) molar and mass, home/office/automated-office BP, and waist circumference/waist-to-height ratio remain separate. Phase 7.0B stable measurement IDs govern. The abbreviated LDL and non-HDL labels appearing in the Phase 7.0C scope table are documentation aliases only and are deliberately not accepted as input identities.

## Decision flow

Each evaluation validates identity, value, unit, timestamps, provenance, verification, source, assay or protocol, required scientific context, derived lineage, and duplicate disposition. A valid original value can remain auditable when interpretation is unavailable. Reference matching is exact and has no regional, population, assay, protocol, unit, setting, or measurement fallback.

Only Phase 7.0C-authorized exact policies can expose informational context for LDL-C, triglycerides, Lp(a), HbA1c, fasting plasma glucose, repeated home BP, repeated multi-occasion office BP, and bounded NICE adult waist-to-height ratio. ApoB, non-HDL-C, HDL-C, automated-office BP, and waist circumference are raw and comparability-qualified trend only.

Safety candidacy is separate from measurement validity, interpretation, diagnosis, alerts, and emergency disposition. The inactive Phase 7.0C candidate policy can identify only the documented repeated-cuff BP, triglyceride, and LDL-C review boundaries. It emits no emergency instruction and defines no glucose safety boundary.

Trend evaluation returns only Comparable, Conditionally Comparable, Not Comparable, or Insufficient Data. It calculates no difference, slope, percentage change, improvement, decline, treatment response, prognosis, or biological-age change.

## Governance

All registries and decisions expose explicit scientific versions and stable ordered reason codes. Original input, source, provider, method, protocol, context, corrections, decisions, authorizations, blocks, and versions remain in the audit result. Confidence is a six-state classification from Phase 7.0B, not a score, and can only be downgraded by incomplete evidence.

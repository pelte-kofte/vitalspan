import type { ScientificComponentRole, ScientificOutputConstruct } from './contracts';

export interface ScientificComponentRolePolicy {
  role: ScientificComponentRole;
  title: string;
  permittedConstructs: readonly ScientificOutputConstruct[];
  mayProduceAgeInYears: boolean;
  mayEnterCombinationReview: boolean;
  mayNumericallyAlterAnotherAgeResult: false;
  policy: string;
}

export const SCIENTIFIC_COMPONENT_ROLE_POLICIES = [
  {
    role: 'primary_age_estimate',
    title: 'Primary Age Estimate',
    permittedConstructs: ['age_in_years'],
    mayProduceAgeInYears: true,
    mayEnterCombinationReview: true,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'A production-validated age model may report its own age-in-years construct. Primary status does not make it whole-person or authorize combination.',
  },
  {
    role: 'independent_age_estimate',
    title: 'Independent Age Estimate',
    permittedConstructs: ['age_in_years'],
    mayProduceAgeInYears: true,
    mayEnterCombinationReview: true,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'A separately validated, versioned age model may report its own age output. Independence, overlap, and compatibility require explicit review.',
  },
  {
    role: 'pace_of_aging_measure',
    title: 'Pace-of-Aging Measure',
    permittedConstructs: ['pace_per_biological_year'],
    mayProduceAgeInYears: false,
    mayEnterCombinationReview: false,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'Pace remains a distinct longitudinal construct and cannot be converted to or combined with age in years without a separately validated model.',
  },
  {
    role: 'validated_risk_modifier',
    title: 'Validated Risk Modifier',
    permittedConstructs: ['risk_estimate', 'percentile', 'normative_deviation'],
    mayProduceAgeInYears: false,
    mayEnterCombinationReview: true,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'A modifier may enter scientific combination review only as part of a separately validated composite. It cannot add or subtract years from an age estimate.',
  },
  {
    role: 'normative_context',
    title: 'Normative Context',
    permittedConstructs: ['percentile', 'normative_deviation', 'context_only'],
    mayProduceAgeInYears: false,
    mayEnterCombinationReview: false,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'Normative standing may be reported separately but cannot be relabeled as age or alter an age result.',
  },
  {
    role: 'interpretive_context',
    title: 'Interpretive Context',
    permittedConstructs: ['context_only', 'proportion', 'risk_estimate'],
    mayProduceAgeInYears: false,
    mayEnterCombinationReview: false,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'Context may explain evidence but cannot contribute a number to biological age.',
  },
  {
    role: 'monitoring_signal',
    title: 'Monitoring Signal',
    permittedConstructs: ['context_only', 'percentile', 'normative_deviation'],
    mayProduceAgeInYears: false,
    mayEnterCombinationReview: false,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'Monitoring signals retain their native meaning and provenance; they do not influence age.',
  },
  {
    role: 'research_only',
    title: 'Research Only',
    permittedConstructs: ['age_in_years', 'pace_per_biological_year', 'percentile', 'risk_estimate', 'normative_deviation', 'proportion', 'context_only'],
    mayProduceAgeInYears: false,
    mayEnterCombinationReview: false,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'Research-only components are retained for audit and cannot execute, combine, or appear as production biological age.',
  },
  {
    role: 'rejected',
    title: 'Rejected',
    permittedConstructs: ['context_only'],
    mayProduceAgeInYears: false,
    mayEnterCombinationReview: false,
    mayNumericallyAlterAnotherAgeResult: false,
    policy: 'Rejected components cannot execute or combine. Related raw observations may remain in their independent health domain.',
  },
] as const satisfies readonly ScientificComponentRolePolicy[];

export function getScientificComponentRolePolicy(
  role: ScientificComponentRole,
): ScientificComponentRolePolicy {
  const policy = SCIENTIFIC_COMPONENT_ROLE_POLICIES.find(candidate => candidate.role === role);
  if (!policy) throw new Error(`Unknown scientific component role: ${role}.`);
  return policy;
}

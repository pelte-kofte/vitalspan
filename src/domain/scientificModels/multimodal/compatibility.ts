import { validateMultimodalComponent } from './validation';
import { getScientificComponentRolePolicy } from './roles';
import type {
  CombinationExclusionReason,
  ComponentPairCompatibilityAssessment,
  MultimodalAvailabilityAssessment,
  MultimodalScientificComponent,
  ScientificCombinationReviewPolicy,
} from './contracts';

function intersection<T extends string>(left: readonly T[], right: readonly T[]): readonly T[] {
  const rightValues = new Set(right);
  return [...new Set(left.filter(value => rightValues.has(value)))].sort();
}

function addReason(
  reasons: CombinationExclusionReason[],
  reason: CombinationExclusionReason,
): void {
  if (!reasons.includes(reason)) reasons.push(reason);
}

function policyMatches(
  left: MultimodalScientificComponent,
  right: MultimodalScientificComponent,
  policy: ScientificCombinationReviewPolicy,
): boolean {
  const direct = policy.componentIds[0] === left.componentId
    && policy.componentIds[1] === right.componentId
    && policy.componentVersions[0] === left.scientificModelVersion
    && policy.componentVersions[1] === right.scientificModelVersion;
  const reverse = policy.componentIds[1] === left.componentId
    && policy.componentIds[0] === right.componentId
    && policy.componentVersions[1] === left.scientificModelVersion
    && policy.componentVersions[0] === right.scientificModelVersion;
  return direct || reverse;
}

function reviewApproved(decision: string | undefined): boolean {
  return decision === 'approved';
}

/**
 * Evaluates scientific compatibility only. It never reads or produces component
 * values and cannot calculate a composite output.
 */
export function assessComponentPairCompatibility(
  left: MultimodalScientificComponent,
  right: MultimodalScientificComponent,
  policy: ScientificCombinationReviewPolicy | null,
): ComponentPairCompatibilityAssessment {
  const reasons: CombinationExclusionReason[] = [];
  const sharedInputIds = intersection(left.overlap.inputIds, right.overlap.inputIds);
  const sharedCorrelationGroups = intersection(
    left.overlap.correlationGroups,
    right.overlap.correlationGroups,
  );
  const sharedTrainingPopulationIds = intersection(
    left.overlap.trainingPopulationIds,
    right.overlap.trainingPopulationIds,
  );
  const sharedOutcomeConstructIds = intersection(
    left.overlap.outcomeConstructIds,
    right.overlap.outcomeConstructIds,
  );

  if (left.componentId === right.componentId) addReason(reasons, 'unknown_evidence');
  if (validateMultimodalComponent(left).length > 0
    || validateMultimodalComponent(right).length > 0) {
    addReason(reasons, 'unknown_evidence');
  }

  [left, right].forEach(component => {
    const role = getScientificComponentRolePolicy(component.role);
    if (!role.mayEnterCombinationReview) addReason(reasons, 'role_prohibited');
    if (component.role === 'pace_of_aging_measure') addReason(reasons, 'construct_incompatible');
    if (component.role === 'research_only' || component.eligibilityStatus === 'research_only'
      || component.combinationEligibility.status === 'research_only') {
      addReason(reasons, 'research_only_component');
    }
    if (component.role === 'rejected') addReason(reasons, 'rejected_component');
    if (component.eligibilityStatus !== 'eligible') addReason(reasons, 'eligibility_not_satisfied');
    if (component.scientificModelVersion === null) addReason(reasons, 'missing_model_version');
    if (component.executionAuthorizationReference === null) addReason(reasons, 'execution_not_authorized');
    if (!['eligible_for_review', 'requires_explicit_review'].includes(component.combinationEligibility.status)) {
      addReason(reasons, component.combinationEligibility.status === 'unknown'
        ? 'unknown_evidence'
        : 'combination_not_authorized');
    }
    if (component.overlap.completeness !== 'complete') addReason(reasons, 'unknown_evidence');
    if (component.measurementWindow.freshness === 'stale') addReason(reasons, 'stale_component');
    if (component.measurementWindow.freshness === 'unknown') addReason(reasons, 'measurement_window_unknown');
    if (component.populationApplicability.status === 'unsupported') addReason(reasons, 'population_mismatch');
    if (component.populationApplicability.status === 'unknown') addReason(reasons, 'population_unknown');
    if (!component.governance.completedStages.includes('independent_verification')) {
      addReason(reasons, 'independent_validation_missing');
    }
    component.dependencySet.forEach(dependency => {
      if (dependency.status === 'unavailable') addReason(reasons, 'calibration_unavailable');
      if (dependency.status === 'unknown' || dependency.version === null) addReason(reasons, 'unknown_evidence');
    });
  });

  if (left.populationApplicability.populationKey === null
    || right.populationApplicability.populationKey === null) {
    addReason(reasons, 'population_unknown');
  } else if (left.populationApplicability.populationKey
    !== right.populationApplicability.populationKey) {
    addReason(reasons, 'population_mismatch');
  }

  const matchedPolicy = policy !== null && policyMatches(left, right, policy) ? policy : null;
  if (!matchedPolicy) {
    addReason(reasons, 'scientific_review_incomplete');
    addReason(reasons, 'combination_not_authorized');
    addReason(reasons, 'measurement_window_unknown');
  } else {
    if (!reviewApproved(matchedPolicy.constructCompatibility)) {
      addReason(reasons, 'construct_incompatible');
    }
    if (!reviewApproved(matchedPolicy.unitCompatibilityReview)) {
      addReason(reasons, 'unit_incompatible');
    }
    if (sharedInputIds.length > 0 && !reviewApproved(matchedPolicy.sharedBiomarkerReview)) {
      addReason(reasons, 'shared_biomarkers_unresolved');
    }
    if (sharedTrainingPopulationIds.length > 0
      && !reviewApproved(matchedPolicy.sharedTrainingPopulationReview)) {
      addReason(reasons, 'shared_training_population_unresolved');
    }
    if (sharedOutcomeConstructIds.length > 0
      && !reviewApproved(matchedPolicy.outcomeOverlapReview)) {
      addReason(reasons, 'outcome_overlap_unresolved');
    }
    if ((sharedInputIds.length > 0 || sharedTrainingPopulationIds.length > 0
      || sharedOutcomeConstructIds.length > 0 || sharedCorrelationGroups.length > 0)
      && !reviewApproved(matchedPolicy.doubleCountingReview)) {
      addReason(reasons, 'double_counting_risk_unresolved');
    }
    if (sharedCorrelationGroups.length > 0 && !reviewApproved(matchedPolicy.correlationReview)) {
      addReason(reasons, 'correlation_risk_unresolved');
    }
    if (!reviewApproved(matchedPolicy.populationCompatibilityReview)) {
      addReason(reasons, 'population_unknown');
    }
    if (!reviewApproved(matchedPolicy.versionCompatibilityReview)) {
      addReason(reasons, 'version_incompatible');
    }
    if (!reviewApproved(matchedPolicy.independentValidationReview)) {
      addReason(reasons, 'independent_validation_missing');
    }
    if (matchedPolicy.calibrationAvailability === 'unavailable') {
      addReason(reasons, 'calibration_unavailable');
    } else if (matchedPolicy.calibrationAvailability === 'unknown') {
      addReason(reasons, 'unknown_evidence');
    }
    if (matchedPolicy.missingDataPolicy !== 'never_impute') {
      addReason(reasons, 'missing_data_policy_unsupported');
    }
    if (!reviewApproved(matchedPolicy.scientificReviewDecision)) {
      addReason(reasons, 'scientific_review_incomplete');
    }
    if (!matchedPolicy.combinationAuthorizationReference?.trim()) {
      addReason(reasons, 'combination_not_authorized');
    }

    const leftEnd = left.measurementWindow.end === null
      ? Number.NaN : Date.parse(left.measurementWindow.end);
    const rightEnd = right.measurementWindow.end === null
      ? Number.NaN : Date.parse(right.measurementWindow.end);
    if (!Number.isFinite(leftEnd) || !Number.isFinite(rightEnd)
      || matchedPolicy.maximumAlignmentWindowDays === null) {
      addReason(reasons, 'measurement_window_unknown');
    } else if (!Number.isFinite(matchedPolicy.maximumAlignmentWindowDays)
      || matchedPolicy.maximumAlignmentWindowDays < 0
      || Math.abs(leftEnd - rightEnd) > matchedPolicy.maximumAlignmentWindowDays * 86_400_000) {
      addReason(reasons, 'measurement_window_misaligned');
    }
  }

  const status = reasons.length === 0
    ? 'compatible_for_authorized_research'
    : reasons.every(reason => reason === 'unknown_evidence'
      || reason === 'measurement_window_unknown'
      || reason === 'scientific_review_incomplete'
      || reason === 'combination_not_authorized')
      ? 'unknown'
      : 'incompatible';
  return {
    componentIds: [left.componentId, right.componentId],
    status,
    blockingReasons: reasons,
    sharedInputIds,
    sharedCorrelationGroups,
    sharedTrainingPopulationIds,
    sharedOutcomeConstructIds,
    policyId: matchedPolicy?.policyId ?? null,
    combinationAuthorizationReference: reasons.length === 0
      ? matchedPolicy?.combinationAuthorizationReference ?? null
      : null,
    explanation: reasons.length === 0
      ? 'Both versioned components passed explicit construct, overlap, temporal, population, validation, and authorization review for research compatibility.'
      : `Combination is withheld: ${reasons.join(', ')}.`,
  };
}

function isValidatedAgeComponent(component: MultimodalScientificComponent): boolean {
  return ['primary_age_estimate', 'independent_age_estimate'].includes(component.role)
    && component.output.construct === 'age_in_years'
    && component.output.unit === 'years'
    && component.eligibilityStatus === 'eligible'
    && component.executionAuthorizationReference !== null
    && component.scientificModelVersion !== null
    && component.governance.completedStages.includes('independent_verification')
    && validateMultimodalComponent(component).length === 0;
}

export function assessMultimodalAvailability(
  components: readonly MultimodalScientificComponent[],
  pairAssessments: readonly ComponentPairCompatibilityAssessment[] = [],
): MultimodalAvailabilityAssessment {
  const validatedAge = components.filter(isValidatedAgeComponent);
  const context = components.filter(component => [
    'normative_context', 'interpretive_context', 'monitoring_signal',
  ].includes(component.role));
  const research = components.filter(component => component.role === 'research_only'
    || component.role === 'pace_of_aging_measure'
    || component.eligibilityStatus === 'research_only');

  if (validatedAge.length > 1) {
    const requiredPairCount = validatedAge.length * (validatedAge.length - 1) / 2;
    const compatiblePairs = pairAssessments.filter(assessment => assessment.status
      === 'compatible_for_authorized_research');
    const allCompatible = compatiblePairs.length === requiredPairCount;
    return {
      state: allCompatible
        ? 'multiple_compatible_models_available'
        : 'multiple_incompatible_models_available',
      validatedAgeComponentIds: validatedAge.map(component => component.componentId),
      contextComponentIds: context.map(component => component.componentId),
      researchComponentIds: research.map(component => component.componentId),
      multimodalAgeAvailable: allCompatible,
      explanation: allCompatible
        ? 'Multiple independently validated age models have explicit pairwise scientific compatibility authorization; no composite calculation is defined here.'
        : 'Multiple age models are present but complete pairwise compatibility authorization is absent.',
      blockingReasons: allCompatible
        ? []
        : [...new Set(pairAssessments.flatMap(assessment => assessment.blockingReasons)
          .concat('combination_not_authorized'))],
    };
  }
  if (validatedAge.length === 1) {
    return {
      state: 'single_validated_model_available',
      validatedAgeComponentIds: [validatedAge[0].componentId],
      contextComponentIds: context.map(component => component.componentId),
      researchComponentIds: research.map(component => component.componentId),
      multimodalAgeAvailable: false,
      explanation: 'One validated age model is available. Its output remains model-specific and cannot be labeled Multimodal Biological Age.',
      blockingReasons: ['combination_not_authorized'],
    };
  }
  if (context.length > 0) {
    return {
      state: 'context_available_without_additional_model',
      validatedAgeComponentIds: [],
      contextComponentIds: context.map(component => component.componentId),
      researchComponentIds: research.map(component => component.componentId),
      multimodalAgeAvailable: false,
      explanation: 'Interpretive or monitoring context exists without an additional validated age model.',
      blockingReasons: ['eligibility_not_satisfied'],
    };
  }
  if (research.length > 0) {
    return {
      state: 'research_preview_only',
      validatedAgeComponentIds: [],
      contextComponentIds: [],
      researchComponentIds: research.map(component => component.componentId),
      multimodalAgeAvailable: false,
      explanation: 'Only research evidence is present; production multimodal use is prohibited.',
      blockingReasons: ['research_only_component'],
    };
  }
  return {
    state: 'insufficient_scientific_evidence',
    validatedAgeComponentIds: [],
    contextComponentIds: [],
    researchComponentIds: [],
    multimodalAgeAvailable: false,
    explanation: 'No validated age component or supported scientific context is available.',
    blockingReasons: ['unknown_evidence'],
  };
}

export type ScientificBaselineDomainId =
  | 'clinical_biological_age'
  | 'cardiorespiratory_fitness'
  | 'functional_capacity'
  | 'cardiometabolic_health';

export type ScientificBaselineComponentKind =
  | 'scientific_specification'
  | 'measurement_registry'
  | 'test_registry'
  | 'protocol_registry'
  | 'assay_method_registry'
  | 'source_registry'
  | 'confidence_registry'
  | 'validation_policy'
  | 'eligibility_policy'
  | 'reference_registry'
  | 'reference_matching_policy'
  | 'interpretation_policy'
  | 'reason_registry'
  | 'population_matching_policy'
  | 'safety_policy'
  | 'trend_comparability_policy'
  | 'coefficient_registry'
  | 'normalization_contract'
  | 'implementation';

export interface ScientificBaselineComponent {
  componentId: string;
  kind: ScientificBaselineComponentKind;
  version: string;
}

export interface ScientificBaselineDomain {
  domainId: ScientificBaselineDomainId;
  displayName: string;
  domainStatus: 'validated_production_active' | 'validated_production_inactive';
  productionActivationState: 'active' | 'inactive';
  productionActivationAuthority: string;
  components: readonly ScientificBaselineComponent[];
  componentsNotSeparatelyVersioned: readonly ScientificBaselineComponentKind[];
  componentsNotApplicable: readonly ScientificBaselineComponentKind[];
  inputPolicyId?: string;
  coefficientFingerprint: string | null;
  referenceDataFingerprint: string | null;
  testSuites: readonly string[];
  testCountAtSourceCommit: number;
  governanceResultAtSourceCommit: 'pass';
}

const component = (
  domainId: ScientificBaselineDomainId,
  kind: ScientificBaselineComponentKind,
  version: string,
): ScientificBaselineComponent => ({
  componentId: `${domainId}:${kind}`,
  kind,
  version,
});

const componentKinds = (
  ...kinds: ScientificBaselineComponentKind[]
): readonly ScientificBaselineComponentKind[] => Object.freeze(kinds);

export const SCIENTIFIC_BASELINE_ID = 'scientific-baseline-v1.0.0' as const;
export const SCIENTIFIC_BASELINE_VERSION = '1.0.0' as const;

export const SCIENTIFIC_BASELINE_V1_0 = Object.freeze({
  baselineId: SCIENTIFIC_BASELINE_ID,
  baselineVersion: SCIENTIFIC_BASELINE_VERSION,
  createdOn: '2026-07-19',
  repository: Object.freeze({
    sourceScientificCommitSha: '7b7b4bea1008a1b31b6d209d55debdfd608719e9',
    branch: 'main',
    sourceScientificCommitPushedAtPreparation: false,
    workingTreeCleanAtPreparation: true,
  }),
  verificationAtSourceCommit: Object.freeze({
    overallTestCount: 611,
    overallSuiteCount: 33,
    typescriptStatus: 'pass' as const,
    governanceAuditStatus: 'pass' as const,
  }),
  productionIntegrationStatus: 'clinical_phenoage_active_other_frozen_domains_inactive' as const,
  baselineActivationStatus: 'prepared_not_activated' as const,
  activationRequires: Object.freeze([
    'Baseline changes committed with the approved commit message.',
    'Baseline commit pushed and working tree clean.',
    'All verification gates repeated against the baseline commit.',
    'Annotated scientific-baseline-v1.0.0 tag created only after approval.',
  ]),
  parentScientificScoreRepresented: false,
  crossDomainCompositeRepresented: false,
  runtimeScientificFallbackAuthorized: false,
  domains: Object.freeze([
    Object.freeze({
      domainId: 'clinical_biological_age',
      displayName: 'Clinical Biological Age / Clinical PhenoAge',
      domainStatus: 'validated_production_active',
      productionActivationState: 'active',
      productionActivationAuthority: 'Clinical PhenoAge v1.0.0 production cutover',
      components: Object.freeze([
        component('clinical_biological_age', 'scientific_specification', 'clinical-phenoage/1.0.0'),
        component('clinical_biological_age', 'measurement_registry', 'clinical-phenoage-canonical-units/1.0.0'),
        component('clinical_biological_age', 'validation_policy', 'clinical-phenoage-canonical-units/1.0.0'),
        component('clinical_biological_age', 'eligibility_policy', 'clinical-phenoage/1.0.0'),
        component('clinical_biological_age', 'coefficient_registry', 'clinical-phenoage-coefficients/1.0.0'),
        component('clinical_biological_age', 'normalization_contract', 'clinical-phenoage-canonical-units/1.0.0'),
        component('clinical_biological_age', 'implementation', 'vitalspan-clinical-phenoage/1.0.0'),
      ]),
      componentsNotSeparatelyVersioned: componentKinds(
        'source_registry', 'confidence_registry', 'reference_registry',
        'interpretation_policy', 'reason_registry',
      ),
      componentsNotApplicable: componentKinds(
        'test_registry', 'protocol_registry', 'assay_method_registry',
        'reference_matching_policy', 'population_matching_policy', 'safety_policy',
        'trend_comparability_policy',
      ),
      inputPolicyId: 'clinical_phenoage_complete_visit',
      coefficientFingerprint: '26d3842b55885598405ae13ae1d058c6403f11a049063d1c565c031f3e5ac4dc',
      referenceDataFingerprint: '41e3247c2bf6ad0e6403a431ac54f4aa4cb90dfe09068a38fcca7084220bfa05',
      testSuites: Object.freeze([
        'src/__tests__/clinicalPhenoAgeCalculation.test.ts',
        'src/__tests__/clinicalPhenoAgeScientificValidation.test.ts',
        'src/__tests__/clinicalPhenoAgeProductCutover.test.ts',
      ]),
      testCountAtSourceCommit: 88,
      governanceResultAtSourceCommit: 'pass',
    }),
    Object.freeze({
      domainId: 'cardiorespiratory_fitness',
      displayName: 'Cardiorespiratory Fitness / VO₂max',
      domainStatus: 'validated_production_inactive',
      productionActivationState: 'inactive',
      productionActivationAuthority: 'Phase 5.0D prohibits production integration',
      components: Object.freeze([
        component('cardiorespiratory_fitness', 'scientific_specification', 'vo2max-domain/1.0.0'),
        component('cardiorespiratory_fitness', 'source_registry', 'vo2max-source-registry/1.0.0'),
        component('cardiorespiratory_fitness', 'confidence_registry', 'vo2max-confidence-registry/1.0.0'),
        component('cardiorespiratory_fitness', 'validation_policy', 'vo2max-eligibility-policy/1.0.0'),
        component('cardiorespiratory_fitness', 'eligibility_policy', 'vo2max-eligibility-policy/1.0.0'),
        component('cardiorespiratory_fitness', 'reference_registry', 'vo2max-reference-registry/1.0.0'),
        component('cardiorespiratory_fitness', 'interpretation_policy', 'vo2max-percentile-policy/1.0.0'),
        component('cardiorespiratory_fitness', 'reason_registry', 'vo2max-eligibility-policy/1.0.0'),
      ]),
      componentsNotSeparatelyVersioned: componentKinds('measurement_registry', 'reason_registry'),
      componentsNotApplicable: componentKinds(
        'test_registry', 'protocol_registry', 'assay_method_registry',
        'reference_matching_policy', 'population_matching_policy', 'safety_policy',
        'trend_comparability_policy', 'coefficient_registry', 'normalization_contract', 'implementation',
      ),
      coefficientFingerprint: null,
      referenceDataFingerprint: null,
      testSuites: Object.freeze(['src/__tests__/vo2maxScientificDomain.test.ts']),
      testCountAtSourceCommit: 63,
      governanceResultAtSourceCommit: 'pass',
    }),
    Object.freeze({
      domainId: 'functional_capacity',
      displayName: 'Functional Capacity',
      domainStatus: 'validated_production_inactive',
      productionActivationState: 'inactive',
      productionActivationAuthority: 'Phase 6.0D prohibits production integration',
      components: Object.freeze([
        component('functional_capacity', 'scientific_specification', 'functional-' + 'capacity-domain/1.0.0'),
        component('functional_capacity', 'measurement_registry', 'functional-capacity-test-registry/1.0.0'),
        component('functional_capacity', 'test_registry', 'functional-capacity-test-registry/1.0.0'),
        component('functional_capacity', 'protocol_registry', 'functional-capacity-protocol-registry/1.0.0'),
        component('functional_capacity', 'source_registry', 'functional-capacity-source-registry/1.0.0'),
        component('functional_capacity', 'confidence_registry', 'functional-capacity-confidence-registry/1.0.0'),
        component('functional_capacity', 'validation_policy', 'functional-capacity-validation-policy/1.0.0'),
        component('functional_capacity', 'eligibility_policy', 'functional-capacity-eligibility-policy/1.0.0'),
        component('functional_capacity', 'reference_registry', 'functional-capacity-reference-registry/1.0.0'),
        component('functional_capacity', 'reference_matching_policy', 'functional-capacity-reference-matching-policy/1.0.0'),
        component('functional_capacity', 'interpretation_policy', 'functional-capacity-interpretation-policy/1.0.0'),
        component('functional_capacity', 'reason_registry', 'functional-capacity-eligibility-policy/1.0.0'),
        component('functional_capacity', 'trend_comparability_policy', 'functional-capacity-trend-comparison-policy/1.0.0'),
      ]),
      componentsNotSeparatelyVersioned: componentKinds('reason_registry'),
      componentsNotApplicable: componentKinds(
        'assay_method_registry', 'population_matching_policy', 'safety_policy',
        'coefficient_registry', 'normalization_contract', 'implementation',
      ),
      coefficientFingerprint: null,
      referenceDataFingerprint: null,
      testSuites: Object.freeze(['src/__tests__/functional' + 'CapacityScientificDomain.test.ts']),
      testCountAtSourceCommit: 35,
      governanceResultAtSourceCommit: 'pass',
    }),
    Object.freeze({
      domainId: 'cardiometabolic_health',
      displayName: 'Cardiometabolic Health',
      domainStatus: 'validated_production_inactive',
      productionActivationState: 'inactive',
      productionActivationAuthority: 'Phase 7.0D prohibits production integration before Phase 7.0E',
      components: Object.freeze([
        component('cardiometabolic_health', 'scientific_specification', 'Vitalspan-CMH-DOMAIN-1.0.0'),
        component('cardiometabolic_health', 'measurement_registry', 'Vitalspan-CMH-MEASUREMENT-1.0.0'),
        component('cardiometabolic_health', 'protocol_registry', 'Vitalspan-CMH-PROTOCOL-1.0.0'),
        component('cardiometabolic_health', 'assay_method_registry', 'Vitalspan-CMH-ASSAY-1.0.0'),
        component('cardiometabolic_health', 'source_registry', 'Vitalspan-CMH-SOURCE-1.0.0'),
        component('cardiometabolic_health', 'confidence_registry', 'Vitalspan-CMH-CONFIDENCE-1.0.0'),
        component('cardiometabolic_health', 'validation_policy', 'Vitalspan-CMH-VALIDATION-1.0.0'),
        component('cardiometabolic_health', 'eligibility_policy', 'Vitalspan-CMH-ELIGIBILITY-1.0.0'),
        component('cardiometabolic_health', 'reference_registry', 'CMH-RR-1.0.0'),
        component('cardiometabolic_health', 'interpretation_policy', 'CMH-IPR-1.0.0'),
        component('cardiometabolic_health', 'reason_registry', 'Vitalspan-CMH-REASON-1.0.0'),
        component('cardiometabolic_health', 'population_matching_policy', 'CMH-PMP-1.0.0'),
        component('cardiometabolic_health', 'safety_policy', 'CMH-SBP-0.1.0-inactive'),
        component('cardiometabolic_health', 'trend_comparability_policy', 'CMH-TCP-1.0.0'),
      ]),
      componentsNotSeparatelyVersioned: componentKinds(),
      componentsNotApplicable: componentKinds(
        'test_registry', 'reference_matching_policy', 'coefficient_registry',
        'normalization_contract', 'implementation',
      ),
      coefficientFingerprint: null,
      referenceDataFingerprint: null,
      testSuites: Object.freeze(['src/__tests__/cardiometabolicScientificDomain.test.ts']),
      testCountAtSourceCommit: 42,
      governanceResultAtSourceCommit: 'pass',
    }),
  ] satisfies readonly ScientificBaselineDomain[]),
  freezePolicy: Object.freeze({
    changeProposalRequired: true,
    changeClassifications: Object.freeze([
      'editorial',
      'non_behavioral_implementation',
      'backward_compatible_scientific_revision',
      'breaking_scientific_revision',
      'emergency_scientific_correction',
    ]),
    behavioralChangeRequiresVersionIncrement: true,
    registryChangeRequiresRegistryVersionIncrement: true,
    referenceChangeRequiresReferenceVersionIncrement: true,
    interpretationChangeRequiresPolicyVersionIncrement: true,
    coefficientChangeRequiresNewFingerprint: true,
    emergencyCorrectionRequiresAuditNoteAndRegressionEvidence: true,
    productionMayRedefineScientificOutput: false,
    uiMayAlterScientificStatus: false,
    aiMayMakeScientificDecisions: false,
    unmatchedResultFallbackAllowed: false,
  }),
});

export interface ScientificBaselineGovernanceAudit {
  valid: boolean;
  issues: readonly string[];
  domainIds: readonly ScientificBaselineDomainId[];
  componentIds: readonly string[];
}

function duplicateValues(values: readonly string[]): readonly string[] {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function auditScientificBaselineV1(): ScientificBaselineGovernanceAudit {
  const issues: string[] = [];
  const domainIds = SCIENTIFIC_BASELINE_V1_0.domains.map(domain => domain.domainId);
  const components = SCIENTIFIC_BASELINE_V1_0.domains.flatMap(domain => domain.components);
  const componentIds = components.map(item => item.componentId);

  duplicateValues(domainIds).forEach(id => issues.push(`Duplicate baseline domain ID: ${id}.`));
  duplicateValues(componentIds).forEach(id => issues.push(`Duplicate baseline component ID: ${id}.`));
  components.forEach(item => {
    if (item.version.trim().length === 0) issues.push(`Empty version identifier: ${item.componentId}.`);
  });
  if (SCIENTIFIC_BASELINE_V1_0.domains.length !== 4) issues.push('The baseline must contain exactly four frozen domains.');
  if (SCIENTIFIC_BASELINE_V1_0.parentScientificScoreRepresented) issues.push('A parent scientific score is prohibited.');
  if (SCIENTIFIC_BASELINE_V1_0.crossDomainCompositeRepresented) issues.push('A cross-domain composite is prohibited.');
  const cardiometabolic = SCIENTIFIC_BASELINE_V1_0.domains.find(domain => domain.domainId === 'cardiometabolic_health');
  const safety = cardiometabolic?.components.find(item => item.kind === 'safety_policy');
  if (cardiometabolic?.productionActivationState !== 'inactive' || !safety?.version.endsWith('-inactive')) {
    issues.push('Cardiometabolic production or safety policy is unexpectedly active.');
  }
  return { valid: issues.length === 0, issues, domainIds, componentIds };
}

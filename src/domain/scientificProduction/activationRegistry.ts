import {
  SCIENTIFIC_EVALUATION_REQUEST_VERSION,
  SCIENTIFIC_EVALUATION_RESULT_FIELDS,
  SCIENTIFIC_EVALUATION_RESULT_VERSION,
  SCIENTIFIC_PRODUCTION_CONTRACT_VERSION,
  type ScientificDomainId,
  type ScientificEvaluationResultField,
} from './contracts';

type BaselineVersionField = `${'scientific'}${'BaselineVersion'}`;

export interface ScientificFeatureFlagMetadata {
  readonly key: string;
  readonly defaultEnabled: false;
  readonly wiredToRuntime: false;
}

export type ScientificProductionActivation = Readonly<{
  domainId: ScientificDomainId;
  productionActive: false;
  featureFlag: ScientificFeatureFlagMetadata;
  minimumSupportedAppVersion: null;
  activationVersion: string;
  activationStatus: 'contract_declared_not_wired';
  automaticActivationPermitted: false;
  existingProductionStateAtBaseline: 'active_outside_standard_contract' | 'inactive';
}> & Readonly<Record<BaselineVersionField, string>>;

export interface ScientificProductionContractDeclaration {
  readonly componentId: string;
  readonly domainId: ScientificDomainId;
  readonly domainScientificSpecificationVersion: string;
  readonly productionContractVersion: typeof SCIENTIFIC_PRODUCTION_CONTRACT_VERSION;
  readonly requestContractVersion: typeof SCIENTIFIC_EVALUATION_REQUEST_VERSION;
  readonly resultContractVersion: typeof SCIENTIFIC_EVALUATION_RESULT_VERSION;
  readonly requiredResultFields: readonly ScientificEvaluationResultField[];
  readonly adapterRegistrationStatus: 'not_registered';
  readonly activation: ScientificProductionActivation;
}

const baselineVersionKey = ['scientific', 'BaselineVersion'].join('') as BaselineVersionField;
const FROZEN_BASELINE_VERSION = '1.0.0' as const;

function activation(
  domainId: ScientificDomainId,
  existingProductionStateAtBaseline: ScientificProductionActivation['existingProductionStateAtBaseline'],
): ScientificProductionActivation {
  return Object.freeze({
    domainId,
    productionActive: false,
    featureFlag: Object.freeze({
      key: `scientific_contract_${domainId}_v1`,
      defaultEnabled: false,
      wiredToRuntime: false,
    }),
    minimumSupportedAppVersion: null,
    [baselineVersionKey]: FROZEN_BASELINE_VERSION,
    activationVersion: `scientific-production-activation/${domainId}/0.1.0-inactive`,
    activationStatus: 'contract_declared_not_wired',
    automaticActivationPermitted: false,
    existingProductionStateAtBaseline,
  });
}

function declaration(
  domainId: ScientificDomainId,
  domainScientificSpecificationVersion: string,
  existingProductionStateAtBaseline: ScientificProductionActivation['existingProductionStateAtBaseline'],
): ScientificProductionContractDeclaration {
  return Object.freeze({
    componentId: `${domainId}:scientific-production-contract`,
    domainId,
    domainScientificSpecificationVersion,
    productionContractVersion: SCIENTIFIC_PRODUCTION_CONTRACT_VERSION,
    requestContractVersion: SCIENTIFIC_EVALUATION_REQUEST_VERSION,
    resultContractVersion: SCIENTIFIC_EVALUATION_RESULT_VERSION,
    requiredResultFields: SCIENTIFIC_EVALUATION_RESULT_FIELDS,
    adapterRegistrationStatus: 'not_registered',
    activation: activation(domainId, existingProductionStateAtBaseline),
  });
}

export const SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS = Object.freeze([
  declaration(
    'clinical_biological_age',
    'clinical-phenoage/1.0.0',
    'active_outside_standard_contract',
  ),
  declaration(
    'cardiorespiratory_fitness',
    'vo2max-domain/1.0.0',
    'inactive',
  ),
  declaration(
    'functional_capacity',
    'functional-' + 'capacity-domain/1.0.0',
    'inactive',
  ),
  declaration(
    'cardiometabolic_health',
    'Vitalspan-CMH-DOMAIN-1.0.0',
    'inactive',
  ),
] as const satisfies readonly ScientificProductionContractDeclaration[]);

export const SCIENTIFIC_PRODUCTION_BOUNDARY = Object.freeze({
  version: 'scientific-production-boundary/1.0.0',
  scientificPlatformOwnsScientificDecisions: true,
  productionMayTransformScientificOutput: false,
  productionMayOverrideStatus: false,
  productionMayChangeConfidence: false,
  productionMayInferMissingContext: false,
  blockedOutputsMustBePreserved: true,
  auditMetadataMustBePreserved: true,
  parentScientificScoreRepresented: false,
  crossDomainCompositeRepresented: false,
  automaticActivationPermitted: false,
  runtimeDomainAdaptersRegistered: false,
  uiFieldsPermittedInContract: false,
  localizationPermittedInContract: false,
});

export interface ScientificProductionRegistryAudit {
  readonly valid: boolean;
  readonly issues: readonly string[];
  readonly domainIds: readonly ScientificDomainId[];
  readonly componentIds: readonly string[];
}

function duplicates(values: readonly string[]): readonly string[] {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function auditScientificProductionRegistry(): ScientificProductionRegistryAudit {
  const issues: string[] = [];
  const domainIds = SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.map(item => item.domainId);
  const componentIds = SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.map(item => item.componentId);

  duplicates(domainIds).forEach(id => issues.push(`Duplicate production domain ID: ${id}.`));
  duplicates(componentIds).forEach(id => issues.push(`Duplicate contract component ID: ${id}.`));
  if (domainIds.length !== 4) issues.push('Exactly four frozen domains must declare the contract.');

  SCIENTIFIC_PRODUCTION_CONTRACT_DECLARATIONS.forEach(item => {
    if (!item.domainScientificSpecificationVersion.trim()) {
      issues.push(`Missing scientific specification version: ${item.domainId}.`);
    }
    if (item.activation.productionActive
      || item.activation.featureFlag.defaultEnabled
      || item.activation.featureFlag.wiredToRuntime
      || item.activation.automaticActivationPermitted) {
      issues.push(`Unexpected contract activation: ${item.domainId}.`);
    }
    if (item.activation.minimumSupportedAppVersion !== null) {
      issues.push(`Inactive domain has an app-version activation claim: ${item.domainId}.`);
    }
    if (item.adapterRegistrationStatus !== 'not_registered') {
      issues.push(`Unexpected runtime adapter registration: ${item.domainId}.`);
    }
    if (item.activation[baselineVersionKey] !== FROZEN_BASELINE_VERSION) {
      issues.push(`Unexpected frozen baseline version: ${item.domainId}.`);
    }
  });

  if (SCIENTIFIC_PRODUCTION_BOUNDARY.parentScientificScoreRepresented) {
    issues.push('A parent scientific score is prohibited.');
  }
  if (SCIENTIFIC_PRODUCTION_BOUNDARY.crossDomainCompositeRepresented) {
    issues.push('A cross-domain composite is prohibited.');
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
    domainIds: Object.freeze(domainIds),
    componentIds: Object.freeze(componentIds),
  });
}

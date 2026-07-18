import type {
  FunctionalCapacityHealthPopulation,
  FunctionalCapacityProtocolId,
  FunctionalCapacityReferenceId,
  FunctionalCapacityReferenceIdentity,
  FunctionalCapacitySourceRecordedSex,
  FunctionalCapacityTestId,
} from './contracts';
import { FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS } from './versions';

export interface FunctionalCapacityReferenceDefinition extends FunctionalCapacityReferenceIdentity {
  active: boolean;
  ageRange: { minimum: number; maximum: number };
  supportedSexes: readonly FunctionalCapacitySourceRecordedSex[];
  countryCodes: readonly string[] | 'explicitly_confirmed_covered_country';
  regionCodes: readonly string[] | 'not_required';
  healthPopulations: readonly FunctionalCapacityHealthPopulation[];
  exactEquipmentRequired: boolean;
  exactCourseRequired: boolean;
  exactSupervisionRequired: boolean;
  fallbackPermitted: false;
  evidenceGrade: 'high' | 'moderate';
  limitation: string;
}

export const FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY = Object.freeze({
  version: FUNCTIONAL_CAPACITY_SCIENTIFIC_VERSIONS.referenceRegistry,
  references: [
    {
      id: 'igrips_2025_adult_absolute', version: 'igrips-adult-absolute/2025.1',
      publication: 'Tomkinson et al. International norms for adult handgrip strength (2025).',
      testId: 'hand_grip_strength', protocolIds: ['southampton_grip_v1'],
      population: 'Adults aged 20 to 100+ from 69 countries and regions; pooled international benchmark.',
      interpretationType: 'published_percentile', active: true, ageRange: { minimum: 20, maximum: 130 },
      supportedSexes: ['female', 'male'], countryCodes: 'explicitly_confirmed_covered_country',
      regionCodes: 'not_required', healthPopulations: ['apparently_healthy', 'healthy_independent', 'community_general'],
      exactEquipmentRequired: true, exactCourseRequired: false, exactSupervisionRequired: false,
      fallbackPermitted: false, evidenceGrade: 'high',
      limitation: 'International pooled benchmark, not local clinical truth; only absolute hand-specific maximum grip is authorized.',
    },
    {
      id: 'nih_toolbox_4m_us_2019', version: 'nih-toolbox-4m-us/2019.1',
      publication: 'Bohannon and Wang. Four-meter Gait Speed: NIH Toolbox Study (2019).',
      testId: 'four_meter_walk', protocolIds: ['nih_toolbox_four_meter_walk_v1'],
      population: 'U.S. adults aged 18 to 85 recruited in ten geographically dispersed cities.',
      interpretationType: 'published_percentile', active: true, ageRange: { minimum: 18, maximum: 85 },
      supportedSexes: ['female', 'male'], countryCodes: ['US'], regionCodes: 'not_required',
      healthPopulations: ['apparently_healthy', 'community_general'], exactEquipmentRequired: true,
      exactCourseRequired: true, exactSupervisionRequired: false, fallbackPermitted: false,
      evidenceGrade: 'moderate', limitation: 'U.S.-specific sample; only exact NIH Toolbox usual-pace static-start protocol.',
    },
    {
      id: 'clsa_4m_ca_2023', version: 'clsa-4m-ca/2023.1',
      publication: 'Mayhew et al. CLSA normative values (2023).',
      testId: 'four_meter_walk', protocolIds: ['clsa_four_meter_walk_2023'],
      population: 'Independently mobile Canadians aged 45 to 85.', interpretationType: 'published_percentile',
      active: true, ageRange: { minimum: 45, maximum: 85 }, supportedSexes: ['female', 'male'],
      countryCodes: ['CA'], regionCodes: 'not_required', healthPopulations: ['healthy_independent'],
      exactEquipmentRequired: true, exactCourseRequired: true, exactSupervisionRequired: false,
      fallbackPermitted: false, evidenceGrade: 'moderate', limitation: 'Canadian healthy/independent population and exact single-trial CLSA method only.',
    },
    {
      id: 'rikli_jones_30cst_us_1999', version: 'rikli-jones-30cst-us/1999.1',
      publication: 'Rikli and Jones. Functional fitness normative scores (1999).',
      testId: 'chair_stand_30_second', protocolIds: ['cdc_steadi_30cst_v1'],
      population: 'Community-residing U.S. adults aged 60 to 94.', interpretationType: 'published_percentile',
      active: true, ageRange: { minimum: 60, maximum: 94 }, supportedSexes: ['female', 'male'],
      countryCodes: ['US'], regionCodes: 'not_required', healthPopulations: ['community_general'],
      exactEquipmentRequired: true, exactCourseRequired: false, exactSupervisionRequired: false,
      fallbackPermitted: false, evidenceGrade: 'moderate', limitation: 'Historical U.S. older-adult norms; no fall-risk category is authorized.',
    },
    {
      id: 'clsa_tug_ca_2023', version: 'clsa-tug-ca/2023.1',
      publication: 'Mayhew et al. CLSA normative values (2023).',
      testId: 'timed_up_and_go', protocolIds: ['clsa_tug_2023'],
      population: 'Independently mobile Canadians aged 45 to 85.', interpretationType: 'published_percentile',
      active: true, ageRange: { minimum: 45, maximum: 85 }, supportedSexes: ['female', 'male'],
      countryCodes: ['CA'], regionCodes: 'not_required', healthPopulations: ['healthy_independent'],
      exactEquipmentRequired: true, exactCourseRequired: true, exactSupervisionRequired: true,
      fallbackPermitted: false, evidenceGrade: 'moderate', limitation: 'Exact single-trial, no-pace-instruction CLSA method; mobility context only.',
    },
    {
      id: 'tromso_tug_no_2021', version: 'tromso-tug-no/2021.1',
      publication: 'Svinoy et al. Tromso TUG reference values (2021).',
      testId: 'timed_up_and_go', protocolIds: ['tromso_tug_2021'],
      population: 'Community-dwelling Norwegians aged 60 to 84, with disease status explicitly stratified.',
      interpretationType: 'published_percentile', active: true, ageRange: { minimum: 60, maximum: 84 },
      supportedSexes: ['female', 'male'], countryCodes: ['NO'], regionCodes: 'not_required',
      healthPopulations: ['community_general', 'disease_specific'], exactEquipmentRequired: true,
      exactCourseRequired: true, exactSupervisionRequired: true, fallbackPermitted: false,
      evidenceGrade: 'moderate', limitation: 'Norwegian, age-restricted, exact chair/course/instruction and disease stratum only.',
    },
    {
      id: 'casanova_6mwt_multicentre_2011', version: 'casanova-6mwt/2011.1',
      publication: 'Casanova et al. 6-min walk reference standards from seven countries (2011).',
      testId: 'six_minute_walk_test', protocolIds: ['ers_ats_6mwt_2014'],
      population: 'Healthy adults aged 40 to 80 from ten centres in seven countries.',
      interpretationType: 'published_reference_curve', active: true, ageRange: { minimum: 40, maximum: 80 },
      supportedSexes: ['female', 'male'], countryCodes: ['BR', 'CL', 'CO', 'ES', 'UY', 'US', 'VE'],
      regionCodes: 'not_required', healthPopulations: ['apparently_healthy'], exactEquipmentRequired: true,
      exactCourseRequired: true, exactSupervisionRequired: true, fallbackPermitted: false,
      evidenceGrade: 'moderate', limitation: 'Conditional multicentre benchmark; exact represented setting review and two-test best-distance protocol required.',
    },
    {
      id: 'elsa_gait_england_2026_candidate', version: 'elsa-gait-england/2026.1',
      publication: 'Grgic et al. ELSA physical-performance reference values (2026).',
      testId: 'usual_gait_speed', protocolIds: ['usual_gait_named_variant_v1'],
      population: 'English adults aged 60+ under the 2.44-m home protocol.', interpretationType: 'published_percentile',
      active: false, ageRange: { minimum: 60, maximum: 130 }, supportedSexes: ['female', 'male'],
      countryCodes: ['GB'], regionCodes: ['ENG'], healthPopulations: ['community_general'],
      exactEquipmentRequired: true, exactCourseRequired: true, exactSupervisionRequired: false,
      fallbackPermitted: false, evidenceGrade: 'moderate', limitation: 'Candidate pending protocol-level registry authorization; unavailable in version 1.0.0.',
    },
  ] as const satisfies readonly FunctionalCapacityReferenceDefinition[],
});

export function getFunctionalCapacityReferenceDefinition(
  id: FunctionalCapacityReferenceId | null,
  version: string | null,
): FunctionalCapacityReferenceDefinition | null {
  return FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY.references.find(reference =>
    reference.id === id && reference.version === version) ?? null;
}

export function referenceIdsForTest(testId: FunctionalCapacityTestId): readonly FunctionalCapacityReferenceId[] {
  return FUNCTIONAL_CAPACITY_REFERENCE_REGISTRY.references
    .filter(reference => reference.testId === testId && reference.active)
    .map(reference => reference.id);
}

export function protocolSupportsReference(
  protocolId: FunctionalCapacityProtocolId | null,
  reference: FunctionalCapacityReferenceDefinition,
): boolean {
  return protocolId !== null && reference.protocolIds.includes(protocolId);
}

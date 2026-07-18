import type { ComponentTemporalPolicyDefinition } from './contracts';

/**
 * Architecture-only temporal policies. Null durations are intentional: alignment
 * limits must come from model-specific scientific review, never a global default.
 */
export const MULTIMODAL_TEMPORAL_POLICIES = [
  {
    policyId: 'single_laboratory_collection',
    measurementWindowKind: 'single_collection',
    defaultWindowDays: null,
    maximumAlignmentWindowDays: null,
    unknownTimingBehavior: 'block_combination',
    staleComponentBehavior: 'block_combination',
    longitudinalRequirement: 'none',
    repeatMeasurementPolicy: 'model_specific',
    rationale: [
      'All inputs for the laboratory model must represent its approved collection context.',
      'No cross-component alignment duration is authorized by this architecture phase.',
    ],
  },
  {
    policyId: 'quality_controlled_point_assessment',
    measurementWindowKind: 'point_assessment',
    defaultWindowDays: null,
    maximumAlignmentWindowDays: null,
    unknownTimingBehavior: 'block_combination',
    staleComponentBehavior: 'block_combination',
    longitudinalRequirement: 'none',
    repeatMeasurementPolicy: 'model_specific',
    rationale: ['A CPET or other point assessment retains its own timestamp and protocol-specific validity.'],
  },
  {
    policyId: 'model_specific_wearable_window',
    measurementWindowKind: 'rolling_observation_window',
    defaultWindowDays: null,
    maximumAlignmentWindowDays: null,
    unknownTimingBehavior: 'block_combination',
    staleComponentBehavior: 'block_combination',
    longitudinalRequirement: 'model_specific',
    repeatMeasurementPolicy: 'required',
    rationale: ['Wearable window length, continuity, device requirements, and alignment must be validated per model.'],
  },
  {
    policyId: 'current_behavior_context',
    measurementWindowKind: 'current_behavior_questionnaire',
    defaultWindowDays: null,
    maximumAlignmentWindowDays: null,
    unknownTimingBehavior: 'block_combination',
    staleComponentBehavior: 'block_combination',
    longitudinalRequirement: 'unknown',
    repeatMeasurementPolicy: 'model_specific',
    rationale: ['Current-behavior context is not assumed to represent the same time window as laboratory or wearable evidence.'],
  },
] as const satisfies readonly ComponentTemporalPolicyDefinition[];

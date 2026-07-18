import type {
  CardiometabolicMeasurementInput,
  CardiometabolicReason,
  CardiometabolicTrendDecision,
} from './contracts';
import { getCardiometabolicMeasurement } from './measurementRegistry';
import { reasonForCardiometabolic, sortCardiometabolicReasons } from './reasonRegistry';
import { CARDIOMETABOLIC_SCIENTIFIC_VERSIONS } from './versions';

export const CARDIOMETABOLIC_TREND_COMPARISON_POLICY = Object.freeze({
  version: CARDIOMETABOLIC_SCIENTIFIC_VERSIONS.trendComparabilityPolicy,
  statuses: ['Comparable', 'Conditionally Comparable', 'Not Comparable', 'Insufficient Data'],
  calculatesChange: false,
  calculatesSlope: false,
  calculatesPercentageChange: false,
  infersImprovement: false,
  infersDecline: false,
  infersTreatmentResponse: false,
  infersPrognosis: false,
  infersBiologicalAgeChange: false,
});

const result = (status: CardiometabolicTrendDecision['status'], reasons: CardiometabolicReason[]): CardiometabolicTrendDecision => ({
  status,
  displayStatus: status === 'comparable' ? 'Comparable' : status === 'conditionally_comparable' ? 'Conditionally Comparable' : status === 'not_comparable' ? 'Not Comparable' : 'Insufficient Data',
  reasons: sortCardiometabolicReasons(reasons),
  calculatesChange: false,
  calculatesSlope: false,
  calculatesPercentageChange: false,
  infersImprovement: false,
  infersTreatmentResponse: false,
  infersPrognosis: false,
});

export function evaluateCardiometabolicTrendCompatibility(
  first: CardiometabolicMeasurementInput,
  second: CardiometabolicMeasurementInput,
): CardiometabolicTrendDecision {
  const reasons: CardiometabolicReason[] = [];
  const firstDefinition = getCardiometabolicMeasurement(first.measurementId);
  const secondDefinition = getCardiometabolicMeasurement(second.measurementId);
  if (first.recordId === second.recordId) reasons.push(reasonForCardiometabolic('trend_same_record'));
  if (!firstDefinition || !secondDefinition) {
    reasons.push(reasonForCardiometabolic('trend_metadata_missing'));
    return result('insufficient_data', reasons);
  }
  if (firstDefinition.id !== secondDefinition.id) {
    reasons.push(reasonForCardiometabolic('trend_measurement_mismatch'));
    return result('not_comparable', reasons);
  }
  if (!first.numeric?.unit && firstDefinition.family !== 'blood_pressure' || !second.numeric?.unit && secondDefinition.family !== 'blood_pressure') reasons.push(reasonForCardiometabolic('trend_metadata_missing'));
  if (!first.assay.methodId && firstDefinition.assayRequired || !second.assay.methodId && secondDefinition.assayRequired) reasons.push(reasonForCardiometabolic('trend_metadata_missing'));
  if (!first.timestamps.measuredAt || !second.timestamps.measuredAt) reasons.push(reasonForCardiometabolic('trend_metadata_missing'));
  if (reasons.some(reason => reason.code === 'trend_metadata_missing')) return result('insufficient_data', reasons);
  if (firstDefinition.canonicalUnit !== secondDefinition.canonicalUnit) reasons.push(reasonForCardiometabolic('trend_unit_mismatch'));
  if (first.assay.methodId !== second.assay.methodId || first.assay.traceabilityDocumented !== second.assay.traceabilityDocumented) reasons.push(reasonForCardiometabolic('trend_assay_mismatch'));
  if (firstDefinition.id === 'ldl_c_calculated' && (first.lineage.calculationMethodId !== second.lineage.calculationMethodId || first.lineage.calculationVersion !== second.lineage.calculationVersion)) reasons.push(reasonForCardiometabolic('trend_calculation_method_mismatch'));
  if (firstDefinition.id === 'triglycerides' && first.context.fastingStatus !== second.context.fastingStatus) reasons.push(reasonForCardiometabolic('trend_fasting_mismatch'));
  if (first.context.acuteIllness !== second.context.acuteIllness || first.context.medicationContextKnown !== second.context.medicationContextKnown) reasons.push(reasonForCardiometabolic('trend_context_mismatch'));
  if (firstDefinition.family === 'blood_pressure') {
    if (first.protocol.protocolId !== second.protocol.protocolId) reasons.push(reasonForCardiometabolic('trend_protocol_mismatch'));
    if (first.provider.deviceId !== second.provider.deviceId || first.protocol.upperArmCuff !== second.protocol.upperArmCuff || first.protocol.cuffSize !== second.protocol.cuffSize) reasons.push(reasonForCardiometabolic('trend_device_mismatch'));
    if (first.bloodPressure?.readingCount !== second.bloodPressure?.readingCount || first.bloodPressure?.occasionCount !== second.bloodPressure?.occasionCount) reasons.push(reasonForCardiometabolic('trend_series_mismatch'));
  }
  if (firstDefinition.id === 'waist_circumference' && first.protocol.waistLandmark !== second.protocol.waistLandmark) reasons.push(reasonForCardiometabolic('trend_landmark_mismatch'));
  if (['non_hdl_c', 'waist_to_height_ratio'].includes(firstDefinition.id) && (first.lineage.calculationMethodId !== second.lineage.calculationMethodId || first.lineage.lineageVerified !== second.lineage.lineageVerified)) reasons.push(reasonForCardiometabolic('trend_lineage_mismatch'));

  const notComparable = reasons.some(reason => reason.severity === 'blocking_interpretation');
  if (notComparable) return result('not_comparable', reasons);
  if (reasons.some(reason => reason.code === 'trend_fasting_mismatch')) {
    reasons.push(reasonForCardiometabolic('trend_conditional_match'));
    return result('conditionally_comparable', reasons);
  }
  reasons.push(reasonForCardiometabolic('trend_exact_match'));
  return result('comparable', reasons);
}

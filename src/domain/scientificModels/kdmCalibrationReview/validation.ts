import { KDM_ARCHITECTURE_AREAS, KDM_RUBRIC_CRITERIA } from './builders';
import { KDM_PRODUCTION_CALIBRATION_DECISION } from './decision';
import { KDM_CALIBRATION_DOSSIERS } from './dossiers';
import { KDM_CALIBRATION_EVIDENCE } from './evidence';

export interface KdmCalibrationReviewValidationIssue {
  code: string;
  path: string;
  message: string;
}

export function validateKdmCalibrationReview(): readonly KdmCalibrationReviewValidationIssue[] {
  const issues: KdmCalibrationReviewValidationIssue[] = [];
  const evidenceIds = new Set<string>(KDM_CALIBRATION_EVIDENCE.map(reference => reference.id));
  const dossierIds = new Set<string>();

  for (const dossier of KDM_CALIBRATION_DOSSIERS) {
    const path = `dossiers.${dossier.id}`;
    if (dossierIds.has(dossier.id)) issues.push({ code: 'duplicate_dossier_id', path, message: 'Dossier ids must be unique.' });
    dossierIds.add(dossier.id);
    if (!evidenceIds.has(dossier.primaryEvidenceId)) issues.push({ code: 'missing_primary_evidence', path, message: 'Primary evidence must resolve.' });
    for (const id of dossier.supportingEvidenceIds) {
      if (!evidenceIds.has(id)) issues.push({ code: 'missing_supporting_evidence', path, message: `Supporting evidence ${id} must resolve.` });
    }
    if (new Set(dossier.rubric.map(item => item.criterion)).size !== KDM_RUBRIC_CRITERIA.length) {
      issues.push({ code: 'incomplete_rubric', path, message: 'Every qualitative rubric criterion is required.' });
    }
    if (new Set(dossier.architecture.map(item => item.area)).size !== KDM_ARCHITECTURE_AREAS.length) {
      issues.push({ code: 'incomplete_architecture', path, message: 'Every architecture area is required.' });
    }
    if (dossier.recordKind === 'named_calibration' && dossier.biomarkerPanel.length === 0) {
      issues.push({ code: 'missing_panel', path, message: 'Named calibrations require a documented panel.' });
    }
  }

  const selected = KDM_CALIBRATION_DOSSIERS.filter(dossier => dossier.disposition === 'selected_after_prerequisites');
  if (selected.length !== 1 || selected[0]?.id !== KDM_PRODUCTION_CALIBRATION_DECISION.selectedCalibrationId) {
    issues.push({ code: 'selection_mismatch', path: 'decision', message: 'Exactly one dossier must match the conditional production decision.' });
  }
  if (KDM_PRODUCTION_CALIBRATION_DECISION.implementationAuthorized !== false) {
    issues.push({ code: 'implementation_authorized', path: 'decision', message: 'This phase may not authorize implementation.' });
  }
  return issues;
}

import type { KdmCalibrationDossier } from './contracts';
import { KDM_CALIBRATION_DOSSIERS } from './dossiers';

export interface KdmPanelComparison {
  calibrationId: KdmCalibrationDossier['id'];
  exactInputCount: number;
  exactClinicalPhenoAgeOverlap: readonly string[];
  relatedClinicalPhenoAgeOverlap: readonly string[];
  specialtyOrResearchInputs: readonly string[];
  acuteIllnessSensitiveInputs: readonly string[];
  panelCaveat: string;
}

export const KDM_PANEL_COMPARISON = KDM_CALIBRATION_DOSSIERS.map(dossier => ({
  calibrationId: dossier.id,
  exactInputCount: dossier.biomarkerPanel.length,
  exactClinicalPhenoAgeOverlap: dossier.biomarkerPanel
    .filter(input => input.clinicalPhenoAgeOverlap === 'exact').map(input => input.name),
  relatedClinicalPhenoAgeOverlap: dossier.biomarkerPanel
    .filter(input => input.clinicalPhenoAgeOverlap === 'related').map(input => input.name),
  specialtyOrResearchInputs: dossier.biomarkerPanel
    .filter(input => input.accessibility === 'specialty' || input.accessibility === 'research')
    .map(input => input.name),
  acuteIllnessSensitiveInputs: dossier.biomarkerPanel
    .filter(input => input.acuteIllnessSensitivity === 'high').map(input => input.name),
  panelCaveat: dossier.biomarkerPanelScope,
})) satisfies readonly KdmPanelComparison[];

export const KDM_POPULATION_COMPARISON = KDM_CALIBRATION_DOSSIERS.map(dossier => ({
  calibrationId: dossier.id,
  country: dossier.population.country,
  sampleSize: dossier.population.sampleSize,
  ageRange: dossier.population.ageRange,
  sexHandling: dossier.population.sexHandling,
  diversity: dossier.population.ethnicityAndDiversity,
  healthSelection: dossier.population.healthSelection,
  transportability: dossier.population.transportability,
  internationalConsumerSuitability: dossier.population.internationalConsumerSuitability,
}));

export const KDM_VALIDATION_COMPARISON = KDM_CALIBRATION_DOSSIERS.map(dossier => ({
  calibrationId: dossier.id,
  exactCalibrationReplicated: dossier.validation.exactCalibrationReplicated,
  developmentValidation: dossier.validation.developmentValidation,
  externalValidations: dossier.validation.externalValidations,
  outcomeCoverage: dossier.validation.outcomeCoverage,
  productionReadiness: dossier.productionReadiness,
}));

import { stableSha256 } from '../sha256';
import {
  CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT,
  CLINICAL_PHENOAGE_FORMULA_DEFINITION,
} from './constants';
import { ClinicalPhenoAgeCalculationError } from './models';

export function clinicalPhenoAgeFormulaFingerprint(definition: unknown = CLINICAL_PHENOAGE_FORMULA_DEFINITION): string {
  return stableSha256(definition);
}

export function isClinicalPhenoAgeFormulaIntegrityValid(definition: unknown = CLINICAL_PHENOAGE_FORMULA_DEFINITION): boolean {
  return clinicalPhenoAgeFormulaFingerprint(definition)
    === CLINICAL_PHENOAGE_EXPECTED_COEFFICIENT_FINGERPRINT;
}

export function assertClinicalPhenoAgeFormulaIntegrity(): void {
  if (!isClinicalPhenoAgeFormulaIntegrityValid()) {
    throw new ClinicalPhenoAgeCalculationError(
      'FormulaIntegrityError',
      'Clinical PhenoAge coefficient integrity validation failed; calculation is blocked.',
    );
  }
}

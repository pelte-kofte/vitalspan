import {
  PersistenceBoundary,
  type ValidationOutcome,
} from '../../domain/scientificPersistence';
import { ClinicalPhenoAgeProductionAdapter } from '../scientificProduction/clinicalPhenoAgeAdapter';
import {
  buildClinicalPhenoAgeRuntimeRequest,
  type ClinicalPhenoAgeRuntimeRequestBuilderInput,
} from '../scientificProduction/clinicalPhenoAgeRuntimeRequestBuilder';

export class ClinicalPhenoAgeRuntimePersistenceOrchestrator {
  constructor(private readonly adapter: ClinicalPhenoAgeProductionAdapter) {
    Object.freeze(this);
  }

  async validate(
    input: ClinicalPhenoAgeRuntimeRequestBuilderInput,
  ): Promise<ValidationOutcome> {
    const request = buildClinicalPhenoAgeRuntimeRequest(input);
    const result = await this.adapter.evaluate(request);
    return PersistenceBoundary.validate(request, result);
  }
}

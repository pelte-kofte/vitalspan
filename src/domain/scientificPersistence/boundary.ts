import type {
  ScientificEvaluationRequest,
  ScientificEvaluationResult,
} from '../scientificProduction';
import type { ValidationOutcome } from './contracts';
import { preConstructionValidation } from './validation';

export const PersistenceBoundary = Object.freeze({
  boundaryVersion: 'scientific-persistence-boundary/1.0.0' as const,
  validate(
    request: ScientificEvaluationRequest,
    result: ScientificEvaluationResult,
  ): ValidationOutcome {
    return preConstructionValidation(request, result);
  },
});

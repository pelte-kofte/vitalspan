import type {
  PersistenceLineage,
  PersistenceMetadata,
  PersistenceResult,
  PersistenceService,
  ValidationOutcome,
} from '../../domain/scientificPersistence';
import type { ClinicalPhenoAgeRuntimePersistenceOrchestrator } from './clinicalPhenoAgeRuntimePersistenceOrchestrator';

type RuntimePersistenceValidator = Pick<
  ClinicalPhenoAgeRuntimePersistenceOrchestrator,
  'validate'
>;

type RuntimePersistenceInput = Parameters<RuntimePersistenceValidator['validate']>[0];

type RuntimePersistenceService = Pick<PersistenceService, 'persist'>;

export class ClinicalPhenoAgeRuntimePersistenceExecutorError extends Error {
  readonly code = 'persistence_boundary_rejected' as const;

  constructor(readonly validationOutcome: ValidationOutcome) {
    super('Scientific persistence boundary validation failed.');
    this.name = 'ClinicalPhenoAgeRuntimePersistenceExecutorError';
  }
}

export class ClinicalPhenoAgeRuntimePersistenceExecutor {
  constructor(
    private readonly orchestrator: RuntimePersistenceValidator,
    private readonly persistenceService: RuntimePersistenceService,
    private readonly metadata: PersistenceMetadata,
    private readonly lineage: PersistenceLineage,
  ) {
    Object.freeze(this);
  }

  async execute(
    input: RuntimePersistenceInput,
  ): Promise<PersistenceResult> {
    const outcome = await this.orchestrator.validate(input);
    if (!outcome.valid || outcome.validatedInput === null) {
      throw new ClinicalPhenoAgeRuntimePersistenceExecutorError(outcome);
    }
    return this.persistenceService.persist(
      outcome.validatedInput,
      this.metadata,
      this.lineage,
    );
  }
}

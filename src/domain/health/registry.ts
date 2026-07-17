import { bloodDomainEngine } from './domains/blood';
import { fitnessDomainEngine } from './domains/fitness';
import { lifestyleDomainEngine } from './domains/lifestyle';
import { medicationDomainEngine } from './domains/medication';
import { nutritionDomainEngine } from './domains/nutrition';
import { peptideDomainEngine } from './domains/peptide';
import { recoveryDomainEngine } from './domains/recovery';
import { sleepDomainEngine } from './domains/sleep';
import { supplementDomainEngine } from './domains/supplement';
import { therapyDomainEngine } from './domains/therapy';
import type {
  AnyHealthDomainState,
  HealthDomainEngine,
  HealthDomainId,
  HealthDomainInputMap,
} from './models';

export type HealthDomainEngineMap = {
  [D in HealthDomainId]: HealthDomainEngine<D>;
};

/** Typed lookup for consumers that need one domain. No engine calls another. */
export const HEALTH_DOMAIN_ENGINES = {
  blood: bloodDomainEngine,
  sleep: sleepDomainEngine,
  recovery: recoveryDomainEngine,
  fitness: fitnessDomainEngine,
  nutrition: nutritionDomainEngine,
  lifestyle: lifestyleDomainEngine,
  medication: medicationDomainEngine,
  supplement: supplementDomainEngine,
  peptide: peptideDomainEngine,
  therapy: therapyDomainEngine,
} satisfies HealthDomainEngineMap;

export function getHealthDomainEngine<D extends HealthDomainId>(id: D): HealthDomainEngineMap[D] {
  return HEALTH_DOMAIN_ENGINES[id];
}

/**
 * Convenience composition for future app-level consumers. Inputs remain
 * domain-scoped and optional; an omitted input produces that domain's Unknown state.
 */
export function buildHealthDomains(
  inputs: Partial<HealthDomainInputMap> = {},
): readonly AnyHealthDomainState[] {
  return [
    bloodDomainEngine.build(inputs.blood),
    sleepDomainEngine.build(inputs.sleep),
    recoveryDomainEngine.build(inputs.recovery),
    fitnessDomainEngine.build(inputs.fitness),
    nutritionDomainEngine.build(inputs.nutrition),
    lifestyleDomainEngine.build(inputs.lifestyle),
    medicationDomainEngine.build(inputs.medication),
    supplementDomainEngine.build(inputs.supplement),
    peptideDomainEngine.build(inputs.peptide),
    therapyDomainEngine.build(inputs.therapy),
  ];
}

import type { CardiometabolicMeasurementInput, CardiometabolicReason } from '../contracts';
import type { CardiometabolicMeasurementDefinition } from '../measurementRegistry';
import { validateCardiometabolicAdiposity } from './adiposityValidation';
import { validateCardiometabolicBloodPressure } from './bloodPressureValidation';
import { validateCardiometabolicGlycemic } from './glycemicValidation';
import { validateCardiometabolicLipid } from './lipidValidation';

export * from './adiposityValidation';
export * from './bloodPressureValidation';
export * from './commonValidation';
export * from './glycemicValidation';
export * from './lipidValidation';

export function validateCardiometabolicFamily(input: CardiometabolicMeasurementInput, definition: CardiometabolicMeasurementDefinition): CardiometabolicReason[] {
  switch (definition.family) {
    case 'atherogenic_lipids': return validateCardiometabolicLipid(input, definition);
    case 'glycemic_status': return validateCardiometabolicGlycemic(input, definition);
    case 'blood_pressure': return validateCardiometabolicBloodPressure(input, definition);
    case 'central_adiposity': return validateCardiometabolicAdiposity(input, definition);
  }
}

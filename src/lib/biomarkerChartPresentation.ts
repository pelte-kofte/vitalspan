export interface ChartReferenceInterval {
  readonly lowerBound?: number;
  readonly upperBound?: number;
  readonly unit: string;
}

export interface CompatibleChartReferenceBand {
  readonly lowerBound?: number;
  readonly upperBound?: number;
}

export interface ChartClassificationBand extends ChartReferenceInterval {
  readonly id: string;
  readonly label: string;
}

function normalizedUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Returns a chart-only reference band when units and bounds are directly
 * compatible. No conversion, classification, or interpretation occurs here.
 */
export function compatibleChartReferenceBand(
  referenceInterval: ChartReferenceInterval | undefined,
  canonicalUnit: string,
): CompatibleChartReferenceBand | null {
  if (
    !referenceInterval
    || normalizedUnit(referenceInterval.unit) !== normalizedUnit(canonicalUnit)
  ) {
    return null;
  }

  const lowerBound = referenceInterval.lowerBound !== undefined
    && Number.isFinite(referenceInterval.lowerBound)
    ? referenceInterval.lowerBound
    : undefined;
  const upperBound = referenceInterval.upperBound !== undefined
    && Number.isFinite(referenceInterval.upperBound)
    ? referenceInterval.upperBound
    : undefined;

  if (lowerBound === undefined && upperBound === undefined) return null;
  if (
    lowerBound !== undefined
    && upperBound !== undefined
    && lowerBound > upperBound
  ) {
    return null;
  }

  return {
    ...(lowerBound === undefined ? {} : { lowerBound }),
    ...(upperBound === undefined ? {} : { upperBound }),
  };
}

export function compatibleChartClassificationBands(
  bands: readonly ChartClassificationBand[] | undefined,
  canonicalUnit: string,
): readonly ChartClassificationBand[] {
  if (!bands) return [];
  return bands.flatMap(band => {
    const compatible = compatibleChartReferenceBand(band, canonicalUnit);
    return compatible
      ? [{
          id: band.id,
          label: band.label,
          unit: band.unit,
          ...compatible,
        }]
      : [];
  });
}

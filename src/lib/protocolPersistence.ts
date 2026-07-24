import { SUPPLEMENT_DATABASE } from '../data/supplementTimings';
import {
  EMPTY_PROTOCOL,
  type CustomSupplement,
  type ProtocolItem,
  type ProtocolState,
  type TimeSlot,
} from '../types/protocol';

export const PROTOCOL_STORAGE_KEY = '@vitalspan_protocol';
export const PROTOCOL_TODAY_STORAGE_KEY = '@vitalspan_protocol_today';

export type ProtocolStorageSetter = (key: string, value: string) => Promise<unknown>;

export interface ParsedProtocolState {
  readonly state: ProtocolState;
  readonly migratedLegacyState: boolean;
}

export interface PreparedProtocolState extends ParsedProtocolState {
  readonly mainStorageWrites: readonly ProtocolState[];
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

export function protocolDayKey(date = new Date()): string {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-');
}

export function parseProtocolDoseCount(dose: string): number {
  const match = dose.match(/(\d+)x\s*daily/i);
  return match ? Math.min(Math.max(Number.parseInt(match[1], 10), 1), 6) : 1;
}

export function protocolDoseId(name: string, index: number): string {
  return `${name}_dose_${index}`;
}

function migrateLegacyProtocol(
  parsed: Record<string, unknown>,
  migratedAt: Date,
): ProtocolState {
  const oldAdded = (parsed.addedSupplements as string[]) ?? [];
  const oldCustom = (parsed.customSupplements as CustomSupplement[]) ?? [];

  const convertedDatabaseItems: ProtocolItem[] = oldAdded.map((name, index) => {
    const databaseItem = SUPPLEMENT_DATABASE.find(
      item => item.name.toLowerCase() === name.toLowerCase(),
    );
    return {
      id: `supp_migrated_${migratedAt.getTime()}_${index}`,
      name: databaseItem?.name ?? name,
      dose: databaseItem?.defaultDose ?? '—',
      source: 'db',
      addedAt: migratedAt.toISOString(),
    };
  });

  const convertedCustomItems: ProtocolItem[] = oldCustom.map(item => ({
    id: item.id,
    name: item.name,
    dose: item.dose,
    timing: item.timing,
    source: 'manual',
    addedAt: item.addedAt,
  }));

  return {
    supplements: [...convertedDatabaseItems, ...convertedCustomItems],
    medTimes: (parsed.medTimes as Record<string, TimeSlot>) ?? {},
    hiddenMeds: [],
    taken: [],
    takenDate: '',
  };
}

export function parseProtocolState(
  raw: string | null,
  migratedAt = new Date(),
): ParsedProtocolState {
  if (!raw) {
    return { state: EMPTY_PROTOCOL, migratedLegacyState: false };
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if ('addedSupplements' in parsed) {
      return {
        state: migrateLegacyProtocol(parsed, migratedAt),
        migratedLegacyState: true,
      };
    }

    if ('supplements' in parsed) {
      return {
        state: {
          ...EMPTY_PROTOCOL,
          ...(parsed as unknown as ProtocolState),
          hiddenMeds: (parsed.hiddenMeds as string[]) ?? [],
          supplements: (parsed.supplements as ProtocolItem[]) ?? [],
          medTimes: (parsed.medTimes as Record<string, TimeSlot>) ?? {},
          taken: (parsed.taken as string[]) ?? [],
          takenDate: (parsed.takenDate as string) ?? '',
        },
        migratedLegacyState: false,
      };
    }
  } catch {
    return { state: EMPTY_PROTOCOL, migratedLegacyState: false };
  }

  return { state: EMPTY_PROTOCOL, migratedLegacyState: false };
}

function visibleProtocolItemIds(
  state: ProtocolState,
  medications: readonly string[],
): string[] {
  const visibleMedications = medications.filter(
    medication => !state.hiddenMeds.includes(medication),
  );
  const supplementIds = state.supplements.flatMap(item => {
    const count = parseProtocolDoseCount(item.personalDose ?? item.dose);
    return count === 1
      ? [item.id]
      : Array.from({ length: count }, (_, index) => protocolDoseId(item.name, index));
  });
  return [...visibleMedications, ...supplementIds];
}

export function prepareProtocolState(
  raw: string | null,
  medications: readonly string[],
  now = new Date(),
): PreparedProtocolState {
  const parsed = parseProtocolState(raw, now);
  if (!raw) {
    return { ...parsed, mainStorageWrites: [] };
  }

  let migrated = parsed.state;
  const mainStorageWrites: ProtocolState[] = parsed.migratedLegacyState
    ? [migrated]
    : [];
  const today = protocolDayKey(now);

  if (migrated.takenDate !== '' && migrated.takenDate !== today) {
    const visibleItemIds = visibleProtocolItemIds(migrated, medications);
    if (visibleItemIds.length > 0) {
      const taken = new Set(migrated.taken);
      const completed = visibleItemIds.every(id => taken.has(id));
      migrated = completed
        ? {
            ...migrated,
            currentStreak: (migrated.currentStreak ?? 0) + 1,
            bestStreak: Math.max(
              migrated.bestStreak ?? 0,
              (migrated.currentStreak ?? 0) + 1,
            ),
            lastCompleteDate: migrated.takenDate,
          }
        : { ...migrated, currentStreak: 0 };
      mainStorageWrites.push({
        ...migrated,
        taken: [],
        takenDate: today,
      });
    }
  }

  return {
    state: {
      ...migrated,
      taken: migrated.takenDate === today ? migrated.taken : [],
      takenDate: today,
    },
    migratedLegacyState: parsed.migratedLegacyState,
    mainStorageWrites,
  };
}

export function toggleProtocolCompletion(
  state: ProtocolState,
  itemId: string,
  now = new Date(),
): ProtocolState {
  const today = protocolDayKey(now);
  const currentTaken = state.takenDate === today ? state.taken : [];
  const taken = currentTaken.includes(itemId)
    ? currentTaken.filter(id => id !== itemId)
    : [...currentTaken, itemId];
  return { ...state, taken, takenDate: today };
}

export async function persistProtocolMainState(
  state: ProtocolState,
  setItem: ProtocolStorageSetter,
): Promise<void> {
  await setItem(PROTOCOL_STORAGE_KEY, JSON.stringify(state));
}

export async function persistProtocolState(
  state: ProtocolState,
  setItem: ProtocolStorageSetter,
): Promise<void> {
  await Promise.all([
    persistProtocolMainState(state, setItem),
    setItem(PROTOCOL_TODAY_STORAGE_KEY, JSON.stringify({
      date: state.takenDate,
      taken: state.taken,
    })),
  ]);
}

/**
 * Canonical protocol types — single source of truth for all protocol-related types.
 *
 * Consumers:
 *   - Phase 20: ProtocolScreen (schema migration)
 *   - Phase 22: adherence streaks, dose bucketing
 *   - Phase 23: notification consumers
 *
 * Migration note: `CustomSupplement` is retained for migration detection only (D-05).
 * It was the shape used in the old `customSupplements: CustomSupplement[]` field.
 * New code should use `ProtocolItem` exclusively. Do not add new usages of
 * `CustomSupplement` outside the migration helper.
 *
 * No imports — this file is pure type definitions plus a single const.
 */

// ─── Time slot ────────────────────────────────────────────────────────────────

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

// ─── ProtocolItem (D-02) ──────────────────────────────────────────────────────

/**
 * Unified representation of a supplement in the user's protocol.
 * Replaces the old split of `addedSupplements: string[]` + `customSupplements: CustomSupplement[]`.
 */
export interface ProtocolItem {
  /** Unique identifier, e.g. `supp_${Date.now()}` */
  id: string;
  name: string;
  /** DB default or user-entered dose at the time the item was added */
  dose: string;
  /** User's personal override dose (supplements only, per D-06) */
  personalDose?: string;
  timing?: TimeSlot;
  /** 'db' — sourced from SUPPLEMENT_DATABASE; 'manual' — user-added */
  source: 'db' | 'manual';
  /** ISO 8601 timestamp of when the item was added to the protocol */
  addedAt: string;
}

// ─── ProtocolState (D-03) ─────────────────────────────────────────────────────

/**
 * Full persisted state for the user's protocol.
 * Stored under AsyncStorage key `@vitalspan_protocol`.
 */
export interface ProtocolState {
  /** Unified supplement list — replaces addedSupplements + customSupplements */
  supplements: ProtocolItem[];
  /** Medication timing overrides keyed by medication name */
  medTimes: Record<string, TimeSlot>;
  /** Names of medications the user has soft-hidden from the protocol view (D-07) */
  hiddenMeds: string[];
  /** IDs of items marked taken today */
  taken: string[];
  /** ISO date string (YYYY-MM-DD) of the current taken session */
  takenDate: string;
}

// ─── CustomSupplement (migration detection only — D-04, D-05) ─────────────────

/**
 * Legacy type — kept ONLY for detecting and migrating old AsyncStorage data.
 * Do NOT use for new functionality. Use `ProtocolItem` instead.
 */
export interface CustomSupplement {
  id: string;
  name: string;
  dose: string;
  timing?: TimeSlot;
  notes?: string;
  addedAt: string;
}

// ─── EMPTY_PROTOCOL ───────────────────────────────────────────────────────────

/** Zero-value ProtocolState used for initialisation and reset. */
export const EMPTY_PROTOCOL: ProtocolState = {
  supplements: [],
  medTimes: {},
  hiddenMeds: [],
  taken: [],
  takenDate: '',
};

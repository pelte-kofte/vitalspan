/** Owner marker is intentionally outside the payload list it protects. */
export const AUTH_OWNER_STORAGE_KEY = '@vitalspan_auth_owner_id';

/**
 * Versioned completion marker for governed Biomarker Persistence history sync.
 * Version 2 replays existing local history once so the additive provenance
 * migration can enrich rows created by older clients.
 */
export const BIOMARKER_PERSISTENCE_MIGRATION_KEY =
  '@vitalspan_biomarker_persistence_migrated_v2';
const LEGACY_BIOMARKER_PERSISTENCE_MIGRATION_KEY =
  '@vitalspan_biomarker_persistence_migrated_v1';

/**
 * All persisted application values that can reveal or affect a user's local
 * experience. Public caches are included deliberately so identity transitions
 * have one fail-closed clearing boundary.
 */
export const USER_SCOPED_STORAGE_KEYS = [
  '@vitalspan_articles_last_fetched',
  LEGACY_BIOMARKER_PERSISTENCE_MIGRATION_KEY,
  BIOMARKER_PERSISTENCE_MIGRATION_KEY,
  '@vitalspan_biomarkers',
  '@vitalspan_disclaimer_accepted',
  '@vitalspan_dismissed_insights',
  '@vitalspan_email_verified_notified',
  '@vitalspan_exercise_log',
  '@vitalspan_exercise_routine',
  '@vitalspan_first_run_complete',
  '@vitalspan_health_data',
  '@vitalspan_health_permissions',
  '@vitalspan_identity_linked',
  '@vitalspan_last_report_ts',
  '@vitalspan_migrated_v2',
  '@vitalspan_notification_prefs',
  '@vitalspan_protocol',
  '@vitalspan_protocol_today',
  '@vitalspan_rxnav_cache',
  '@vitalspan_today_priority_dismissed',
  '@vitalspan_user_profile',
] as const;

/** Backward-compatible name used by Settings export/clear-data flows. */
export const STORAGE_KEYS = USER_SCOPED_STORAGE_KEYS;

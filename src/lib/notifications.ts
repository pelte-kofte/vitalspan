/**
 * Notification scheduling helpers for Vitalspan.
 *
 * Provides per-slot (morning / afternoon / evening / night) scheduling of
 * daily local push notifications. Preferences are persisted in AsyncStorage
 * under NOTIFICATION_PREFS_KEY and read by App.tsx on every launch to
 * reschedule after EAS updates (D-04).
 *
 * Pattern mirrors src/lib/healthkit.ts: module-scope key constants,
 * exported interfaces, exported async functions with explicit try/catch,
 * no default export.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeSlot } from '../types/protocol';
import type { AuthRequestScope } from './authSessionCoordinator';
import { captureAuthRequestScope, isAuthRequestScopeCurrent } from './supabase';

// ─── Storage key ──────────────────────────────────────────────────────────────

export const NOTIFICATION_PREFS_KEY = '@vitalspan_notification_prefs';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationPrefs {
  morning:   { enabled: boolean; time: string }; // time = "HH:MM" (24h)
  afternoon: { enabled: boolean; time: string };
  evening:   { enabled: boolean; time: string };
  night:     { enabled: boolean; time: string };
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

/** All slots disabled by default; times from D-02 */
export const DEFAULT_PREFS: NotificationPrefs = {
  morning:   { enabled: false, time: '08:00' },
  afternoon: { enabled: false, time: '13:00' },
  evening:   { enabled: false, time: '18:00' },
  night:     { enabled: false, time: '21:00' },
};

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────

/**
 * Load notification preferences from AsyncStorage.
 * Returns DEFAULT_PREFS on missing key or parse error (T-23-01 mitigation).
 */
export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  const scope = captureAuthRequestScope();
  if (!scope) return DEFAULT_PREFS;
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!isAuthRequestScopeCurrent(scope)) return DEFAULT_PREFS;
    return raw ? (JSON.parse(raw) as NotificationPrefs) : DEFAULT_PREFS;
  } catch (e) {
    console.error('[notifications] loadNotificationPrefs failed:', e);
    return DEFAULT_PREFS;
  }
}

/**
 * Save notification preferences to AsyncStorage.
 * Swallows errors silently — non-critical write.
 */
export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  const scope = captureAuthRequestScope();
  if (!scope || !isAuthRequestScopeCurrent(scope)) return;
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('[notifications] saveNotificationPrefs failed:', e);
  }
}

// ─── Permission ───────────────────────────────────────────────────────────────

/**
 * Checks existing permission status before prompting (D-03).
 * Returns true if permission is (or becomes) granted.
 * Returns false on denial or error without throwing.
 */
export async function ensurePermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.error('[notifications] ensurePermission failed:', e);
    return false;
  }
}

// ─── Scheduling helpers ───────────────────────────────────────────────────────

/**
 * Schedule a daily repeating notification for a single slot.
 *
 * Uses a deterministic identifier ("vitalspan-{slot}") so repeated calls
 * replace rather than duplicate the scheduled entry (Pitfall 3 mitigation).
 *
 * @param slot - TimeSlot key (morning | afternoon | evening | night)
 * @param time - "HH:MM" 24-hour time string
 */
export async function scheduleSlot(
  slot: TimeSlot,
  time: string,
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<void> {
  if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) return;
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: `vitalspan-${slot}`,
    content: {
      title: 'Vitalspan Reminder',
      body: `Time to take your ${slot} supplements.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  if (!isAuthRequestScopeCurrent(expectedScope)) {
    await Notifications.cancelScheduledNotificationAsync(`vitalspan-${slot}`).catch(() => null);
  }
}

/**
 * Cancel the scheduled notification for a single slot.
 */
export async function cancelSlot(slot: TimeSlot): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`vitalspan-${slot}`);
}

// ─── Per-item scheduling ──────────────────────────────────────────────────────

const SLOT_DEFAULT_TIMES: Record<TimeSlot, string> = {
  morning:   '08:00',
  afternoon: '13:00',
  evening:   '18:00',
  night:     '21:00',
};

/**
 * Schedule a daily reminder for a single protocol item or medication.
 *
 * @param id    - Stable identifier string; will be prefixed with `vitalspan-item-`
 * @param slot  - Which slot time to fire at
 * @param name  - Display name used in the notification body
 * @param prefs - NotificationPrefs, used to resolve the slot's configured clock time
 */
export async function scheduleItemReminder(
  id: string,
  slot: TimeSlot,
  name: string,
  prefs: NotificationPrefs,
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<void> {
  if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) return;
  const time = prefs[slot]?.time ?? SLOT_DEFAULT_TIMES[slot];
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: `vitalspan-item-${id}`,
    content: {
      title: 'Vitalspan Reminder',
      body: `Time to take ${name}.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  if (!isAuthRequestScopeCurrent(expectedScope)) {
    await Notifications.cancelScheduledNotificationAsync(`vitalspan-item-${id}`).catch(() => null);
  }
}

/**
 * Cancel the per-item reminder for a given id.
 */
export async function cancelItemReminder(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`vitalspan-item-${id}`);
}

/**
 * Cancel all scheduled notifications, then reschedule all per-item reminders
 * from the current protocol state. Called by App.tsx on every launch to keep
 * notifications fresh after EAS updates (D-04).
 */
export async function rescheduleAll(
  prefs: NotificationPrefs,
  protocol?: {
    supplements?: Array<{ id: string; name: string; reminderEnabled?: boolean; reminderSlot?: TimeSlot }>;
    medReminders?: Record<string, { enabled: boolean; slot: TimeSlot }>;
  },
  expectedScope: AuthRequestScope | null = captureAuthRequestScope(),
): Promise<void> {
  if (!expectedScope || !isAuthRequestScopeCurrent(expectedScope)) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const item of protocol?.supplements ?? []) {
    if (!isAuthRequestScopeCurrent(expectedScope)) return;
    if (item.reminderEnabled && item.reminderSlot) {
      await scheduleItemReminder(item.id, item.reminderSlot, item.name, prefs, expectedScope).catch(() => null);
    }
  }
  for (const [medName, config] of Object.entries(protocol?.medReminders ?? {})) {
    if (!isAuthRequestScopeCurrent(expectedScope)) return;
    if (config.enabled) {
      await scheduleItemReminder(`med_${medName}`, config.slot, medName, prefs, expectedScope).catch(() => null);
    }
  }
}

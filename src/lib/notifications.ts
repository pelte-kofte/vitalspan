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
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    return raw ? (JSON.parse(raw) as NotificationPrefs) : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Save notification preferences to AsyncStorage.
 * Swallows errors silently — non-critical write.
 */
export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // swallow
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
  } catch {
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
export async function scheduleSlot(slot: TimeSlot, time: string): Promise<void> {
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
}

/**
 * Cancel the scheduled notification for a single slot.
 */
export async function cancelSlot(slot: TimeSlot): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`vitalspan-${slot}`);
}

/**
 * Cancel all scheduled notifications, then reschedule all enabled slots.
 * Used by App.tsx on every launch to keep notifications fresh after EAS
 * updates (D-04). Uses cancel-all first to prevent accumulation (Pitfall 3).
 */
export async function rescheduleAll(prefs: NotificationPrefs): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const slots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night'];
  for (const slot of slots) {
    if (prefs[slot].enabled) {
      await scheduleSlot(slot, prefs[slot].time);
    }
  }
}

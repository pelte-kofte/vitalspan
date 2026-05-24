# External Integrations

**Analysis Date:** 2026-05-24

## APIs & External Services

**None active.** The app makes zero outbound HTTP/API calls. All data is computed locally or mocked.

No `fetch`, `axios`, or external SDK network calls exist in `src/`.

## Data Storage

**Databases:**
- None — no remote database connected
- AsyncStorage (local device only) used as the sole persistence layer
  - Client: `@react-native-async-storage/async-storage` 2.2.0
  - Accessed directly in screens (no storage abstraction hook)

**AsyncStorage keys in use:**
| Key | Contents | Files |
|-----|----------|-------|
| `@vitalspan_user_profile` | UserProfile (name, age, sex, goal, conditions, medications, onboardingComplete) | `App.tsx`, `OnboardingScreen.tsx`, `ProfileScreen.tsx`, `DashboardScreen.tsx`, `ProtocolScreen.tsx`, `LongevityScoreScreen.tsx`, `SettingsScreen.tsx` |
| `@vitalspan_biomarkers` | StoredEntry[] (biomarker history with timestamps) | `BiomarkerEntryScreen.tsx`, `BiomarkerDetailScreen.tsx`, `DashboardScreen.tsx`, `LabUploadScreen.tsx`, `LongevityScoreScreen.tsx` |
| `@vitalspan_protocol` | ProtocolState (medTimes, addedSupplements, customSupplements, taken, takenDate) | `ProtocolScreen.tsx` |
| `@vitalspan_protocol_today` | { date, taken } daily taken cache | `DashboardScreen.tsx`, `ProtocolScreen.tsx` |
| `@vitalspan_health_data` | HealthData (HRV, sleep, glucose, recovery, isDemoMode, lastSynced) | `src/lib/healthkit.ts`, `LongevityScoreScreen.tsx` |
| `@vitalspan_health_permissions` | PermissionStatus (granted, categories, requestedAt) | `src/lib/healthkit.ts` |

**Planned future database:**
- Supabase (mentioned in `CLAUDE.md` "What's Next" — not installed, no code present)

**File Storage:**
- Local filesystem only via `expo-file-system` (PDF reading from device in `src/lib/labParser.ts`)
- No cloud file storage

**Caching:**
- AsyncStorage serves as the cache layer (no TTL mechanism except HealthKit stale check: 4-hour threshold in `src/lib/healthkit.ts:isHealthDataStale`)

## Authentication & Identity

**Auth Provider:**
- None — no authentication system present
- User profile is stored locally only with no identity verification
- Planned: Supabase (not implemented)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, or similar)

**Logs:**
- `console.log` only (one instance in `src/lib/phenoAge.ts:76` for PhenoAge debug output)
- No structured logging framework

**Analytics:**
- None (no Amplitude, Mixpanel, Firebase Analytics, or similar)

## CI/CD & Deployment

**Hosting:**
- iOS App Store (target)
- EAS Build configured in `eas.json` with three profiles:
  - `development`: developmentClient, internal distribution
  - `preview`: internal distribution
  - `production`: auto-increment build number

**CI Pipeline:**
- None configured (no GitHub Actions, Bitrise, or similar)
- EAS CLI is the manual build/submit tool

**App Store:**
- Bundle ID: `com.vitalspan.app`
- EAS Project ID: `4d42a8cb-bf83-4229-82a5-1b2273356a54`
- Submit config present in `eas.json` (`submit.production` is empty — not yet configured)

## Apple HealthKit

**Status:** Mock/stub only — `expo-health` is NOT installed.

**Current implementation:** `src/lib/healthkit.ts`
- Simulates permission request via Alert dialogs
- Generates randomized demo data (flagged `isDemoMode: true`)
- Persists mock data to `@vitalspan_health_data` via AsyncStorage

**Declared capabilities** (in `app.json` `ios.infoPlist`):
- `NSHealthShareUsageDescription` — read access declared
- `NSHealthUpdateUsageDescription` — write access declared

**Real implementation path** (commented out in `src/lib/healthkit.ts`):
```
npx expo install expo-health && npx expo run:ios
```
Data types planned: HRV, RestingHeartRate, Vo2Max, SleepAnalysis, RespiratoryRate, Steps, MindfulSession, BloodGlucose

## Document / File Integrations

**Lab PDF Parsing:** `src/lib/labParser.ts`
- Uses `expo-document-picker` to select PDF files from device
- Uses `expo-image-picker` for image-based lab results
- Uses `expo-file-system` (`File.arrayBuffer()`) to read PDF binary
- Parses biomarker values from raw PDF text using regex patterns
- Supports English and Turkish lab report aliases
- No external OCR or cloud parsing service — fully on-device

## Planned Integrations (Not Yet Implemented)

| Service | Purpose | Notes |
|---------|---------|-------|
| `expo-health` (Apple HealthKit) | Real biometric data sync | Mock ready in `src/lib/healthkit.ts` |
| Supabase | Backend database + auth | Mentioned in `CLAUDE.md`, no code |
| RevenueCat | Paywall / subscriptions | Mentioned in `CLAUDE.md`, no code |
| expo-notifications | Push notifications | Mentioned in `CLAUDE.md`, no code |
| EAS Submit | App Store submission | Config stub in `eas.json` |

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

## Environment Configuration

**Required env vars:** None — the app has no runtime environment variables.

**Secrets location:** No secrets present. EAS project ID is in `app.json` (non-sensitive).

---

*Integration audit: 2026-05-24*

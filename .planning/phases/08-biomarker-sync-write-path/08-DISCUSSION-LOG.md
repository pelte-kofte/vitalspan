# Phase 8: Biomarker Sync Write Path - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 8-Biomarker Sync Write Path
**Areas discussed:** Migration trigger location, Dashboard staleness gate, biomarker_entries table schema, Write path location

---

## Migration Trigger Location

| Option | Description | Selected |
|--------|-------------|----------|
| App.tsx after auth init | Fire-and-forget after initSupabaseSession(). User never waits. | ✓ |
| DashboardScreen on first mount | Runs when user first sees Dashboard — slightly later. | |

**User's choice:** App.tsx after auth init
**Notes:** Same fire-and-forget pattern as initSupabaseSession().

---

### Migration failure behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Fail silently, retry next launch | Don't set flag on failure. Next launch retries. | ✓ |
| Fail silently, don't retry | Set flag even on failure — runs once, period. | |

**User's choice:** Fail silently, retry next launch
**Notes:** Flag only set after confirmed success.

---

### Empty AsyncStorage on migration

| Option | Description | Selected |
|--------|-------------|----------|
| Skip if no entries | Check length first; set flag and return immediately. | ✓ |
| Run anyway as no-op | Insert empty array — same outcome, simpler code path. | |

**User's choice:** Skip if no entries

---

## Dashboard Staleness Gate

| Option | Description | Selected |
|--------|-------------|----------|
| Always pull on mount | Every mount fetches from Supabase. Simple, always fresh. | ✓ |
| Timestamp gate (>5 min) | Pull only if stale by time. Fewer requests, more complexity. | |
| Once per app session | Pull on first mount after launch. May show stale data. | |

**User's choice:** Always pull on mount

---

### What Dashboard reads from Supabase

| Option | Description | Selected |
|--------|-------------|----------|
| Raw entries (StoredEntry[] shape) | Existing PhenoAge computation unchanged. | ✓ |
| Skip Dashboard Supabase pull | Dashboard stays AsyncStorage-only — remove SC3 from scope. | |

**User's choice:** Raw entries only

---

## biomarker_entries Table Schema

### user_id association

| Option | Description | Selected |
|--------|-------------|----------|
| user_id UUID from auth.uid() | Per-user data isolation. Required for future multi-device sync. | ✓ |
| No user_id | All entries shared — security problem for health data. | |

**User's choice:** user_id from auth.uid()

---

### Primary key type

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve AsyncStorage string id | Reuse existing id field. No remapping needed during migration. | ✓ |
| Supabase-native UUID | More conventional but requires id remapping. | |

**User's choice:** Preserve AsyncStorage string id (text PK)

---

### RLS policy

| Option | Description | Selected |
|--------|-------------|----------|
| SELECT + INSERT for own rows only | Append-only from client. Correct for this phase. | ✓ |
| Full CRUD for own rows | Adds UPDATE/DELETE — not needed for Phase 8. | |

**User's choice:** SELECT + INSERT where user_id = auth.uid()

---

## Write Path Location

### Service file location

| Option | Description | Selected |
|--------|-------------|----------|
| New src/lib/biomarkerWriteService.ts | Follows Phase 7 service pattern. Keeps screen thin. | ✓ |
| Inline in BiomarkerEntryScreen.save() | Simpler, fewer files, mixes concerns. | |
| Extend existing biomarkerService.ts | Conflates read and write concerns. | |

**User's choice:** New src/lib/biomarkerWriteService.ts

---

### Service exports

| Option | Description | Selected |
|--------|-------------|----------|
| Two functions: syncEntry + migrateHistory | Clear separation of concerns at call sites. | ✓ |
| One function: syncEntries(entries[]) | Simpler API but less clear intent. | |

**User's choice:** Two functions: syncEntry(entry: StoredEntry): void + migrateHistory(entries: StoredEntry[]): Promise<void>

---

### Screens that call syncEntry

| Option | Description | Selected |
|--------|-------------|----------|
| Both BiomarkerEntryScreen and GuidedFirstRunScreen | GuidedFirstRunScreen entries also synced live. | |
| BiomarkerEntryScreen only | GuidedFirstRunScreen entries caught by migration. | ✓ |

**User's choice:** BiomarkerEntryScreen only

---

## Claude's Discretion

- `upsert` with `onConflict: 'id'` for migration insert (safe against partial retries)
- `syncEntry` returns `void` (not `Promise<void>`) to make fire-and-forget contract explicit

## Deferred Ideas

- **Delete sync** — No DELETE RLS; data is append-only. Out of scope for v2.
- **Multi-device sync** — Each device has its own anonymous UUID. Account linking deferred post-v2.
- **GuidedFirstRunScreen live sync** — Entries caught by migration. Live sync deferred.

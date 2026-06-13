/**
 * TDD test script for advisorContext.ts behavioral spec.
 * Run: npx ts-node src/lib/advisorContext.test.ts
 * RED phase: these tests define required behavior before implementation.
 *
 * Tests mock AsyncStorage so the function can be called in a Node context.
 */

// ── AsyncStorage mock ─────────────────────────────────────────────────────────
const _store: Record<string, string> = {};

jest_mockRequire('@react-native-async-storage/async-storage', {
  getItem: async (key: string): Promise<string | null> => _store[key] ?? null,
  setItem: async (key: string, value: string): Promise<void> => { _store[key] = value; },
  removeItem: async (key: string): Promise<void> => { delete _store[key]; },
});

function setStorageKey(key: string, value: unknown): void {
  _store[key] = JSON.stringify(value);
}
function clearStorage(): void {
  for (const k of Object.keys(_store)) delete _store[k];
}

// Minimal mock for module resolution
function jest_mockRequire(mod: string, impl: unknown): void {
  // No-op in ts-node context — modules are resolved via the path in require()
  // The actual mock is handled by overriding the require cache below
  void mod; void impl;
}

// ── require-cache mock injection for AsyncStorage ────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Module = require('module');
const _originalLoad = Module._load.bind(Module);
Module._load = function (request: string, parent: unknown, isMain: boolean): unknown {
  if (request === '@react-native-async-storage/async-storage') {
    return {
      default: {
        getItem: async (key: string): Promise<string | null> => _store[key] ?? null,
        setItem: async (key: string, value: string): Promise<void> => { _store[key] = value; },
        removeItem: async (key: string): Promise<void> => { delete _store[key]; },
      },
    };
  }
  return _originalLoad(request, parent, isMain);
};

// ── Test harness ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed++;
  } else {
    console.log(`FAIL: ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function run(): Promise<void> {
  // Import after mock injection
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { assembleAdvisorContext } = require('./advisorContext') as typeof import('./advisorContext');

  // ── Test 1: ageBand "35–39" when age = 37 ──────────────────────────────────
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 37, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  {
    const ctx = await assembleAdvisorContext();
    assert('Test 1: ageBand "35–39" when age=37', ctx.ageBand === '35–39', `got ${ctx.ageBand}`);
  }

  // ── Test 2: ageBand "40–44" when age = 42 ──────────────────────────────────
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 42, sex: 'female', goal: 'performance', medications: [], conditions: [] });
  {
    const ctx = await assembleAdvisorContext();
    assert('Test 2: ageBand "40–44" when age=42', ctx.ageBand === '40–44', `got ${ctx.ageBand}`);
  }

  // ── Test 3: healthDataAvailable=false, no hrv/sleepScore/recovery when isDemoMode=true ─
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  setStorageKey('@vitalspan_health_data', { hrv: 55, sleepScore: 80, recovery: 70, isDemoMode: true });
  {
    const ctx = await assembleAdvisorContext();
    assert('Test 3: healthDataAvailable=false when isDemoMode=true', ctx.healthDataAvailable === false, `got ${ctx.healthDataAvailable}`);
    assert('Test 3: hrv absent when isDemoMode=true', !('hrv' in ctx), `hrv present: ${ctx.hrv}`);
    assert('Test 3: sleepScore absent when isDemoMode=true', !('sleepScore' in ctx), `sleepScore present: ${ctx.sleepScore}`);
    assert('Test 3: recovery absent when isDemoMode=true', !('recovery' in ctx), `recovery present: ${ctx.recovery}`);
  }

  // ── Test 4: healthDataAvailable=true, hrv/sleepScore/recovery present when isDemoMode=false ─
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  setStorageKey('@vitalspan_health_data', { hrv: 55, sleepScore: 80, recovery: 70, isDemoMode: false });
  {
    const ctx = await assembleAdvisorContext();
    assert('Test 4: healthDataAvailable=true when isDemoMode=false', ctx.healthDataAvailable === true, `got ${ctx.healthDataAvailable}`);
    assert('Test 4: hrv present when isDemoMode=false', ctx.hrv === 55, `got ${ctx.hrv}`);
    assert('Test 4: sleepScore present when isDemoMode=false', ctx.sleepScore === 80, `got ${ctx.sleepScore}`);
    assert('Test 4: recovery present when isDemoMode=false', ctx.recovery === 70, `got ${ctx.recovery}`);
  }

  // ── Test 5: biomarker within optMin..optMax → 'Optimal' ───────────────────
  // Using 'apob' (optMin:40, optMax:70) — value 55 is within range
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  setStorageKey('@vitalspan_biomarkers', [
    { id: '1', type: 'apob', value: 55, unit: 'mg/dL', date: '2026-01-01' },
  ]);
  {
    const ctx = await assembleAdvisorContext();
    const apob = ctx.biomarkers.find((b) => b.name === 'ApoB');
    assert('Test 5: value within range → Optimal', apob?.status === 'Optimal', `got ${apob?.status}`);
  }

  // ── Test 6: biomarker moderately above optMax → 'Suboptimal' ──────────────
  // ApoB optMax=70; value 90 is 28.6% above optMax (<40%) → Suboptimal
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  setStorageKey('@vitalspan_biomarkers', [
    { id: '1', type: 'apob', value: 90, unit: 'mg/dL', date: '2026-01-01' },
  ]);
  {
    const ctx = await assembleAdvisorContext();
    const apob = ctx.biomarkers.find((b) => b.name === 'ApoB');
    assert('Test 6: value moderately above optMax → Suboptimal', apob?.status === 'Suboptimal', `got ${apob?.status}`);
  }

  // ── Test 7: biomarker far above optMax → 'Critical' ───────────────────────
  // ApoB optMax=70; value 150 is 114% above optMax (>40%) → Critical
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  setStorageKey('@vitalspan_biomarkers', [
    { id: '1', type: 'apob', value: 150, unit: 'mg/dL', date: '2026-01-01' },
  ]);
  {
    const ctx = await assembleAdvisorContext();
    const apob = ctx.biomarkers.find((b) => b.name === 'ApoB');
    assert('Test 7: value far above optMax → Critical', apob?.status === 'Critical', `got ${apob?.status}`);
  }

  // ── Test 8: medications array contains names only ─────────────────────────
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: ['Metformin', 'Lisinopril'], conditions: [] });
  {
    const ctx = await assembleAdvisorContext();
    assert('Test 8: medications are names (Metformin present)', ctx.medications.includes('Metformin'), `got ${JSON.stringify(ctx.medications)}`);
    assert('Test 8: medications are names (Lisinopril present)', ctx.medications.includes('Lisinopril'), `got ${JSON.stringify(ctx.medications)}`);
    assert('Test 8: medications count matches', ctx.medications.length === 2, `got ${ctx.medications.length}`);
  }

  // ── Test 9: supplements merges addedSupplements + customSupplements.name, deduped ─
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  setStorageKey('@vitalspan_protocol', {
    medTimes: {},
    addedSupplements: ['Omega-3', 'NMN'],
    customSupplements: [
      { id: 'c1', name: 'NMN', dose: '500mg', addedAt: '2026-01-01' }, // duplicate
      { id: 'c2', name: 'Magnesium', dose: '400mg', addedAt: '2026-01-01' },
    ],
    taken: [],
    takenDate: '2026-01-01',
  });
  {
    const ctx = await assembleAdvisorContext();
    assert('Test 9: supplements contains Omega-3', ctx.supplements.includes('Omega-3'), `got ${JSON.stringify(ctx.supplements)}`);
    assert('Test 9: supplements contains NMN (once, deduped)', ctx.supplements.filter((s) => s === 'NMN').length === 1, `got ${JSON.stringify(ctx.supplements)}`);
    assert('Test 9: supplements contains Magnesium', ctx.supplements.includes('Magnesium'), `got ${JSON.stringify(ctx.supplements)}`);
    assert('Test 9: supplements count is 3 (deduped)', ctx.supplements.length === 3, `got ${ctx.supplements.length}`);
  }

  // ── Test 10: never throws when AsyncStorage is empty ──────────────────────
  clearStorage();
  {
    let threw = false;
    let ctx: Awaited<ReturnType<typeof assembleAdvisorContext>> | null = null;
    try {
      ctx = await assembleAdvisorContext();
    } catch {
      threw = true;
    }
    assert('Test 10: does not throw when storage empty', !threw, 'threw an exception');
    assert('Test 10: returns valid object when storage empty', ctx !== null && typeof ctx === 'object', `got ${ctx}`);
    assert('Test 10: empty biomarkers array when storage empty', Array.isArray(ctx?.biomarkers) && ctx.biomarkers.length === 0, `got ${ctx?.biomarkers}`);
  }

  // ── Test 11: exerciseFrequency "3x/week" when 3 entries in last 7 days ────
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  // Create 3 entries logged within the last 7 days
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const twoDaysAgo = new Date(now); twoDaysAgo.setDate(now.getDate() - 2);
  const oldEntry = new Date(now); oldEntry.setDate(now.getDate() - 10); // outside 7 days
  setStorageKey('@vitalspan_exercise_log', [
    { id: 'e1', exerciseId: '001', exerciseName: 'Squat', category: 'Legs', date: '2026-06-13', loggedAt: now.toISOString() },
    { id: 'e2', exerciseId: '002', exerciseName: 'Push-up', category: 'Push', date: '2026-06-12', loggedAt: yesterday.toISOString() },
    { id: 'e3', exerciseId: '003', exerciseName: 'Pull-up', category: 'Pull / Row', date: '2026-06-11', loggedAt: twoDaysAgo.toISOString() },
    { id: 'e4', exerciseId: '004', exerciseName: 'Run', category: 'Cardio', date: '2026-06-04', loggedAt: oldEntry.toISOString() },
  ]);
  {
    const ctx = await assembleAdvisorContext();
    assert('Test 11: exerciseFrequency is "3x/week" for 3 entries in last 7 days', ctx.exerciseFrequency === '3x/week', `got ${ctx.exerciseFrequency}`);
  }

  // ── Test 12: exerciseFrequency omitted when no entries in last 7 days ─────
  clearStorage();
  setStorageKey('@vitalspan_user_profile', { age: 45, sex: 'male', goal: 'longevity', medications: [], conditions: [] });
  const veryOld = new Date(now); veryOld.setDate(now.getDate() - 30);
  setStorageKey('@vitalspan_exercise_log', [
    { id: 'e1', exerciseId: '001', exerciseName: 'Squat', category: 'Legs', date: '2026-05-15', loggedAt: veryOld.toISOString() },
  ]);
  {
    const ctx = await assembleAdvisorContext();
    assert('Test 12: exerciseFrequency absent when no entries in last 7 days', !('exerciseFrequency' in ctx), `got ${ctx.exerciseFrequency}`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err: unknown) => {
  console.error('Test runner threw:', err);
  process.exit(1);
});

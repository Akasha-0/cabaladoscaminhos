/**
 * W71-B: Spec for permission-flow.ts
 */

import {
  getPermissionState,
  shouldShowPermissionPrompt,
  recordPromptResponse,
  getPromptCooldown,
  clearAllPromptHistory,
  auditPromptHistory,
  decideNotification,
  isSacredTradition,
  normalizeTraditions,
  auditSacredCoverage,
  SACRED_TRADITIONS,
  SACRED_TRADITION_MIN,
  PROMPT_COOLDOWN_MS,
  MAX_DISMISSALS,
  TRADITION_BOUNDARY_REGEX,
} from '../engines/permission-flow.ts';

// ───────────────────────────────────────────────────────────────────────────
// Self-running harness
// ───────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const assertions: Array<{ name: string; ok: boolean; detail?: string }> = [];

function assertIt(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed += 1;
    assertions.push({ name, ok: true });
  } else {
    failed += 1;
    assertions.push({ name, ok: false, detail });
  }
}

function assertEqual<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) {
    passed += 1;
    assertions.push({ name, ok: true });
  } else {
    failed += 1;
    assertions.push({
      name,
      ok: false,
      detail: `expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`,
    });
  }
}

function assertThrows(name: string, fn: () => unknown, pattern?: RegExp): void {
  try {
    fn();
    failed += 1;
    assertions.push({ name, ok: false, detail: 'did not throw' });
  } catch (e) {
    const msg = (e as Error).message;
    if (!pattern || pattern.test(msg)) {
      passed += 1;
      assertions.push({ name, ok: true });
    } else {
      failed += 1;
      assertions.push({
        name,
        ok: false,
        detail: `threw "${msg}" but did not match ${pattern}`,
      });
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Mocks for browser permission state
// ───────────────────────────────────────────────────────────────────────────

function setBrowserMocks(permission: NotificationPermission | 'none'): void {
  const g = globalThis as unknown as { navigator?: Navigator; Notification?: NotificationStatic };
  if (permission === 'none') {
    delete g.navigator;
    delete g.Notification;
    return;
  }
  g.navigator = { serviceWorker: {} as ServiceWorkerContainer };
  g.Notification = {
    permission,
    maxActions: 4,
    requestPermission: async () => permission,
  } as unknown as NotificationStatic;
}

function clearBrowserMocks(): void {
  setBrowserMocks('none');
}

// ───────────────────────────────────────────────────────────────────────────
// Spec body
// ───────────────────────────────────────────────────────────────────────────

export function runPermissionFlowSpec(): { passed: number; failed: number; assertions: typeof assertions } {
  passed = 0;
  failed = 0;
  assertions.length = 0;

  // ─── Section 1: Permission state detection ───
  {
    setBrowserMocks('none');
    assertEqual('state:none_is_unsupported', getPermissionState(), 'unsupported');

    setBrowserMocks('granted');
    assertEqual('state:granted', getPermissionState(), 'granted');

    setBrowserMocks('denied');
    assertEqual('state:denied', getPermissionState(), 'denied');

    setBrowserMocks('default');
    assertEqual('state:default', getPermissionState(), 'default');

    clearBrowserMocks();
  }

  // ─── Section 2: shouldShowPermissionPrompt ───
  {
    setBrowserMocks('default');
    clearAllPromptHistory();

    // First time, no history → show
    assertEqual('prompt:first_time', shouldShowPermissionPrompt('u1'), true);

    // After recording a dismissal, cooldown applies
    recordPromptResponse('u1', 'dismissed');
    assertEqual('prompt:after_dismiss_cooldown', shouldShowPermissionPrompt('u1'), false);

    // But after 7 days, should show again
    const farFuture = Date.now() - (PROMPT_COOLDOWN_MS + 60_000);
    assertEqual(
      'prompt:after_cooldown_expired',
      shouldShowPermissionPrompt('u1', { lastPromptAt: farFuture, dismissedCount: 1 }),
      true,
    );

    // 3 dismissals → permanent block
    recordPromptResponse('u1', 'dismissed');
    recordPromptResponse('u1', 'dismissed');
    assertEqual('prompt:max_dismissals', shouldShowPermissionPrompt('u1'), false);

    // Denied permission → never show
    setBrowserMocks('denied');
    assertEqual('prompt:denied_state', shouldShowPermissionPrompt('u2'), false);
    setBrowserMocks('default');

    // Unsupported → never show
    setBrowserMocks('none');
    assertEqual('prompt:unsupported_state', shouldShowPermissionPrompt('u3'), false);
    setBrowserMocks('default');

    // Granted → never show
    setBrowserMocks('granted');
    assertEqual('prompt:granted_state', shouldShowPermissionPrompt('u4'), false);
    setBrowserMocks('default');
  }

  // ─── Section 3: recordPromptResponse ───
  {
    clearAllPromptHistory();
    recordPromptResponse('u-grant', 'granted');
    const audit = auditPromptHistory();
    const userAudit = audit.perUser.find((p) => p.userId === 'u-grant');
    assertEqual('record:granted_resets_count', userAudit?.dismissedCount, 0);
    assertIt('record:granted_sets_lastPromptAt', typeof userAudit?.lastPromptAt === 'number');

    recordPromptResponse('u-deny', 'denied');
    recordPromptResponse('u-deny', 'denied');
    recordPromptResponse('u-deny', 'denied');
    recordPromptResponse('u-deny', 'denied'); // 4th, should cap
    const denyAudit = auditPromptHistory();
    const deny = denyAudit.perUser.find((p) => p.userId === 'u-deny');
    assertEqual('record:cap_at_max', deny?.dismissedCount, MAX_DISMISSALS);
  }

  // ─── Section 4: recordPromptResponse validation ───
  {
    assertThrows('record:empty_userId', () => recordPromptResponse('', 'granted'));
    assertThrows('record:invalid_response', () => recordPromptResponse('u', 'foo' as never));
  }

  // ─── Section 5: getPromptCooldown ───
  {
    clearAllPromptHistory();
    setBrowserMocks('none');
    assertEqual('cooldown:unsupported', getPromptCooldown('u1').canPrompt, false);

    setBrowserMocks('granted');
    assertEqual('cooldown:granted', getPromptCooldown('u2').canPrompt, false);

    setBrowserMocks('denied');
    assertEqual('cooldown:denied', getPromptCooldown('u3').canPrompt, false);

    setBrowserMocks('default');
    assertEqual('cooldown:first_time', getPromptCooldown('u4').canPrompt, true);

    recordPromptResponse('u4', 'dismissed');
    const c = getPromptCooldown('u4');
    assertEqual('cooldown:after_dismiss_blocked', c.canPrompt, false);
    assertEqual('cooldown:after_dismiss_within_cooldown', c.reason, 'within_cooldown');
    assertIt('cooldown:after_dismiss_cooldown_ms_positive', c.cooldownMs > 0);

    // max dismissals
    recordPromptResponse('u5', 'dismissed');
    recordPromptResponse('u5', 'dismissed');
    recordPromptResponse('u5', 'dismissed');
    assertEqual('cooldown:max_dismissals', getPromptCooldown('u5').reason, 'max_dismissals_reached');
  }

  // ─── Section 6: shouldShowPermissionPrompt validation ───
  {
    assertThrows('prompt:empty_userId', () => shouldShowPermissionPrompt(''));
  }

  // ─── Section 7: decideNotification — sacred coverage ───
  {
    const baseCtx = {
      userId: 'u1',
      traditions: ['cigano', 'orixas', 'astrologia'] as string[],
      streakDays: 5,
      achievementsUnlocked: 3,
      communityMemberships: 2,
    };

    // 3 traditions → achievement OK
    const threeT = decideNotification({ ...baseCtx, traditions: ['cigano', 'orixas', 'astrologia'] }, 'achievement');
    assertEqual('decide:3t_achievement_ok', threeT.shouldSend, true);

    // 2 traditions → achievement blocked
    const twoT = decideNotification({ ...baseCtx, traditions: ['cigano', 'orixas'] }, 'achievement');
    assertEqual('decide:2t_achievement_blocked', twoT.shouldSend, false);

    // 0 traditions → tradition still needs ≥1
    const tradZero = decideNotification({ ...baseCtx, traditions: [] }, 'tradition');
    assertEqual('decide:0t_tradition_blocked', tradZero.shouldSend, false);

    // mention always OK
    const mention = decideNotification({ ...baseCtx, traditions: [] }, 'mention');
    assertEqual('decide:0t_mention_ok', mention.shouldSend, true);

    // streak < 3 → blocked
    const shortStreak = decideNotification({ ...baseCtx, traditions: ['cigano', 'orixas', 'astrologia'], streakDays: 2 }, 'streak');
    assertEqual('decide:short_streak_blocked', shortStreak.shouldSend, false);

    // streak >= 3 → OK
    const longStreak = decideNotification({ ...baseCtx, traditions: ['cigano', 'orixas', 'astrologia'], streakDays: 5 }, 'streak');
    assertEqual('decide:long_streak_ok', longStreak.shouldSend, true);

    // community with 0 memberships → blocked even with traditions
    const noMemberships = decideNotification({ ...baseCtx, traditions: ['cigano', 'orixas', 'astrologia'], communityMemberships: 0 }, 'community');
    assertEqual('decide:no_memberships_blocked', noMemberships.shouldSend, false);

    // community with memberships + traditions → OK
    const community = decideNotification({ ...baseCtx, traditions: ['cigano', 'orixas', 'astrologia'], communityMemberships: 2 }, 'community');
    assertEqual('decide:community_ok', community.shouldSend, true);

    // system always OK
    const sys = decideNotification({ ...baseCtx, traditions: [] }, 'system');
    assertEqual('decide:system_always_ok', sys.shouldSend, true);

    // Unknown category
    const unk = decideNotification(baseCtx, 'unknown' as never);
    assertEqual('decide:unknown_blocked', unk.shouldSend, false);
  }

  // ─── Section 8: Sacred traditions ───
  {
    assertEqual('traditions:7_count', SACRED_TRADITIONS.length, 7);
    assertEqual('traditions:min_3', SACRED_TRADITION_MIN, 3);

    assertEqual('isSacred:cigano', isSacredTradition('cigano'), true);
    assertEqual('isSacred:orixas', isSacredTradition('orixas'), true);
    assertEqual('isSacred:astrologia', isSacredTradition('astrologia'), true);
    assertEqual('isSacred:cabala', isSacredTradition('cabala'), true);
    assertEqual('isSacred:numerologia', isSacredTradition('numerologia'), true);
    assertEqual('isSacred:tarot', isSacredTradition('tarot'), true);
    assertEqual('isSacred:tantra', isSacredTradition('tantra'), true);
    assertEqual('isSacred:invalid', isSacredTradition('bogus'), false);
    assertEqual('isSacred:empty', isSacredTradition(''), false);
  }

  // ─── Section 9: normalizeTraditions ───
  {
    const norm = normalizeTraditions(['Cigano', 'cigano', 'orixas', 'BOGUS', '  tantra  ', '', null as unknown as string]);
    assertEqual('norm:dedup_cigano', norm.filter((t) => t === 'cigano').length, 1);
    assertEqual('norm:includes_orixas', norm.includes('orixas'), true);
    assertEqual('norm:excludes_bogus', norm.includes('bogus' as never), false);
    assertEqual('norm:trims_whitespace', norm.includes('tantra'), true);
    assertEqual('norm:skips_empty', norm.includes('' as never), false);
    assertEqual('norm:skips_null', norm.includes(null as never), false);
    assertEqual('norm:length', norm.length, 3);

    assertEqual('norm:non_array', normalizeTraditions(null as unknown as string[]).length, 0);
  }

  // ─── Section 10: auditSacredCoverage ───
  {
    const none = auditSacredCoverage([]);
    assertEqual('cov:none_count', none.count, 0);
    assertEqual('cov:none_meets', none.meetsMinimum, false);
    assertEqual('cov:none_missing_length', none.missing.length, 7);

    const three = auditSacredCoverage(['cigano', 'orixas', 'astrologia']);
    assertEqual('cov:three_count', three.count, 3);
    assertEqual('cov:three_meets', three.meetsMinimum, true);
    assertEqual('cov:three_missing_length', three.missing.length, 4);

    const seven = auditSacredCoverage([...SACRED_TRADITIONS]);
    assertEqual('cov:seven_count', seven.count, 7);
    assertEqual('cov:seven_meets', seven.meetsMinimum, true);
    assertEqual('cov:seven_missing_length', seven.missing.length, 0);

    // Invalid input dropped
    const dirty = auditSacredCoverage(['cigano', 'not-a-tradition']);
    assertEqual('cov:dirty_count', dirty.count, 1);
  }

  // ─── Section 11: TRADITION_BOUNDARY_REGEX (lookaround pattern) ───
  {
    assertIt('boundary:matches_cigano', TRADITION_BOUNDARY_REGEX.test('cigano'));
    assertIt('boundary:matches_orixas', TRADITION_BOUNDARY_REGEX.test('orixas'));
    assertIt('boundary:rejects_supercigano', !TRADITION_BOUNDARY_REGEX.test('supercigano'));
    assertIt('boundary:rejects_ciganos', !TRADITION_BOUNDARY_REGEX.test('ciganos'));
    assertIt('boundary:case_insensitive', TRADITION_BOUNDARY_REGEX.test('CIGANO'));
  }

  // ─── Section 12: auditPromptHistory ───
  {
    clearAllPromptHistory();
    recordPromptResponse('u-a', 'denied');
    recordPromptResponse('u-b', 'denied');
    recordPromptResponse('u-b', 'denied');
    const a = auditPromptHistory();
    assertEqual('audit:total_users', a.totalUsers, 2);
    const uA = a.perUser.find((u) => u.userId === 'u-a');
    const uB = a.perUser.find((u) => u.userId === 'u-b');
    assertEqual('audit:u-a_count', uA?.dismissedCount, 1);
    assertEqual('audit:u-b_count', uB?.dismissedCount, 2);
  }

  // ─── Section 13: decideNotification validation ───
  {
    assertThrows('decide:null_ctx', () => decideNotification(null as never, 'system'));
    assertThrows('decide:empty_userId', () =>
      decideNotification({ userId: '', traditions: [], streakDays: 0, achievementsUnlocked: 0, communityMemberships: 0 }, 'system'),
    );
  }

  clearBrowserMocks();
  return { passed, failed, assertions };
}

const isDirect = typeof import.meta.url === 'string' && process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isDirect) {
  const r = runPermissionFlowSpec();
  console.log(`permission-flow.spec.ts: ${r.passed} passed / ${r.failed} failed / ${r.assertions.length} assertions`);
  if (r.failed > 0) {
    for (const a of r.assertions.filter((a) => !a.ok)) console.log(`  ✗ ${a.name}: ${a.detail ?? ''}`);
    process.exit(1);
  }
  process.exit(0);
}
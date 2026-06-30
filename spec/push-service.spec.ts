/**
 * W71-B: Spec for push-service.ts
 *
 * Self-running test harness (no vitest required). Exports `runPushServiceSpec()`
 * which an aggregating smoke runner can call.
 */

import {
  saveSubscription,
  getSubscription,
  deleteSubscription,
  clearAllSubscriptions,
  generateVapidKeys,
  sendPush,
  sendBatchPush,
  extractAudience,
  makeFakeEndpoint,
  auditSubscriptions,
  tagForTradition,
  buildTraditionPayload,
  subscriptionCount,
} from '../engines/push-service.ts';

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
// Mock fetch (records requests instead of sending)
// ───────────────────────────────────────────────────────────────────────────

interface MockFetchCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  bodyLength: number;
  responseStatus: number;
}

function makeMockFetch(status = 201): {
  fetcher: typeof fetch;
  calls: MockFetchCall[];
} {
  const calls: MockFetchCall[] = [];
  const fetcher: typeof fetch = (async (url: string | URL, init?: RequestInit) => {
    const u = typeof url === 'string' ? url : url.toString();
    const method = init?.method ?? 'GET';
    const headers: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((v, k) => (headers[k] = v));
      } else if (Array.isArray(init.headers)) {
        for (const [k, v] of init.headers) headers[k] = v;
      } else {
        Object.assign(headers, init.headers as Record<string, string>);
      }
    }
    const bodyLength = init?.body ? (init.body as Uint8Array).length : 0;
    calls.push({ url: u, method, headers, bodyLength, responseStatus: status });
    return new Response(null, { status });
  }) as unknown as typeof fetch;
  return { fetcher, calls };
}

// ───────────────────────────────────────────────────────────────────────────
// Spec body
// ───────────────────────────────────────────────────────────────────────────

export function runPushServiceSpec(): { passed: number; failed: number; assertions: typeof assertions } {
  passed = 0;
  failed = 0;
  assertions.length = 0;

  // ─── Section 1: VAPID key generation ───
  {
    const keys = generateVapidKeys();
    // 65 bytes uncompressed → 88 chars base64url (ceil(65 * 4/3) = 88, no padding in b64url so 87 chars)
    // Wait: 65 bytes = 65 * 8 = 520 bits, base64url encodes 6 bits/char → 520/6 = 86.67 → 87 chars
    assertEqual('vapid:publicKey_length_is_87_base64url_chars', keys.publicKey.length, 87);
    // 32 bytes scalar → 43 chars base64url (32*4/3 = 42.67 → 43)
    assertEqual('vapid:privateKey_length_is_43_base64url_chars', keys.privateKey.length, 43);
    assertEqual('vapid:subject_default_mailto', keys.subject.startsWith('mailto:'), true);

    const withSubject = generateVapidKeys('https://cabaladoscaminhos.app');
    assertEqual('vapid:custom_subject', withSubject.subject, 'https://cabaladoscaminhos.app');

    // Two generations should be distinct
    const k1 = generateVapidKeys();
    const k2 = generateVapidKeys();
    assertEqual('vapid:distinct_public_keys', k1.publicKey !== k2.publicKey, true);
    assertEqual('vapid:distinct_private_keys', k1.privateKey !== k2.privateKey, true);
  }

  // ─── Section 2: Subscription CRUD ───
  {
    clearAllSubscriptions();

    const sub = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
      keys: { p256dh: 'A' + 'A'.repeat(86), auth: 'B'.repeat(22) },
      userId: 'u1',
      createdAt: 1000,
      lastUsed: 1000,
    };
    saveSubscription(sub);
    assertEqual('crud:save_get_count', subscriptionCount(), 1);
    const found = getSubscription('u1');
    assertEqual('crud:get_returns_one', found.length, 1);
    assertEqual('crud:get_endpoint_match', found[0]?.endpoint, sub.endpoint);

    // Update lastUsed by re-saving
    saveSubscription({ ...sub, lastUsed: 2000 });
    const updated = getSubscription('u1');
    assertEqual('crud:update_lastUsed', updated[0]?.lastUsed, 2000);

    // Add second user
    const sub2 = { ...sub, endpoint: 'https://fcm.googleapis.com/fcm/send/xyz', userId: 'u2' };
    saveSubscription(sub2);
    assertEqual('crud:multi_user_count', subscriptionCount(), 2);
    assertEqual('crud:multi_user_u2', getSubscription('u2').length, 1);

    // Delete by endpoint
    deleteSubscription(sub.endpoint);
    assertEqual('crud:delete_count', subscriptionCount(), 1);
    assertEqual('crud:delete_get_u1', getSubscription('u1').length, 0);

    // Delete the same endpoint again — no-op
    deleteSubscription(sub.endpoint);
    assertEqual('crud:delete_idempotent', subscriptionCount(), 1);
  }

  // ─── Section 3: saveSubscription validation ───
  {
    clearAllSubscriptions();
    const valid = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
      keys: { p256dh: 'A'.repeat(88), auth: 'B'.repeat(22) },
      userId: 'u1',
      createdAt: 1000,
      lastUsed: 1000,
    };
    assertThrows('validate:missing_endpoint', () =>
      saveSubscription({ ...valid, endpoint: '' as unknown as string }),
    );
    assertThrows('validate:missing_keys_p256dh', () =>
      saveSubscription({ ...valid, keys: { auth: 'B'.repeat(22) } as unknown as { p256dh: string; auth: string } }),
    );
    assertThrows('validate:missing_userId', () =>
      saveSubscription({ ...valid, userId: '' }),
    );
    assertThrows('validate:missing_createdAt', () =>
      saveSubscription({ ...valid, createdAt: 'now' as unknown as number }),
    );

    // Endpoint re-used by a different user → index migrates
    saveSubscription(valid);
    const migrated = { ...valid, userId: 'u-other', createdAt: 2000 };
    saveSubscription(migrated);
    assertEqual('migrate:original_user_loses_endpoint', getSubscription('u1').length, 0);
    assertEqual('migrate:new_user_gains_endpoint', getSubscription('u-other').length, 1);
  }

  // ─── Section 4: extractAudience ───
  {
    assertEqual('audience:fcm', extractAudience('https://fcm.googleapis.com/fcm/send/abc'), 'https://fcm.googleapis.com');
    assertEqual('audience:mozilla', extractAudience('https://updates.push.services.mozilla.com/wpush/v2/abc'), 'https://updates.push.services.mozilla.com');
    assertEqual('audience:apple', extractAudience('https://api.push.apple.com/3/device/abc'), 'https://api.push.apple.com');
    assertEqual('audience:subpath_preserved', extractAudience('https://push.example.com/v1/foo/bar'), 'https://push.example.com');
    assertThrows('audience:invalid_url', () => extractAudience('not-a-url'));
  }

  // ─── Section 5: sendPush (mocked) ───
  {
    clearAllSubscriptions();
    const vapid = generateVapidKeys();
    const sub = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: { p256dh: 'A'.repeat(88), auth: 'B'.repeat(22) },
      userId: 'u1',
      createdAt: 1000,
      lastUsed: 1000,
    };

    // The keys aren't real P-256 points, so encryption will throw — verify error path
    const mock = makeMockFetch(201);
    sendPush(sub, { title: 'Test', body: 'Hi' }, vapid, mock.fetcher).then((r) => {
      assertEqual('send:invalid_p256dh_returns_error', r.success, false);
      assertIt('send:invalid_p256dh_error_message', !!r.error);
    });

    // Now with a real VAPID-generated receiver keypair
    const receiverVapid = generateVapidKeys();
    const realSub = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: receiverVapid.publicKey,
        auth: 'B'.repeat(22), // 16-byte secret encoded as base64url = 22 chars
      },
      userId: sub.userId,
      createdAt: sub.createdAt,
      lastUsed: sub.lastUsed,
    };

    const mock2 = makeMockFetch(201);
    sendPush(realSub, { title: 'Real', body: 'Body' }, vapid, mock2.fetcher).then((r) => {
      assertEqual('send:real_subscription_success', r.success, true);
      assertEqual('send:real_subscription_status', r.statusCode, 201);
      assertEqual('send:mock_called_once', mock2.calls.length, 1);
      const call = mock2.calls[0];
      assertEqual('send:method_is_POST', call?.method, 'POST');
      assertIt('send:auth_header_vapid', !!call?.headers.Authorization?.startsWith('vapid t='));
      assertEqual('send:content_encoding', call?.headers['Content-Encoding'], 'aes128gcm');
      assertEqual('send:content_type', call?.headers['Content-Type'], 'application/octet-stream');
      assertIt('send:encryption_header_salt', !!call?.headers.Encryption?.startsWith('salt='));
      assertIt('send:crypto_key_header', !!call?.headers['Crypto-Key']?.startsWith('dh='));
      assertEqual('send:ttl_default', call?.headers.TTL, '86400');
      assertEqual('send:topic_default', call?.headers.Topic, 'general');
      assertIt('send:body_nonempty', (call?.bodyLength ?? 0) > 0);
    });

    // Topic uses payload.tag
    const mock3 = makeMockFetch(201);
    sendPush(realSub, { title: 'A', body: 'B', tag: 'tradition.cigano' }, vapid, mock3.fetcher).then(() => {
      assertEqual('send:topic_from_payload_tag', mock3.calls[0]?.headers.Topic, 'tradition.cigano');
    });

    // 410 Gone → delete subscription
    const mock410 = makeMockFetch(410);
    sendPush(realSub, { title: 'A', body: 'B' }, vapid, mock410.fetcher).then((r) => {
      assertEqual('send:410_returns_failure', r.success, false);
      assertEqual('send:410_statusCode', r.statusCode, 410);
    });

    // 201 + invalid payload (non-string title) → validation error
    sendPush(realSub, { title: 42 as unknown as string, body: 'B' }, vapid, makeMockFetch().fetcher).then((r) => {
      assertEqual('send:invalid_payload_returns_error', r.success, false);
    });

    // 201 + invalid VAPID
    sendPush(realSub, { title: 'A', body: 'B' }, { publicKey: '', privateKey: '', subject: 'mailto:x' }, makeMockFetch().fetcher).then((r) => {
      assertEqual('send:invalid_vapid_returns_error', r.success, false);
    });
  }

  // ─── Section 6: sendBatchPush ───
  {
    clearAllSubscriptions();
    const vapid = generateVapidKeys();
    const receiver1 = generateVapidKeys();
    const receiver2 = generateVapidKeys();

    const subs = [
      {
        endpoint: makeFakeEndpoint(1),
        keys: { p256dh: receiver1.publicKey, auth: 'B'.repeat(22) },
        userId: 'u1',
        createdAt: 1000,
        lastUsed: 1000,
      },
      {
        endpoint: makeFakeEndpoint(2),
        keys: { p256dh: receiver2.publicKey, auth: 'B'.repeat(22) },
        userId: 'u1',
        createdAt: 1000,
        lastUsed: 1000,
      },
      {
        endpoint: 'https://fcm.googleapis.com/fcm/send/invalid',
        keys: { p256dh: 'bad', auth: 'bad' },
        userId: 'u2',
        createdAt: 1000,
        lastUsed: 1000,
      },
    ];

    const mock = makeMockFetch(201);
    sendBatchPush(subs, { title: 'Batch', body: 'Body' }, vapid, mock.fetcher).then((r) => {
      assertEqual('batch:total_results', r.results.length, 3);
      assertEqual('batch:sent_count', r.sent, 2);
      assertEqual('batch:failed_count', r.failed, 1);
      assertEqual('batch:endpoint_match_1', r.results[0]?.endpoint, subs[0]?.endpoint);
      assertEqual('batch:endpoint_match_3', r.results[2]?.endpoint, subs[2]?.endpoint);
      assertEqual('batch:invalid_success_false', r.results[2]?.success, false);
    });

    // Empty batch
    sendBatchPush([], { title: 'X', body: 'Y' }, vapid).then((r) => {
      assertEqual('batch:empty_zero', r.sent, 0);
      assertEqual('batch:empty_results', r.results.length, 0);
    });

    // Non-array
    sendBatchPush(null as unknown as never[], { title: 'X', body: 'Y' }, vapid).then((r) => {
      assertEqual('batch:nonarray_zero', r.sent, 0);
    });
  }

  // ─── Section 7: Sacred helpers ───
  {
    assertEqual('tradition:tag_cigano', tagForTradition('cigano'), 'tradition.cigano');
    assertEqual('tradition:tag_orixas', tagForTradition('orixas'), 'tradition.orixas');
    assertEqual('tradition:tag_unknown', tagForTradition('bogus' as never), 'general');

    const p = buildTraditionPayload('cigano', { title: 'Cigano Reading', body: 'New card' });
    assertEqual('tradition:payload_title', p.title, 'Cigano Reading');
    assertEqual('tradition:payload_tag', p.tag, 'tradition.cigano');
  }

  // ─── Section 8: auditSubscriptions ───
  {
    clearAllSubscriptions();
    const sub1 = {
      endpoint: makeFakeEndpoint(11),
      keys: { p256dh: 'A'.repeat(88), auth: 'B'.repeat(22) },
      userId: 'a',
      createdAt: 1,
      lastUsed: 1,
    };
    const sub2 = { ...sub1, endpoint: makeFakeEndpoint(22), userId: 'b', lastUsed: 2 };
    saveSubscription(sub1);
    saveSubscription(sub2);
    const audit = auditSubscriptions();
    assertEqual('audit:total', audit.total, 2);
    assertEqual('audit:perUser_length', audit.perUser.length, 2);
    assertIt('audit:lastUsedRange_present', audit.lastUsedRangeMs !== null);
    assertEqual('audit:lastUsedRange_min', audit.lastUsedRangeMs?.min, 1);
    assertEqual('audit:lastUsedRange_max', audit.lastUsedRangeMs?.max, 2);
  }

  // ─── Section 9: makeFakeEndpoint uniqueness ───
  {
    const eps = new Set<string>();
    for (let i = 0; i < 100; i++) eps.add(makeFakeEndpoint(i));
    assertEqual('fake:100_unique_endpoints', eps.size, 100);
  }

  return { passed, failed, assertions };
}

// Allow direct invocation via `node --experimental-strip-types`
const isDirect = typeof import.meta.url === 'string' && process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isDirect) {
  const r = runPushServiceSpec();
  // Wait for async assertions in sendPush/sendBatchPush to settle
  setTimeout(() => {
    console.log(`push-service.spec.ts: ${r.passed} passed / ${r.failed} failed / ${r.assertions.length} assertions`);
    if (r.failed > 0) {
      for (const a of r.assertions.filter((a) => !a.ok)) console.log(`  ✗ ${a.name}: ${a.detail ?? ''}`);
      process.exit(1);
    }
    process.exit(0);
  }, 500);
}
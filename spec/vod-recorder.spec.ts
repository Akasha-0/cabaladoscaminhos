/**
 * W71-D: vod-recorder.spec.ts
 *
 * Self-running spec harness for vod-recorder.ts (no vitest binary needed).
 */

import {
  generateVod,
  generateThumbnails,
  generateTranscriptPlaceholder,
  getVod,
  getVodById,
  listVods,
  deleteVod,
  setVodTraditionTags,
  auditVodAsset,
  auditVodSurface,
  validateVodConfig,
  validateThumbnailCount,
  estimateVodSize,
  setStreamHostResolver,
  clearVodStore,
  type VodConfig,
  type VodAsset,
} from '../engines/vod-recorder.ts';

// ─── Harness ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertIt(cond: unknown, label: string): void {
  if (cond) passed++;
  else {
    failed++;
    failures.push(label);
  }
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else {
    failed++;
    failures.push(`${label}: expected ${e}, got ${a}`);
  }
}

function assertThrows(fn: () => unknown, pattern: RegExp | string, label: string): void {
  try {
    fn();
    failed++;
    failures.push(`${label}: expected throw, got none`);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const ok = typeof pattern === 'string' ? msg.includes(pattern) : pattern.test(msg);
    if (ok) passed++;
    else {
      failed++;
      failures.push(`${label}: throw '${msg}' did not match ${pattern}`);
    }
  }
}

async function assertThrowsAsync(
  promise: Promise<unknown>,
  pattern: RegExp | string,
  label: string,
): Promise<void> {
  try {
    await promise;
    failed++;
    failures.push(`${label}: expected throw, got resolve`);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const ok = typeof pattern === 'string' ? msg.includes(pattern) : pattern.test(msg);
    if (ok) passed++;
    else {
      failed++;
      failures.push(`${label}: throw '${msg}' did not match ${pattern}`);
    }
  }
}

function section(name: string): void {
  console.log(`  ▶ ${name}`);
}

function reset(): void {
  clearVodStore();
  setStreamHostResolver(null);
}

const VALID_CONFIG: VodConfig = {
  streamId: 'stream-abc',
  recordingUrl: 'https://cdn.example.com/recording.mp4',
  durationMs: 60_000,
  format: 'mp4',
  targetBitrate: 2_500_000,
  generateThumbnails: true,
  thumbnailCount: 5,
  generateTranscript: true,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

export async function runVodRecorderSpec(): Promise<{
  passed: number;
  failed: number;
  total: number;
  failures: readonly string[];
}> {
  reset();
  passed = 0;
  failed = 0;
  failures.length = 0;

  section('validateVodConfig');
  assertIt(validateVodConfig(VALID_CONFIG) === undefined, 'valid config passes');
  assertThrows(
    () => validateVodConfig(null as any),
    /config is required/,
    'null config rejected',
  );
  assertThrows(
    () => validateVodConfig({ ...VALID_CONFIG, streamId: '' }),
    /streamId is required/,
    'empty streamId rejected',
  );
  assertThrows(
    () => validateVodConfig({ ...VALID_CONFIG, recordingUrl: '' }),
    /recordingUrl is required/,
    'empty recordingUrl rejected',
  );
  assertThrows(
    () => validateVodConfig({ ...VALID_CONFIG, durationMs: 0 }),
    /durationMs must be a finite number/,
    'durationMs=0 rejected',
  );
  assertThrows(
    () => validateVodConfig({ ...VALID_CONFIG, durationMs: -1 }),
    /durationMs must be a finite number/,
    'negative durationMs rejected',
  );
  assertThrows(
    () => validateVodConfig({ ...VALID_CONFIG, durationMs: Infinity }),
    /durationMs must be a finite number/,
    'Infinity durationMs rejected',
  );
  assertThrows(
    () => validateVodConfig({ ...VALID_CONFIG, format: 'avi' as any }),
    /format must be mp4/,
    'invalid format rejected',
  );
  assertThrows(
    () => validateVodConfig({ ...VALID_CONFIG, targetBitrate: 0 }),
    /targetBitrate must be a positive number/,
    'zero bitrate rejected',
  );
  assertThrows(
    () => validateVodConfig({ ...VALID_CONFIG, thumbnailCount: 200 }),
    /thumbnailCount must be in/,
    'thumbnailCount>100 rejected',
  );

  section('validateThumbnailCount');
  assertIt(validateThumbnailCount(0) === 0, 'count=0 valid');
  assertIt(validateThumbnailCount(100) === 100, 'count=100 valid');
  assertThrows(
    () => validateThumbnailCount(-1),
    /count must be an integer in/,
    'negative rejected',
  );
  assertThrows(
    () => validateThumbnailCount(101),
    /count must be an integer in/,
    '>100 rejected',
  );
  assertThrows(
    () => validateThumbnailCount(1.5),
    /count must be an integer in/,
    'non-integer rejected',
  );

  section('estimateVodSize');
  // 60s * 2_500_000bps / 8 = 18_750_000 bytes
  assertEq(estimateVodSize(60_000, 2_500_000), 18_750_000, '60s@2.5Mbps = 18.75MB');
  assertEq(estimateVodSize(0, 1_000_000), 0, 'duration=0 → 0 bytes');
  assertEq(estimateVodSize(60_000, 0), 0, 'bitrate=0 → 0 bytes');

  section('generateThumbnails — placeholder URLs');
  const thumbs = await generateThumbnails('https://cdn.example.com/recording.mp4', 3);
  assertEq(thumbs.length, 3, 'thumb count=3');
  assertIt(thumbs[0].includes('#thumb-1-placeholder'), 'thumb 1 has placeholder marker');
  assertIt(thumbs[1].includes('#thumb-2-placeholder'), 'thumb 2 has placeholder marker');
  assertIt(thumbs[2].includes('#thumb-3-placeholder'), 'thumb 3 has placeholder marker');
  await assertThrowsAsync(
    generateThumbnails('', 3),
    /recordingUrl is required/,
    'empty recordingUrl rejected',
  );
  await assertThrowsAsync(
    generateThumbnails('https://x.com/r.mp4', 200),
    /count must be an integer in/,
    'invalid count rejected',
  );
  const zeroThumbs = await generateThumbnails('https://x.com/r.mp4', 0);
  assertEq(zeroThumbs.length, 0, 'count=0 returns empty');

  section('generateTranscriptPlaceholder');
  const transcript = generateTranscriptPlaceholder('https://cdn.example.com/recording.mp4', 3600_000);
  assertIt(transcript.includes('Transcript placeholder'), 'transcript has marker');
  assertIt(transcript.includes('Duration: 01:00:00'), 'duration formatted');
  assertIt(transcript.includes('[00:00:00]'), 'first segment anchor');
  assertIt(transcript.includes('[00:07:30]'), 'early segment anchor');
  assertIt(transcript.includes('[00:45:00]') || transcript.includes('[00:52:30]'), 'late segment anchor');
  assertThrows(
    () => generateTranscriptPlaceholder('', 1000),
    /recordingUrl is required/,
    'empty recordingUrl rejected',
  );
  assertThrows(
    () => generateTranscriptPlaceholder('https://x', 0),
    /durationMs must be/,
    'durationMs=0 rejected',
  );
  assertThrows(
    () => generateTranscriptPlaceholder('https://x', -1),
    /durationMs must be/,
    'durationMs<0 rejected',
  );

  section('generateVod — happy path');
  setStreamHostResolver((sid) => (sid === 'stream-abc' ? 'host-alice' : null));
  const vod = await generateVod(VALID_CONFIG);
  assertIt(vod.id.startsWith('vod_'), 'vod id prefixed');
  assertEq(vod.streamId, 'stream-abc', 'streamId');
  assertEq(vod.hostId, 'host-alice', 'hostId from resolver');
  assertEq(vod.recordingUrl, VALID_CONFIG.recordingUrl, 'recordingUrl');
  assertEq(vod.durationMs, 60_000, 'durationMs');
  assertEq(vod.format, 'mp4', 'format');
  assertEq(vod.size, 18_750_000, 'size=18.75MB');
  assertEq(vod.thumbnailUrls.length, 5, '5 thumbnails');
  assertIt(typeof vod.transcriptUrl === 'string', 'transcriptUrl set');
  assertEq(vod.status, 'ready', 'status=ready');
  assertEq(vod.bitrate, 2_500_000, 'bitrate');

  section('generateVod — without thumbnails or transcript');
  const vod2 = await generateVod({
    ...VALID_CONFIG,
    streamId: 'stream-xyz',
    generateThumbnails: false,
    generateTranscript: false,
  });
  assertEq(vod2.thumbnailUrls.length, 0, 'no thumbnails');
  assertEq(vod2.transcriptUrl, undefined, 'no transcript');

  section('getVod / getVodById');
  const byStream = getVod('stream-abc');
  assertIt(byStream !== null, 'getVod finds by streamId');
  assertEq(byStream?.id, vod.id, 'id matches');
  const byId = getVodById(vod.id);
  assertEq(byId?.id, vod.id, 'getVodById matches');
  assertEq(getVod('nonexistent'), null, 'getVod null on miss');
  assertEq(getVodById('nonexistent'), null, 'getVodById null on miss');

  section('listVods — pagination + filters');
  reset();
  setStreamHostResolver((sid) => {
    if (sid === 's1') return 'host-a';
    if (sid === 's2') return 'host-b';
    if (sid === 's3') return 'host-a';
    return null;
  });
  await generateVod({ ...VALID_CONFIG, streamId: 's1' });
  await generateVod({ ...VALID_CONFIG, streamId: 's2' });
  await generateVod({ ...VALID_CONFIG, streamId: 's3' });
  const all = listVods({}, { limit: 10, offset: 0 });
  assertEq(all.length, 3, 'list all=3');
  const hostA = listVods({ hostId: 'host-a' }, { limit: 10, offset: 0 });
  assertEq(hostA.length, 2, 'host-a filter=2');
  const hostB = listVods({ hostId: 'host-b' }, { limit: 10, offset: 0 });
  assertEq(hostB.length, 1, 'host-b filter=1');
  setVodTraditionTags(hostA[0].id, ['cigano', 'tarot']);
  const cigano = listVods({ tradition: 'cigano' }, { limit: 10, offset: 0 });
  assertEq(cigano.length, 1, 'tradition=cigano filter=1');
  // Pagination
  const p1 = listVods({}, { limit: 2, offset: 0 });
  const p2 = listVods({}, { limit: 2, offset: 2 });
  assertEq(p1.length, 2, 'page1=2');
  assertEq(p2.length, 1, 'page2=1');
  assertIt(p1[0].id !== p2[0].id, 'pages differ');

  assertThrows(
    () => listVods({}, { limit: -1, offset: 0 }),
    /opts.limit must be >= 0/,
    'negative limit rejected',
  );
  assertThrows(
    () => listVods({}, { limit: 10, offset: -1 }),
    /opts.offset must be >= 0/,
    'negative offset rejected',
  );

  section('deleteVod — host-only');
  reset();
  setStreamHostResolver(() => 'host-xyz');
  const dVod = await generateVod(VALID_CONFIG);
  assertEq(getVodById(dVod.id)?.id, dVod.id, 'vod exists before delete');
  // Host deletes
  const delResult = deleteVod(dVod.id, 'host-xyz');
  assertEq(delResult.deleted, true, 'host delete returns deleted=true');
  assertEq(getVodById(dVod.id), null, 'vod gone after delete');

  // Non-host cannot delete
  const dVod2 = await generateVod(VALID_CONFIG);
  const failResult = deleteVod(dVod2.id, 'someone-else');
  assertEq(failResult.deleted, false, 'non-host delete rejected');
  assertIt(/forbidden/.test(failResult.reason ?? ''), 'reason mentions forbidden');
  // vod still there
  assertEq(getVodById(dVod2.id)?.id, dVod2.id, 'vod still exists after forbidden delete');

  // Edge cases
  const noId = deleteVod('', 'host-xyz');
  assertEq(noId.deleted, false, 'empty vodId rejected');
  const noReq = deleteVod(dVod2.id, '');
  assertEq(noReq.deleted, false, 'empty requesterId rejected');
  const notFound = deleteVod('nonexistent', 'host-xyz');
  assertEq(notFound.deleted, false, 'delete missing returns false');

  section('setVodTraditionTags');
  reset();
  setStreamHostResolver(() => 'host');
  const tv = await generateVod(VALID_CONFIG);
  const tagged = setVodTraditionTags(tv.id, ['cigano', 'tarot', 'cigano']);
  assertEq(tagged?.traditionTags.length, 2, 'deduped tags');
  assertIt(tagged?.traditionTags.includes('cigano'), 'has cigano');
  assertIt(tagged?.traditionTags.includes('tarot'), 'has tarot');
  assertEq(setVodTraditionTags('nonexistent', ['x']), null, 'unknown vod returns null');

  section('auditVodAsset / auditVodSurface');
  const audited = auditVodAsset(tv);
  assertEq(audited.id, tv.id, 'audit id');
  assertEq(audited.format, 'mp4', 'audit format');
  assertEq(audited.status, 'ready', 'audit status');
  assertEq(audited.hasThumbnails, true, 'audit hasThumbnails');
  assertEq(audited.hasTranscript, true, 'audit hasTranscript');
  assertIt(audited.sizeMb > 0, 'audit sizeMb>0');
  assertEq(audited.traditionCount, 0, 'audit traditionCount=0 initially');

  const surf = auditVodSurface();
  assertEq(surf.formats.length, 2, '2 formats');
  assertEq(surf.statuses.length, 3, '3 statuses');
  assertIt(surf.placeholderMarker.includes('placeholder'), 'placeholder marker');

  return { passed, failed, total: passed + failed, failures };
}

// Direct execution guard
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await runVodRecorderSpec();
  console.log(`vod-recorder.spec: ${r.passed}/${r.total} passed`);
  if (r.failed > 0) {
    console.error('FAILURES:');
    for (const f of r.failures) console.error('  - ' + f);
    process.exit(1);
  }
}
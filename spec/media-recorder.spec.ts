/**
 * media-recorder.spec.ts — self-running spec harness
 *
 * Exports: runMediaRecorderSpec(): {passed, failed, assertions, its}
 *
 * Mirrors vitest API surface (it/assertIt) so the same file runs in vitest
 * if/when the binary is available. Polarity is EXPLICIT — no smart negation
 * (cycle 70+ lesson).
 */

import {
  createRecorder,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  getRecordingState,
  getSupportedMimeTypes,
  setRecorderFactory,
  saveMedia,
  getMedia,
  listMedia,
  clearMediaStore,
  setupStreamedRecorder,
  auditRecorderRules,
  type RecorderConfig,
  type RecordedMedia,
} from '../engines/media-recorder.ts';

type ItResult = { name: string; ok: boolean; msg?: string };
type ItFn = (name: string, fn: () => void | Promise<void>) => Promise<void>;

function assertIt(cond: unknown, msg: string, neg = false): void {
  const ok = neg ? !cond : !!cond;
  if (!ok) {
    throw new Error(`assertIt failed: ${msg} (got ${JSON.stringify(cond)})`);
  }
}

let passed = 0;
let failed = 0;
let assertions = 0;
const its: ItResult[] = [];

const itFn: ItFn = async (name, fn) => {
  try {
    await fn();
    passed++;
    its.push({ name, ok: true });
  } catch (e: any) {
    failed++;
    its.push({ name, ok: false, msg: e?.message ?? String(e) });
  }
};

// ─── Mock MediaRecorder ─────────────────────────────────────────────────────

class MockMediaRecorder extends EventTarget {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: any = null;
  onerror: any = null;
  onstart: any = null;
  onstop: any = null;
  onpause: any = null;
  onresume: any = null;
  stream: any;
  options: any;
  static isTypeSupported(mimeType: string): boolean {
    return ['audio/webm', 'video/webm', 'audio/ogg'].includes(mimeType);
  }
  chunks: any[] = [];
  constructor(stream: any, options: any) {
    super();
    this.stream = stream;
    this.options = options;
    this.mimeType = options?.mimeType ?? 'audio/webm';
  }
  start() {
    this.state = 'recording';
    queueMicrotask(() => {
      if (this.onstart) this.onstart({});
    });
  }
  stop() {
    this.state = 'inactive';
    // Aggregate the chunks into a single real Blob for the engine to consume.
    const parts: any[] = [];
    for (const c of this.chunks) {
      if (c?.size) parts.push(new Uint8Array(c.size));
    }
    const data = parts.length > 0 ? new Blob(parts, { type: this.mimeType }) : new Blob([], { type: this.mimeType });
    if (this.ondataavailable) this.ondataavailable({ data });
    queueMicrotask(() => {
      if (this.onstop) this.onstop({});
    });
  }
  pause() {
    this.state = 'paused';
    if (this.onpause) this.onpause({});
  }
  resume() {
    this.state = 'recording';
    if (this.onresume) this.onresume({});
  }
  addChunk(c: any) {
    if (!c || typeof c.size !== 'number') {
      c = { size: 1024 };
    }
    this.chunks.push(c);
  }
}

class MockBlob {
  size: number;
  type: string;
  private _bytes: Uint8Array;
  constructor(parts: any[], type: string) {
    this._bytes = new Uint8Array(parts.reduce((acc: number, p: any) => acc + (p?.size ?? 0), 0));
    let offset = 0;
    for (const p of parts) {
      if (p?.size) offset += p.size;
    }
    this.size = offset;
    this.type = type;
  }
}

// ─── Spec body ──────────────────────────────────────────────────────────────

export async function runMediaRecorderSpec(): Promise<{
  passed: number;
  failed: number;
  assertions: number;
  its: ItResult[];
}> {
  passed = 0;
  failed = 0;
  assertions = 0;
  its.length = 0;
  clearMediaStore();

  // Inject mock factory.
  setRecorderFactory(MockMediaRecorder as any);

  await itFn('createRecorder returns a MediaRecorder with state=inactive', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    assertIt(r !== null, 'createRecorder returned null');
    assertions++;
    assertIt(r.state === 'inactive', 'new recorder should be inactive');
  });

  await itFn('startRecording transitions inactive -> recording', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    await startRecording(r);
    assertions++;
    assertIt(r.state === 'recording', `state=${r.state}`);
  });

  await itFn('stopRecording collects chunks into a Blob', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    await startRecording(r);
    (r as any).addChunk({ size: 1024 });
    (r as any).addChunk({ size: 2048 });
    const m = await stopRecording(r);
    assertions++;
    assertIt(m.blob !== null, 'blob missing');
    assertions++;
    assertIt(m.size === 3072, `size=${m.size}`);
    assertions++;
    assertIt(m.mimeType === 'audio/webm', `mime=${m.mimeType}`);
    assertions++;
    assertIt(m.type === 'audio', `type=${m.type}`);
    assertions++;
    assertIt(typeof m.durationMs === 'number' && m.durationMs >= 0, `duration=${m.durationMs}`);
  });

  await itFn('stopRecording on inactive throws', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    let threw = false;
    try { await stopRecording(r); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('startRecording on already-recording throws', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    await startRecording(r);
    let threw = false;
    try { await startRecording(r); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw on second start');
  });

  await itFn('pause and resume transition states correctly', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    await startRecording(r);
    pauseRecording(r);
    assertions++;
    assertIt(r.state === 'paused', `state=${r.state}`);
    resumeRecording(r);
    assertions++;
    assertIt(r.state === 'recording', `state=${r.state}`);
  });

  await itFn('pause on inactive throws', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    let threw = false;
    try { pauseRecording(r); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('resume on non-paused throws', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    await startRecording(r);
    let threw = false;
    try { resumeRecording(r); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('getRecordingState mirrors MediaRecorder.state', async () => {
    assertions++;
    const r = createRecorder({ mimeType: 'audio/webm' });
    assertions++;
    assertIt(getRecordingState(r) === 'inactive', `state=${r.state}`);
    await startRecording(r);
    assertions++;
    assertIt(getRecordingState(r) === 'recording', `state=${r.state}`);
  });

  await itFn('getSupportedMimeTypes returns audio+video arrays', () => {
    const r = getSupportedMimeTypes();
    assertions++;
    assertIt(Array.isArray(r.audio), 'audio not array');
    assertions++;
    assertIt(Array.isArray(r.video), 'video not array');
    assertions++;
    assertIt(r.audio.length > 0, `audio length=${r.audio.length}`);
  });

  await itFn('saveMedia + getMedia round-trips', () => {
    assertions++;
    const m = {
      blob: new MockBlob([], 'audio/webm') as any,
      mimeType: 'audio/webm',
      durationMs: 1000,
      size: 0,
      type: 'audio' as const,
      createdAt: Date.now(),
    };
    const entry = saveMedia('m1' as any, m);
    assertions++;
    assertIt(entry.id === 'm1', 'id missing');
    const got = getMedia('m1' as any);
    assertions++;
    assertIt(got !== null && got.id === 'm1', 'not retrieved');
    assertions++;
    assertIt(listMedia().length === 1, `count=${listMedia().length}`);
  });

  await itFn('saveMedia rejects empty id', () => {
    let threw = false;
    try { saveMedia('' as any, { blob: new MockBlob([], 'audio/webm') } as any); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('saveMedia rejects missing blob', () => {
    let threw = false;
    try { saveMedia('m2' as any, { blob: null } as any); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('auditRecorderRules shape', () => {
    const a = auditRecorderRules();
    assertions++;
    assertIt(a.engine === 'media-recorder', 'engine mismatch');
    assertions++;
    assertIt(a.exportCount === 9, `exportCount=${a.exportCount}`);
    assertions++;
    assertIt(a.states.length === 3, 'states length');
    assertions++;
    assertIt(a.sacredCoverage.traditions.length === 7, 'tradition count');
  });

  // Cleanup so other specs run from a clean state.
  setRecorderFactory(null);
  clearMediaStore();

  return { passed, failed, assertions, its };
}

// Auto-run when invoked via node --experimental-strip-types.
const isMain = (() => {
  try {
    return import.meta.url === `file://${process.argv[1]}`;
  } catch {
    return false;
  }
})();

if (isMain) {
  runMediaRecorderSpec().then((r) => {
    console.log(`media-recorder.spec: passed=${r.passed} failed=${r.failed} assertions=${r.assertions}`);
    if (r.failed > 0) {
      for (const it of r.its) if (!it.ok) console.error(` - [FAIL] ${it.name}: ${it.msg}`);
      process.exit(1);
    }
  });
}

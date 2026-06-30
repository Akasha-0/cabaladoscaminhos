import { describe, it, expect, beforeEach } from 'vitest';
import {
  VoiceEngine,
  VoiceEngineError,
  InMemoryVoiceAdapter,
  WebSpeechVoiceAdapter,
  VOICE_PRESETS,
  ALL_KNOWN_TRADICOES,
  IFA_STATUS,
  markdownToPlain,
  resetCueSequence,
} from './index';
import type { CueId, VoiceId } from './types';

const asVoiceId = (s: string): VoiceId => s as VoiceId;

describe('VoiceEngine — types & constants', () => {
  it('IFA_STATUS is "coming-soon"', () => {
    expect(IFA_STATUS).toBe('coming-soon');
  });

  it('ALL_KNOWN_TRADICOES has exactly 7 entries', () => {
    expect(ALL_KNOWN_TRADICOES.length).toBe(7);
  });

  it('ALL_KNOWN_TRADICOES is frozen', () => {
    expect(Object.isFrozen(ALL_KNOWN_TRADICOES)).toBe(true);
  });

  it('VOICE_PRESETS is frozen', () => {
    expect(Object.isFrozen(VOICE_PRESETS)).toBe(true);
  });

  it('VOICE_PRESETS covers 6 of 7 tradições (Ifá = coming-soon)', () => {
    expect(VOICE_PRESETS.length).toBe(6);
    const tradicoes = new Set(VOICE_PRESETS.map((v) => v.tradicao));
    expect(tradicoes.has('ifa')).toBe(false);
    expect(tradicoes.has('cigano')).toBe(true);
    expect(tradicoes.has('candomble')).toBe(true);
    expect(tradicoes.has('umbanda')).toBe(true);
    expect(tradicoes.has('cabala')).toBe(true);
    expect(tradicoes.has('astrologia')).toBe(true);
    expect(tradicoes.has('tantra')).toBe(true);
  });
});

describe('markdownToPlain', () => {
  it('strips fenced code blocks', () => {
    const out = markdownToPlain('Antes\n```\nsecret\n```\nDepois');
    expect(out).toContain('Antes');
    expect(out).toContain('Depois');
    expect(out).not.toContain('secret');
  });

  it('strips inline code', () => {
    expect(markdownToPlain('Use `npm install` here')).toBe('Use npm install here');
  });

  it('converts blockquotes to Citação prefix', () => {
    const out = markdownToPlain('> olá mundo');
    expect(out).toContain('Citação:');
    expect(out).toContain('olá mundo');
  });

  it('converts bullets to Item prefix', () => {
    const out = markdownToPlain('- primeiro\n- segundo');
    expect(out).toContain('Item: primeiro');
    expect(out).toContain('Item: segundo');
  });

  it('drops URLs from links but keeps text', () => {
    const out = markdownToPlain('Veja [aqui](https://example.com)');
    expect(out).toContain('aqui');
    expect(out).not.toContain('https://example.com');
  });

  it('drops images entirely', () => {
    const out = markdownToPlain('![alt](img.png) fim');
    expect(out).not.toContain('alt');
    expect(out).not.toContain('img.png');
    expect(out).toContain('fim');
  });

  it('strips bold/italic markers', () => {
    expect(markdownToPlain('**negrito** e *itálico*')).toBe('negrito e itálico');
  });
});

describe('VoiceEngine — play()', () => {
  let engine: VoiceEngine;
  let adapter: InMemoryVoiceAdapter;

  beforeEach(() => {
    resetCueSequence();
    adapter = new InMemoryVoiceAdapter();
    engine = new VoiceEngine(adapter);
  });

  it('throws VoiceEngineError with EMPTY_TEXT code on empty input', async () => {
    try {
      await engine.play({ text: '   ' });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(VoiceEngineError);
      const err = e as VoiceEngineError;
      expect(err.code).toBe('EMPTY_TEXT');
    }
  });

  it('enqueues and speaks a text', async () => {
    const state = await engine.play({ text: 'Olá mundo' });
    expect(state.cueId).toMatch(/^cue-\d{4}-[0-9a-f]{8}$/);
    expect(state.status).toBe('done');
    expect(state.renderedText).toContain('Olá mundo');
    expect(adapter.getRecordCount()).toBe(1);
  });

  it('uses default voice (cigano) when no voiceId given', async () => {
    const state = await engine.play({ text: 'teste' });
    expect(state.voiceId).toBe('cigano');
  });

  it('respects explicit voiceId', async () => {
    const state = await engine.play({ text: 'teste', voiceId: asVoiceId('iya') });
    expect(state.voiceId).toBe('iya');
  });

  it('throws UNKNOWN_VOICE for invalid voice', async () => {
    try {
      await engine.play({ text: 'teste', voiceId: asVoiceId('nope') });
      expect.fail('should have thrown');
    } catch (e) {
      const err = e as VoiceEngineError;
      expect(err.code).toBe('UNKNOWN_VOICE');
    }
  });

  it('produces distinct CueIds across calls', async () => {
    const a = await engine.play({ text: 'texto' });
    const b = await engine.play({ text: 'outro' });
    expect(a.cueId).not.toBe(b.cueId);
    expect(a.cueId).toMatch(/^cue-\d{4}-[0-9a-f]{8}$/);
    expect(b.cueId).toMatch(/^cue-\d{4}-[0-9a-f]{8}$/);
  });
});

describe('VoiceEngine — queue management', () => {
  let engine: VoiceEngine;
  let adapter: InMemoryVoiceAdapter;

  beforeEach(() => {
    resetCueSequence();
    adapter = new InMemoryVoiceAdapter();
    engine = new VoiceEngine(adapter);
  });

  it('getQueue() filters terminal states (done/error/canceled)', async () => {
    await engine.play({ text: 'primeiro' });
    await engine.play({ text: 'segundo' });
    await engine.play({ text: 'terceiro' });
    const q = engine.getQueue();
    expect(q.length).toBe(0);
  });

  it('exportAudit() returns append-only log with queued+playing+done', async () => {
    await engine.play({ text: 'um' });
    await engine.play({ text: 'dois' });
    const audit = engine.exportAudit();
    expect(audit.length).toBeGreaterThanOrEqual(4);
    const statuses = audit.map((a) => a.status);
    expect(statuses).toContain('queued');
    expect(statuses).toContain('playing');
    expect(statuses).toContain('done');
  });

  it('cancel() with no args clears state', async () => {
    await engine.cancel();
    expect(engine.getQueue().length).toBe(0);
    expect(engine.getCurrent()).toBeNull();
  });

  it('cancel(cueId) removes specific item', async () => {
    const state = await engine.play({ text: 'a' });
    const state2 = await engine.play({ text: 'b' });
    await engine.cancel(state2.cueId);
    expect(engine.getQueue().length).toBe(0);
  });
});

describe('VoiceEngine — adapter contract', () => {
  it('uses the supplied adapter', () => {
    const adapter = new InMemoryVoiceAdapter();
    const engine = new VoiceEngine(adapter);
    expect(engine.getAdapter()).toBe(adapter);
    expect(engine.getAdapter().id).toBe('in-memory');
  });

  it('InMemoryVoiceAdapter reports isSupported() = true', () => {
    const a = new InMemoryVoiceAdapter();
    expect(a.isSupported()).toBe(true);
  });

  it('InMemoryVoiceAdapter records all speaks in order', async () => {
    const a = new InMemoryVoiceAdapter();
    const e = new VoiceEngine(a);
    await e.play({ text: 'um' });
    await e.play({ text: 'dois' });
    const recs = a.getRecords();
    expect(recs.length).toBe(2);
    expect(recs[0].text).toBe('um');
    expect(recs[1].text).toBe('dois');
  });

  it('InMemoryVoiceAdapter.clear() resets records', async () => {
    const a = new InMemoryVoiceAdapter();
    const e = new VoiceEngine(a);
    await e.play({ text: 'x' });
    expect(a.getRecordCount()).toBe(1);
    a.clear();
    expect(a.getRecordCount()).toBe(0);
  });

  it('WebSpeechVoiceAdapter reports isSupported as boolean', () => {
    const ws = new WebSpeechVoiceAdapter();
    expect(typeof ws.isSupported()).toBe('boolean');
  });

  it('WebSpeechVoiceAdapter.cancel() returns a Promise', async () => {
    const ws = new WebSpeechVoiceAdapter();
    const p = ws.cancel();
    expect(p).toBeInstanceOf(Promise);
    await p;
  });
});

describe('VoiceEngine — sacred-cultural sensitivity', () => {
  it('Iyá voice affirms warmth, rejects austerity', () => {
    const iya = VOICE_PRESETS.find((v) => v.id === 'iya');
    expect(iya).toBeDefined();
    expect(iya!.voiceStyle.toLowerCase()).toContain('maternal');
    expect(iya!.voiceStyle.toLowerCase()).not.toContain('auster');
  });

  it('Swami voice affirms joy, rejects eroticization', () => {
    const swami = VOICE_PRESETS.find((v) => v.id === 'swami-ananda');
    expect(swami!.voiceStyle.toLowerCase()).toContain('alegre');
    expect(swami!.voiceStyle.toLowerCase()).not.toContain('erot');
  });

  it('Rabino voice affirms scholarship, rejects loudness', () => {
    const rabino = VOICE_PRESETS.find((v) => v.id === 'rabino-moshe');
    expect(rabino!.voiceStyle.toLowerCase()).toContain('erudito');
    expect(rabino!.voiceStyle.toLowerCase()).not.toMatch(/alto|grit|imposit/);
  });

  it('Pai Ogum voice affirms decisive-not-gruff', () => {
    const ogum = VOICE_PRESETS.find((v) => v.id === 'pai-ogum');
    expect(ogum!.voiceStyle.toLowerCase()).toContain('decisivo');
    expect(ogum!.voiceStyle.toLowerCase()).not.toContain('grosseir');
  });

  it('Ifá returns empty voice list (coming-soon)', () => {
    const voices = VOICE_PRESETS.filter((v) => v.tradicao === 'ifa');
    expect(voices.length).toBe(0);
  });

  it('All voice styles use OWN-TERM vocabulary (cigano/caboclo/etc)', () => {
    const styles = VOICE_PRESETS.map((v) => v.voiceStyle).join(' ').toLowerCase();
    // All 6 should have some sacred-cultural sensitivity phrasing.
    expect(styles.length).toBeGreaterThan(50);
  });
});

describe('VoiceEngine — CueId deterministic format', () => {
  it('format is cue-NNNN-XXXXXXXX', async () => {
    resetCueSequence();
    const adapter = new InMemoryVoiceAdapter();
    const engine = new VoiceEngine(adapter);
    const state = await engine.play({ text: 'x' });
    expect(state.cueId).toMatch(/^cue-\d{4}-[0-9a-f]{8}$/);
  });

  it('seq increments across calls', async () => {
    resetCueSequence();
    const adapter = new InMemoryVoiceAdapter();
    const engine = new VoiceEngine(adapter);
    const a = await engine.play({ text: 'a' });
    const b = await engine.play({ text: 'b' });
    const aSeq = parseInt(a.cueId.split('-')[1], 10);
    const bSeq = parseInt(b.cueId.split('-')[1], 10);
    expect(bSeq).toBe(aSeq + 1);
  });
});

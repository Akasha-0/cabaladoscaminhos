/**
 * @akasha/portal — Attendance shared types smoke test
 *
 * Wave 22.2. Verifica que os tipos públicos estão exportados e que as
 * constantes runtime (EMOTIONAL_STATES) batem com o esperado.
 */

import { describe, it, expect } from 'vitest';

import {
  EMOTIONAL_STATES,
} from '@/lib/state/emotional-state';

import type {
  AttendanceClient,
  AttendanceDiscovery,
  AttendanceRating,
  AttendanceTab,
  DiscoverySource,
} from '../shared';

describe('attendance/shared — types & shape', () => {
  it('EMOTIONAL_STATES tem 4 entradas canônicas', () => {
    expect(EMOTIONAL_STATES).toEqual(['centrado', 'ansioso', 'perdido', 'curioso']);
    expect(EMOTIONAL_STATES.length).toBe(4);
  });

  it('AttendanceClient shape compila com os 4 campos obrigatórios', () => {
    const c: AttendanceClient = {
      id: 'x',
      fullName: 'Test',
      age: 30,
      sunSign: 'Áries',
      emotionalState: 'centrado',
    };
    expect(c.id).toBe('x');
    expect(c.emotionalState).toBe('centrado');
  });

  it('AttendanceDiscovery suporta os 6 sources', () => {
    const sources: DiscoverySource[] = [
      'cabala', 'astrologia', 'tantra', 'odu', 'iching', 'literature',
    ];
    expect(sources.length).toBe(6);
  });

  it('AttendanceRating aceita "up" e "down"', () => {
    const r1: AttendanceRating = 'up';
    const r2: AttendanceRating = 'down';
    expect([r1, r2]).toEqual(['up', 'down']);
  });

  it('AttendanceTab cobre os 3 estados mobile', () => {
    const tabs: AttendanceTab[] = ['cliente', 'insights', 'chat'];
    expect(tabs.length).toBe(3);
  });

  it('AttendanceDiscovery aceita rankScore entre 0 e 1', () => {
    const d: AttendanceDiscovery = {
      id: 'd1',
      source: 'cabala',
      title: 't',
      excerpt: 'e',
      rankScore: 0.5,
      createdAt: new Date().toISOString(),
    };
    expect(d.rankScore).toBeGreaterThanOrEqual(0);
    expect(d.rankScore).toBeLessThanOrEqual(1);
  });
});

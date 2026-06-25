// Testes unitários para o audit-log (Wave 8.3, LGPD Art. 18 + Art. 37).
//
// Cobre:
// - auditLog() escreve NDJSON em stdout com timestamp ISO
// - action/userId/metadata são serializados
// - requestId opcional é incluído
// - falha ao serializar NÃO joga (apenas warning) — robustez é prioridade
// - tipo AuditAction aceita todos os valores conhecidos
//
// NOTA: stdout.write é mockado globalmente para evitar output poluído.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

import { auditLog, type AuditAction } from './audit-log';

beforeEach(() => {
  writeSpy.mockClear();
  warnSpy.mockClear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-24T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('auditLog()', () => {
  it('escreve uma linha NDJSON em stdout com timestamp ISO', () => {
    auditLog({ action: 'profile_delete_requested', userId: 'user-1' });

    expect(writeSpy).toHaveBeenCalledOnce();
    const line = writeSpy.mock.calls[0][0] as string;
    expect(line).toMatch(/^\[AUDIT\] \{.*\}\n$/);

    const json = line.replace('[AUDIT] ', '').trim();
    const parsed = JSON.parse(json);

    expect(parsed.ts).toBe('2026-06-24T12:00:00.000Z');
    expect(parsed.action).toBe('profile_delete_requested');
    expect(parsed.userId).toBe('user-1');
  });

  it('inclui metadata quando fornecido', () => {
    auditLog({
      action: 'profile_export_completed',
      userId: 'user-2',
      metadata: { rowsExported: 42, format: 'json' },
    });

    const line = writeSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line.replace('[AUDIT] ', '').trim());

    expect(parsed.metadata).toEqual({ rowsExported: 42, format: 'json' });
  });

  it('inclui requestId quando fornecido', () => {
    auditLog({
      action: 'consent_updated',
      userId: 'user-3',
      requestId: 'req-abc-123',
    });

    const line = writeSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line.replace('[AUDIT] ', '').trim());

    expect(parsed.requestId).toBe('req-abc-123');
  });

  it('aceita userId null (operações anônimas)', () => {
    auditLog({
      action: 'conexao_third_party_consent_declarado',
      userId: null,
    });

    const line = writeSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line.replace('[AUDIT] ', '').trim());

    expect(parsed.userId).toBeNull();
  });

  it('preserva todas as ações conhecidas do AuditAction union', () => {
    const ALL_ACTIONS: AuditAction[] = [
      'profile_delete_requested',
      'profile_delete_completed',
      'profile_delete_failed',
      'profile_export_requested',
      'profile_export_completed',
      'conexao_third_party_consent_declarado',
      'consent_updated',
    ];

    for (const action of ALL_ACTIONS) {
      writeSpy.mockClear();
      auditLog({ action, userId: 'user-x' });
      expect(writeSpy).toHaveBeenCalledOnce();

      const parsed = JSON.parse(
        (writeSpy.mock.calls[0][0] as string).replace('[AUDIT] ', '').trim()
      );
      expect(parsed.action).toBe(action);
    }
  });

  it('NÃO bloqueia o caller se stdout.write joga (warning + swallow)', () => {
    writeSpy.mockImplementationOnce(() => {
      throw new Error('stdout closed');
    });

    expect(() =>
      auditLog({ action: 'profile_delete_completed', userId: 'user-4' })
    ).not.toThrow();

    expect(warnSpy).toHaveBeenCalledOnce();
    // console.warn foi chamado com múltiplos args: prefix + erro.
    // Verificamos que ALGUM dos args contém a string do erro.
    const args = warnSpy.mock.calls[0];
    const allArgs = args.map((a) => String(a)).join(' ');
    expect(args[0]).toContain('[audit-log]');
    expect(allArgs).toContain('stdout closed');
  });

  it('serializa Date.now() no campo ts como ISO 8601 UTC', () => {
    vi.setSystemTime(new Date('2024-01-15T03:14:15.926Z'));

    auditLog({ action: 'profile_delete_requested', userId: 'u' });

    const parsed = JSON.parse(
      (writeSpy.mock.calls[0][0] as string).replace('[AUDIT] ', '').trim()
    );

    // ISO 8601 UTC: tem 'T', 'Z', e tem millis.
    expect(parsed.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(parsed.ts).toBe('2024-01-15T03:14:15.926Z');
  });

  it('preserva a ordem: ts primeiro, depois campos do entry', () => {
    auditLog({
      action: 'consent_updated',
      userId: 'u',
      metadata: { consentType: 'analytics' },
      requestId: 'r-1',
    });

    const parsed = JSON.parse(
      (writeSpy.mock.calls[0][0] as string).replace('[AUDIT] ', '').trim()
    );
    const keys = Object.keys(parsed);

    // ts vem primeiro por causa do spread `{ ts, ...entry }`.
    expect(keys[0]).toBe('ts');
  });

  it('cada chamada produz exatamente 1 write (não divide em múltiplas linhas)', () => {
    auditLog({ action: 'profile_delete_requested', userId: 'u1' });
    auditLog({ action: 'profile_export_completed', userId: 'u2' });

    expect(writeSpy).toHaveBeenCalledTimes(2);
    for (const call of writeSpy.mock.calls) {
      const payload = call[0] as string;
      // Cada write deve terminar com \n (newline-delimited JSON).
      expect(payload).toMatch(/\n$/);
      // E conter exatamente UM JSON válido.
      const json = payload.replace('[AUDIT] ', '').trim();
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });
});
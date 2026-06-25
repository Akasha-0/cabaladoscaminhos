'use client';

/**
 * ClientCard — Wave 22.2 Zelador Attendance UI
 *
 * Mostra o consulente ativo no topo de /atendimento. Card compacto
 * (não rouba espaço do Chat Mentor ou dos Insights):
 *
 *   João Silva · 34a · Sol em Escorpião · Salvador, BA
 *
 * Cidade é opcional (LGPD-friendly: se omitida, não aparece).
 * Visual: linha única horizontal, com pequenas badges para signo e idade.
 *
 * Por que sem avatar grande:
 *   - O Zelador atende no celular. Espaço vertical é precioso.
 *   - Em produção, avatar fica num drawer lateral sob demanda.
 */

import type { AttendanceClient as AttendanceClientData } from '../shared';

export interface ClientCardProps {
  client: AttendanceClientData;
  locale: string;
}

export function ClientCard({ client, locale: _locale }: ClientCardProps) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-3 flex-wrap"
      data-testid="attendance-client-card"
      data-client-id={client.id}
    >
      <div className="flex flex-col min-w-0 flex-1">
        <h1
          className="text-lg md:text-xl text-ak-text-primary leading-tight m-0 truncate"
          style={{ fontFamily: 'var(--ak-font-cinzel)' }}
          data-testid="attendance-client-name"
        >
          {client.fullName}
        </h1>
        <p
          className="text-xs text-ak-text-subtle m-0 mt-0.5"
          data-testid="attendance-client-meta"
        >
          <span data-testid="attendance-client-age">{client.age}a</span>
          {' · '}
          <span data-testid="attendance-client-sign">{client.sunSign}</span>
          {client.birthCity && (
            <>
              {' · '}
              <span data-testid="attendance-client-city">{client.birthCity}</span>
            </>
          )}
        </p>
      </div>

      <span
        className="text-[10px] uppercase tracking-[0.18em] text-ak-accent-aurora/80 px-2 py-1 rounded-full border border-ak-accent-aurora/30 bg-ak-accent-aurora/5 shrink-0"
        data-testid="attendance-client-status"
        aria-label="Em sessão"
      >
        ● Em sessão
      </span>
    </div>
  );
}

export default ClientCard;

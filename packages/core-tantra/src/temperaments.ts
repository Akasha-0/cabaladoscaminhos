/**
 * F-220: 4 Temperamentos Gregos (Hipócrates 400BC) — Pilar 3 sub-framework
 *
 * Integra os 4 temperamentos gregos como Pilar 3 (Numerologia Tântrica)
 * sub-framework opt-in. Cita Hipócrates e Galeno.
 *
 * 4 Temperamentos:
 * - Sanguíneo (sangue) — sociável, otimista, ativo
 * - Colérico (bílis amarela) — ambicioso, líder, enérgico
 * - Melancólico (bílis negra) — analítico, criativo, introspectivo
 * - Fleumático (fleuma) — calmo, pacífico, diplomático
 *
 * R-019 (synthesis/greek-temperaments.md) D1: framework opt-in, não obrigatório.
 * R-019 D2: nomenclatura PT-BR (sem acentos aqui para compatibilidade TS).
 * R-019 D3: mapeamento especulativo Pilar/Camada (precisa R-022 validação).
 * R-019 D4: estado atual, não tipo fixo (alinhamento R-022 §3.1).
 *
 * @see .autonomous/research/synthesis/greek-temperaments.md
 */

export type Temperamento = 'sanguineo' | 'colerico' | 'melancolico' | 'fleumatico';

/** Lista canônica dos 4 temperamentos gregos (R-019 §2.2) */
export const TEMPERAMENTOS: readonly Temperamento[] = [
  'sanguineo',
  'colerico',
  'melancolico',
  'fleumatico',
] as const;

/** Mapeamento especulativo Temperamento → Pilar+Camada dominante (R-019 D3) */
export const TEMPERAMENTO_PILAR_MAP: Record<
  Temperamento,
  { pilar: string; camada: 'D' | 'S' | 'Z' | 'V'; elemento: string }
> = {
  sanguineo: { pilar: 'tantra', camada: 'S', elemento: 'ar' },
  colerico: { pilar: 'cabala', camada: 'V', elemento: 'fogo' },
  melancolico: { pilar: 'iching', camada: 'D', elemento: 'terra' },
  fleumatico: { pilar: 'astrologia', camada: 'Z', elemento: 'agua' },
};

/** Características de cada temperamento (R-019 §2.2) */
export const TEMPERAMENTO_CARACTERISTICAS: Record<
  Temperamento,
  { humor: string; qualidade: string; orgao: string; estacao: string; tracos: string[] }
> = {
  sanguineo: {
    humor: 'sangue',
    qualidade: 'quente + umido',
    orgao: 'coracao',
    estacao: 'primavera',
    tracos: ['sociavel', 'otimista', 'ativo', 'instavel', 'prazeroso'],
  },
  colerico: {
    humor: 'bilis amarela',
    qualidade: 'quente + seco',
    orgao: 'figado',
    estacao: 'verao',
    tracos: ['ambicioso', 'lider', 'irritavel', 'energetico'],
  },
  melancolico: {
    humor: 'bilis negra',
    qualidade: 'frio + seco',
    orgao: 'baco',
    estacao: 'outono',
    tracos: ['analitico', 'criativo', 'introspectivo', 'pessimista'],
  },
  fleumatico: {
    humor: 'fleuma',
    qualidade: 'frio + umido',
    orgao: 'cerebro',
    estacao: 'inverno',
    tracos: ['calmo', 'pacifico', 'diplomatico', 'estavel'],
  },
};

/** Valida se uma string é um temperamento válido */
export function isTemperamento(s: unknown): s is Temperamento {
  return typeof s === 'string' && (TEMPERAMENTOS as readonly string[]).includes(s);
}

/**
 * Mapeia um "estado atual" (data + contexto) para um temperamento.
 * Implementação simples baseada em data — pode ser substituída por
 * lógica contemplativa do usuário (R-019 D4).
 */
export function inferirTemperamentoAtual(data: Date): Temperamento {
  const mes = data.getMonth() + 1;
  if (mes >= 3 && mes <= 5) return 'sanguineo';
  if (mes >= 6 && mes <= 8) return 'colerico';
  if (mes >= 9 && mes <= 11) return 'melancolico';
  return 'fleumatico';
}

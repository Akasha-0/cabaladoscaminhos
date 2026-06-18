/**
 * akasha-authority.ts — Akasha Authority Decision Framework
 *
 * F-227 (v0.0.19 spec): "Paz vs Ansiedade" — o sistema interno de decisão do Akasha.
 * Inspirado no Strategy + Authority do Human Design, mas reinterpretado em chave
 * Cabalística-Tântrica: Corpo 3 (mente positiva) traz PAZ → aja; Corpo 4
 * (mente negativa) traz ANSIEDADE → espere. O resto da Authority é derivado dos
 * 5 Pilares (Cabala Lua/Year, Astrologia Casa 8, Tantra corpo predominante,
 * Odu principal, I Ching hexagrama do dia).
 *
 * Regra-mãe (v0.0.19 spec §F-227):
 *   - Corpo 3 / mente em paz → AJA (act)
 *   - Corpo 4 / mente em ansiedade → ESPERE (wait)
 *   - Casa 8 presente → autoridade esplénica (intuição direta do corpo)
 *   - Lua em água → autoridade emocional (clareza emocional antes de agir)
 *   - Padrão → autoridade mental (reflexão 48h)
 *
 * Este módulo é o **prompt de decisão** que aparece antes de qualquer ação
 * importante. Não substitui o `DailyDecisionCard` (que é mais narrativo) —
 * é o cartão COMPACTO que pergunta: "Paz ou ansiedade?".
 */
import type { PilaresDados } from './significados-curados';
import { deriveAkashaAuthority } from './synthesis/synthesizer';

/** Estado emocional do momento — entrada do prompt. */
export type EstadoAkasha = 'paz' | 'ansiedade' | 'neutro';

/** Tipos de autoridade Akasha — re-exportados de synthesizer para API plana. */
export type { AkashaAuthority, EstrategiaAkasha, AutoridadeAkasha } from './synthesis/synthesizer';

/** Tipo parcial para uso em UI — só precisa dos campos que o deriveAkashaAuthority consulta. */
export type PilaresParciais = Partial<PilaresDados>;

/**
 * Regra-mãe do F-227:
 *   Corpo 3 (paz) = aja
 *   Corpo 4 (ansiedade) = espere
 *
 * Esta é a função SIMPLES que o `AkashaAuthorityPrompt` chama antes de cada
 * ação importante. Recebe o estado emocional atual do usuário e devolve a
 * recomendação crua: agir, esperar ou observar.
 */
export function recomendarAcaoPorEstado(estado: EstadoAkasha): {
  acao: 'aja' | 'espere' | 'observe';
  justificativa: string;
  icone: string;
} {
  switch (estado) {
    case 'paz':
      return {
        acao: 'aja',
        justificativa:
          'Corpo 3 ativo — mente em paz. Aja nos próximos 30 minutos antes que a dúvida chegue.',
        icone: '✦',
      };
    case 'ansiedade':
      return {
        acao: 'espere',
        justificativa:
          'Corpo 4 ativo — mente em ansiedade. Espere até sentir paz emocional. Não force.',
        icone: '◌',
      };
    case 'neutro':
    default:
      return {
        acao: 'observe',
        justificativa: 'Sem clareza nem ansiedade. Observe mais 24-48h. A decisão pede maturação.',
        icone: '◯',
      };
  }
}

/**
 * Constrói a pergunta de decisão Akasha para HOJE, a partir dos 5 pilares.
 * Esta é a pergunta que o `AkashaAuthorityPrompt` exibe antes de qualquer
 * ação importante: "Qual é o seu estado AGORA?".
 */
export function perguntaAkashaHoje(pilares: PilaresParciais): {
  pergunta: string;
  opcoes: { estado: EstadoAkasha; label: string; cor: string }[];
  contexto: string;
} {
  const authority = deriveAkashaAuthority(pilares);
  return {
    pergunta: 'Antes de agir, qual é o seu estado AGORA?',
    opcoes: [
      { estado: 'paz', label: 'Paz — corpo calmo, mente clara', cor: '#34C759' },
      { estado: 'ansiedade', label: 'Ansiedade — urgência, aperto, dúvida', cor: '#FF3B30' },
      { estado: 'neutro', label: 'Neutro — sem clareza nem aperto', cor: '#8E8E93' },
    ],
    contexto: `Sua autoridade base: ${authority.autoridade} — estratégia ${authority.estrategia}.`,
  };
}

/**
 * Helper de decisão rápida: dada a ação que o usuário quer tomar + o estado
 * emocional atual + a autoridade derivada dos 5 pilares, devolve:
 *   - deveAgir: true / false
 *   - razao: justificativa em 1-2 frases
 *   - alternativa: o que fazer se a resposta for não
 */
export function avaliarDecisao(args: {
  estado: EstadoAkasha;
  pilares: PilaresParciais;
  intencao: string;
}): { deveAgir: boolean; razao: string; alternativa: string } {
  const { estado, pilares, intencao } = args;
  const authority = deriveAkashaAuthority(pilares);
  const rec = recomendarAcaoPorEstado(estado);

  // Regra especial: autoridade emocional exige paz (não apenas ausência de ansiedade)
  if (authority.autoridade === 'emocional' && estado === 'ansiedade') {
    return {
      deveAgir: false,
      razao: `Sua autoridade é Emocional — você só age depois de sentir PAZ, não só ausência de ansiedade. "${intencao}" pede mais 24h.`,
      alternativa: `Medite 10 min. Volte a esta decisão quando sentir paz. Hoje: ${authority.decisaoHoje}`,
    };
  }

  // Regra especial: autoridade sacral (corpo) — só age se corpo diz sim
  if (authority.autoridade === 'sagrada' && estado === 'ansiedade') {
    return {
      deveAgir: false,
      razao: `Sua autoridade é Sagrada (corpo 8/Prana) — quando o corpo sente contração, é não. "${intencao}" pode esperar.`,
      alternativa: `Respire fundo 3x. Se a contração soltar, aja. Se persistir, hoje não é o dia.`,
    };
  }

  // Regra-padrão: paz → aja; ansiedade → espere; neutro → observe
  if (rec.acao === 'aja') {
    return {
      deveAgir: true,
      razao: `${rec.justificativa} "${intencao}" cabe na sua estratégia de HOJE (${authority.estrategia}).`,
      alternativa: 'Se dúvida surgir, volte à regra: paz = aja.',
    };
  }
  if (rec.acao === 'espere') {
    return {
      deveAgir: false,
      razao: `${rec.justificativa} "${intencao}" não cabe na sua estratégia HOJE (${authority.estrategia}).`,
      alternativa: authority.decisaoHoje,
    };
  }
  return {
    deveAgir: false,
    razao: `${rec.justificativa} "${intencao}" precisa de mais clareza.`,
    alternativa: 'Observe mais 24-48h. Volte quando a clareza chegar.',
  };
}

/**
 * Prática concreta do dia segundo a Authority. Frase curta que o usuário
 * repete ao acordar (ou antes de qualquer decisão) para calibrar o corpo.
 */
export function praticaAuthorityDiaria(pilares: PilaresParciais): string {
  const authority = deriveAkashaAuthority(pilares);
  switch (authority.autoridade) {
    case 'sagrada':
      return 'Respire fundo 3x antes de qualquer decisão. Se o corpo expandir, é sim. Se contrair, é não.';
    case 'emocional':
      return 'Espere 24h depois de qualquer pico emocional. Só aja em paz — não em euforia nem em medo.';
    case 'esplénica':
      return 'Confie no primeiro impulso. Se passou 5 segundos, é interpretação, não intuição.';
    case 'mental':
    default:
      return 'Escreva a decisão em 1 frase. Se consegue, está claro. Se precisar de 3 frases, ainda não é o dia.';
  }
}

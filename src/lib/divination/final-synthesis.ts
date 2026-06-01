// ============================================================
// SÍNTESE FINAL DOS 4 PILARES
// ============================================================
// Esta é a peça que fecha a consulta. Depois que as 36 casas
// são interpretadas, o sistema roda a síntese dos 4 pilares:
//
// 1. O Caminho do Trabalho e Dinheiro  (Casas 2, 8, 10, 12, 31, 34, 35)
// 2. O Caminho do Lar e Família         (Casas 4, 18, 30)
// 3. O Caminho do Amor e Relacionamentos (Casas 24, 25)
// 4. O Grande Conselho Espiritual       (Casas 1, 16, 33, 36)
//
// A síntese é o que Gabriel entrega impresso ou em PDF para o cliente.

import { buildSynthesisPrompt, buildSystemPromptForHouse, validateHouseReadiness } from './interpretive-agent';
import { getHousesByPillar } from './house-delegation';
import type {
  ConsultaInput,
  InterpretacaoCasa,
  PilarResumo,
  SinteseFinal,
  SynthesisPillar,
} from './house-types';

export const SYNTHESIS_PILLARS: SynthesisPillar[] = [
  'trabalho_dinheiro',
  'lar_familia',
  'amor_relacionamentos',
  'conselho_espiritual',
];

export const PILLAR_TITLES: Record<SynthesisPillar, string> = {
  trabalho_dinheiro: 'O Caminho do Trabalho e Dinheiro',
  lar_familia: 'O Caminho do Lar e Família',
  amor_relacionamentos: 'O Caminho do Amor e Relacionamentos',
  conselho_espiritual: 'O Grande Conselho Espiritual e Evolutivo',
};

export const PILLAR_DESCRIPTIONS: Record<SynthesisPillar, string> = {
  trabalho_dinheiro:
    'Uma síntese das energias que governam sua carreira, seus bens materiais e sua relação com o mundo do trabalho e das finanças.',
  lar_familia:
    'O resumo da sua base emocional, das suas raízes familiares e da energia que rege o seu ninho e suas relações de sangue.',
  amor_relacionamentos:
    'A leitura do seu coração, da forma como você ama, e dos contratos afetivos que você firma nesta encarnação.',
  conselho_espiritual:
    'O veredito final da sua jornada. O Grande Conselho que une sua essência, sua espiritualidade, seu propósito e a vitória cármica.',
};

/**
 * Calcula o plano de interpretação: lista ordenada de casas que devem
 * ser processadas com base no input.
 */
export function buildInterpretationPlan(consulta: ConsultaInput): {
  casaId: number;
  ready: boolean;
  missing: string[];
}[] {
  const { HOUSES_36 } = require('./house-delegation') as typeof import('./house-delegation');
  return HOUSES_36.map((h) => {
    const v = validateHouseReadiness(h, consulta);
    return { casaId: h.number, ready: v.ready, missing: v.missing };
  });
}

/**
 * Veredito cármico final — Casa 36 é a última e resume o destino.
 */
export function buildVereditoCarmicoPrompt(consulta: ConsultaInput): string {
  const house36 = (require('./house-delegation') as typeof import('./house-delegation')).getHouse(36);
  if (!house36) return '';
  return buildSystemPromptForHouse(house36, consulta);
}

/**
 * Helper de prompt para o pilar
 */
export function getPromptForPillar(
  pilar: SynthesisPillar,
  interpretacoes: InterpretacaoCasa[]
): string {
  return buildSynthesisPrompt(pilar, interpretacoes);
}

/**
 * Helper de casas para o pilar
 */
export function getCasasForPillar(pilar: SynthesisPillar): number[] {
  return getHousesByPillar(pilar);
}

/**
 * Monta a estrutura vazia de uma síntese
 */
export function buildEmptySintese(): SinteseFinal {
  return {
    pilares: {
      trabalhoDinheiro: {
        titulo: PILLAR_TITLES.trabalho_dinheiro,
        casasUsadas: getHousesByPillar('trabalho_dinheiro'),
        resumoExecutivo: '',
        pontosChave: [],
        orientacaoPratica: '',
        periodoFavoravel: undefined,
      },
      larFamilia: {
        titulo: PILLAR_TITLES.lar_familia,
        casasUsadas: getHousesByPillar('lar_familia'),
        resumoExecutivo: '',
        pontosChave: [],
        orientacaoPratica: '',
        periodoFavoravel: undefined,
      },
      amorRelacionamentos: {
        titulo: PILLAR_TITLES.amor_relacionamentos,
        casasUsadas: getHousesByPillar('amor_relacionamentos'),
        resumoExecutivo: '',
        pontosChave: [],
        orientacaoPratica: '',
        periodoFavoravel: undefined,
      },
      conselhoEspiritual: {
        titulo: PILLAR_TITLES.conselho_espiritual,
        casasUsadas: getHousesByPillar('conselho_espiritual'),
        resumoExecutivo: '',
        pontosChave: [],
        orientacaoPratica: '',
        periodoFavoravel: undefined,
      },
    },
    vereditoCarmico: '',
    geradoEm: new Date().toISOString(),
  };
}

export function emptyPilar(titulo: string, casasUsadas: number[]): PilarResumo {
  return {
    titulo,
    casasUsadas,
    resumoExecutivo: '',
    pontosChave: [],
    orientacaoPratica: '',
    periodoFavoravel: undefined,
  };
}

// Ritual Matching - Cabala Dos Caminhos
// Odu-to-ritual mapping and ritual matching logic

import { OduInfo } from '@/lib/odus/calculos';

/**
 * Ritual categories for matching
 */
export type RitualCategory =
  | 'caminho'
  | 'protecao'
  | 'prosperidade'
  | 'saude'
  | 'limpeza'
  | 'alinhamento'
  | 'justica'
  | 'transformacao'
  | 'defesa'
  | 'agradecimento'
  | 'atracao'
  | 'movimento';

/**
 * Ritual configuration from Odu mapping
 */
export interface RitualConfig {
  category: RitualCategory;
  nome: string;
  orixa: string;
  urgencia: 'baixa' | 'media' | 'alta';
  prazo: string;
  descricao: string;
  componentes: string[];
}

/**
 * Ritual match result
 */
export interface RitualMatchResult {
  success: boolean;
  ritual: RitualConfig | null;
  odu: OduInfo;
  matchedOn: string[];
}

/**
 * Odu number to ritual mapping
 */
const oduToRitualMap: Record<number, {
  category: RitualCategory;
  urgencia: 'baixa' | 'media' | 'alta';
  prazo: string;
}> = {
  1: { category: 'protecao', urgencia: 'alta', prazo: '7 dias' },
  2: { category: 'justica', urgencia: 'media', prazo: '14 dias' },
  3: { category: 'transformacao', urgencia: 'media', prazo: '21 dias' },
  4: { category: 'limpeza', urgencia: 'alta', prazo: '3 dias' },
  5: { category: 'atracao', urgencia: 'media', prazo: '30 dias' },
  6: { category: 'prosperidade', urgencia: 'media', prazo: '15 dias' },
  7: { category: 'defesa', urgencia: 'alta', prazo: '7 dias' },
  8: { category: 'alinhamento', urgencia: 'baixa', prazo: '40 dias' },
  9: { category: 'saude', urgencia: 'alta', prazo: '5 dias' },
  10: { category: 'agradecimento', urgencia: 'baixa', prazo: '30 dias' },
  11: { category: 'movimento', urgencia: 'media', prazo: '21 dias' },
  12: { category: 'caminho', urgencia: 'media', prazo: '15 dias' },
  13: { category: 'protecao', urgencia: 'alta', prazo: '7 dias' },
  14: { category: 'transformacao', urgencia: 'media', prazo: '21 dias' },
  15: { category: 'justica', urgencia: 'media', prazo: '30 dias' },
  16: { category: 'limpeza', urgencia: 'alta', prazo: '3 dias' },
  17: { category: 'prosperidade', urgencia: 'baixa', prazo: '40 dias' },
  18: { category: 'defesa', urgencia: 'media', prazo: '14 dias' },
  19: { category: 'atracao', urgencia: 'media', prazo: '21 dias' },
  20: { category: 'alinhamento', urgencia: 'alta', prazo: '7 dias' },
  21: { category: 'saude', urgencia: 'alta', prazo: '5 dias' },
  22: { category: 'agradecimento', urgencia: 'baixa', prazo: '30 dias' },
};

/**
 * Ritual definitions by category
 */
const ritualDefinitions: Record<RitualCategory, {
  nome: string;
  descricao: string;
  componentes: string[];
}> = {
  caminho: {
    nome: 'Ritual de Caminho',
    descricao: 'Abre novos caminhos e remove blokos energéticos',
    componentes: ['Velas douradas', 'Algodão branco', 'Pimenta-do-reino', 'Água de coco'],
  },
  protecao: {
    nome: 'Ritual de Proteção',
    descricao: 'Cria escudo energético contra negativas e energias hostiperas',
    componentes: ['Sal grosso', 'Alfaßia', 'Arruda', 'Pau-brasil'],
  },
  prosperidade: {
    nome: 'Ritual de Prosperidade',
    descricao: 'Atrai abundância material e espiritual',
    componentes: ['Moedas de cobre', 'Velas verdes', 'Canjica', 'Mel'],
  },
  saude: {
    nome: 'Ritual de Saúde',
    descricao: 'Promove cura física, emocional e espiritual',
    componentes: ['Ervas medicinais', 'Velas amarelas', 'Alimentos brancos', 'Inhames'],
  },
  limpeza: {
    nome: 'Ritual de Limpeza',
    descricao: 'Remove energias densas e purifica o ambiente',
    componentes: ['Hip厦门市', 'Banhos de folhas', 'Velas brancas', 'Despachos'],
  },
  alinhamento: {
    nome: 'Ritual de Alinhamento',
    descricao: 'Equilibra chakras e alinha aura com-orixás',
    componentes: ['Velas cores variadas', 'Incenso', 'Oftcia', 'Folhas sagradas'],
  },
  justica: {
    nome: 'Ritual de Justiça',
    descricao: 'Executa causa justa e repele injustiças',
    componentes: ['Paliteiros', 'Velas negras', 'Ferro', 'Carvão'],
  },
  transformacao: {
    nome: 'Ritual de Transformação',
    descricao: 'Auxilia mudança de comportamentos e renovação',
    componentes: ['Velas laranjas', 'Amalá', 'Pipoca', 'Molho de兴旺'],
  },
  defesa: {
    nome: 'Ritual de Defesa',
    descricao: 'Defende contra feitiçarla e olho grosso',
    componentes: ['Girassóis', 'Olhos de santa luzia', 'Velas azuis', 'Panos vermelhos'],
  },
  agradecimiento: {
    nome: 'Ritual de Agradecimento',
    descricao: 'Expressa gratidão aos-orixás por bênçãos recebidas',
    componentes: ['Doces', 'Frutas', 'Velas douradas', 'Florais'],
  },
  atracao: {
    nome: 'Ritual de Atração',
    descricao: 'Attrai amor, oportunidades e energias positivas',
    componentes: ['Velas rosas', 'Perfume floral', 'Pétalas de rosa', 'Mel'],
  },
  movimento: {
    nome: 'Ritual de Movimento',
    descricao: 'Promove动感 e supera letargia espiritual',
    componentes: ['Velas vermelhas', 'Gengibre', 'Pimenta', 'Cachaça'],
  },
};

/**
 * Match Odu to ritual configuration
 */
export function matchRitual(odu: OduInfo): RitualMatchResult {
  const oduConfig = oduToRitualMap[odu.numero];
  const matchedOn: string[] = [];

  if (oduConfig) {
    matchedOn.push(`número ${odu.numero}`);
  }

  const orixa = odu.orixaRegente;
  if (orixa) {
    matchedOn.push(`orixá regente ${orixa}`);
  }

  const definition = oduConfig ? ritualDefinitions[oduConfig.category] : null;

  if (!oduConfig || !definition) {
    return {
      success: false,
      ritual: null,
      odu,
      matchedOn,
    };
  }

  const ritual: RitualConfig = {
    category: oduConfig.category,
    nome: definition.nome,
    orixa: orixa || 'Nenhum',
    urgencia: oduConfig.urgencia,
    prazo: oduConfig.prazo,
    descricao: definition.descricao,
    componentes: definition.componentes,
  };

  return {
    success: true,
    ritual,
    odu,
    matchedOn,
  };
}

/**
 * Match multiple Odus to rituals
 */
export function matchRituals(odus: OduInfo[]): RitualMatchResult[] {
  return odus.map(matchRitual);
}

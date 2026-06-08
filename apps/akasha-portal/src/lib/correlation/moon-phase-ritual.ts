/**
 * Moon Phase Ritual Correlation
 * Maps lunar phases to spiritual practices, orixás, and ebó recommendations.
 * Based on 'Alquimia Lunar e Janelas de Operação Mágica' from IDEIA.md
 */

export interface MoonPhaseRitual {
  fase: string;
  energia_tipica: string;
  janela_operacao: string;
  praticas_recomendadas: string[];
  orixas_em_evidencia: string[];
  tipo_de_ebó_recomendado: string;
  casas_divinas: string[];
}

export const MOON_PHASE_RITUALS: Record<string, MoonPhaseRitual> = {
  'Nova': {
    fase: 'Nova',
    energia_tipica: 'Introspecção, silêncio, planejamento invisível',
    janela_operacao: 'Das 00:00 às 03:00 (Hora Astrológica)',
    praticas_recomendadas: [
      'Início de projetos secretos',
      'Firmezas de proteção profunda',
      'Assentamento de Exu',
      'Meditação em silêncio',
      'Conexão com o oculto',
    ],
    orixas_em_evidencia: ['Exu', 'Omolu', 'Ogum'],
    tipo_de_ebó_recomendado: 'Proteção e firmezas - trabalho de ocultismo e forças protetoras',
    casas_divinas: ['Casa 1 (O Cavaleiro)', 'Casa 26 (O Livro)'],
  },
  'Crescente': {
    fase: 'Crescente',
    energia_tipica: 'Foco, ação disciplinada, força de vontade',
    janela_operacao: 'Das 06:00 às 12:00 (Amanhecer/Zênite)',
    praticas_recomendadas: [
      'Rituais de abertura de caminhos comerciais',
      'Banhos de prosperidade',
      'Magia de atração',
      'Colocação de Ego',
      'Fortalecimento pessoal',
    ],
    orixas_em_evidencia: ['Oxóssi', 'Ogum', 'Xangô'],
    tipo_de_ebó_recomendado: 'Prosperidade e abertura - rituais de crescimento e expansão',
    casas_divinas: ['Casa 13 (A Criança)', 'Casa 34 (Os Peixes)'],
  },
  'Cheia': {
    fase: 'Cheia',
    energia_tipica: 'Expansão áurica máxima, magnetismo, êxtase',
    janela_operacao: 'Das 18:00 às 00:00 (Ascensão da Lua)',
    praticas_recomendadas: [
      'Alta magia de atração',
      'Consagração de patuás e boris',
      'Rituais de amor',
      'Cura de Ori',
      'Carregamento magnético',
    ],
    orixas_em_evidencia: ['Oxalá', 'Oxum', 'Iemanjá'],
    tipo_de_ebó_recomendado: 'Amor e atração - magia de magnetismo e consagrações',
    casas_divinas: ['Casa 16 (A Estrela)', 'Casa 31 (O Sol)'],
  },
  'Minguante': {
    fase: 'Minguante',
    energia_tipica: 'Desapego, austeridade, banimento consciente',
    janela_operacao: 'Das 12:00 às 18:00 (Ocaso Solar)',
    praticas_recomendadas: [
      'Quebra de energias paradas',
      'Ebós de descarrego pesado',
      'Cura de vícios e doenças',
      'Limpeza kármica',
      'Encerramento de ciclos',
    ],
    orixas_em_evidencia: ['Omolu', 'Nanã', 'Iansã'],
    tipo_de_ebó_recomendado: 'Descarrego e limpeza - banimento de energias negativas e cura',
    casas_divinas: ['Casa 8 (O Caixão)', 'Casa 10 (A Foice)'],
  },
};

/**
 * Get the ritual mapping for a given moon phase.
 * @param fase - The moon phase name (Nova, Crescente, Cheia, Minguante)
 * @returns MoonPhaseRitual or undefined if phase not found
 */
export function getMoonPhaseRitual(fase: string): MoonPhaseRitual | undefined {
  return MOON_PHASE_RITUALS[fase];
}

/**
 * Get all moon phase rituals as an array.
 */
export function getAllMoonPhaseRituals(): MoonPhaseRitual[] {
  return Object.values(MOON_PHASE_RITUALS);
}

/**
 * Check if a phase name is valid.
 */
export function isValidMoonPhase(fase: string): boolean {
  return fase in MOON_PHASE_RITUALS;
}

/**
 * Get Orixás associated with a specific moon phase.
 */
export function getOrixasByMoonPhase(fase: string): string[] {
  return MOON_PHASE_RITUALS[fase]?.orixas_em_evidencia ?? [];
}
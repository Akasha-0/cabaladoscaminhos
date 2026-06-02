// Odu Matching Logic - Cabala Dos Caminhos
// Matches Odu to rituals, ebós, and spiritual practices

import { OduInfo } from '@/lib/odus/calculos';

/**
 * Ritual types for Odu matching
 */
export type RitualType =
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
  | 'atração'
  | 'movimento';

/**
 * Ebó categories
 */
export type EboCategory =
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
  | 'atração'
  | 'movimento';

/**
 * Ritual suggestion for an Odu
 */
export interface RitualSuggestion {
  tipo: RitualType;
  nome: string;
  descricao: string;
  orixa: string;
  urgencia: 'baixa' | 'media' | 'alta';
  prazo: string;
  componentes: string[];
}

/**
 * Ebó suggestion for an Odu
 */
export interface EboSuggestion {
  tipo: EboCategory;
  nome: string;
  descricao: string;
  orixa: string;
  elementos: string[];
  passos: string[];
  observacoes: string[];
}

/**
 * Complete matching result for an Odu
 */
export interface OduMatchingResult {
  odu: OduInfo;
  rituais: RitualSuggestion[];
  ebos: EboSuggestion[];
  orixasRelacionados: string[];
  praticasDiarias: string[];
  contraindicacoes: string[];
}

const oduRitualMap: Record<number, { tipo: RitualType; urgencia: 'baixa' | 'media' | 'alta'; prazo: string }> = {
  1: { tipo: 'caminho', urgencia: 'alta', prazo: 'urgent' },
  2: { tipo: 'prosperidade', urgencia: 'media', prazo: 'semana' },
  3: { tipo: 'defesa', urgencia: 'alta', prazo: 'hoje' },
  4: { tipo: 'protecao', urgencia: 'alta', prazo: 'hoje' },
  5: { tipo: 'atração', urgencia: 'media', prazo: 'semana' },
  6: { tipo: 'prosperidade', urgencia: 'media', prazo: 'semana' },
  7: { tipo: 'transformacao', urgencia: 'media', prazo: 'quinzena' },
  8: { tipo: 'alinhamento', urgencia: 'alta', prazo: 'hoje' },
  9: { tipo: 'limpeza', urgencia: 'media', prazo: 'semana' },
  10: { tipo: 'saude', urgencia: 'alta', prazo: 'hoje' },
  11: { tipo: 'movimento', urgencia: 'media', prazo: 'semana' },
  12: { tipo: 'justica', urgencia: 'alta', prazo: 'hoje' },
  13: { tipo: 'transformacao', urgencia: 'media', prazo: 'quinzena' },
  14: { tipo: 'transformacao', urgencia: 'media', prazo: 'semana' },
  15: { tipo: 'defesa', urgencia: 'alta', prazo: 'hoje' },
  16: { tipo: 'agradecimento', urgencia: 'baixa', prazo: 'mes' },
};
/**
 * Ordered keyword-to-ebó-category lookup for parseEboType.
 * Earlier entries take priority; keywords must be checked in this order.
 */
const EBO_TYPE_TOKENS: [string, EboCategory][] = [
  ['Caminho', 'caminho'],
  ['Prosperidade', 'prosperidade'],
  ['Defesa', 'defesa'],
  ['Atração', 'atração'],
  ['Ouro', 'atração'],
  ['Prote', 'protecao'],
  ['Transmut', 'transformacao'],
  ['Alinhamento', 'alinhamento'],
  ['Saúde', 'saude'],
  ['Alívio', 'saude'],
  ['Justiça', 'justica'],
  ['Renovação', 'transformacao'],
  ['Agradecimento', 'agradecimento'],
  ['Movimento', 'movimento'],
  ['Limpeza', 'limpeza'],
];
/**
 * Keyword-to-element display-name lookup for parseEboElements.
 * Each entry maps a substring to the label shown in EboSuggestion.elementos.
 */
const EBO_ELEMENT_TOKENS: [string, string][] = [
  ['despachos', 'Despachos'],
  ['moedas', 'Moedas'],
  ['pipoca', 'Pipoca'],
  ['panos', 'Panos escuros'],
  ['alimentos brancos', 'Alimentos brancos'],
  ['canjica', 'Canjica'],
  ['banhos', 'Banhos de folhas'],
  ['frutas', 'Frutas'],
  ['folhas', 'Folhas'],
  ['velas', 'Velas'],
  ['inhames', 'Inhames'],
  ['paliteiros', 'Paliteiros'],
  ['ferro', 'Ferro'],
  ['girassóis', 'Girassóis'],
  ['mel', 'Mel'],
  ['doces', 'Doces'],
  ['amala', 'Amalá'],
  ['pedras', 'Pedras de raio'],
  ['lama', 'Lama/argila'],
  ['algodão', 'Algodão'],
];

/**
 * Ritual definitions by type
 */
const ritualDefinitions: Record<RitualType, { nome: string; descricao: string; componentes: string[] }> = {
  caminho: {
    nome: 'Ritual de Caminho',
    descricao: 'Abre caminhos e remove obstáculos, especialmente em encruzilhadas',
    componentes: ['Moedas', 'Pipoca', 'Panos escuros', 'Velas pretas'],
  },
  protecao: {
    nome: 'Ritual de Proteção',
    descricao: 'Fortalece a aura e protege contra energias negativas',
    componentes: ['Flores brancas', 'Água de cheiro', 'Sal grosso', 'Alecrim'],
  },
  prosperidade: {
    nome: 'Ritual de Prosperidade',
    descricao: 'Atrai abundância e abre portas para novos negócios',
    componentes: ['Frutas douradas', 'Moedas', 'Mel', 'Canela'],
  },
  saude: {
    nome: 'Ritual de Saúde',
    descricao: 'Promove cura e bem-estar físico e espiritual',
    componentes: ['Plantas medicinais', 'Velas verdes', 'Água mineral', 'Algodão'],
  },
  limpeza: {
    nome: 'Ritual de Limpeza',
    descricao: 'Remove energias densas e purifica o ambiente e a pessoa',
    componentes: ['Ervas de limpeza', 'Defumadores', 'Sal grosso', 'Banho de folha'],
  },
  alinhamento: {
    nome: 'Ritual de Alinhamento (Bori)',
    descricao: 'Fortalece o Ori (cabeça) e alinha o espiritual com o material',
    componentes: ['Canjica branca', 'Algodão', 'Velas brancas', 'Folhas de boldo'],
  },
  justica: {
    nome: 'Ritual de Justiça',
    descricao: 'Promove ação justa e equilibrio nas situações de conflito',
    componentes: ['Pedras de raio', 'Amalá', 'Fumo', 'Velas vermelhas'],
  },
  transformacao: {
    nome: 'Ritual de Transformação',
    descricao: 'Auxilia na mudança de ciclo e renovação espiritual',
    componentes: ['Argila', 'Pipoca (Deburu)', 'Resinas', 'Flores roxas'],
  },
  defesa: {
    nome: 'Ritual de Defesa',
    descricao: 'Protege contra feitiçarias, inveja e ataques espirituais',
    componentes: ['Espada de Santa Bárbara', 'Alho', 'Pimenta', 'Erva de bicho'],
  },
  agradecimento: {
    nome: 'Ritual de Agradecimento',
    descricao: 'Expressa gratidão aos Orixás e fortalece a espiritualidade',
    componentes: ['Flores brancas', 'Velas claras', 'Frutas doces', 'Incenso'],
  },
  atração: {
    nome: 'Ritual de Atração',
    descricao: 'Atrai prosperidade, amor e energias positivas',
    componentes: ['Mel', 'Frutas douradas', 'Girassóis', 'Moedas douradas'],
  },
  movimento: {
    nome: 'Ritual de Movimento',
    descricao: 'Ativa energia de mudança e superação de stagnação',
    componentes: ['Chaves', 'Velas', 'Guiné', 'Arruda'],
  },
};

/**
 * Ebó definitions by category
 */
const eboDefinitions: Record<EboCategory, { nome: string; elementos: string[]; passos: string[]; observacoes: string[] }> = {
  caminho: {
    nome: 'Ebó de Caminho/Limpeza',
    elementos: ['Despachos', 'Moedas', 'Pipoca', 'Panos escuros'],
    passos: [
      'Prepare os componentes em local limpo',
      'Faça preces a Exu e ao Orixá regente',
      'Enterre ou deixe em encruzilhada ao amanhecer',
      'Não olhe para trás após o ritual',
    ],
    observacoes: ['Horário preferencial: madrugada', 'Luar menguante favorece'],
  },
  protecao: {
    nome: 'Ebó de Proteção',
    elementos: ['Alimentos brancos', 'Canjica', 'Folhas frias', 'Velas azuis'],
    passos: [
      'Prepare canjica sem açúcar',
      'Banho de folhas em água filtrada',
      'Acenda velas ao anoitecer',
      'Pequena oferenda na beira-mar (para Iemanjá)',
    ],
    observacoes: ['Evite dias de chuva forte', 'Sábado é favorável para Iemanjá'],
  },
  prosperidade: {
    nome: 'Ebó de Prosperidade',
    elementos: ['Doces', 'Frutas', 'Moedas douradas', 'Mel'],
    passos: [
      'Escolha 6 tipos de frutas frescas',
      'Disponha em círculo com mel no centro',
      'Faça preces de agradecimento',
      'Distribua parte aos menos favorecidos',
    ],
    observacoes: ['Consulte o Babalawo para dia específico', 'Fase da lua crescente favorece'],
  },
  saude: {
    nome: 'Ebó de Alívio/Saúde',
    elementos: ['Frutas brancas', 'Ervas calmas', 'Leite de cabra', 'Velas verdes'],
    passos: [
      'Prepare decocto de ervas suaves',
      'Banho de leite diluído em água',
      'Acenda velas verdes pela manhã',
      'Repouse após o ritual',
    ],
    observacoes: ['Combine com rezas mansas', 'Evite exposição solar intensa'],
  },
  limpeza: {
    nome: 'Ebó de Limpeza Astral',
    elementos: ['Fumo', 'Pinhão roxo', 'Acarajé', 'Ervas várias'],
    passos: [
      'Sacuda as folhas de fumo sobre a cabeça',
      'Prepare sacudimento com pinhão roxo',
      'Ofereça acarajé ao vento (para Iansã)',
      'Banho de ervas imediatamente após',
    ],
    observacoes: ['Horário: ventanias suaves', 'Evite dias de tempestade'],
  },
  alinhamento: {
    nome: 'Ebó de Alinhamento (Bori)',
    elementos: ['Canjica branca', 'Algodão', 'Boldo', 'Velas brancas'],
    passos: [
      'Jejum parcial antes do ritual',
      'Passe canjica na testa em formato de Ori',
      'Coloque algodão sobre a cabeça',
      'Banho de boldo (tapete de Oxalá)',
    ],
    observacoes: ['Este é ritual sagrado', 'Realizar com orientação de especialista'],
  },
  justica: {
    nome: 'Ebó de Justiça',
    elementos: ['Pedras de raio', 'Amalá', 'Folhas de fumo', 'Velas vermelhas'],
    passos: [
      'Prepare amalá bem quente',
      'Adicione folhas de fumo na preparação',
      'Acenda velas vermelhas próximas ao local',
      'Faça solicitações claras a Xangô',
    ],
    observacoes: ['Seja sincero em suas solicitações', 'Xangô valoriza honestidade'],
  },
  transformacao: {
    nome: 'Ebó de Transformação/Renovação',
    elementos: ['Pipoca (Deburu)', 'Lama/argila', 'Fitas coloridas (7 cores)', 'Velas roxas'],
    passos: [
      'Prepare pipoca sem sal para Omolu',
      'Aplique lama sutil nos pés',
      'Amarre fitas em cores variadas',
      'Banho de folhas de fortuna (para Oxumaré)',
    ],
    observacoes: ['Lua cheia favorece renovação', 'Tempo de reflexão é essencial'],
  },
  defesa: {
    nome: 'Ebó de Defesa',
    elementos: ['Espada de Santa Bárbara', 'Acarajés', 'Erva de bicho', 'Pimenta'],
    passos: [
      'Prepare banhos com erva de bicho',
      'Envolva espada de Santa Bárbara em pano branco',
      'Prepare acarajés bem recheados',
      'Aplique banhos nas solas dos pés',
    ],
    observacoes: ['Realize em dias secos', 'Proteja a cabeça com pano branco'],
  },
  agradecimento: {
    nome: 'Ebó de Agradecimento',
    elementos: ['Flores brancas', 'Frutas claras', 'Velas many', 'Incenso suave'],
    passos: [
      'Organize flores brancas em vaso limpo',
      'Disponha frutas ao redor das velas',
      'Acenda número ímpar de velas',
      'Exprima gratidão em voz alta',
    ],
    observacoes: ['Este ritual fortalece espiritualidade', 'Registre seus agradecimentos'],
  },
  atração: {
    nome: 'Ebó de Atração/Ouro',
    elementos: ['Mel', 'Calda de frutas', 'Girassóis', 'Moedas douradas'],
    passos: [
      'Prepare banhos de mel diluído',
      'Use caldas de frutas em águas doces',
      'Disponha girassóis perto de água corrente',
      'Moedas douradas em vasos de plantas',
    ],
    observacoes: ['Combine com banhos de Oxum', 'Horário da tarde é favorável'],
  },
  movimento: {
    nome: 'Ebó de Movimento',
    elementos: ['Chaves', 'Velas nas esquinas', 'Guiné', 'Arruda'],
    passos: [
      'Gire chaves sobre a cabeça 3 vezes',
      'Acenda velas em 4 esquinas da casa',
      'Banho de guiné e arruda bem quente',
      'Caminhe pelas casas com ramo de arruda',
    ],
    observacoes: ['Combine com atividades físicas', 'Evite locais muito escuros'],
  },
};

/**
 * Map Odu number to related Orixás
 */
const oduRelatedOrixas: Record<number, string[]> = {
  1: ['Exu', 'Omolu'],
  2: ['Ibeji', 'Oxum'],
  3: ['Ogum', 'Xangô'],
  4: ['Iemanjá', 'Oxum'],
  5: ['Oxum', 'Iemanjá'],
  6: ['Xangô', 'Ogum'],
  7: ['Omolu', 'Nanã'],
  8: ['Oxalá', 'Iemanjá'],
  9: ['Iansã', 'Omolu'],
  10: ['Oxalá', 'Ibeji'],
  11: ['Iansã', 'Ogum'],
  12: ['Xangô', 'Oxalá'],
  13: ['Nanã', 'Omolu'],
  14: ['Oxumaré', 'Iemanjá'],
  15: ['Obá', 'Oxum'],
  16: ['Orunmilá', 'Oxalá'],
};

/**
 * Daily practices by Odu type
 */
const dailyPractices: Record<number, string[]> = {
  1: ['Cultive a paciência', 'Não aja por impulso', 'Cuide de Exu e dos antepassados', 'Evite discussões desnecessárias'],
  2: ['Mantenha a alegria interna', 'Cuide da criança interior', 'Busque sociedades justas', 'Evite mentiras'],
  3: ['Evite brigas', 'Mantenha foco no trabalho', 'Não demande contra outros', 'Pratique a justiça'],
  4: ['Desenvolva a intuição', 'Preste atenção aos sonhos', 'Cuide da saúde dos olhos', 'Evite ignorar avisos'],
  5: ['Cuide da autoestima', 'Use perfumes agradáveis', 'Mantenha higiene espiritual', 'Busque diplomacia'],
  6: ['Seja generoso', 'Estude regularmente', 'Pratique gratidão', 'Mantenha cabeça erguida'],
  7: ['Pratique desapego', 'Aceite mudanças', 'Evite persistir no erro', 'Cuide do ambiente'],
  8: ['Cuide do Ori (cabeça)', 'Busque paz interior', 'Evite orgulho', 'Pratique humildade'],
  9: ['Respeite o poder feminino', 'Controle palavras', 'Flua com mudanças', 'Evite fofocas'],
  10: ['Vista branco', 'Mantenha silêncio', 'Estude espiritualidade', 'Respeite mais velhos'],
  11: ['Organize mente e rotina', 'Canalize ansiedade em algo produtivo', 'Pratique atividades físicas', 'Evite procrastinação'],
  12: ['Mantenha integridade', 'Não julgue sem provas', 'Equilibre razão e emoção', 'Busque justiça'],
  13: ['Respeite o tempo', 'Busque sabedoria dos mais velhos', 'Cuide das articulações', 'Evite ambientes sujos'],
  14: ['Mantenha discrição', 'Cultive flexibilidade', 'Evite falsidade', 'Respeite segredos'],
  15: ['Busque paz no lar', 'Proteja sua energia', 'Foque no amor próprio', 'Evite brigas domésticas'],
  16: ['Mantenha práticas em dia', 'Compartilhe sabedoria', 'Seja grato', 'Não duvide da espiritualidade'],
};

/**
 * Contraindications by Odu
 */
const contraindications: Record<number, string[]> = {
  1: ['Não ingira carne de porco em excesso', 'Evite cachaça em excesso', 'Não ande na rua ao meio-dia sem necessidade'],
  2: ['Não coma ovos', 'Evite rã', 'Jamais minta ou traia confiança'],
  3: ['Evite usar facas sem necessidade', 'Não coma carne de galo', 'Não pratique violência verbal'],
  4: ['Não olhe para buracos vazios', 'Evite roupas muito vermelhas em crises', 'Nunca minta'],
  5: ['Não coma ovos', 'Evite comidas muito salgadas', 'Não reclame da vida'],
  6: ['Evite inveja', 'Não conte planos antes de realizar', 'Não coma abóbora em excesso', 'Evite teimosia extrema'],
  7: ['Não durma no escuro absoluto se tiver medo', 'Evite carne de caça', 'Não persista no erro'],
  8: ['Não use roupas pretas', 'Evite carne vermelha em dias de preceito', 'Cuide do Ori com reverência'],
  9: ['Não espalhe fofocas', 'Evite ventanias fortes na praia', 'Não use roupas rasgadas'],
  10: ['Não use roupas pretas', 'Evite comida amanhecida', 'Respeite mais velhos'],
  11: ['Não guarde objetos quebrados', 'Evite procrastinação', 'Não use roupas muito escuras'],
  12: ['Não pratique injustiça', 'Jamais acoberte mentiras', 'Evite abóbora/quiabo em excesso em crises'],
  13: ['Evite ambientes bagunçados', 'Não coma rã ou tartaruga', 'Não reclame da velhice'],
  14: ['Evite falsidade', 'Não maltrate animais', 'Nunca revele segredos confiados'],
  15: ['Não inveje espaço alheio', 'Evite comidas apimentadas perto de dormir', 'Não brigue em casa'],
  16: ['Não duvide da própria espiritualidade', 'Evite orgulho e arrogância', 'Ouça conselhos dos mais velhos'],
};

/**
 * Get ritual suggestion for an Odu based on its type
 */
function buildRitualSuggestion(odu: OduInfo): RitualSuggestion | null {
  const ritualConfig = oduRitualMap[odu.numero];
  if (!ritualConfig) return null;

  const definition = ritualDefinitions[ritualConfig.tipo];
  if (!definition) return null;

  return {
    tipo: ritualConfig.tipo,
    nome: definition.nome,
    descricao: definition.descricao,
    orixa: odu.orixaRegente,
    urgencia: ritualConfig.urgencia,
    prazo: ritualConfig.prazo,
    componentes: definition.componentes,
  };
}

/**
 * Parse ebó type from text using ordered keyword lookup.
 */
function parseEboType(eboText: string): EboCategory {
  for (const [keyword, category] of EBO_TYPE_TOKENS) {
    if (eboText.includes(keyword)) return category;
  }
  return 'protecao';
}
/**
 * Parse ebó elements from text using keyword-to-label lookup.
 * Returns an empty array if no elements are found.
 */
function parseEboElements(eboText: string): string[] {
  const elements: string[] = [];
  for (const [keyword, label] of EBO_ELEMENT_TOKENS) {
    if (eboText.includes(keyword)) elements.push(label);
  }
  return elements;
}
/**
 * Parse ebó string from Odu data into structured suggestion.
 */
function parseEboFromOdu(odu: OduInfo): EboSuggestion | null {
  const eboText = odu.ebos[0] || '';
  if (!eboText) return null;
  const tipo = parseEboType(eboText);
  const elements = parseEboElements(eboText);
  const definition = eboDefinitions[tipo] ?? eboDefinitions['protecao'];
  return {
    tipo,
    nome: definition.nome,
    descricao: eboText,
    orixa: odu.orixaRegente,
    elementos: elements.length > 0 ? elements : definition.elementos,
    passos: definition.passos,
    observacoes: definition.observacoes,
  };
}

/**
 * Main matching function - matches an Odu to rituals, ebós, and suggestions
 * 
 * @param odu - Odu object to match
 * @returns Complete matching result with rituals, ebós, and suggestions
 */
export function matchOduToRitual(odu: OduInfo): OduMatchingResult {
  const ritualSuggestion = buildRitualSuggestion(odu);
  const eboSuggestion = parseEboFromOdu(odu);
  const relatedOrixas = oduRelatedOrixas[odu.numero] || [];
  const praticas = dailyPractices[odu.numero] || [];
  const contra = contraindications[odu.numero] || [];

  const rituais: RitualSuggestion[] = ritualSuggestion ? [ritualSuggestion] : [];

  const ebos: EboSuggestion[] = eboSuggestion ? [eboSuggestion] : [];

  return {
    odu,
    rituais,
    ebos,
    orixasRelacionados: [odu.orixaRegente, ...relatedOrixas],
    praticasDiarias: praticas,
    contraindicacoes: contra,
  };
}

/**
 * Match multiple Odus for complex readings
 */
function matchMultipleOduToRituals(odus: OduInfo[]): OduMatchingResult[] {
  return odus.map(odu => matchOduToRitual(odu));
}

/**
 * Get summary of all rituals needed for a set of Odus.
 */
function getRitualSummary(results: OduMatchingResult[]): {
  urgencia: 'baixa' | 'media' | 'alta';
  quantidade: number;
  orixas: string[];
  tipos: RitualType[];
} {
  const allUrgencias = results.flatMap(r => r.rituais.map(rit => rit.urgencia));
  const urgenciaMax = allUrgencias.includes('alta')
    ? 'alta'
    : allUrgencias.includes('media')
    ? 'media'
    : 'baixa';
  const orixaSet = new Set<string>();
  const tipoSet = new Set<RitualType>();
  for (const result of results) {
    for (const orixa of result.orixasRelacionados) orixaSet.add(orixa);
    for (const rit of result.rituais) tipoSet.add(rit.tipo);
  }
  return {
    urgencia: urgenciaMax,
    quantidade: results.length,
    orixas: [...orixaSet],
    tipos: [...tipoSet],
  };
}
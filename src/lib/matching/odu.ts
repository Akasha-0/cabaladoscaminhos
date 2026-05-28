// Odu Matching Logic - Cabala Dos Caminhos
// Matches Odu to ebós, rituals, and spiritual practices

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

/**
 * Map Odu numbers to ritual types
 */
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
    descricao: 'Ativa energia de mudança e superação de stagnation',
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
    nome: 'Ebó de Saúde',
    elementos: ['Plantas medicinais', 'Velas verdes', 'Água de catrina', 'Algodão'],
    passos: [
      'Prepare infusão de plantas sagradas',
      'Faça limpeza com ramo de arruda',
      'Acenda velas verdes por 7 dias',
      'Banho de imersão com folhas',
    ],
    observacoes: ['Quering weekends são favoráveis', 'Associado a Oxalá para cura'],
  },
  limpeza: {
    nome: 'Ebó de Limpeza',
    elementos: ['Ervas especiais', 'Defumadores', 'Sal grosso', 'Espada de Ogum'],
    passos: [
      'Defume o ambiente com ervas',
      'Passe sal grosso nos cantos',
      'Lave ferramentas com água de infusão',
      'Quite-se com Exu primeiro',
    ],
    observacoes: ['Lua nova é ideal para limpeza', 'Evite dias de festa de Orixá'],
  },
  alinhamento: {
    nome: 'Ebó de Alinhamento (Bori)',
    elementos: ['Canjica branca', 'Algodão branco', 'Velas', 'Folhas de efun'],
    passos: [
      'Prepare canjica como_OFFFERING para Ori',
      'Coloque algodão na cabeça',
      'Acenda velasbrancas',
      'Faça preces ao seu Ori',
    ],
    observacoes: ['Favorece segundas e quintas', 'Jejum parcial recommended'],
  },
  justica: {
    nome: 'Ebó de Justiça',
    elementos: ['Pedras de raio', 'Amalá', 'Fumo', 'Velas vermelhas'],
    passos: [
      'Prepare amalá com condiciones especiais',
      'Acenda velas vermelhas e pretas',
      'Faça oferta a Ogum e Xangô',
      'Peca retidão e honestidade',
    ],
    observacoes: ['Feriados e dias de Ogum são ideais', 'Nunca worked false testemunhos'],
  },
  transformacao: {
    nome: 'Ebó de Transformação',
    elementos: ['Pipoca (Deburu)', 'Argila vermelha', 'Resinas', 'Flores roxas'],
    passos: [
      'Misture argila com água de infusão',
      'Queime resinas em braseiro',
      'Jogue pipoca nos quatro cantos',
      'Renove suas intenções',
    ],
    observacoes: ['Período de mudança de ciclo é favorável', 'Associado a Exu, Logun Edé e Obaluaê'],
  },
  defesa: {
    nome: 'Ebó de Defesa',
    elementos: ['Alho', 'Pimenta', 'Espada de Santa Bárbara', 'Erva de bicho'],
    passos: [
      'Prepare infusão com ervas protetoras',
      'Faça sinal de defesa',
      'Enterre componentes em cruz no terreiro',
      'Ligue a Espada de Santa Bárbara',
    ],
    observacoes: ['Evite dia de Oxumar', 'Xangô Saturdays são ideais'],
  },
  agradecimento: {
    nome: 'Ebó de Agradecimento',
    elementos: ['Frutas doces', 'Flores brancas', 'Velas claras', 'Incenso'],
    passos: [
      'Agradeça aos Orixás por bênçãos received',
      ' Disponha flores em círculo',
      'Acenda velas e incenso',
      'Distribua doces em local sagrado',
    ],
    observacoes: ['Festividades de Oxalá são ideais', 'Todas as sextas-feiras favorables para gratidão'],
  },
  atração: {
    nome: 'Ebó de Atração',
    elementos: ['Mel', 'Frutas douradas', 'Girassóis', 'Moedas douradas'],
    passos: [
      'Misture mel com água de infusão',
      'Coloque moedas douradas em desenho circular',
      'Adicione frutas ao redor',
      'Faça preces de abundância',
    ],
    observacoes: ['Lua crescente é ideal', 'Associado a Oshun e Logun Edé'],
  },
  movimento: {
    nome: 'Ebó de Movimento',
    elementos: ['Chaves', 'Arruda', 'Guiné', 'Velas amarelas'],
    passos: [
      'Jogue chaves representando abertura de caminhos',
      'Prepare banho de arruda e guiné',
      'Acenda velas amarelas',
      'Mantenha-se em movimento físico',
    ],
    observacoes: ['Quartas-feiras são favorables', 'Xangô é o Orixá regente'],
  },
};

/**
 * Map Odu number to related Orixás
 */
const oduRelatedOrixas: Record<number, string[]> = {
  1: ['Exu', 'Omolu'],
  2: ['Ibeji', 'Ogum'],
  3: ['Ogum', 'Obaluaê'],
  4: ['Oxalá', 'Obaluaye'],
  5: ['Ochún', 'Logun Edé'],
  6: ['Oxumar', 'Oxum'],
  7: ['Exu', 'Logun Edé'],
  8: ['Oxalá', 'Obagui'],
  9: ['Omolu', 'Obaluaye'],
  10: ['Oxalá', 'Obaluaye'],
  11: ['Xangô', 'Ogum'],
  12: ['Ogum', 'Xangô'],
  13: ['Exu', 'Obaluaê'],
  14: ['Exu', 'Obaluaê'],
  15: ['Ogum', 'Exu'],
  16: ['Oxalá', 'Oduduwa'],
};

/**
 * Daily practices by Odu type
 */
const dailyPractices: Record<number, string[]> = {
  1: ['Rezar a Eru', 'Oferecer água antes do sol', 'Caminhar com intenção'],
  2: ['Meditar sobre dualidade', 'Fazer oferendas binárias', 'Equilibrar opostos'],
  3: ['Agradecer o trabalho', 'Cuidar de ferramentas', 'Limpar espadas'],
  4: ['Respeitar o descanso', 'Fazer preces ao amanhecer', 'Honrar Ossaim'],
  5: ['Nadar ou banhar-se', 'Cuidar da aparência', 'Oferecer água doce'],
  6: ['Lavar moedas com água', 'Cuidar de joias', 'Honrar água corrente'],
  7: ['Respeitar mercados', 'Não hablar de preços', 'Fazer oferendas a Exu'],
  8: ['Alimentar o Ori', 'Descansar a cabeça', 'Fazer oferendas matinais'],
  9: ['Quebrar cocos', 'Fazer ofertas a Omolu', 'Respeitar a terra'],
  10: ['Cuidar do corpo', 'Evitar excesSES', 'Fazer oferendas a Oxalá'],
  11: ['Fazerof当当', 'Lutar pela verdade', 'Respeitar raios'],
  12: ['Limpar ferramentas', 'Fazer oferendas', 'Caminhar com props'],
  13: ['Honrar Exu', 'Fazer limpezas frequentes', 'Respect crossroads'],
  14: ['Entregar-se ao destino', 'Aceitar mudanças', 'Ofertar a Omolu'],
  15: ['Lutar por justica', 'Defender inocentes', 'Usar vermelho e preto'],
  16: ['Agradecer sempre', 'Dar esmolas', 'Respeitar brancos'],
};

/**
 * Contraindications by Odu
 */
const contraindications: Record<number, string[]> = {
  1: ['Descuidar do Ori', 'Mentir para Orixá', 'Dormir sem saudar'],
  2: ['Forçar situações', 'Mentir', 'Descuidar dualidade Sim/Não'],
  3: ['Usar violência desnecessária', 'Descuidar ferramentas', 'Deixar de limpar espadas'],
  4: ['Tomar ganda sem orientação', 'Trabalhar aos domingos', 'Fazer oferendas à noite'],
  5: ['Bater em água parada', 'Usar perfume sintético', 'Mergulhar em água suja'],
  6: ['Descuidar de rios', 'Usar adornos de ouro em excesso', 'Jogar moedas em fontes'],
  7: ['Mentir', 'Fazer acordos falsos', 'Descuidar de Exu'],
  8: ['Trabalhar голодом', 'Dormir após meio-dia', 'Falar mal de Ori'],
  9: ['Pisotar tierra', 'Quebrar objetos de cerâmica', 'Descartar alimentos no chão'],
  10: ['Usar roupas de luto', 'Descuidar da saúde', 'Falar mal de Oxalá'],
  11: ['Usar violência', 'Mentir', 'Descuidar da verdade'],
  12: ['Abandonar ferramentas', 'Faltar aos compromissos', 'Deixar de lutar'],
  13: ['Passar por encruzilhadas sem saudar', 'Derramar bebidas', 'Fazer oferendas sem respeito'],
  14: ['Resistir ao destino', 'Forçar situações', 'Ignorar señales'],
  15: ['Usar espadas sem necessidade', 'Gritar', 'Agredir o próximo'],
  16: ['Reclamar da vida', 'Ser ingrato', 'Ignorar bênçãos'],
};

/**
 * Get ritual suggestion for an Odu based on its type
 */
function buildRitualSuggestion(odu: OduInfo): RitualSuggestion | null {
  const config = oduRitualMap[odu.numero];
  if (!config) return null;

  const definition = ritualDefinitions[config.tipo];
  if (!definition) return null;

  return {
    tipo: config.tipo,
    nome: definition.nome,
    descricao: definition.descricao,
    orixa: odu.orixaRegente,
    urgencia: config.urgencia,
    prazo: config.prazo,
    componentes: definition.componentes,
  };
}

/**
 * Parse ebó string from Odu data into structured suggestion
 */
function parseEboFromOdu(odu: OduInfo): EboSuggestion | null {
  const config = oduRitualMap[odu.numero];
  if (!config) return null;

  const definition = eboDefinitions[config.tipo];
  if (!definition) return null;

  return {
    tipo: config.tipo,
    nome: definition.nome,
    descricao: `Ebó associado ao Odu ${odu.numero} - ${odu.nome}`,
    orixa: odu.orixaRegente,
    elementos: definition.elementos,
    passos: definition.passos,
    observacoes: definition.observacoes,
  };
}

/**
 * Main matching function - matches an Odu to rituals, ebós, and suggestions
 * @param odu - The Odu to match
 * @returns Complete matching result with rituals, ebós, and recommendations
 */
export function matchOduToRituals(odu: OduInfo): OduMatchingResult {
  const ritual = buildRitualSuggestion(odu);
  const ebo = parseEboFromOdu(odu);
  const relatedOrixas = oduRelatedOrixas[odu.numero] || [];
  const praticas = dailyPractices[odu.numero] || [];
  const contraindicacoesOdu = contraindications[odu.numero] || [];

  return {
    odu,
    rituais: ritual ? [ritual] : [],
    ebos: ebo ? [ebo] : [],
    orixasRelacionados: relatedOrixas,
    praticasDiarias: praticas,
    contraindicacoes: contraindicacoesOdu,
  };
}

/**
 * Match an Odu by number (lookup in odusData)
 */
export function matchOduToRitualsByNumero(numero: number): OduMatchingResult | null {
  const { odusData } = require('@/lib/odus/calculos');
  const odu = odusData[numero];
  if (!odu) return null;
  return matchOduToRituals(odu);
}

/**
 * Match an Odu by name
 */
export function matchOduToRitualsByNome(nome: string): OduMatchingResult | null {
  const { odusData } = require('@/lib/odus/calculos');
  const odu = (Object.values(odusData) as OduInfo[]).find(
    (o): boolean => o.nome.toLowerCase() === nome.toLowerCase()
  );
  if (!odu) return null;
  return matchOduToRituals(odu);
}

/**
 * Mesa Real (Baralho Cigano) — Dados Estáticos das 36 Casas
 *
 * FONTE DE VERDADE: docs/04_data-model.md §5.1
 * Nomes, ordem e keywords seguem o Baralho Cigano brasileiro
 * conforme definido pelo PRD (Doc 02 §C.2).
 *
 * Cada posição da mesa 9×4 tem:
 * - número fixo (1..36)
 * - nome tradicional
 * - significado base (sacrado)
 * - elemento regente
 * - casa astrológica delegada (do Doc 06 §2)
 * - planeta regente (do Doc 06 §2)
 * - aspectos numerológicos delegados
 * - aspectos do Odu natal
 *
 * @module lenormand/mesa-real-data
 */

import type { CasaCigana, CartaCigana, OduInfo } from './mesa-real-types';

// ============================================================================
// 36 CASAS DA MESA REAL
// ============================================================================
// Grid 9x4: linha 1 = casas 1-9, linha 2 = 10-18, linha 3 = 19-27, linha 4 = 28-36
// Nomes e ordem baseados no Doc 04 §5.1 e Doc 02 §C.2.

export const CASAS_MESA_REAL: CasaCigana[] = [
  // ─────── LINHA 1 (1-9) ───────
  {
    houseNumber: 1,
    name: 'O CAVALEIRO',
    meaning: 'O Cavaleiro — notícias chegando, início de movimento, o primeiro impulso da vida. Como a pessoa chega ao mundo.',
    element: 'fogo',
    archetype: 'mensageiro',
    astrologyHouse: 1,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Número de Expressão (como o self se manifesta)'],
    oduAspects: ['Odus de início e movimento'],
  },
  {
    houseNumber: 2,
    name: 'O TREVO',
    meaning: 'O Trevo — pequenas sortes, oportunidades rápidas, a fé que sustenta. Júpiter e a boa sorte.',
    element: 'éter',
    archetype: 'sorte',
    astrologyHouse: 2,
    associatedPlanet: 'Júpiter',
    numerologyAspects: ['Número de Motivação (o que o coração busca)'],
    oduAspects: ['Odus de fortuna e oportunidade'],
  },
  {
    houseNumber: 3,
    name: 'O NAVIO',
    meaning: 'O Navio — viagens, negócios à distância, mudanças de horizonte, expansão além dos próprios limites.',
    element: 'água',
    archetype: 'viagem',
    astrologyHouse: 9,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Número de Expressão (comunicação além dos limites)'],
    oduAspects: ['Odus de jornada e expansão'],
  },
  {
    houseNumber: 4,
    name: 'A CASA',
    meaning: 'A Casa — lar físico, família, moradia, estrutura doméstica, base de vida, ancestralidade.',
    element: 'terra',
    archetype: 'lar',
    astrologyHouse: 4,
    associatedPlanet: 'Lua',
    numerologyAspects: ['Número de Motivação (segurança emocional)'],
    oduAspects: ['Odus de família e raízes'],
  },
  {
    houseNumber: 5,
    name: 'A ÁRVORE',
    meaning: 'A Árvore — saúde, vitalidade, energia vital, raízes, crescimento, ancestralidade.',
    element: 'madeira',
    archetype: 'vitalidade',
    astrologyHouse: 6,
    associatedPlanet: 'Sol',
    numerologyAspects: ['Número de Destino (resistência física)'],
    oduAspects: ['Odus de saúde e vitalidade'],
  },
  {
    houseNumber: 6,
    name: 'AS NUVENS',
    meaning: 'As Nuvens — confusão mental, dúvidas, nebulosidade, indecisão, o que está velado.',
    element: 'água',
    archetype: 'confusão',
    astrologyHouse: 12,
    associatedPlanet: 'Netuno',
    numerologyAspects: ['Números de Desafio (onde estão as dúvidas)'],
    oduAspects: ['Odus de limitação e véus'],
  },
  {
    houseNumber: 7,
    name: 'A SERPENTE',
    meaning: 'A Serpente — perigo, traição, inveja, forças ocultas, sexualidade, sabedoria oculta.',
    element: 'fogo',
    archetype: 'sombra',
    astrologyHouse: 8,
    associatedPlanet: 'Plutão',
    numerologyAspects: ['Dívidas Kármicas (números ausentes no nome)'],
    oduAspects: ['Odus de medo profundo e perigo'],
  },
  {
    houseNumber: 8,
    name: 'O CAIXÃO',
    meaning: 'O Caixão — fim de ciclos, transformação profunda, crises, morte simbólica, renascimento.',
    element: 'terra',
    archetype: 'transformação',
    astrologyHouse: 8,
    associatedPlanet: 'Plutão',
    numerologyAspects: ['Número de Missão (morte do velho self)'],
    oduAspects: ['Odus de teste material máximo'],
  },
  {
    houseNumber: 9,
    name: 'OS BUQUÊS',
    meaning: 'Os Buquês — presentes, surpresas felizes, reconhecimento, beleza, alegria, dons.',
    element: 'ar',
    archetype: 'bênção',
    astrologyHouse: 5,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Dons Nativos (dia de nascimento)'],
    oduAspects: ['Odus de presente e reconhecimento'],
  },

  // ─────── LINHA 2 (10-18) ───────
  {
    houseNumber: 10,
    name: 'A FOICE',
    meaning: 'A Foice — cortes necessários, decisões definitivas, colheita, perigos imediatos, separação.',
    element: 'metal',
    archetype: 'corte',
    astrologyHouse: 8,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Números de Desafio (principal)'],
    oduAspects: ['Odus de encerramento definitivo'],
  },
  {
    houseNumber: 11,
    name: 'O CHICOTE',
    meaning: 'O Chicote — conflitos, repetição de padrões, estresse, agressividade, disputas, brigas.',
    element: 'fogo',
    archetype: 'conflito',
    astrologyHouse: 1,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Números de Desafio (padrões destrutivos)'],
    oduAspects: ['Odus de energia sugada por conflito'],
  },
  {
    houseNumber: 12,
    name: 'OS PÁSSAROS',
    meaning: 'Os Pássaros — comunicação, parcerias dinâmicas, nervosismo, trocas rápidas, conversas.',
    element: 'ar',
    archetype: 'comunicação',
    astrologyHouse: 3,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Número de Expressão (eficiência comunicativa)'],
    oduAspects: ['Odus de voz e palavra'],
  },
  {
    houseNumber: 13,
    name: 'A CRIANÇA',
    meaning: 'A Criança — novos começos, projetos iniciais, inocência, renovação, vulnerabilidade.',
    element: 'fogo',
    archetype: 'renovação',
    astrologyHouse: 1,
    associatedPlanet: 'Júpiter',
    numerologyAspects: ['Número de Missão (recomeço)'],
    oduAspects: ['Odus de pureza e início'],
  },
  {
    houseNumber: 14,
    name: 'A RAPOSA',
    meaning: 'A Raposa — astúcia, estratégia, autossuficiência, cautela, discernimento, esperteza.',
    element: 'ar',
    archetype: 'astúcia',
    astrologyHouse: 3,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Número de Expressão (mente estratégica)'],
    oduAspects: ['Odus de percepção do oculto'],
  },
  {
    houseNumber: 15,
    name: 'O URSO',
    meaning: 'O Urso — poder pessoal, autoridade, finanças de grande porte, proteção, liderança.',
    element: 'terra',
    archetype: 'poder',
    astrologyHouse: 10,
    associatedPlanet: 'Sol',
    numerologyAspects: ['Caminho de Vida (núcleo do poder)'],
    oduAspects: ['Odus de força e proteção'],
  },
  {
    houseNumber: 16,
    name: 'A ESTRELA',
    meaning: 'A Estrela — esperança, espiritualidade, guia divino, sonhos, missão de alma, brilho.',
    element: 'éter',
    archetype: 'espiritualidade',
    astrologyHouse: 9,
    associatedPlanet: 'Netuno',
    numerologyAspects: ['Caminho de Vida (especialmente 11, 22, 33)'],
    oduAspects: ['Odus de luz e iluminação'],
  },
  {
    houseNumber: 17,
    name: 'A CEGONHA',
    meaning: 'A Cegonha — mudanças significativas, renovação, melhoria, movimentos inesperados, gestação.',
    element: 'ar',
    archetype: 'mudança',
    astrologyHouse: 9,
    associatedPlanet: 'Urano',
    numerologyAspects: ['Número de Missão (mudança a serviço)'],
    oduAspects: ['Odus de transformação do destino'],
  },
  {
    houseNumber: 18,
    name: 'O CACHORRO',
    meaning: 'O Cachorro — lealdade, amizade, aliados, proteção, confiança, círculo de amigos.',
    element: 'ar',
    archetype: 'lealdade',
    astrologyHouse: 11,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Número de Motivação (projeção nos amigos)'],
    oduAspects: ['Odus de vínculos e proteção'],
  },

  // ─────── LINHA 3 (19-27) ───────
  {
    houseNumber: 19,
    name: 'A TORRE',
    meaning: 'A Torre — isolamento, solidão consciente, ego, autoridade institucional, introspecção.',
    element: 'fogo',
    archetype: 'isolamento',
    astrologyHouse: 12,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Números de Desafio (ego central)'],
    oduAspects: ['Odus de tendência ao isolamento'],
  },
  {
    houseNumber: 20,
    name: 'O JARDIM',
    meaning: 'O Jardim — vida social, público, eventos, exposição, coletividade, espaços públicos.',
    element: 'terra',
    archetype: 'socialização',
    astrologyHouse: 7,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Número de Expressão (apresentação pública)'],
    oduAspects: ['Odus de manifestação pública do dom'],
  },
  {
    houseNumber: 21,
    name: 'A MONTANHA',
    meaning: 'A Montanha — obstáculos, bloqueios, atrasos, inimigos ocultos, desafios duradouros, karma.',
    element: 'terra',
    archetype: 'obstáculo',
    astrologyHouse: 12,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Desafios + Dívidas Kármicas'],
    oduAspects: ['Odus de natureza do bloqueio'],
  },
  {
    houseNumber: 22,
    name: 'OS CAMINHOS',
    meaning: 'Os Caminhos — escolhas, bifurcação, decisões cruciais, possibilidades múltiplas, encruzilhada.',
    element: 'ar',
    archetype: 'escolha',
    astrologyHouse: 1,
    associatedPlanet: 'Lua',
    numerologyAspects: ['Caminho de Vida (o grande caminho)'],
    oduAspects: ['Odus de sentido de direção'],
  },
  {
    houseNumber: 23,
    name: 'O RATO',
    meaning: 'O Rato — perdas graduais, desgaste, ansiedade, pensamentos que consomem, escassez, vazamento.',
    element: 'terra',
    archetype: 'desgaste',
    astrologyHouse: 12,
    associatedPlanet: 'Netuno',
    numerologyAspects: ['Dívidas (números ausentes = vazamento)'],
    oduAspects: ['Odus de energia vital drenada'],
  },
  {
    houseNumber: 24,
    name: 'O CORAÇÃO',
    meaning: 'O Coração — amor, emoções profundas, desejos do coração, afetos, romance, sentimentos.',
    element: 'água',
    archetype: 'amor',
    astrologyHouse: 5,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Número de Motivação (o que o coração deseja)'],
    oduAspects: ['Odus de forma como a alma ama'],
  },
  {
    houseNumber: 25,
    name: 'O ANEL',
    meaning: 'O Anel — contratos, comprometimentos, alianças, casamento, acordos formais, ciclos.',
    element: 'metal',
    archetype: 'compromisso',
    astrologyHouse: 7,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Número de Missão (selada em alianças)'],
    oduAspects: ['Odus de destino em compromissos'],
  },
  {
    houseNumber: 26,
    name: 'O LIVRO',
    meaning: 'O Livro — segredos, conhecimento oculto, estudos, mistérios guardados, sabedoria.',
    element: 'ar',
    archetype: 'sabedoria',
    astrologyHouse: 9,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Caminho de Vida 7 (conhecimento oculto)'],
    oduAspects: ['Odus de segredos do dom'],
  },
  {
    houseNumber: 27,
    name: 'A CARTA',
    meaning: 'A Carta — documentos, notícias escritas, mensagens formais, comunicação oficial.',
    element: 'ar',
    archetype: 'documento',
    astrologyHouse: 3,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Número de Expressão (comunicação formal)'],
    oduAspects: ['Odus de palavra como ferramenta'],
  },

  // ─────── LINHA 4 (28-36) ───────
  {
    houseNumber: 28,
    name: 'O CIGANO',
    meaning: 'O Cigano — figura masculina, ação, protagonismo, o consulente homem, energia ativa.',
    element: 'fogo',
    archetype: 'masculino',
    astrologyHouse: 1,
    associatedPlanet: 'Sol',
    numerologyAspects: ['Caminho de Vida (self ativo)'],
    oduAspects: ['Odus de arquétipo masculino'],
  },
  {
    houseNumber: 29,
    name: 'A CIGANA',
    meaning: 'A Cigana — figura feminina, intuição, receptividade, a consulente mulher, energia yin.',
    element: 'água',
    archetype: 'feminino',
    astrologyHouse: 4,
    associatedPlanet: 'Lua',
    numerologyAspects: ['Número de Motivação (self receptivo)'],
    oduAspects: ['Odus de arquétipo feminino'],
  },
  {
    houseNumber: 30,
    name: 'OS LÍRIOS',
    meaning: 'Os Lírios — paz, pureza, maturidade, sabedoria conquistada, calma após a tempestade.',
    element: 'ar',
    archetype: 'paz',
    astrologyHouse: 9,
    associatedPlanet: 'Júpiter',
    numerologyAspects: ['Caminho de Vida (honrar o destino)'],
    oduAspects: ['Odus de colheita em paz'],
  },
  {
    houseNumber: 31,
    name: 'O SOL',
    meaning: 'O Sol — sucesso máximo, clareza total, vitória, o ápice da realização, brilho máximo.',
    element: 'fogo',
    archetype: 'sucesso',
    astrologyHouse: 10,
    associatedPlanet: 'Sol',
    numerologyAspects: ['Número de Missão (missão cumprida)'],
    oduAspects: ['Odus de plenitude do dom'],
  },
  {
    houseNumber: 32,
    name: 'A LUA',
    meaning: 'A Lua — intuição, psiquismo, reconhecimento, honrarias, o inconsciente à flor da pele.',
    element: 'água',
    archetype: 'intuição',
    astrologyHouse: 12,
    associatedPlanet: 'Lua',
    numerologyAspects: ['Número de Motivação (desejos inconscientes)'],
    oduAspects: ['Odus de dimensão psíquica da alma'],
  },
  {
    houseNumber: 33,
    name: 'A CHAVE',
    meaning: 'A Chave — a solução que se revela, abertura de portas, a resposta esperada, importância.',
    element: 'metal',
    archetype: 'solução',
    astrologyHouse: 9,
    associatedPlanet: 'Júpiter',
    numerologyAspects: ['Número de Missão (a chave da vida)'],
    oduAspects: ['Odus de dom como chave do destino'],
  },
  {
    houseNumber: 34,
    name: 'OS PEIXES',
    meaning: 'Os Peixes — dinheiro, fluxo financeiro, negócios, abundância material, como ganha.',
    element: 'água',
    archetype: 'dinheiro',
    astrologyHouse: 2,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Número de Expressão (talento em recurso)'],
    oduAspects: ['Odus de teste material com dinheiro'],
  },
  {
    houseNumber: 35,
    name: 'A ÂNCORA',
    meaning: 'A Âncora — estabilidade, trabalho fixo, permanência, segurança de longo prazo, solidez.',
    element: 'terra',
    archetype: 'estabilidade',
    astrologyHouse: 6,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Número de Missão (ancorada em propósito)'],
    oduAspects: ['Odus de dom que sustenta a vida material'],
  },
  {
    houseNumber: 36,
    name: 'A CRUZ',
    meaning: 'A Cruz — fardo kármico, teste espiritual máximo, responsabilidade, superação do destino.',
    element: 'fogo',
    archetype: 'carma',
    astrologyHouse: 12,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Karma de Vida + Dívidas Kármicas'],
    oduAspects: ['Odus de teste espiritual máximo'],
  },
];

// ============================================================================
// CARTAS (alias das casas — no Baralho Cigano, casa e carta compartilham nome)
// ============================================================================
export const CARTAS_CIGANAS: CartaCigana[] = CASAS_MESA_REAL.map((casa) => ({
  numero: casa.houseNumber,
  nome: casa.name,
  significado: casa.meaning,
  palavrasChave: casa.oduAspects,
}));

// ============================================================================
// 16 ODUS DO IFÁ
// ============================================================================
export const ODUS_IFA: OduInfo[] = [
  {
    numero: 1,
    nome: 'Ogbe (Oxé)',
    significado: 'A luz que ilumina o caminho. Vitória, criação, renascimento, autoridade divina.',
    elemento: 'Fogo',
    orixaRegente: 'Oxalá',
    quizilas: ['Cachaça em excesso', 'Andar na rua ao meio-dia'],
    preceptos: ['Cultivar a paciência', 'Honrar a criação'],
  },
  {
    numero: 2,
    nome: 'Ejiokô',
    significado: 'A dualidade, a parceria, o movimento. Início de jornada, escolha entre caminhos.',
    elemento: 'Ar / Terra',
    orixaRegente: 'Ibeji, Ogum',
    quizilas: [],
    preceptos: ['Buscar equilíbrio', 'Honrar as parcerias'],
  },
  {
    numero: 3,
    nome: 'Etogundá',
    significado: 'A batalha, a conquista, a abertura de caminhos. Força, vitória, superação.',
    elemento: 'Fogo / Terra',
    orixaRegente: 'Ogum, Ogun',
    quizilas: [],
    preceptos: ['Enfrentar batalhas com coragem', 'Abrir caminhos com ética'],
  },
  {
    numero: 4,
    nome: 'Irosun',
    significado: 'O aviso, a atenção, o cuidado com traições. Intuição, pressentimento, alerta.',
    elemento: 'Fogo / Terra',
    orixaRegente: 'Oxum, Iemanjá',
    quizilas: [],
    preceptos: ['Manter vigilância', 'Confiar na intuição'],
  },
  {
    numero: 5,
    nome: 'Oxê (Ogunda)',
    significado: 'A beleza, o amor, a fertilidade, o magnetismo. Conquista, doçura, poder feminino.',
    elemento: 'Água',
    orixaRegente: 'Oxum',
    quizilas: [],
    preceptos: ['Honrar a beleza interior', 'Cultivar o amor próprio'],
  },
  {
    numero: 6,
    nome: 'Obará',
    significado: 'A riqueza, a glória, a abundância, a fartura. Prosperidade, fartura material e espiritual.',
    elemento: 'Terra',
    orixaRegente: 'Xangô, Oxóssi',
    quizilas: [],
    preceptos: ['Compartilhar a fartura', 'Honrar a terra'],
  },
  {
    numero: 7,
    nome: 'Odi',
    significado: 'Os segredos, a transformação, a cautela, a limpeza. Mistério, profundidade, renascimento.',
    elemento: 'Terra / Água',
    orixaRegente: 'Exu, Omolu',
    quizilas: [],
    preceptos: ['Respeitar os mistérios', 'Cultivar a limpeza interior'],
  },
  {
    numero: 8,
    nome: 'Ejionile',
    significado: 'A justiça, a liderança, a força, a vitória. Equilíbrio, retidão, poder legítimo.',
    elemento: 'Fogo / Água',
    orixaRegente: 'Xangô, Oxalá',
    quizilas: [],
    preceptos: ['Buscar a justiça', 'Liderar com retidão'],
  },
  {
    numero: 9,
    nome: 'Ossá',
    significado: 'A proteção feminina, a sabedoria, a turbulência das águas. Cuidado maternal, proteção.',
    elemento: 'Água',
    orixaRegente: 'Iemanjá, Oyá',
    quizilas: [],
    preceptos: ['Honrar as águas', 'Buscar proteção divina'],
  },
  {
    numero: 10,
    nome: 'Ofun',
    significado: 'A espiritualidade profunda, o equilíbrio mental, a meditação. Sabedoria ancestral.',
    elemento: 'Ar',
    orixaRegente: 'Oxalufan, Oxalá',
    quizilas: [],
    preceptos: ['Meditar regularmente', 'Honrar a ancestralidade'],
  },
  {
    numero: 11,
    nome: 'Owarin',
    significado: 'A dinâmica, o perigo, a astúcia, o movimento rápido. Transformação veloz, alerta.',
    elemento: 'Ar / Fogo',
    orixaRegente: 'Exu, Oyá',
    quizilas: [],
    preceptos: ['Agir com astúcia', 'Manter-se alerta'],
  },
  {
    numero: 12,
    nome: 'Ejilaxebô',
    significado: 'A honra, a proteção, o caminho aberto. Reconhecimento, vitória merecida.',
    elemento: 'Ar',
    orixaRegente: 'Ogum, Oxum',
    quizilas: [],
    preceptos: ['Honrar o mérito', 'Proteger os seus'],
  },
  {
    numero: 13,
    nome: 'Oturupon',
    significado: 'A cura, a purificação, a ancestralidade. Saúde, limpeza, conexão com os mortos.',
    elemento: 'Terra',
    orixaRegente: 'Omolu, Nanã',
    quizilas: [],
    preceptos: ['Honrar os ancestrais', 'Cultivar a cura interior'],
  },
  {
    numero: 14,
    nome: 'Oturá',
    significado: 'A paz, a benevolência, a proteção divina. Harmonia, tranquilidade, segurança.',
    elemento: 'Água',
    orixaRegente: 'Oxalá, Iemanjá',
    quizilas: [],
    preceptos: ['Buscar a paz interior', 'Confiar na proteção divina'],
  },
  {
    numero: 15,
    nome: 'Iká',
    significado: 'O poder, a estratégia, a responsabilidade. Autoridade, comando, decisão.',
    elemento: 'Fogo',
    orixaRegente: 'Xangô, Oxum',
    quizilas: [],
    preceptos: ['Usar o poder com responsabilidade', 'Decidir com ética'],
  },
  {
    numero: 16,
    nome: 'Ofurufu',
    significado: 'A completude, a totalidade, a bênção universal. Integração, plenitude, fim de jornada.',
    elemento: 'Éter',
    orixaRegente: 'Oxalá, todos os Orixás',
    quizilas: [],
    preceptos: ['Buscar a totalidade', 'Integrar todas as lições'],
  },
];

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/** Busca casa por houseNumber (1..36). */
export function getCasaPorNumero(numero: number): CasaCigana | undefined {
  return CASAS_MESA_REAL.find((c) => c.houseNumber === numero);
}

/** Busca carta por numero (1..36). */
export function getCartaPorNumero(numero: number): CartaCigana | undefined {
  return CARTAS_CIGANAS.find((c) => c.numero === numero);
}
/** Busca odu por numero. */
export function getOduPorNumero(numero: number): OduInfo | undefined {
  return ODUS_IFA.find((o) => o.numero === numero);
}
/** Retorna posicao no grid 9x4 para houseNumber. */
export function getPosicaoGrid(casaNumero: number): { row: number; col: number } {
  const idx = casaNumero - 1;
  return { row: Math.floor(idx / 9) + 1, col: (idx % 9) + 1 };
}

/**
 * Correlação especial por casa (1..36) — complementa o Doc 06 §2 com
 * camadas祭祀: numerologia cabalística, tântrica, cabalística.
 */
export interface CorrelacaoEspecial {
  numerologia: string[];
  tantrica: string[];
  cabalistica: string[];
}

export const CORRELACOES_ESPECIAIS: Record<number, CorrelacaoEspecial> = {
  1:  { numerologia: ['Expressão 1'], tantrica: ['Alma 1'], cabalistica: ['Kether'] },
  2:  { numerologia: ['Motivação 2'], tantrica: ['Dom Divino 2'], cabalistica: ['Chokmah'] },
  3:  { numerologia: ['Expressão 3'], tantrica: ['Caminho 3'], cabalistica: ['Binah'] },
  4:  { numerologia: ['Motivação 4'], tantrica: ['Karma 4'], cabalistica: ['Chesed'] },
  5:  { numerologia: ['Destino 5'], tantrica: ['Alma 5'], cabalistica: ['Geburah'] },
  6:  { numerologia: ['Desafios 1+2'], tantrica: ['Karma 6'], cabalistica: ['Tiphareth'] },
  7:  { numerologia: ['Dívidas 7'], tantrica: ['Sombra 7'], cabalistica: ['Netzach'] },
  8:  { numerologia: ['Missão 8'], tantrica: ['Karma 8'], cabalistica: ['Hod'] },
  9:  { numerologia: ['Dons 9'], tantrica: ['Plenitude 9'], cabalistica: ['Yesod'] },
  10: { numerologia: ['Desafio principal 10'], tantrica: ['Karma 10'], cabalistica: ['Malkuth'] },
  11: { numerologia: ['Desafios destrutivos 11'], tantrica: ['Conflito 11'], cabalistica: ['Daath (sombra)'] },
  12: { numerologia: ['Expressão 12'], tantrica: ['Voz 12'], cabalistica: ['Comunicação (Hod)'] },
  13: { numerologia: ['Missão recomeço 13'], tantrica: ['Pureza 13'], cabalistica: ['Renovação (Tiphareth)'] },
  14: { numerologia: ['Expressão estratégica 14'], tantrica: ['Percepção 14'], cabalistica: ['Astúcia (Netzach)'] },
  15: { numerologia: ['Caminho 15'], tantrica: ['Força 15'], cabalistica: ['Poder (Geburah)'] },
  16: { numerologia: ['Caminho 11/22/33'], tantrica: ['Iluminação 16'], cabalistica: ['Estrela (Tiphareth)'] },
  17: { numerologia: ['Missão mudança 17'], tantrica: ['Transformação 17'], cabalistica: ['Urano (Hod)'] },
  18: { numerologia: ['Motivação 18'], tantrica: ['Vínculos 18'], cabalistica: ['Vênus (Netzach)'] },
  19: { numerologia: ['Desafio ego 19'], tantrica: ['Isolamento 19'], cabalistica: ['Saturno (Binah)'] },
  20: { numerologia: ['Expressão pública 20'], tantrica: ['Dom público 20'], cabalistica: ['Vênus (Tiphareth)'] },
  21: { numerologia: ['Desafios + Dívidas 21'], tantrica: ['Bloqueio 21'], cabalistica: ['Saturno (Geburah)'] },
  22: { numerologia: ['Caminho 22'], tantrica: ['Direção 22'], cabalistica: ['Caminhos (Tiphareth)'] },
  23: { numerologia: ['Dívidas ausentes 23'], tantrica: ['Drenagem 23'], cabalistica: ['Netuno (Kether)'] },
  24: { numerologia: ['Motivação 24'], tantrica: ['Amor 24'], cabalistica: ['Vênus (Tiphareth)'] },
  25: { numerologia: ['Missão selada 25'], tantrica: ['Aliança 25'], cabalistica: ['Saturno (Malkuth)'] },
  26: { numerologia: ['Caminho 7'], tantrica: ['Sabedoria 26'], cabalistica: ['Mercúrio (Hod)'] },
  27: { numerologia: ['Expressão formal 27'], tantrica: ['Palavra 27'], cabalistica: ['Mercúrio (Hod)'] },
  28: { numerologia: ['Caminho ativo 28'], tantrica: ['Masculino 28'], cabalistica: ['Sol (Tiphareth)'] },
  29: { numerologia: ['Motivação 29'], tantrica: ['Feminino 29'], cabalistica: ['Lua (Tiphareth)'] },
  30: { numerologia: ['Caminho 30'], tantrica: ['Colheita 30'], cabalistica: ['Júpiter (Chesed)'] },
  31: { numerologia: ['Missão 31'], tantrica: ['Plenitude 31'], cabalistica: ['Sol (Tiphareth)'] },
  32: { numerologia: ['Motivação 32'], tantrica: ['Psiquismo 32'], cabalistica: ['Lua (Tiphareth)'] },
  33: { numerologia: ['Missão chave 33'], tantrica: ['Solução 33'], cabalistica: ['Júpiter (Chesed)'] },
  34: { numerologia: ['Expressão talento 34'], tantrica: ['Teste material 34'], cabalistica: ['Vênus (Netzach)'] },
  35: { numerologia: ['Missão ancorada 35'], tantrica: ['Sustento 35'], cabalistica: ['Saturno (Malkuth)'] },
  36: { numerologia: ['Karma + Dívidas 36'], tantrica: ['Teste máximo 36'], cabalistica: ['Kether (todo)'] },
};
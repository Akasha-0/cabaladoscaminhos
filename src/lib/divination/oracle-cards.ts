// src/lib/divination/oracle-cards.ts
// Catálogo canônico das 36 Cartas Ciganas (Lenormand Cigano)
// usado pelo Cockpit Oracular e por testes de oráculo.
//
// Fonte canônica: as 36 cartas da Mesa Real (Doc 06 §2 / Doc 14).
// Esta é uma camada de "oráculo aberto" (single-card pulls) por
// cima do baralho completo — não é o baralho em si (esse está em
// `src/lib/constants/lenormand-cards.ts`).

// ============================================================================
// Types
// ============================================================================

export type OracleTheme =
  | 'renewal'
  | 'shadow-work'
  | 'ancestry'
  | 'intuition'
  | 'grounding';

export interface OracleCard {
  /** 'oracle-001' .. 'oracle-036'. */
  id: string;
  /** Nome canônico (carta cigana). */
  name: string;
  /** Descrição curta (1 linha). */
  description: string;
  /** Mensagem espiritual (1-2 frases). */
  message: string;
  /** Afirmação p/ o consulente. */
  affirmation: string;
  /** Categoria espiritual. */
  theme: OracleTheme;
}

export interface OracleDeck {
  cards: OracleCard[];
}

// ============================================================================
// Catálogo das 36 cartas
// ============================================================================

/**
 * Tabela canônica das 36 cartas. `theme` é atribuído por
 * agrupamento temático das casas (rotativo entre os 5 temas
 * definidos acima, na ordem em que aparecem no baralho).
 */
const THEMES_BY_INDEX: OracleTheme[] = [
  'renewal', // 1-8: abertura, movimento, escolha
  'shadow-work', // 9-15: transformação, sombra, fim
  'ancestry', // 16-22: laços, família, base
  'intuition', // 23-29: percepção, amor, sonho
  'grounding', // 30-36: corpo, casa, ciclo
];

function pickTheme(index0: number): OracleTheme {
  // Distribui as 36 cartas em 5 grupos: 8+7+7+7+7
  if (index0 < 8) return THEMES_BY_INDEX[0];
  if (index0 < 15) return THEMES_BY_INDEX[1];
  if (index0 < 22) return THEMES_BY_INDEX[2];
  if (index0 < 29) return THEMES_BY_INDEX[3];
  return THEMES_BY_INDEX[4];
}

const CARDS: OracleCard[] = [
  { id: 'oracle-001', name: 'O Cavaleiro', description: 'Notícia rápida, ação, movimento',         message: 'O impulso chegou. Use-o antes que esfrie.',           affirmation: 'Eu ajo com clareza e propósito.',                            theme: 'renewal' },
  { id: 'oracle-002', name: 'O Trevo',     description: 'Sorte, oportunidade, fé',                 message: 'Há uma pequena porta aberta. Entre sem medo.',          affirmation: 'Eu confio na sorte que me acompanha.',                       theme: 'renewal' },
  { id: 'oracle-003', name: 'O Navio',     description: 'Viagem, mudança, expansão',              message: 'O horizonte mudou. Acolha a travessia.',                 affirmation: 'Eu navego em direção ao novo.',                              theme: 'renewal' },
  { id: 'oracle-004', name: 'A Casa',      description: 'Família, lar, base',                     message: 'A raiz sustenta o voo.',                                  affirmation: 'Eu sou firme como o chão que piso.',                         theme: 'renewal' },
  { id: 'oracle-005', name: 'A Árvore',    description: 'Saúde, vitalidade, crescimento',         message: 'Cresce devagar, mas cresce.',                             affirmation: 'Eu honro o meu tempo de maturação.',                         theme: 'renewal' },
  { id: 'oracle-006', name: 'As Nuvens',   description: 'Dúvida, confusão, indecisão',            message: 'A névoa é temporária. Espere.',                           affirmation: 'Eu respiro e aceito o que ainda não vejo.',                  theme: 'renewal' },
  { id: 'oracle-007', name: 'A Serpente',  description: 'Inveja oculta, sabedoria',               message: 'Cuidado com o que não se mostra.',                        affirmation: 'Eu transformo suspeita em discernimento.',                   theme: 'renewal' },
  { id: 'oracle-008', name: 'O Caixão',    description: 'Fim, transformação, morte simbólica',    message: 'Algo se encerra para que algo possa nascer.',            affirmation: 'Eu deixo ir o que já cumpriu o seu papel.',                  theme: 'renewal' },

  { id: 'oracle-009', name: 'O Buquê',     description: 'Surpresas, dons, beleza',                message: 'A vida lhe oferece uma flor.',                            affirmation: 'Eu mereço e aceito o que é bom.',                            theme: 'shadow-work' },
  { id: 'oracle-010', name: 'A Foice',     description: 'Corte, decisão, maturidade',             message: 'Decida. O corte liberta.',                                affirmation: 'Eu tenho coragem de escolher.',                               theme: 'shadow-work' },
  { id: 'oracle-011', name: 'O Chicote',   description: 'Conflito, raiva, disputa',               message: 'A tensão pede pausa, não mais força.',                    affirmation: 'Eu transformo a raiva em direção.',                          theme: 'shadow-work' },
  { id: 'oracle-012', name: 'Os Pássaros', description: 'Comunicação, notícias, palavras',        message: 'Algo está prestes a ser dito.',                           affirmation: 'Eu falo e escuto com verdade.',                              theme: 'shadow-work' },
  { id: 'oracle-013', name: 'O Cão',       description: 'Lealdade, amizade, proteção',            message: 'Há um coração fiel ao seu lado.',                         affirmation: 'Eu sou leal e recebo lealdade.',                             theme: 'shadow-work' },
  { id: 'oracle-014', name: 'O Burro',     description: 'Rotina, perseverança, teimosia',        message: 'O passo constante vence.',                                affirmation: 'Eu persisto com paciência.',                                 theme: 'shadow-work' },
  { id: 'oracle-015', name: 'O Coelho',    description: 'Medo, cautela, prudência',              message: 'Vá devagar se o medo pedir.',                             affirmation: 'Eu honro os meus limites.',                                  theme: 'shadow-work' },

  { id: 'oracle-016', name: 'A Estrela',   description: 'Esperança, inspiração',                 message: 'A luz guia o caminho.',                                   affirmation: 'Eu sigo a estrela que me orienta.',                          theme: 'ancestry' },
  { id: 'oracle-017', name: 'O Veado',     description: 'Nobreza, metas, crescimento',           message: 'Avance com altivez.',                                     affirmation: 'Eu caminho com dignidade.',                                  theme: 'ancestry' },
  { id: 'oracle-018', name: 'A Cegonha',   description: 'Mudança, novos inícios',                message: 'Um novo ciclo começa.',                                   affirmation: 'Eu recebo a mudança com gratidão.',                          theme: 'ancestry' },
  { id: 'oracle-019', name: 'O Cachorro',  description: 'Companheirismo, fidelidade',            message: 'A confiança se renova.',                                  affirmation: 'Eu sou digno de confiança.',                                 theme: 'ancestry' },
  { id: 'oracle-020', name: 'O Torreão',   description: 'Estabilidade, limite, proteção',        message: 'O muro é seguro; saia quando for a hora.',                affirmation: 'Eu sei quando me proteger.',                                 theme: 'ancestry' },
  { id: 'oracle-021', name: 'O Gato',      description: 'Independência, autonomia',              message: 'Use sua astúcia sem perder a ternura.',                   affirmation: 'Eu confio na minha independência.',                          theme: 'ancestry' },
  { id: 'oracle-022', name: 'O Rato',      description: 'Inimizade oculta, perda',                message: 'Onde há vazamento, há o que vazar.',                      affirmation: 'Eu protejo o que me sustenta.',                               theme: 'ancestry' },

  { id: 'oracle-023', name: 'A Rã',        description: 'Prosperidade, fertilidade',             message: 'O fluxo está se abrindo.',                                affirmation: 'Eu recebo a abundância.',                                    theme: 'intuition' },
  { id: 'oracle-024', name: 'A Borboleta', description: 'Leveza, transformação',                  message: 'Soltar o peso liberta.',                                  affirmation: 'Eu escolho a leveza.',                                       theme: 'intuition' },
  { id: 'oracle-025', name: 'A Flor',      description: 'Amor, beleza',                           message: 'O amor floresce onde há cuidado.',                        affirmation: 'Eu sou digno de amor e beleza.',                             theme: 'intuition' },
  { id: 'oracle-026', name: 'A Espada',    description: 'Conflito, decisão, justiça',             message: 'A verdade exige corte.',                                  affirmation: 'Eu ajo com coragem e justiça.',                              theme: 'intuition' },
  { id: 'oracle-027', name: 'A Âncora',    description: 'Estabilidade, segurança',                message: 'A segurança é interna primeiro.',                         affirmation: 'Eu sou minha própria âncora.',                               theme: 'intuition' },
  { id: 'oracle-028', name: 'O Anjo',      description: 'Proteção, espiritualidade',              message: 'Você está acompanhado.',                                  affirmation: 'Eu aceito a proteção que me cerca.',                         theme: 'intuition' },
  { id: 'oracle-029', name: 'O Bouquet',   description: 'Celebração, alegrias',                   message: 'Celebre sem culpa.',                                      affirmation: 'Eu celebro a vida.',                                         theme: 'intuition' },

  { id: 'oracle-030', name: 'A Lua',       description: 'Intuição, inconsciente',                 message: 'O que é sussurrado à noite é verdade.',                    affirmation: 'Eu confio na minha intuição.',                               theme: 'grounding' },
  { id: 'oracle-031', name: 'O Sol',       description: 'Sucesso, clareza, vitalidade',           message: 'O brilho vem do trabalho honesto.',                        affirmation: 'Eu brilho com autenticidade.',                               theme: 'grounding' },
  { id: 'oracle-032', name: 'A Montanha',  description: 'Obstáculos, desafios',                   message: 'A montanha tem um caminho; procure.',                      affirmation: 'Eu supero o que parece impossível.',                          theme: 'grounding' },
  { id: 'oracle-033', name: 'Os Maridos',  description: 'Aliança, sociedade, parceria',           message: 'A boa parceria multiplica.',                              affirmation: 'Eu construo parcerias justas.',                              theme: 'grounding' },
  { id: 'oracle-034', name: 'O Corvo',     description: 'Mágoa, segredo revelado',                message: 'O que era oculto vem à luz para ser curado.',             affirmation: 'Eu transformo mágoa em compreensão.',                        theme: 'grounding' },
  { id: 'oracle-035', name: 'As Crianças', description: 'Inocência, novo começo',                 message: 'A pureza ainda vive em você.',                            affirmation: 'Eu permito a alegria simples.',                              theme: 'grounding' },
  { id: 'oracle-036', name: 'A Cruz',      description: 'Conclusão, fardo, superação',            message: 'O peso é prova, não castigo.',                            affirmation: 'Eu carrego com fé o que me cabe.',                           theme: 'grounding' },
];

// ============================================================================
// API pública
// ============================================================================

/** Retorna o deck completo (36 cartas) em um `OracleDeck`. */
export function getOracleCards(): OracleDeck {
  return { cards: CARDS };
}

/** Retorna todas as cartas como array. */
export function getAllOracleCards(): OracleCard[] {
  return CARDS;
}

/** Busca uma carta pelo id (e.g. `'oracle-007'`). Retorna `undefined` se inválido. */
export function getOracleCardById(id: string): OracleCard | undefined {
  if (!id) return undefined;
  return CARDS.find((c) => c.id === id);
}

/** Retorna uma carta aleatória do deck. */
export function getRandomOracleCard(): OracleCard {
  return CARDS[Math.floor(Math.random() * CARDS.length)] as OracleCard;
}

/** Filtra cartas por tema (5 temas canônicos). */
export function getOracleCardsByTheme(theme: string): OracleCard[] {
  if (!theme) return [];
  return CARDS.filter((c) => c.theme === theme);
}

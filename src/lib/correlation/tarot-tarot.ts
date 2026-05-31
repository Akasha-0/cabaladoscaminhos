/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps relationships between Tarot Major Arcana cards with spiritual context
 * Based on elemental, chakra, and numerological correspondences
 */

/**
 * Represents the type of relationship between two Tarot cards
 */
export type TarotRelationshipType =
  | 'mesmo_elemento'      // Same element relationship
  | 'mesmo_chakra'       // Same chakra relationship
  | 'numerologico'       // Numerological relationship (card numbers sum to sacred numbers)
  | 'complementar'       // Complementary/opposite archetypes
  | 'sequencial'          // Sequential cards in the journey
  | 'transformacao';     // Transformation relationship (Death → Temperance, etc.)

/**
 * Represents the correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** The source arcano name */
  arcano_1: string;
  /** The target arcano name */
  arcano_2: string;
  /** The type of spiritual relationship */
  tipo_relacionamento: TarotRelationshipType;
  /** The card number of arcano 1 */
  numero_1: number;
  /** The card number of arcano 2 */
  numero_2: number;
  /** Common element if applicable */
  elemento?: string;
  /** Common chakra if applicable */
  chakra?: string;
  /** Chakra number if applicable */
  chakra_numero?: number;
  /** Spiritual meaning of this card pair relationship */
  significado_espiritual: string;
  /** Combined interpretation for readings */
  interpretacao_combinada: string;
}

// ─── Tarot-Tarot Relationship Mappings ────────────────────────────────────────
// Maps pairs of Major Arcana cards to their spiritual relationships.
// Relationships are bidirectional - card A relates to card B and vice versa.

export const TAROT_TAROT_MAPPINGS: TarotTarotMapping[] = [
  // ─── Fire Element Group ──────────────────────────────────────────────────
  {
    arcano_1: 'O Imperador',
    arcano_2: 'O Carro',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 4,
    numero_2: 7,
    elemento: 'Fogo',
    significado_espiritual:
      'Autoridade marcial encontra a vitória guerreira. A estrutura do Imperadormanifesta-se através da conquista do Carro.',
    interpretacao_combinada:
      'Assertividade, disciplina marcial e triunfo através da força de vontade. O momento de agir com confiança absoluta.',
  },
  {
    arcano_1: 'O Imperador',
    arcano_2: 'A Força',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 4,
    numero_2: 11,
    elemento: 'Fogo',
    significado_espiritual:
      'Autoridade imperial encontra coragem cardíaca. A força do Imperador transforma-se em compaixão guerreira na Força.',
    interpretacao_combinada:
      'Coragem compassiva, domínio gentil das situações. O guerreiro que lidera com o coração.',
  },
  {
    arcano_1: 'O Carro',
    arcano_2: 'A Torre',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 7,
    numero_2: 16,
    elemento: 'Fogo',
    significado_espiritual:
      'Vitória controlada encontra destruição libertadora. O Carro conquista, a Torre destrói para reconstruir.',
    interpretacao_combinada:
      'Mudança dramática com propósito. A transformação que vem através da ação decisiva e ruptura de limitações.',
  },
  {
    arcano_1: 'A Força',
    arcano_2: 'A Temperança',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 11,
    numero_2: 14,
    elemento: 'Fogo',
    significado_espiritual:
      'Coragem cardíaca encontra equilíbrio alquímico. A compaixão da Força manifesta-se como moderação da Temperança.',
    interpretacao_combinada:
      'Equilíbrio emocional através da força interior. A cura que vem do domínio gentil das polaridades.',
  },
  {
    arcano_1: 'O Sol',
    arcano_2: 'O Julgamento',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 19,
    numero_2: 20,
    elemento: 'Fogo',
    significado_espiritual:
      'Vitalidade solar encontra ressurreição flamejante. O brilho do Sol ilumina o despertar do Julgamento.',
    interpretacao_combinada:
      'Renascimento radiante, chamada divina para a plenitude. O momento de brilhar autenticamente e responder ao chamado da alma.',
  },

  // ─── Water Element Group ─────────────────────────────────────────────────
  {
    arcano_1: 'A Sacerdotisa',
    arcano_2: 'A Lua',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 2,
    numero_2: 18,
    elemento: 'Água',
    significado_espiritual:
      'Sabedoria lunar encontra o inconsciente profundo. A intuição da Sacerdotisa expande-se no mar da Lua.',
    interpretacao_combinada:
      'Viagem pelos mundos interiores, revelação dos mistérios ocultos. O reino do sonho e da percepção além do véu.',
  },
  {
    arcano_1: 'A Sacerdotisa',
    arcano_2: 'O Enforcado',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 2,
    numero_2: 12,
    elemento: 'Água',
    significado_espiritual:
      'Mistérios guardados encontram sacrifício revelador. A sabedoria da Sacerdotisa sacrifica-se na inversão do Enforcado.',
    interpretacao_combinada:
      'Nova perspectiva através da entrega. A sabedoria que vem quando abandonamos a resistência e abraçamos o sacrifício consciente.',
  },
  {
    arcano_1: 'A Morte',
    arcano_2: 'A Lua',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 13,
    numero_2: 18,
    elemento: 'Água',
    significado_espiritual:
      'Transformação inevitável encontra os mares emocionais. A morte do ego navega pelos волны da Lua.',
    interpretacao_combinada:
      'Dissolução das ilusões, navegação pelo inconsciente. A transformação que acontece quando confrontamos nossos medos mais profundos.',
  },

  // ─── Earth Element Group ─────────────────────────────────────────────────
  {
    arcano_1: 'O Louco',
    arcano_2: 'A Imperatriz',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 0,
    numero_2: 3,
    elemento: 'Terra',
    significado_espiritual:
      'Novo começo errante encontra abundância fertilizante. A liberdade do Louco manifesta-se como criação da Imperatriz.',
    interpretacao_combinada:
      'Criatividade que flui naturalmente, novos começos férteis. O impulso inicial que se transforma em manifestação abundante.',
  },
  {
    arcano_1: 'O Louco',
    arcano_2: 'O Diabo',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 0,
    numero_2: 15,
    elemento: 'Terra',
    significado_espiritual:
      'Liberdade absoluta encontra prisão terrena. A inocência do Louco contrasta com as correntes do Diabo.',
    interpretacao_combinada:
      'O caminho entre a liberdade e a servidão voluntária. A jornada do despertar que pode levar à libertação ou à submissão.',
  },
  {
    arcano_1: 'A Imperatriz',
    arcano_2: 'O Mundo',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 3,
    numero_2: 21,
    elemento: 'Terra',
    significado_espiritual:
      'Abundância fertilizante encontra completude terrena. A criação da Imperatriz completa-se na integração do Mundo.',
    interpretacao_combinada:
      'Realização criativa, manifestação da abundância interior. O ciclo completo que honra a Terra Mãe.',
  },

  // ─── Air Element Group ───────────────────────────────────────────────────
  {
    arcano_1: 'O Mago',
    arcano_2: 'O Hierofante',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 1,
    numero_2: 5,
    elemento: 'Ar',
    significado_espiritual:
      'Manifestação individual encontra sabedoria sagrada. O poder do Mago expande-se na tradição do Hierofante.',
    interpretacao_combinada:
      'Magia que se torna doutrina, poder pessoal que honra a tradição. A manifestação consciente dentro dos sagrado.',
  },
  {
    arcano_1: 'O Mago',
    arcano_2: 'Os Enamorados',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 1,
    numero_2: 6,
    elemento: 'Ar',
    significado_espiritual:
      'Poder de manifestar encontra união de opostos. A vontade do Mago escolhe no momento dos Enamorados.',
    interpretacao_combinada:
      'Escolha sagrada com poder de criação. O momento de manifestar através da união dos opostos.',
  },
  {
    arcano_1: 'O Hierofante',
    arcano_2: 'A Justiça',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 5,
    numero_2: 8,
    elemento: 'Ar',
    significado_espiritual:
      'Sabedoria sagrada encontra equilíbrio cósmico. A tradição do Hierofante é julgada pela lei divina da Justiça.',
    interpretacao_combinada:
      'Lei sagrada em ação, equilíbrio entre tradição e justiça. O julgamento que honra o caminho espiritual.',
  },
  {
    arcano_1: 'A Estrela',
    arcano_2: 'Os Enamorados',
    tipo_relacionamento: 'mesmo_elemento',
    numero_1: 17,
    numero_2: 6,
    elemento: 'Ar',
    significado_espiritual:
      'Esperança desperta encontra união sagrada. A luz da Estrela guia a escolha dos Enamorados.',
    interpretacao_combinada:
      'Conexão espiritual em harmonia, escolha que traz esperança. O amor que se eleva através da luz interior.',
  },

  // ─── Numerological Relationships (Sacred Numbers) ────────────────────────
  // 10 + 11 = 21 (Wheel + Strength = World) - cycles and courage lead to completion
  {
    arcano_1: 'A Roda da Fortuna',
    arcano_2: 'A Força',
    tipo_relacionamento: 'numerologico',
    numero_1: 10,
    numero_2: 11,
    significado_espiritual:
      'Ciclos do destino encontram coragem cardíaca. A roda gira, mas a força interior permanece.',
    interpretacao_combinada:
      'Coragem nos ciclos da vida, aceitação do destino com força interior. A resiliência que transforma o ciclo em evolução.',
  },
  // 10 + 10 = 20 (Wheel + Wheel = Judgement) - doubling of cycles for awakening
  {
    arcano_1: 'A Roda da Fortuna',
    arcano_2: 'O Julgamento',
    tipo_relacionamento: 'numerologico',
    numero_1: 10,
    numero_2: 20,
    significado_espiritual:
      'Ciclos do destino encontram ressurreição. A roda prepara o despertar do Julgamento.',
    interpretacao_combinada:
      'Renascimento através da compreensão dos ciclos. O momento de responder ao chamado divino após atravessar muitas voltas.',
  },

  // ─── Same Chakra Relationships ───────────────────────────────────────────
  // Chakra 1 - Root
  {
    arcano_1: 'O Louco',
    arcano_2: 'A Roda da Fortuna',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 0,
    numero_2: 10,
    chakra: '1º Chakra Raiz (Muladhara)',
    chakra_numero: 1,
    significado_espiritual:
      'Grounding journey from freedom to cycles. The root opens to embrace the turning of fate.',
    interpretacao_combinada:
      'Ancoramento na mudança, aceitar os ciclos do destino com a liberdade interior do louco.',
  },
  {
    arcano_1: 'O Louco',
    arcano_2: 'O Diabo',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 0,
    numero_2: 15,
    chakra: '1º Chakra Raiz (Muladhara)',
    chakra_numero: 1,
    significado_espiritual:
      'Libertação e prisão no mesmo chakra. A inocência do Louco contrasta com as amarras do Diabo.',
    interpretacao_combinada:
      'O teste fundamental: liberdade ou servidão. A escolha que determina nossa relação com a matéria.',
  },

  // Chakra 2 - Sacral
  {
    arcano_1: 'O Mago',
    arcano_2: 'O Carro',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 1,
    numero_2: 7,
    chakra: '2º Chakra Sacral (Svadhisthana)',
    chakra_numero: 2,
    significado_espiritual:
      'Poder de manifestar encontra vitória guerreira. A vontade do Mago conquista no Carro.',
    interpretacao_combinada:
      'Manifestação através da ação decisiva. O poder de criar realidade através da vontade sagrada.',
  },
  {
    arcano_1: 'O Mago',
    arcano_2: 'A Morte',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 1,
    numero_2: 13,
    chakra: '2º Chakra Sacral (Svadhisthana)',
    chakra_numero: 2,
    significado_espiritual:
      'Criação manifesta encontra destruição transformadora. O poder do Mago inclui a capacidade de morrer e renascer.',
    interpretacao_combinada:
      'Transformação criativa, o poder de destruir para reconstruir. A morte do velho que permite novo nascimento.',
  },
  {
    arcano_1: 'O Carro',
    arcano_2: 'A Torre',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 7,
    numero_2: 16,
    chakra: '2º Chakra Sacral (Svadhisthana)',
    chakra_numero: 2,
    significado_espiritual:
      'Vitória conquistada encontra destruição reveladora. A jornada do Carro atravessa a Tower para a libertação.',
    interpretacao_combinada:
      'Avanço transformador, ruptura necessária para o progresso. A destruição que liberta para novas conquistas.',
  },

  // Chakra 3 - Solar Plexus
  {
    arcano_1: 'A Sacerdotisa',
    arcano_2: 'O Eremita',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 2,
    numero_2: 9,
    chakra: '3º Chakra Plexo Solar (Manipura)',
    chakra_numero: 3,
    significado_espiritual:
      'Intuição guardada encontra iluminação solitária. A sabedoria da Sacerdotisa é encontrada pelo Eremita em solidão.',
    interpretacao_combinada:
      'Busca da verdade através da introspecção. A sabedoria interior que brilha na escuridão da solidão sagrada.',
  },
  {
    arcano_1: 'A Sacerdotisa',
    arcano_2: 'O Julgamento',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 2,
    numero_2: 20,
    chakra: '3º Chakra Plexo Solar (Manipura)',
    chakra_numero: 3,
    significado_espiritual:
      'Mistérios ocultos encontram ressurreição. A Sacerdotisa guarda os segredos que o Julgamento revela.',
    interpretacao_combinada:
      'Despertar dos mistérios, chamado para a verdade. A revelação que responde ao chamado da alma.',
  },
  {
    arcano_1: 'O Eremita',
    arcano_2: 'O Julgamento',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 9,
    numero_2: 20,
    chakra: '3º Chakra Plexo Solar (Manipura)',
    chakra_numero: 3,
    significado_espiritual:
      'Iluminação solitária encontra ressurreição coletiva. A luz do Eremita prepara o despertar do Julgamento.',
    interpretacao_combinada:
      'Luz interior que irradia para o mundo, chamado divino após a busca solitária.',
  },

  // Chakra 4 - Heart
  {
    arcano_1: 'A Imperatriz',
    arcano_2: 'Os Enamorados',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 3,
    numero_2: 6,
    chakra: '4º Chakra Cardíaco (Anahata)',
    chakra_numero: 4,
    significado_espiritual:
      'Amor fertilizante encontra escolha sagrada. A Imperatriz nutre a decisão dos Enamorados.',
    interpretacao_combinada:
      'Amor que escolhe, escolha que ama. O coração que encontra sua counterpart na harmonia dos opostos.',
  },
  {
    arcano_1: 'A Imperatriz',
    arcano_2: 'A Força',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 3,
    numero_2: 11,
    chakra: '4º Chakra Cardíaco (Anahata)',
    chakra_numero: 4,
    significado_espiritual:
      'Abundância amorosa encontra coragem cardíaca. O amor da Imperatriz manifesta-se como força da Temperança.',
    interpretacao_combinada:
      'Amor forte e compassivo, força que vem do coração. A capacidade de amar com coragem e equilibrar as polaridades.',
  },
  {
    arcano_1: 'Os Enamorados',
    arcano_2: 'A Temperança',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 6,
    numero_2: 14,
    chakra: '4º Chakra Cardíaco (Anahata)',
    chakra_numero: 4,
    significado_espiritual:
      'Escolha de amor encontra equilíbrio alquímico. A união dos Enamorados é temperada pela Temperança.',
    interpretacao_combinada:
      'Harmonia nas relações, equilíbrio entre dar e receber. A união que se transforma em harmonia duradoura.',
  },
  {
    arcano_1: 'A Força',
    arcano_2: 'A Temperança',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 11,
    numero_2: 14,
    chakra: '4º Chakra Cardíaco (Anahata)',
    chakra_numero: 4,
    significado_espiritual:
      'Coragem cardíaca encontra equilíbrio de polaridades. A força do coração é equilibradapela Temperança.',
    interpretacao_combinada:
      'Equilíbrio através do amor, força que harmoniza. A capacidade de manter o coração aberto enquanto se enfrenta os desafios.',
  },

  // Chakra 5 - Throat
  {
    arcano_1: 'O Hierofante',
    arcano_2: 'A Justiça',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 5,
    numero_2: 8,
    chakra: '5º Chakra Laríngeo (Vishuddha)',
    chakra_numero: 5,
    significado_espiritual:
      'Doutrina sagrada encontra lei divina. A sabedoria do Hierofante é equilibrada pela justiça cósmica.',
    interpretacao_combinada:
      'Verdade falada com sabedoria, julgamento que honra a tradição. A expressão da verdade sagrada em equilíbrio.',
  },

  // Chakra 6 - Third Eye
  {
    arcano_1: 'A Estrela',
    arcano_2: 'A Lua',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 17,
    numero_2: 18,
    chakra: '6º Chakra Frontal (Ajna)',
    chakra_numero: 6,
    significado_espiritual:
      'Esperança desperta encontra ilusão revelada. A luz da Estrela dissipa os véus da Lua.',
    interpretacao_combinada:
      'Intuição clara através das ilusões, esperança que guia pelos mares emocionais. A percepção que vê além do véu.',
  },

  // Chakra 7 - Crown
  {
    arcano_1: 'O Sol',
    arcano_2: 'O Mundo',
    tipo_relacionamento: 'mesmo_chakra',
    numero_1: 19,
    numero_2: 21,
    chakra: '7º Chakra Coronário (Sahasrara)',
    chakra_numero: 7,
    significado_espiritual:
      'Vitalidade solar encontra completude divina. O brilho do Sol integra-se na totalidade do Mundo.',
    interpretacao_combinada:
      'Realização espiritual plena, conexão com a fonte de toda luz. A dan ça cósmica que completa o ciclo da grande obra.',
  },

  // ─── Transformation Relationships ────────────────────────────────────────
  {
    arcano_1: 'A Morte',
    arcano_2: 'A Temperança',
    tipo_relacionamento: 'transformacao',
    numero_1: 13,
    numero_2: 14,
    significado_espiritual:
      'Transformação inevitável encontra equilíbrio alquímico. A morte do velho self é transmutada pela Temperança.',
    interpretacao_combinada:
      'Metamorfose consciente, a morte que leva à harmonia. O processo de transmutação que transforma trauma em sabedoria.',
  },
  {
    arcano_1: 'A Torre',
    arcano_2: 'A Estrela',
    tipo_relacionamento: 'transformacao',
    numero_1: 16,
    numero_2: 17,
    significado_espiritual:
      'Destruição súbita encontra esperança renovad. A Torre destrói, a Estrela restaura a fé.',
    interpretacao_combinada:
      'Libertação através da crise, renascimento após a queda. A esperança que nasce das cinzas da destruição.',
  },
  {
    arcano_1: 'O Diabo',
    arcano_2: 'A Estrela',
    tipo_relacionamento: 'transformacao',
    numero_1: 15,
    numero_2: 17,
    significado_espiritual:
      'Prisões interiores encontram libertação estelar. As correntes do Diabo são cortadas pela luz da Estrela.',
    interpretacao_combinada:
      'Libertação das amarras materiais e emocionais. A luz que dissipa as sombras e restaura a esperança.',
  },

  // ─── Sequential Relationships ──────────────────────────────────────────────
  {
    arcano_1: 'O Louco',
    arcano_2: 'O Mago',
    tipo_relacionamento: 'sequencial',
    numero_1: 0,
    numero_2: 1,
    significado_espiritual:
      'Inocência encontra poder. A liberdade do Louco desperta o poder do Mago.',
    interpretacao_combinada:
      'O início da jornada, o despertar do poder interior. O momento de passar da inocência ao uso consciente da vontade.',
  },
  {
    arcano_1: 'A Imperatriz',
    arcano_2: 'O Imperador',
    tipo_relacionamento: 'sequencial',
    numero_1: 3,
    numero_2: 4,
    significado_espiritual:
      'Abundância encontra estrutura. A criação da Imperatriz precisa da estrutura do Imperador.',
    interpretacao_combinada:
      'Manifestação criativa com fundamento, fertilidade com disciplina. O equilíbrio entre receptividade e ação.',
  },
  {
    arcano_1: 'A Estrela',
    arcano_2: 'A Lua',
    tipo_relacionamento: 'sequencial',
    numero_1: 17,
    numero_2: 18,
    significado_espiritual:
      'Esperança encontra inconsciente. A luz da Estrela ilumina os mares da Lua.',
    interpretacao_combinada:
      'Luz guiando pelo emocional, esperança nas profundezas. A navegação intuitiva após a restauração da fé.',
  },
  {
    arcano_1: 'A Lua',
    arcano_2: 'O Sol',
    tipo_relacionamento: 'sequencial',
    numero_1: 18,
    numero_2: 19,
    significado_espiritual:
      'Ilusão encontra claridade. Os véus da Lua são dissipados pela luz do Sol.',
    interpretacao_combinada:
      'Despertar da ilusão, emergência na luz. O momento de clareza após navegar pelos mares do inconsciente.',
  },
  {
    arcano_1: 'O Sol',
    arcano_2: 'O Julgamento',
    tipo_relacionamento: 'sequencial',
    numero_1: 19,
    numero_2: 20,
    significado_espiritual:
      'Vitalidade encontra despertar. O brilho do Sol prepara o despertar do Julgamento.',
    interpretacao_combinada:
      'Chamado divino no momento de plenitude. A resposta ao chamado da alma quando estamos em nosso brilho.',
  },

  // ─── Complementary Relationships ──────────────────────────────────────────
  {
    arcano_1: 'O Louco',
    arcano_2: 'O Mundo',
    tipo_relacionamento: 'complementar',
    numero_1: 0,
    numero_2: 21,
    significado_espiritual:
      'Início e fim da jornada. O Louco começa o que o Mundo completa.',
    interpretacao_combinada:
      'O ciclo completo da experiência humana, do novo começo à realização. A jornada que retorna ao ponto de partida em um novo nível.',
  },
  {
    arcano_1: 'A Sacerdotisa',
    arcano_2: 'O Sol',
    tipo_relacionamento: 'complementar',
    numero_1: 2,
    numero_2: 19,
    significado_espiritual:
      'Mistério lunar encontra claridade solar. O oculto revela-se na luz.',
    interpretacao_combinada:
      'Equilíbrio entre o oculto e o manifesto, entre a sabedoria guardada e a verdade clara. A integração do mistério na luz.',
  },
  {
    arcano_1: 'A Imperatriz',
    arcano_2: 'O Hierofante',
    tipo_relacionamento: 'complementar',
    numero_1: 3,
    numero_2: 5,
    significado_espiritual:
      'Feminino sagrado encontra masculino sagrado. A fertilidade encontra a doutrina.',
    interpretacao_combinada:
      'Sagrado feminino e masculino em equilíbrio, criação e tradição. A expressão completa do divino em forma.',
  },
  {
    arcano_1: 'O Hierofante',
    arcano_2: 'A Estrela',
    tipo_relacionamento: 'complementar',
    numero_1: 5,
    numero_2: 17,
    significado_espiritual:
      'Tradição encontra esperança individual. A sabedoria coletiva ilumina a esperança pessoal.',
    interpretacao_combinada:
      'Fé na tradição que nutre a esperança individual. A estrela guia dentro da estrutura sagrada.',
  },
] as const;

/**
 * Get the tarot-tarot relationship between two arcanos
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns The relationship mapping or null if not found
 */
export function getTarotTarot(arcano1: string, arcano2: string): TarotTarotMapping | null {
  return (
    TAROT_TAROT_MAPPINGS.find(
      (m) =>
        (m.arcano_1 === arcano1 && m.arcano_2 === arcano2) ||
        (m.arcano_1 === arcano2 && m.arcano_2 === arcano1)
    ) ?? null
  );
}

/**
 * Get all relationships for a specific arcano
 * @param arcano - Arcano name
 * @returns Array of all relationships involving this arcano
 */
export function getTarotRelationships(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(
    (m) => m.arcano_1 === arcano || m.arcano_2 === arcano
  );
}

/**
 * Get all relationships of a specific type
 * @param tipo - Relationship type
 * @returns Array of mappings with this relationship type
 */
export function getRelationshipsByType(tipo: TarotRelationshipType): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.tipo_relacionamento === tipo);
}

/**
 * Get all relationships by element
 * @param elemento - Element name (Fogo, Água, Terra, Ar)
 * @returns Array of mappings with this element
 */
export function getRelationshipsByElement(elemento: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.elemento === elemento);
}

/**
 * Get all relationships by chakra
 * @param chakraNumero - Chakra number (1-7)
 * @returns Array of mappings with this chakra
 */
export function getRelationshipsByChakra(chakraNumero: number): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.chakra_numero === chakraNumero);
}

/**
 * Get all tarot-tarot relationships
 * @returns Array of all relationship mappings
 */
export function getAllTarotTarot(): TarotTarotMapping[] {
  return [...TAROT_TAROT_MAPPINGS];
}

/**
 * Get arcanos that share a relationship type with a given arcano
 * @param arcano - Arcano name
 * @param tipo - Relationship type to filter by
 * @returns Array of related arcano names
 */
export function getRelatedArcanos(arcano: string, tipo?: TarotRelationshipType): string[] {
  const relationships = tipo
    ? getRelationshipsByType(tipo).filter(
        (m) => m.arcano_1 === arcano || m.arcano_2 === arcano
      )
    : getTarotRelationships(arcano);

  const related = new Set<string>();
  relationships.forEach((m) => {
    if (m.arcano_1 === arcano) related.add(m.arcano_2);
    else if (m.arcano_2 === arcano) related.add(m.arcano_1);
  });

  return Array.from(related);
}

/**
 * Check if two arcanos have a relationship
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns True if a relationship exists
 */
export function hasTarotRelationship(arcano1: string, arcano2: string): boolean {
  return getTarotTarot(arcano1, arcano2) !== null;
}

/**
 * Get all unique relationship types
 * @returns Array of relationship types
 */
export function getAllRelationshipTypes(): TarotRelationshipType[] {
  const types = new Set<TarotRelationshipType>();
  TAROT_TAROT_MAPPINGS.forEach((m) => types.add(m.tipo_relacionamento));
  return Array.from(types);
}

export default {
  getTarotTarot,
  getTarotRelationships,
  getRelationshipsByType,
  getRelationshipsByElement,
  getRelationshipsByChakra,
  getAllTarotTarot,
  getRelatedArcanos,
  hasTarotRelationship,
  getAllRelationshipTypes,
  TAROT_TAROT_MAPPINGS,
};

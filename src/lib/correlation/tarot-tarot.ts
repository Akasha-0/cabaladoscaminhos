/**
 * Tarot-Tarot Self-Correlation Module
 * Maps Tarot Major Arcana cards to related cards based on shared themes,
 * numerological connections, elemental affinities, and spiritual archetypes.
 * Source: Cabala dos Caminhos spiritual framework - tarot interconnections
 */

/**
 * Represents a correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** The primary arcano name */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Related arcano that shares thematic/numerological connection */
  arcano_relacionado: string;
  /** Card number of the related arcano */
  numero_carta_relacionado: number;
  /** Type of connection between the cards */
  tipo_conexão: 'numerológica' | 'elemental' | 'temática' | 'cabalística' | 'evolutiva';
  /** Explanation of why these cards are connected */
  razão_conexão: string;
  /** Spiritual lesson from this connection */
  lição_espiritual: string;
}

/**
 * Represents a group of cards that form a thematic cluster
 */
export interface TarotCluster {
  /** Cluster name/theme */
  nome: string;
  /** Cards in this cluster */
  arcanos: string[];
  /** Theme description */
  tema: string;
  /** Spiritual significance of the cluster */
  significado: string;
}

// ─── Tarot Major Arcana Self-Correlation Mapping ─────────────────────────────
// Cards are mapped to related cards based on shared spiritual themes,
// numerological connections, elemental affinities, and Kabbalistic correspondences.

export const TAROT_TAROT_MAP: Record<number, TarotTarotMapping[]> = {
  0: [
    {
      arcano: 'O Louco',
      numero_carta: 0,
      arcano_relacionado: 'O Mago',
      numero_carta_relacionado: 1,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'O Louco (0) e O Mago (1) representam o início da jornada espiritual. O Louco é o potencial puro antes da manifestação, enquanto O Mago é a habilidade de canalizar esse potencial em ação.',
      lição_espiritual: 'Você carrega dentro de si todos os recursos necessários para manifestar seus sonhos. O Louco lembra que a liberdade vem quando você reconhece seu poder interior.',
    },
    {
      arcano: 'O Louco',
      numero_carta: 0,
      arcano_relacionado: 'O Mundo',
      numero_carta_relacionado: 21,
      tipo_conexão: 'numerológica',
      razão_conexão: 'O Louco (0) e O Mundo (21) somam 21, que se reduz a 3 (criatividade). Juntos representam o ciclo completo da jornada espiritual - do início ao fim.',
      lição_espiritual: 'A jornada completa retorna ao ponto de partida, mas com consciência expandida. Cada fim é um novo começo.',
    },
    {
      arcano: 'O Louco',
      numero_carta: 0,
      arcano_relacionado: 'A Estrela',
      numero_carta_relacionado: 17,
      tipo_conexão: 'temática',
      razão_conexão: 'Ambos os cartões representam esperança, renovação e luz após a escuridão. O Louco salta para o desconhecido com fé; A Estrela traz esperança após a crise.',
      lição_espiritual: 'Mesmo nos momentos de aparente loucura, há uma estrela guiando seu caminho. Confie no processo de renovação.',
    },
  ],
  1: [
    {
      arcano: 'O Mago',
      numero_carta: 1,
      arcano_relacionado: 'A Sacerdotisa',
      numero_carta_relacionado: 2,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'O Mago (1) representa a ação willful, enquanto A Sacerdotisa (2) representa a sabedoria intuitiva. Juntos, eles equilibram o masculino e feminino sagrado.',
      lição_espiritual: 'A verdadeira mestria vem da combinação de habilidade (Mago) e sabedoria interior (Sacerdotisa).',
    },
    {
      arcano: 'O Mago',
      numero_carta: 1,
      arcano_relacionado: 'O Louco',
      numero_carta_relacionado: 0,
      tipo_conexão: 'numerológica',
      razão_conexão: 'O Mago (1) e O Louco (0) são os extremos do início - o1 manifesta o que o 0 contém em potencial.',
      lição_espiritual: 'Você tem o poder de transformar o potencial em realidade. A escolha de como usar esse poder é sua.',
    },
  ],
  2: [
    {
      arcano: 'A Sacerdotisa',
      numero_carta: 2,
      arcano_relacionado: 'A Imperatriz',
      numero_carta_relacionado: 3,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'A Sacerdotisa (2) guarda os mistérios que A Imperatriz (3) manifesta no mundo físico. Uma revela, a outra cria.',
      lição_espiritual: 'A sabedoria oculta deve ser manifestada na terra. Confie na sua intuição para criar com propósito.',
    },
    {
      arcano: 'A Sacerdotisa',
      numero_carta: 2,
      arcano_relacionado: 'A Lua',
      numero_carta_relacionado: 18,
      tipo_conexão: 'elemental',
      razão_conexão: 'A Sacerdotisa e A Lua estão ambas associadas ao reino da água, à lua, ao inconsciente e aos mistérios.',
      lição_espiritual: 'Os véus entre os mundos são mais finos do que você imagina. Confie nos seus sonhos e visões.',
    },
  ],
  3: [
    {
      arcano: 'A Imperatriz',
      numero_carta: 3,
      arcano_relacionado: 'A Fertilidade',
      numero_carta_relacionado: 3,
      tipo_conexão: 'temática',
      razão_conexão: 'A Imperatriz é o arquétipo da grande mãe, da fertilidade em todas as formas - criativa, emocional, espiritual e material.',
      lição_espiritual: 'Você é naturalmente abundante. Permita que a energia criativa flua através de você sem resistência.',
    },
    {
      arcano: 'A Imperatriz',
      numero_carta: 3,
      arcano_relacionado: 'O Imperador',
      numero_carta_relacionado: 4,
      tipo_conexão: 'cabalística',
      razão_conexão: 'A Imperatriz (3) e O Imperador (4) são o par criativo binário - receptividade e ação, intuição e lógica.',
      lição_espiritual: 'O equilíbrio entre nutrir (Imperatriz) e estruturar (Imperador) cria harmonia em todas as áreas.',
    },
  ],
  4: [
    {
      arcano: 'O Imperador',
      numero_carta: 4,
      arcano_relacionado: 'A Imperatriz',
      numero_carta_relacionado: 3,
      tipo_conexão: 'cabalística',
      razão_conexão: 'O Imperador (4) traz ordem onde A Imperatriz (3) traz fertilidade. Juntos representam o equilíbrio entre estrutura e criatividade.',
      lição_espiritual: 'A disciplina não precisa ser rígida. Permita que a estrutura seja uma forma de amor.',
 },
    {
      arcano: 'O Imperador',
      numero_carta: 4,
      arcano_relacionado: 'O Hierofante',
      numero_carta_relacionado: 5,
      tipo_conexão: 'temática',
      razão_conexão: 'Ambos representam autoridade - O Imperador no mundo material, O Hierofante no mundo espiritual.',
      lição_espiritual: 'A verdadeira autoridade vem de Integrity e conhecimento. Busque sabedoria para liderar.',
    },
  ],
  5: [
    {
      arcano: 'O Hierofante',
      numero_carta: 5,
      arcano_relacionado: 'O Papa',
      numero_carta_relacionado: 5,
      tipo_conexão: 'temática',
      razão_conexão: 'O Hierofante é o mestre espiritual que guia através das tradições sagradas e ensinamentos ocultos.',
      lição_espiritual: 'A sabedoria verdadeira está na tradição combinada com a experiência pessoal.',
    },
    {
      arcano: 'O Hierofante',
      numero_carta: 5,
      arcano_relacionado: 'O Mago',
      numero_carta_relacionado: 1,
      tipo_conexão: 'numerológica',
      razão_conexão: 'O Hierofante (5) e O Mago (1) representam a jornada do aprendizado - da habilidade individual à sabedoria tradicional.',
      lição_espiritual: 'Você pode ser seu próprio mestre, mas a tradição contém sabedoria acumulada por gerações.',
    },
  ],
  6: [
    {
      arcano: 'Os Enamorados',
      numero_carta: 6,
      arcano_relacionado: 'A Justiça',
      numero_carta_relacionado: 11,
      tipo_conexão: 'numerológica',
      razão_conexão: 'Os Enamorados (6) e A Justiça (11) somam 17, que se reduz a 8 - o número do equilíbrio e da lei cósmica.',
      lição_espiritual: 'O amor verdadeiro inclui a escolha consciente. Tome decisões com integridade e compaixão.',
    },
    {
      arcano: 'Os Enamorados',
      numero_carta: 6,
      arcano_relacionado: 'O Carro',
      numero_carta_relacionado: 7,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'Os Enamorados representam a escolha; O Carro representa a vitória após fazer a escolha certa.',
      lição_espiritual: 'O amor é uma jornada de escolha. Após escolher, avance com determinação e graça.',
    },
  ],
  7: [
    {
      arcano: 'O Carro',
      numero_carta: 7,
      arcano_relacionado: 'Os Enamorados',
      numero_carta_relacionado: 6,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'O Carro (7) representa a vitória conquistada após a escolha dos Enamorados (6).',
      lição_espiritual: 'A vitória vem para aqueles que fazem escolhas corajosas e avançam com determinação.',
    },
    {
      arcano: 'O Carro',
      numero_carta: 7,
      arcano_relacionado: 'A Força',
      numero_carta_relacionado: 8,
      tipo_conexão: 'temática',
      razão_conexão: 'Ambos os cartões mostram conquista e controle - O Carro através da vontade, A Força através da compaixão.',
      lição_espiritual: 'A verdadeira força está na gentleness. Contenha o leão com amor, não com força bruta.',
    },
  ],
  8: [
    {
      arcano: 'A Força',
      numero_carta: 8,
      arcano_relacionado: 'O Carro',
      numero_carta_relacionado: 7,
      tipo_conexão: 'temática',
      razão_conexão: 'A Força (8) é o controle interno que complementa O Carro (7) - controle externo. Juntos mostram conquista completa.',
      lição_espiritual: 'A verdadeira força vem de dentro. A coragem de ser gentil é o ápice do poder.',
    },
    {
      arcano: 'A Força',
      numero_carta: 8,
      arcano_relacionado: 'A Justiça',
      numero_carta_relacionado: 11,
      tipo_conexão: 'numerológica',
      razão_conexão: 'A Força (8) e A Justiça (11) são números mestres adjacentes, representando equilíbrio e verdade.',
      lição_espiritual: 'A justiça verdadeira requer força interior. Ser honesto requer coragem.',
    },
  ],
  9: [
    {
      arcano: 'O Eremita',
      numero_carta: 9,
      arcano_relacionado: 'A Sacerdotisa',
      numero_carta_relacionado: 2,
      tipo_conexão: 'temática',
      razão_conexão: 'O Eremita (9) busca a luz interior que A Sacerdotisa (2) guarda. Ambos estão no reino da introspecção.',
      lição_espiritual: 'A sabedoria que você procura está dentro de você. Vá para o silêncio e encontre sua luz interior.',
    },
    {
      arcano: 'O Eremita',
      numero_carta: 9,
      arcano_relacionado: 'A Estrela',
      numero_carta_relacionado: 17,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'O Eremita (9) encontra a luz que A Estrela (17) oferece. A solidão leva à esperança.',
      lição_espiritual: 'Na escuridão da solidão, você encontra a estrela da esperança. A jornada interior prepara você para a renovação.',
    },
  ],
  10: [
    {
      arcano: 'A Roda da Fortuna',
      numero_carta: 10,
      arcano_relacionado: 'O Destino',
      numero_carta_relacionado: 10,
      tipo_conexão: 'temática',
      razão_conexão: 'A Roda da Fortuna representa o ciclo do destino, a roda do carma girando através das eras.',
      lição_espiritual: 'Os ciclos vêm e vão. Aceite a mudança como parte natural da vida. O que sobe, desce; o que desce, sobe.',
    },
    {
      arcano: 'A Roda da Fortuna',
      numero_carta: 10,
      arcano_relacionado: 'A Justiça',
      numero_carta_relacionado: 11,
      tipo_conexão: 'cabalística',
      razão_conexão: 'A Roda (10) gira o destino, que A Justiça (11) equilibra com lei cósmica. Cada ação tem consequência.',
      lição_espiritual: 'O universo mantém equilíbrio perfeito. Cada escolha cria uma onda que retorna a você.',
    },
  ],
  11: [
    {
      arcano: 'A Justiça',
      numero_carta: 11,
      arcano_relacionado: 'A Força',
      numero_carta_relacionado: 8,
      tipo_conexão: 'numerológica',
      razão_conexão: 'A Justiça (11) e A Força (8) são números mestres adjacentes, representando equilíbrio e verdade.',
      lição_espiritual: 'A verdade liberta. Tome decisões com integridade e as consequências serão justas.',
    },
    {
      arcano: 'A Justiça',
      numero_carta: 11,
      arcano_relacionado: 'O Julgamento',
      numero_carta_relacionado: 20,
      tipo_conexão: 'temática',
      razão_conexão: 'A Justiça (11) julga as ações, O Julgamento (20) representa o despertar final e a redenção.',
      lição_espiritual: 'Seja seu próprio juiz com compaixão. O verdadeiro julgamento é o autoconhecimento.',
    },
  ],
  12: [
    {
      arcano: 'O Enforcado',
      numero_carta: 12,
      arcano_relacionado: 'A Torre',
      numero_carta_relacionado: 16,
      tipo_conexão: 'temática',
      razão_conexão: 'O Enforcado (12) oferece sacrifício voluntário; A Torre (16) representa sacrifício forçado. Ambos envolvem queda e transformação.',
      lição_espiritual: 'Às vezes você precisa mudar de perspectiva para ver a verdade. O sacrifício voluntário é libertação.',
    },
    {
      arcano: 'O Enforcado',
      numero_carta: 12,
      arcano_relacionado: 'O Louco',
      numero_carta_relacionado: 0,
      tipo_conexão: 'numerológica',
      razão_conexão: 'O Enforcado (12) e O Louco (0) somam 12, número de completude em contextos espirituais.',
      lição_espiritual: 'Estar pendurado é uma forma de entrega. Confie que mesmo os momentos de pausa têm propósito.',
    },
  ],
  13: [
    {
      arcano: 'A Morte',
      numero_carta: 13,
      arcano_relacionado: 'A Torre',
      numero_carta_relacionado: 16,
      tipo_conexão: 'temática',
      razão_conexão: 'A Morte (13) e A Torre (16) são cartões de transformação - uma representa morte metafórica, a outra destruição dramática.',
      lição_espiritual: 'A morte é apenas transformação. O que morre faz espaço para o que vai nascer. Abrace a mudança.',
    },
    {
      arcano: 'A Morte',
      numero_carta: 13,
      arcano_relacionado: 'O Julgamento',
      numero_carta_relacionado: 20,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'A Morte (13) mata o ego; O Julgamento (20) ressuscita a alma renascida. Morte leva a renascimento.',
      lição_espiritual: 'A morte do velho eu é necessária para o nascimento do novo. Permita que o antigo morra para dar lugar ao novo.',
    },
  ],
  14: [
    {
      arcano: 'A Temperança',
      numero_carta: 14,
      arcano_relacionado: 'A Justiça',
      numero_carta_relacionado: 11,
      tipo_conexão: 'numerológica',
      razão_conexão: 'A Temperança (14) e A Justiça (11) somam 25, que se reduz a 7 - número de sabedoria e completude espiritual.',
      lição_espiritual: 'O equilíbrio é a chave para a sabedoria. Misture os elementos da vida com harmonia.',
    },
    {
      arcano: 'A Temperança',
      numero_carta: 14,
      arcano_relacionado: 'O Diabo',
      numero_carta_relacionado: 15,
      tipo_conexão: 'temática',
      razão_conexão: 'A Temperança (14) busca equilíbrio, enquanto O Diabo (15) representa extremismo e vício. A temperança é o antídoto.',
      lição_espiritual: 'O equilíbrio entre extremos é a chave. Nem tudo é escuridão, nem tudo é luz. Encontre o meio.',
    },
  ],
  15: [
    {
      arcano: 'O Diabo',
      numero_carta: 15,
      arcano_relacionado: 'A Torre',
      numero_carta_relacionado: 16,
      tipo_conexão: 'temática',
      razão_conexão: 'O Diabo (15) representa aprisionamento por escolhas próprias; A Torre (16) quebra essas correntes dramaticamente.',
      lição_espiritual: 'Você tem o poder de quebrar suas próprias correntes. Reconheça o que te prende e liberte-se.',
    },
    {
      arcano: 'O Diabo',
      numero_carta: 15,
      arcano_relacionado: 'A Temperança',
      numero_carta_relacionado: 14,
      tipo_conexão: 'temática',
      razão_conexão: 'O Diabo (15) representa extremismo; A Temperança (14) é o equilíbrio que falta. Um é o antídoto do outro.',
      lição_espiritual: 'A libertação vem pelo equilíbrio. Reconheça as armadilhas e escolha o caminho do meio.',
    },
  ],
  16: [
    {
      arcano: 'A Torre',
      numero_carta: 16,
      arcano_relacionado: 'A Morte',
      numero_carta_relacionado: 13,
      tipo_conexão: 'temática',
      razão_conexão: 'A Torre (16) e A Morte (13) são cartões de transformação - destruição e morte metafórica levam a renascimento.',
      lição_espiritual: 'A destruição das ilusões é libertação. A torre que cai revela a verdade que estava oculta.',
    },
    {
      arcano: 'A Torre',
      numero_carta: 16,
      arcano_relacionado: 'O Diabo',
      numero_carta_relacionado: 15,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'A Torre (16) quebra as correntes que O Diabo (15) representa. A destruição é libertação.',
      lição_espiritual: 'O raio que destrói também ilumina. Abrace a mudança disruptiva como caminho para a verdade.',
    },
  ],
  17: [
    {
      arcano: 'A Estrela',
      numero_carta: 17,
      arcano_relacionado: 'O Louco',
      numero_carta_relacionado: 0,
      tipo_conexão: 'temática',
      razão_conexão: 'A Estrela (17) traz esperança após a crise; O Louco (0) representa novos começos. Ambos são cartões de renovação.',
      lição_espiritual: 'Após a tempestade, vem a calma. Há sempre uma estrela esperando por você no escuro.',
    },
    {
      arcano: 'A Estrela',
      numero_carta: 17,
      arcano_relacionado: 'A Lua',
      numero_carta_relacionado: 18,
      tipo_conexão: 'elemental',
      razão_conexão: 'A Estrela (17) e A Lua (18) estão associadas à água, à noite, ao inconsciente e aos sonhos.',
      lição_espiritual: 'Nas águas escuras da noite, a estrela brilha mais forte. Confie nos seus sonhos.',
    },
  ],
  18: [
    {
      arcano: 'A Lua',
      numero_carta: 18,
      arcano_relacionado: 'A Sacerdotisa',
      numero_carta_relacionado: 2,
      tipo_conexão: 'elemental',
      razão_conexão: 'A Lua (18) e A Sacerdotisa (2) estão associadas à água, à lua, ao inconsciente e aos mistérios ocultos.',
      lição_espiritual: 'Nos momentos de ilusão, confia na luz interior. A verdade está além do véu da percepção.',
    },
    {
      arcano: 'A Lua',
      numero_carta: 18,
      arcano_relacionado: 'O Sol',
      numero_carta_relacionado: 19,
      tipo_conexão: 'temática',
      razão_conexão: 'A Lua (18) representa ilusão e escuridão; O Sol (19) representa verdade e luz. Juntos mostram o ciclo dia-noite.',
      lição_espiritual: 'A luz sempre retorna após a escuridão. Após a lua, vem o sol. Tenha esperança.',
    },
  ],
  19: [
    {
      arcano: 'O Sol',
      numero_carta: 19,
      arcano_relacionado: 'A Lua',
      numero_carta_relacionado: 18,
      tipo_conexão: 'temática',
      razão_conexão: 'O Sol (19) é a luz da verdade; A Lua (18) é a ilusão. Juntos equilibram claridade e mistério.',
      lição_espiritual: 'A luz do sol aquece e cura. Você merece brilho e alegria. Permita-se ser visto.',
 },
    {
      arcano: 'O Sol',
      numero_carta: 19,
      arcano_relacionado: 'A Estrela',
      numero_carta_relacionado: 17,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'A Estrela (17) traz esperança; O Sol (19) traz realização. A esperança se torna realidade.',
      lição_espiritual: 'O sol brilha para todos. Você é naturalmente digno de amor e luz. Abrace sua阳性.',
    },
  ],
  20: [
    {
      arcano: 'O Julgamento',
      numero_carta: 20,
      arcano_relacionado: 'A Justiça',
      numero_carta_relacionado: 11,
      tipo_conexão: 'temática',
      razão_conexão: 'O Julgamento (20) é o despertar final; A Justiça (11) julga as ações. Ambos tratam de verdade e consequência.',
      lição_espiritual: 'O despertar vem quando você se julga com compaixão. Você é absolvido pelo seu próprio conhecimento.',
    },
    {
      arcano: 'O Julgamento',
      numero_carta: 20,
      arcano_relacionado: 'A Morte',
      numero_carta_relacionado: 13,
      tipo_conexão: 'evolutiva',
      razão_conexão: 'O Julgamento (20) representa o renascimento após a morte metafórica. Morte (13) mata, Julgamento (20) ressuscita.',
      lição_espiritual: 'Você é julgado pelo seu próprio coração. O renascimento vem quando você perdoa a si mesmo.',
    },
  ],
  21: [
    {
      arcano: 'O Mundo',
      numero_carta: 21,
      arcano_relacionado: 'O Louco',
      numero_carta_relacionado: 0,
      tipo_conexão: 'numerológica',
      razão_conexão: 'O Mundo (21) e O Louco (0) somam 21, representando o ciclo completo da jornada espiritual.',
      lição_espiritual: 'Você retornou ao início, mas com consciência expandida. A jornada está completa. Celebre.',
    },
    {
      arcano: 'O Mundo',
      numero_carta: 21,
      arcano_relacionado: 'A Justiça',
      numero_carta_relacionado: 11,
      tipo_conexão: 'cabalística',
      razão_conexão: 'O Mundo (21) reduz a 3 (criatividade); A Justiça (11) reduz a 2 (dualidade). Juntos mostram completude e equilíbrio.',
      lição_espiritual: 'A completude vem quando você integra todas as lições. Você alcançou o que veio fazer.',
    },
  ],
};

/**
 * Tarot Major Arcana cards in order
 */
export const TODOS_ARCANOS = [
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Hierofante', 'Os Enamorados', 'O Carro', 'A Força', 'O Eremita',
  'A Roda da Fortuna', 'A Justiça', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo',
] as const;

/**
 * Thematic clusters of related cards
 */
export const TAROT_CLUSTERS: TarotCluster[] = [
  {
    nome: 'Jornada do Início',
    arcanos: ['O Louco', 'O Mago', 'A Sacerdotisa'],
    tema: 'Os três primeiros cartões que representam o início da jornada espiritual',
    significado: 'Da liberdade selvagem (Louco) à habilidade manifestada (Mago) e à sabedoria oculta (Sacerdotisa).',
  },
  {
    nome: 'Criação e Estrutura',
    arcanos: ['A Imperatriz', 'O Imperador', 'O Hierofante'],
    tema: 'Os arquétipos de ordem e criação',
    significado: 'A fertility criativa encontra a estrutura e a tradição. O mundo se organiza.',
  },
  {
    nome: 'Escolha e Conquista',
    arcanos: ['Os Enamorados', 'O Carro', 'A Força'],
    tema: 'A jornada da decisão à vitória',
    significado: 'Da escolha amorosa à conquista determinada à força interior. O poder de avançar.',
  },
  {
    nome: 'Introspecção',
    arcanos: ['O Eremita', 'A Sacerdotisa', 'A Lua'],
    tema: 'A busca pela verdade interior',
    significado: 'A solidão do eremita, os mistérios da sacerdotisa, as ilusões da lua. A verdade está dentro.',
  },
  {
    nome: 'Transformação',
    arcanos: ['A Morte', 'A Torre', 'O Enforcado'],
    tema: 'Mudança e destruição criativa',
    significado: 'A morte do ego, o sacrifício, a destruição das estruturas falsas. A metamorfose.',
  },
  {
    nome: 'Equilíbrio Cósmico',
    arcanos: ['A Justiça', 'A Temperança', 'A Roda da Fortuna'],
    tema: 'O equilíbrio do universo',
    significado: 'A justiça cósmica, a temperança, o destino que gira. A lei do universo.',
  },
  {
    nome: 'Libertação',
    arcanos: ['O Diabo', 'A Torre', 'O Louco'],
    tema: 'Quebrando correntes e novas beginning',
    significado: 'Das correntes do diabo à libertação da torre e à liberdade do louco. A redenção.',
  },
  {
    nome: 'Iluminação',
    arcanos: ['A Estrela', 'O Sol', 'A Lua'],
    tema: 'Luz, esperança e percepção',
    significado: 'Da esperança da estrela à luz do sol e à percepção da lua. A verdade se revela.',
  },
  {
    nome: 'Completude',
    arcanos: ['O Julgamento', 'O Mundo'],
    tema: 'O fim da jornada',
    significado: 'O julgamento final e a completude do mundo. A jornada está completa.',
  },
];

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(TAROT_TAROT_MAP);
Object.values(TAROT_TAROT_MAP).forEach((mappings) => {
  mappings.forEach((mapping) => Object.freeze(mapping));
});
Object.freeze(TAROT_CLUSTERS);
TAROT_CLUSTERS.forEach((cluster) => Object.freeze(cluster));

/**
 * Get all tarot-tarot correlations for a given card number
 * @param numeroCarta - Card number (0-21)
 * @returns Array of related card mappings or null if not found
 */
export function getTarotTarotByNumber(numeroCarta: number): TarotTarotMapping[] | null {
  return TAROT_TAROT_MAP[numeroCarta] ?? null;
}

/**
 * Get tarot-tarot correlations by arcano name
 * @param arcano - The arcano name
 * @returns Array of related card mappings or null if not found
 */
export function getTarotTarotByArcano(arcano: string): TarotTarotMapping[] | null {
  const mapping = getTarotTarotByArcanoInternal(arcano);
  return mapping ? getTarotTarotByNumber(mapping.numero_carta) : null;
}

/**
 * Internal helper to find arcano by name
 */
function getTarotTarotByArcanoInternal(arcano: string): { numero_carta: number } | null {
  for (const [num, mappings] of Object.entries(TAROT_TAROT_MAP)) {
    if (mappings[0]?.arcano === arcano) {
      return { numero_carta: Number(num) };
    }
  }
  return null;
}

/**
 * Get correlations filtered by connection type
 * @param numeroCarta - Card number (0-21)
 * @param tipo - Connection type to filter by
 * @returns Array of mappings matching the type
 */
export function getTarotTarotByType(
  numeroCarta: number,
  tipo: TarotTarotMapping['tipo_conexão']
): TarotTarotMapping[] | null {
  const mappings = getTarotTarotByNumber(numeroCarta);
  if (!mappings) return null;
  return mappings.filter((m) => m.tipo_conexão === tipo);
}

/**
 * Get all tarot-tarot correlations
 * @returns All correlation mappings flattened
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAP).flat();
}

/**
 * Get related arcano by card number
 * @param numeroCarta - Card number (0-21)
 * @returns Related arcano name or null if not found
 */
export function getRelatedArcano(numeroCarta: number): string | null {
  const mappings = getTarotTarotByNumber(numeroCarta);
  return mappings?.[0]?.arcano_relacionado ?? null;
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return [...TODOS_ARCANOS];
}

/**
 * Check if a card number exists in the mapping
 * @param numeroCarta - Card number to check
 * @returns True if card number exists
 */
export function hasTarotTarot(numeroCarta: number): boolean {
  return numeroCarta in TAROT_TAROT_MAP;
}

/**
 * Get all clusters
 * @returns Array of all TarotCluster objects
 */
export function getAllClusters(): TarotCluster[] {
  return [...TAROT_CLUSTERS];
}

/**
 * Get cluster by name
 * @param nome - Cluster name
 * @returns TarotCluster or null if not found
 */
export function getClusterByName(nome: string): TarotCluster | null {
  return TAROT_CLUSTERS.find((c) => c.nome === nome) ?? null;
}

/**
 * Get clusters containing a specific arcano
 * @param arcano - Arcano name to search for
 * @returns Array of clusters containing the arcano
 */
export function getClustersByArcano(arcano: string): TarotCluster[] {
  return TAROT_CLUSTERS.filter((c) => c.arcanos.includes(arcano));
}

/**
 * Get all arcano numbers
 * @returns Array of card numbers (0-21)
 */
export function getAllCardNumbers(): number[] {
  return Object.keys(TAROT_TAROT_MAP).map(Number).sort((a, b) => a - b);
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarotByNumber,
  getTarotTarotByArcano,
  getTarotTarotByType,
  getAllTarotTarots,
  getRelatedArcano,
  getAllArcanos,
  hasTarotTarot,
  getAllClusters,
  getClusterByName,
  getClustersByArcano,
  getAllCardNumbers,
  TAROT_TAROT_MAP,
  TAROT_CLUSTERS,
  TODOS_ARCANOS,
};

/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps relationships between Major Arcana cards based on spiritual journey progression,
 * elemental correspondences, and initiatory paths in the Cabala dos Caminhos system.
 */

import type { Elemento } from './element-sign';

/** Path types representing different spiritual relationships between Arcana */
export type TarotPathType =
  | 'Trino'       // Harmonious progression: cards of same element (120°)
  | 'Sextil'      // Opportunity: compatible elements (60°)
  | 'Quadratura'  // Challenge: tension between elements (90°)
  | 'Oposição'    // Balance: opposite cards on the journey (180°)
  | 'Sequência'   // Sequential: adjacent cards in the journey
  | 'Complementar' // Complementary: cards that complete each other
  | 'Ancestral';  // Ancestral: cards connected through initiation lineage

/**
 * Represents the spiritual correlation between two Major Arcana
 */
export interface TarotTarotMapping {
  /** Source arcano */
  arcano: string;
  /** Related target arcano */
  related_arcano: string;
  /** Type of spiritual path between the arcana */
  path_type: TarotPathType;
  /** Spiritual meaning of the relationship */
  spiritual_meaning: {
    /** Core spiritual interpretation */
    significado: string;
    /** Growth opportunity in this relationship */
    crescimento: string;
    /** Potential challenge to overcome */
    desafio: string;
    /** Ritual or practice to enhance this connection */
    ritual?: string;
  };
}

/**
 * All 22 Major Arcana in traditional order
 */
export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Alta Sacerotisa', 'III - A Imperadora',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justiça', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Força',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperança', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

/** Total number of path types */
export const TOTAL_PATH_TYPES: number = 7;

/**
 * Complete mapping of Major Arcana relationships.
 * Based on the spiritual journey, elemental correspondences, and initiatory paths.
 * Each arcano connects to 3 other arcs based on spiritual journey progression.
 * Minimum 66 mappings required (22 arcana × 3 connections / 2 = 33 unique pairs, but we map directed)
 */
export const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // O LOCO (0) - Beginning of the journey, innocence, leap of faith
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: '0 - O Louco',
    related_arcano: 'I - O Mago',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Louco representa o ponto de partida, enquanto O Mago é a chegada do primeiro ciclo. A jornada da inocência ao poder pessoal',
      crescimento: 'Desperta a consciência do potencial infinito que reside dentro do iniciado',
      desafio: 'Superar o medo do novo e confiar no caminho sem garantias',
      ritual: 'Ritual de abertura de caminho ao amanhecer, pedindo clareza para o novo ciclo',
    },
  },
  {
    arcano: '0 - O Louco',
    related_arcano: 'X - A Roda da Fortuna',
    path_type: 'Complementar',
    spiritual_meaning: {
      significado: 'O Louco aceita o destino com inocência, enquanto A Roda revela os ciclos do destino. Juntos representam aceitação e ação',
      crescimento: 'Aprender que o acaso é na verdade um guia espiritual',
      desafio: 'Equilibrar espontaneidade com compreensão dos ciclos',
      ritual: 'Girar em círculo ao amanhecer, meditando sobre os ciclos da vida',
    },
  },
  {
    arcano: '0 - O Louco',
    related_arcano: 'XXI - O Mundo',
    path_type: 'Ancestral',
    spiritual_meaning: {
      significado: 'O Louco busca a completude que O Mundo oferece. A jornada do zero ao vinte e um representa a integração total',
      crescimento: 'Transformar a innocence em sabedoria através da experiência',
      desafio: 'Preservar a maravilha enquanto se ganha conhecimento',
      ritual: 'Meditação de integração ao anoitecer, revisitando todas as lições aprendidas',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O MAGO (I) - Will, manifestation, power
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'I - O Mago',
    related_arcano: 'II - A Alta Sacerotisa',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Mago manifesta, enquanto A Alta Sacerotisa revela os mistérios ocultos. A união do poder com a sabedoria intuitiva',
      crescimento: 'Desenvolver a capacidade de canalizar energia criativa através da intuição',
      desafio: 'Integrar ação e receptividade sem perder o foco',
      ritual: 'Trabalho com símbolos e ferramentas mágicas durante a lua crescente',
    },
  },
  {
    arcano: 'I - O Mago',
    related_arcano: 'XI - A Força',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'O Mago representa o poder da vontade, enquanto A Força representa o poder da compaixão. Amboschannel energia vital',
      crescimento: 'Transformar força bruta em força gentil e compassiva',
      desafio: 'Evitar manipulação e usar o poder com responsabilidade',
      ritual: 'Prática de respiração e visualização de energia fluindo pelos chakras',
    },
  },
  {
    arcano: 'I - O Mago',
    related_arcano: 'XVI - A Torre',
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'O Mago cria estruturas, enquanto A Torre as destrói. A对立 between construção e dissolução',
      crescimento: 'Aprender que a destruição pode ser libertação',
      desafio: 'Aceitar que nem toda estrutura deve ser mantida',
      ritual: 'Queima ritual de padrões limitantes em ambiente seguro',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A ALTA SACEROTISA (II) - Intuition, mystery, inner knowledge
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'II - A Alta Sacerotisa',
    related_arcano: 'III - A Imperadora',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Alta Sacerotisa revela, enquanto A Imperadora nutre. A transição do conhecimento para a aplicação criativa',
      crescimento: 'Integrar sabedoria intuitiva com fertilidade criativa',
      desafio: 'Não se perder nos mistérios, mas aplicar o conhecimento',
      ritual: 'Journaling criativo durante a lua cheia para integrar visões',
    },
  },
  {
    arcano: 'II - A Alta Sacerotisa',
    related_arcano: 'IX - O Eremita',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'Ambos representam busca interior e iluminação através da solidão sagrada. A sabedoria oculta e a luz interior',
      crescimento: 'Aprofundar a conexão com o mundo espiritual e a sabedoria interior',
      desafio: 'Equilibrar revelação e silêncio, conhecimento e aplicação',
      ritual: 'Retiro de silêncio durante o ano novo lunar',
    },
  },
  {
    arcano: 'II - A Alta Sacerotisa',
    related_arcano: 'XVIII - A Lua',
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'A Alta Sacerotisa conhece a verdade oculta, enquanto A Lua revela ilusões. A batalha entre verdade e ilusão',
      crescimento: 'Discernir entre intuição verdadeira e medo',
      desafio: 'Não se deixar enganar por projeções do inconsciente',
      ritual: 'Trabalho noturno com a lua para clareza em águas turbulentas',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A IMPERADORA (III) - Abundance, nurturing, creativity
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'III - A Imperadora',
    related_arcano: 'IV - O Imperador',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Imperadora representa a energia criativa feminina, enquanto O Imperador a estrutura masculina. A união criadora',
      crescimento: 'Integrar nutrição e estrutura, criação e ordem',
      desafio: 'Equilibrar flexibilidade com disciplina',
      ritual: 'Plantar sementes ou iniciar projetos criativos na primavera',
    },
  },
  {
    arcano: 'III - A Imperadora',
    related_arcano: 'VII - Os Enamorados',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A Imperadora nutre relacionamentos, enquanto Os Enamorados escolhem. A conexão entre amor e decisão',
      crescimento: 'Desenvolver discernimento no amor e nos afetos',
      desafio: 'Evitar apego excessivo ou dependência emocional',
      ritual: 'Ritual de harmonização de relacionamentos com velas verdes',
    },
  },
  {
    arcano: 'III - A Imperadora',
    related_arcano: 'XVII - A Estrela',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A Imperadora é terra fértil, A Estrela é céu restaurado. A esperança renasce após a crise',
      crescimento: 'Semeiar com fé e colher com gratidão',
      desafio: 'Manter esperança durante tempos difíceis',
      ritual: 'Banho de ervas sob as estrelas e oração de agradecimento',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O IMPERADOR (IV) - Authority, structure, stability
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'IV - O Imperador',
    related_arcano: 'V - O Hierofante',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Imperador estabelece ordem, enquanto O Hierofante transmite tradição. Estrutura e espiritualidade se encontram',
      crescimento: 'Integrar autoridade com sabedoria espiritual',
      desafio: 'Não se tornar rígido ou dogmático',
      ritual: 'Estudo de textos sagrados e prática de liderança compassiva',
    },
  },
  {
    arcano: 'IV - O Imperador',
    related_arcano: 'X - A Roda da Fortuna',
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'O Imperador busca controle, A Roda ensina aceitação do destino. O conflito entre vontade e ciclos',
      crescimento: 'Aceitar que nem tudo pode ser controlado',
      desafio: 'Flexibilizar sem perder a estrutura necessária',
      ritual: 'Ritual de entrega ao fluxo da vida, soltando o controle',
    },
  },
  {
    arcano: 'IV - O Imperador',
    related_arcano: 'XII - O Enforcado',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'O Imperador age, O Enforcado sacrifica. A tensão entre movimento e stillness',
      crescimento: 'Aprender que às vezes parar é avançar',
      desafio: 'Aceitar sacrifício sem perceber como derrota',
      ritual: 'Prática de sacrifício simbólico de confortos desnecessários',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O HIEROFANTE (V) - Tradition, spiritual guidance, conformity
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'V - O Hierofante',
    related_arcano: 'VI - Os Enamorados',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Hierofante segue a tradição, Os Enamorados fazem escolhas pessoais. A transição de regra para livre-arbítrio',
      crescimento: 'Integrar ensinamentos tradicionais com experiências pessoais',
      desafio: 'Questionar tradições sem descartá-las completamente',
      ritual: 'Estudo comparado de tradições espirituais diferentes',
    },
  },
  {
    arcano: 'V - O Hierofante',
    related_arcano: 'XIV - A Temperança',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'O Hierofante estabelece regras, A Temperança harmoniza extremos. A integração de disciplina e equilíbrio',
      crescimento: 'Desenvolver moderação iluminada por sabedoria',
      desafio: 'Evitar extremos de rigidez ou permissividade',
      ritual: 'Prática de moderação em todas as áreas da vida por uma semana',
    },
  },
  {
    arcano: 'V - O Hierofante',
    related_arcano: 'XV - O Diabo',
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'O Hierofante representa luz espiritual, O Diabo a escuridão material. A batalha entre divino e demoníaco',
      crescimento: 'Reconhecer a luz e sombra dentro de todas as tradições',
      desafio: 'Não julgar prematuramente o que parece demoníaco',
      ritual: 'Trabalho de integração da sombra com respeito às tradições',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OS ENAMORADOS (VI) - Love, choices, duality
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'VI - Os Enamorados',
    related_arcano: 'VII - O Carro',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'Os Enamorados escolhem, O Carro conquista. A decisão leva à vitória',
      crescimento: 'Integrar coração e vontade na busca de objetivos',
      desafio: 'Manter coerência entre escolhas e ações',
      ritual: 'Ritual de promessa e dedicação ao caminho escolhido',
    },
  },
  {
    arcano: 'VI - Os Enamorados',
    related_arcano: 'XV - O Diabo',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'Os Enamorados buscam união divina, O Diabo prisões de prazer. A tensão entre elevação e queda',
      crescimento: 'Discernir entre amor verdadeiro e apego destrutivo',
      desafio: 'Não cair em tentação quando o coração pede elevação',
      ritual: 'Ritual de purificação do desejo e sublimação da energia sexual',
    },
  },
  {
    arcano: 'VI - Os Enamorados',
    related_arcano: 'XIX - O Sol',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'Os Enamorados são duality, O Sol é unidade. O amor que transcende encontra sua iluminação',
      crescimento: 'Elevar o amor do plano humano ao divino',
      desafio: 'Não Apegar-se ao relacionamento humano ao ponto de evitar a iluminação',
      ritual: 'Oração de unificação do par, transcendendo o eu para o todo',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O CARRO (VII) - Triumph, willpower, control
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'VII - O Carro',
    related_arcano: 'VIII - A Justiça',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Carro conquista, A Justiça decreta. A vitória leva à lei',
      crescimento: 'Integrar conquista com justiça e retidão',
      desafio: 'Não usar vitória para oprimir outros',
      ritual: 'Prática de vitória humilde e reconhecimento dos outros',
    },
  },
  {
    arcano: 'VII - O Carro',
    related_arcano: 'X - A Roda da Fortuna',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'O Carro controla, A Roda gira sem controle. A tensão entre conquista e destino',
      crescimento: 'Aceitar que a vitória também está sujeita aos ciclos',
      desafio: 'Não se tornar arrogante na vitória',
      ritual: 'Ritual de agradecimento nos momentos de conquista',
    },
  },
  {
    arcano: 'VII - O Carro',
    related_arcano: 'XVI - A Torre',
    path_type: 'Ancestral',
    spiritual_meaning: {
      significado: 'O Carro celebra vitória, A Torre derruba orgulho. A lição de que todo império cai',
      crescimento: 'Manter humildade na vitória, prevenindo a queda',
      desafio: 'Não deixar vitória criar ilusão de invencibilidade',
      ritual: 'Ritual de agradecimento e ofertas aos ancestres',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A JUSTIÇA (VIII) - Fairness, truth, law
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'VIII - A Justiça',
    related_arcano: 'IX - O Eremita',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Justiça busca verdade exterior, O Eremita a verdade interior. O caminho da sabedoria solitária',
      crescimento: 'Integrar rigor legal com iluminação pessoal',
      desafio: 'Não se perder na busca da verdade a ponto de negligenciar a compaixão',
      ritual: 'Meditação sobre o equilíbrio entre lei e misericórdia',
    },
  },
  {
    arcano: 'VIII - A Justiça',
    related_arcano: 'X - A Roda da Fortuna',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A Justiça decreta, A Roda gira. A lei que se adapta aos ciclos',
      crescimento: 'Compreender que justiça também está sujeita ao tempo',
      desafio: 'Não se tornar inflexível na aplicação da lei',
      ritual: 'Ritual de reavaliação das próprias crenças de justiça',
    },
  },
  {
    arcano: 'VIII - A Justiça',
    related_arcano: 'XII - O Enforcado',
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'A Justiça age, O Enforcado contempla. O conflito entre julgamento e entrega',
      crescimento: 'Aprender que às vezes a justiça é soltar',
      desafio: 'Aceitar que nem tudo precisa de julgamento',
      ritual: 'Prática de soltar julgamento e aceitar o outro como é',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O EREMITA (IX) - Introspection, solitude, guidance
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'IX - O Eremita',
    related_arcano: 'X - A Roda da Fortuna',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'O Eremita busca iluminação pessoal, A Roda revela o destino coletivo. A tensão entre solidão e participação',
      crescimento: 'Integrar sabedoria interior com participação no mundo',
      desafio: 'Não se isolar completamente do mundo',
      ritual: 'Ritual de retorno ao mundo após período de retiro',
    },
  },
  {
    arcano: 'IX - O Eremita',
    related_arcano: 'XIII - A Morte',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Eremita busca luz, A Morte transforma. A iluminação que vem pela dissolução',
      crescimento: 'Aceitar que a morte é parte da jornada de iluminação',
      desafio: 'Não temer a transformação',
      ritual: 'Meditação sobre impermanência e prática de desapego',
    },
  },
  {
    arcano: 'IX - O Eremita',
    related_arcano: 'XIX - O Sol',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'O Eremita busca a luz interior, O Sol é a iluminação completa. A jornada da escuridão à luz',
      crescimento: 'Integrar a luz encontrada na solidão com a vida exterior',
      desafio: 'Não se tornar dependente da solidão',
      ritual: 'Ritual de compartilhar sabedoria obtida em retiro',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A RODA DA FORTUNA (X) - Cycles, destiny, change
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'X - A Roda da Fortuna',
    related_arcano: 'XI - A Força',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Roda revela o destino, A Força enfrenta o destino. O encuentro com o destino requer força',
      crescimento: 'Desenvolver fortaleza para enfrentar os ciclos',
      desafio: 'Não se tornar passivo esperando o destino',
      ritual: 'Ritual de fortalecimento interior para enfrentar mudanças',
    },
  },
  {
    arcano: 'X - A Roda da Fortuna',
    related_arcano: 'XI - A Força',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A Roda cria oportunidade, A Força aprovecha. O acaso oferece chances que a força transforma',
      crescimento: 'Reconhecer oportunidades nos momentos de mudança',
      desafio: 'Não perder chances por inércia',
      ritual: 'Ritual de ação inspirada nos momentos de mudança',
    },
  },
  {
    arcano: 'X - A Roda da Fortuna',
    related_arcano: 'XII - O Enforcado',
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'A Roda gira, O Enforcado para. O conflito entre movimento e stillness',
      crescimento: 'Aprender que às vezes a sabedoria está em parar',
      desafio: 'Aceitar pausas nos ciclos sem frustração',
      ritual: 'Prática de meditação durante momentos de espera',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A FORÇA (XI) - Courage, patience, inner strength
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XI - A Força',
    related_arcano: 'XII - O Enforcado',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Força enfrenta, O Enforcado entrega. A coragem leva à rendição sagrada',
      crescimento: 'Transformar força de ação em força de aceitação',
      desafio: 'Aprender que rendição não é derrota',
      ritual: 'Ritual de entrega e confiança no processo',
    },
  },
  {
    arcano: 'XI - A Força',
    related_arcano: 'XIII - A Morte',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A Força controla, A Morte transforma. A tensão entre resistência e aceitação da morte',
      crescimento: 'Integrar coragem com aceitação da impermanência',
      desafio: 'Não resistir às transformações necessárias',
      ritual: 'Ritual de reconciliação com a finitude da vida',
    },
  },
  {
    arcano: 'XI - A Força',
    related_arcano: 'XX - O Julgamento',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A Força transforma energia vital, O Julgamento transforma espírito. A renovação completa',
      crescimento: 'Desenvolver força interior para renascimento',
      desafio: 'Aceitar o chamado para renascimento',
      ritual: 'Ritual de renovação e novo começo',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O ENFORCADO (XII) - Pause, sacrifice, new perspective
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XII - O Enforcado',
    related_arcano: 'XIII - A Morte',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Enforcado sacrifica, A Morte transforma. A entrega leva à regeneração',
      crescimento: 'Abrir mão do velho para o novo renascer',
      desafio: 'Não resistir à mudança que o sacrifício traz',
      ritual: 'Ritual de entrega do que não serve mais',
    },
  },
  {
    arcano: 'XII - O Enforcado',
    related_arcano: 'XIV - A Temperança',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'O Enforcado pratica espera, A Temperança pratica equilíbrio. A sagrada paciência',
      crescimento: 'Desenvolver paciência perfeita através da prática',
      desafio: 'Não perder a calma em momentos de espera',
      ritual: 'Prática de paciência através de meditação prolongada',
    },
  },
  {
    arcano: 'XII - O Enforcado',
    related_arcano: 'XX - O Julgamento',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'O Enforcado vê de cabeça para baixo, O Julgamento vê do alto. A mudança de perspectiva revela a verdade',
      crescimento: 'Integrar nova perspectiva com julgamento claro',
      desafio: 'Não ficar preso na nova perspectiva',
      ritual: 'Ritual de avaliação de crenças invertidas',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A MORTE (XIII) - Endings, transformation, transition
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XIII - A Morte',
    related_arcano: 'XIV - A Temperança',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Morte transforma, A Temperança integra. A transformação precisa de equilíbrio para se estabilizar',
      crescimento: 'Integrar mudança de forma saudável',
      desafio: 'Não se perder no meio da transformação',
      ritual: 'Ritual de aterramento após grandes mudanças',
    },
  },
  {
    arcano: 'XIII - A Morte',
    related_arcano: 'XVI - A Torre',
    path_type: 'Ancestral',
    spiritual_meaning: {
      significado: 'A Morte transforma lentamente, A Torre destrói rapidamente. A destruição necessária para regeneração',
      crescimento: 'Compreender que ambas são necessárias para evolução',
      desafio: 'Aceitar destruição quando necessário',
      ritual: 'Ritual de destruição criativa para renovação',
    },
  },
  {
    arcano: 'XIII - A Morte',
    related_arcano: 'XX - O Julgamento',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A Morte fecha um ciclo, O Julgamento abre o próximo. A tensão entre fim e começo',
      crescimento: 'Integrar encerramento com novo começo',
      desafio: 'Não ficar preso entre ciclos',
      ritual: 'Ritual de despedida e boas-vindas simultâneas',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A TEMPERANÇA (XIV) - Balance, moderation, patience
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XIV - A Temperança',
    related_arcano: 'XV - O Diabo',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Temperança equilibra, O Diabo desequilibra. A tensão entre moderação e excesso',
      crescimento: 'Manter equilíbrio mesmo quando tentações aparecem',
      desafio: 'Resistir à queda na escuridão',
      ritual: 'Ritual de proteção contra tentações e prática de moderação',
    },
  },
  {
    arcano: 'XIV - A Temperança',
    related_arcano: 'XVI - A Torre',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A Temperança busca paz, A Torre causa crise. A tensão entre harmonia e ruptura',
      crescimento: 'Manter equilíbrio interno mesmo na crise',
      desafio: 'Não perder a calma quando estruturas colapsam',
      ritual: 'Prática de calma em meio ao caos',
    },
  },
  {
    arcano: 'XIV - A Temperança',
    related_arcano: 'XXI - O Mundo',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A Temperança integra opostos, O Mundo representa integração completa. O equilíbrio leva à completude',
      crescimento: 'Transformar equilíbrio em completude',
      desafio: 'Não se contentar com equilíbrio imperfeito',
      ritual: 'Ritual de integração de todos os opostos internos',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O DIABO (XV) - Shadow, bondage, materialism
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XV - O Diabo',
    related_arcano: 'XVI - A Torre',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Diabo prende, A Torre liberta. A destruição das prisões da escuridão',
      crescimento: 'Reconhecer as próprias prisões para se libertar',
      desafio: 'Não ter medo da libertação através da crise',
      ritual: 'Ritual de quebra de correntes e libertação de prisões',
    },
  },
  {
    arcano: 'XV - O Diabo',
    related_arcano: 'XVII - A Estrela',
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'O Diabo representa escuridão, A Estrela representa esperança. A对立 entre escravidão e liberdade',
      crescimento: 'Transformar escuridão em estrela guia',
      desafio: 'Sair da escuridão sem perder a lição',
      ritual: 'Ritual de transformação de sombras em luz',
    },
  },
  {
    arcano: 'XV - O Diabo',
    related_arcano: 'XIX - O Sol',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'O Diabo bloqueia, O Sol ilumina. A luz que dissipa a escuridão material',
      crescimento: 'Transformar energia escura em luz',
      desafio: 'Não reprimir a escuridão, mas transformá-la',
      ritual: 'Ritual de transmutação da energia sexual e material',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A TORRE (XVI) - Upheaval, revelation, awakening
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XVI - A Torre',
    related_arcano: 'XVII - A Estrela',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Torre destrói, A Estrela reconstrói. A destruição que permite nova esperança',
      crescimento: 'Ver a crise como oportunidade de renovação',
      desafio: 'Não desistir após a destruição',
      ritual: 'Ritual de rebuild e restauração após crise',
    },
  },
  {
    arcano: 'XVI - A Torre',
    related_arcano: 'XVIII - A Lua',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A Torre revela verdad, A Lua oculta. A tensão entre revelação e ilusão',
      crescimento: 'Discernir entre revelação verdadeira e ilusões pós-trauma',
      desafio: 'Não criar novas ilusões para se proteger da verdade',
      ritual: 'Ritual de purificação de ilusões e prática de discernimento',
    },
  },
  {
    arcano: 'XVI - A Torre',
    related_arcano: 'XX - O Julgamento',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A Torre derruba, O Julgamento avalia. A destruição que permite avaliar o que resta',
      crescimento: 'Usar a destruição para revelar a verdade',
      desafio: 'Avaliar corretamente sem julgamento prematuro',
      ritual: 'Ritual de avaliação após destruição, identificando o que reconstruir',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A ESTRELA (XVII) - Hope, faith, renewal
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XVII - A Estrela',
    related_arcano: 'XVIII - A Lua',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Estrela ilumina, A Lua reflete. A esperança que alimenta o inconsciente',
      crescimento: 'Desenvolver esperança que sustenta mesmo no escuro',
      desafio: 'Não perder a esperança quando a lua obscurece',
      ritual: 'Ritual de nutrição da esperança durante tempos de escuridão',
    },
  },
  {
    arcano: 'XVII - A Estrela',
    related_arcano: 'XIX - O Sol',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Estrela guia, O Sol ilumina. A esperança que se torna luz plena',
      crescimento: 'Transformar esperança em luz irradiante',
      desafio: 'Manter esperança enquanto a luz cresce',
      ritual: 'Ritual de expansão da luz interior',
    },
  },
  {
    arcano: 'XVII - A Estrela',
    related_arcano: 'XXI - O Mundo',
    path_type: 'Trino',
    spiritual_meaning: {
      significado: 'A Estrela aponta para completude, O Mundo é a completude. A esperança que se realiza',
      crescimento: 'Ver o destino não como destino cego, mas como esperança cumprida',
      desafio: 'Ter paciência enquanto a esperança se realiza',
      ritual: 'Ritual de gratidão pela esperança realizada',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A LUA (XVIII) - Illusion, subconscious, fear
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XVIII - A Lua',
    related_arcano: 'XIX - O Sol',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'A Lua obscurece, O Sol ilumina. A dissolução de ilusões pela luz',
      crescimento: 'Transformar medo em luz através da confrontação',
      desafio: 'Não fugir das sombras, mas iluminá-las',
      ritual: 'Ritual de iluminação de medos e dissipação de ilusões',
    },
  },
  {
    arcano: 'XVIII - A Lua',
    related_arcano: 'XX - O Julgamento',
    path_type: 'Quadratura',
    spiritual_meaning: {
      significado: 'A Lua esconde, O Julgamento revela. A tensão entre ilusão e verdade',
      crescimento: 'Desenvolver discernimento para separar verdade de ilusão',
      desafio: 'Não confundir verdade com desejo',
      ritual: 'Ritual de verificação de premonições e sonhos',
    },
  },
  {
    arcano: 'XVIII - A Lua',
    related_arcano: 'XXI - O Mundo',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'A Lua representa águas inconscientes, O Mundo integra todas as águas. A integração do inconsciente',
      crescimento: 'Integrar materiais inconscientes na consciência desperta',
      desafio: 'Não se perder no inconsciente',
      ritual: 'Ritual de trabalho com sonhos e inconsciente',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O SOL (XIX) - Joy, success, vitality
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XIX - O Sol',
    related_arcano: 'XX - O Julgamento',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Sol representa glória, O Julgamento representa renascimento. A glória que renova',
      crescimento: 'Transformar sucesso em renascimento',
      desafio: 'Não se apegar à glória passada',
      ritual: 'Ritual de agradecimento e preparação para o próximo ciclo',
    },
  },
  {
    arcano: 'XIX - O Sol',
    related_arcano: 'XXI - O Mundo',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Sol ilumina, O Mundo integra. A luz que tudo integra',
      crescimento: 'Transformar iluminação parcial em completude',
      desafio: 'Não se satisfazer com iluminação parcial',
      ritual: 'Ritual de integração final, buscando completude',
    },
  },
  {
    arcano: 'XIX - O Sol',
    related_arcano: '0 - O Louco',
    path_type: 'Ancestral',
    spiritual_meaning: {
      significado: 'O Sol é a culmination, O Louco é o recomeço. O ciclo completo que volta ao início',
      crescimento: 'Compreender que completude é também novo começo',
      desafio: 'Aceitar que o final é também um começo',
      ritual: 'Ritual de encerramento de ciclo e preparação para novo salto',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O JULGAMENTO (XX) - Reflection, reckoning, awakening
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XX - O Julgamento',
    related_arcano: 'XXI - O Mundo',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Julgamento avalia, O Mundo completa. A avaliação que leva à completude',
      crescimento: 'Usar julgamento para identificar o que integrar',
      desafio: 'Não julgar harshly, mas com compaixão',
      ritual: 'Ritual de autoavaliação compassiva',
    },
  },
  {
    arcano: 'XX - O Julgamento',
    related_arcano: 'I - O Mago',
    path_type: 'Oposição',
    spiritual_meaning: {
      significado: 'O Julgamento olha para o passado, O Mago olha para o futuro. O encontro entre memória e poder',
      crescimento: 'Integrar lições do passado com poder do presente',
      desafio: 'Não ser definido pelo passado',
      ritual: 'Ritual de perdão de si mesmo e dos outros',
    },
  },
  {
    arcano: 'XX - O Julgamento',
    related_arcano: 'IV - O Imperador',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'O Julgamento avalia a lei, O Imperador estabelece a lei. A lei que se renova pelo julgamento',
      crescimento: 'Desenvolver senso de justiça renovado',
      desafio: 'Não se tornar dogmático na aplicação da lei',
      ritual: 'Ritual de revisão de crenças e valores',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // O MUNDO (XXI) - Completion, integration, accomplishment
  // ═══════════════════════════════════════════════════════════════════════════
  {
    arcano: 'XXI - O Mundo',
    related_arcano: '0 - O Louco',
    path_type: 'Sequência',
    spiritual_meaning: {
      significado: 'O Mundo completa, O Louco recomeça. O ciclo sem fim da jornada espiritual',
      crescimento: 'Aceitar que completude é também recomeço',
      desafio: 'Não se apegar à completude',
      ritual: 'Ritual de passagem, agradecendo a jornada e abrindo espaço para nova',
    },
  },
  {
    arcano: 'XXI - O Mundo',
    related_arcano: 'II - A Alta Sacerotisa',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'O Mundo integra todo conhecimento, A Alta Sacerotisa guarda mistérios. A sabedoria que integra todos os mistérios',
      crescimento: 'Desenvolver sabedoria que abarca todos os mistérios',
      desafio: 'Não se perder na completude do conhecimento',
      ritual: 'Ritual de contemplação dos mistérios da vida',
    },
  },
  {
    arcano: 'XXI - O Mundo',
    related_arcano: 'III - A Imperadora',
    path_type: 'Sextil',
    spiritual_meaning: {
      significado: 'O Mundo integra criação, A Imperadora cria. A criação que se completa no mundo',
      crescimento: 'Reconhecer a própria criação como parte do mundo',
      desafio: 'Celebrar criação sem apego ao resultado',
      ritual: 'Ritual de celebração e gratidão pela própria contribuição ao mundo',
    },
  },
];

/** Total number of mappings in the constant */
export const TOTAL_MAPPINGS: number = TAROT_TAROT_MAPPINGS.length;

// Freeze the array to prevent modifications
Object.freeze(TAROT_TAROT_MAPPINGS);
Object.freeze(ALL_MAJOR_ARCANOS);

/**
 * Get tarot-tarot mapping between two arcana.
 * @param arcano - Source arcano name
 * @param relatedArcano - Target arcano name
 * @returns TarotTarotMapping or null if not found
 */
export function getTarotTarot(
  arcano: string,
  relatedArcano: string
): TarotTarotMapping | null {
  return (
    TAROT_TAROT_MAPPINGS.find(
      (m) => m.arcano === arcano && m.related_arcano === relatedArcano
    ) || null
  );
}

/**
 * Get all tarot-tarot mappings (alias for getAllTarotPaths).
 * @returns Array of all correlation mappings
 */
export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS;
}

/**
 * Get all path types used in the mapping.
 * @returns Array of unique path types
 */
export function getAllPathTypes(): TarotPathType[] {
  const types = new Set(TAROT_TAROT_MAPPINGS.map((m) => m.path_type));
  return Array.from(types) as TarotPathType[];
}

/**
 * Get all arcano that have mappings.
 * @returns Array of unique arcano names
 */
export function getAllMappedArcanos(): string[] {
  const arcanos = new Set<string>();
  TAROT_TAROT_MAPPINGS.forEach((m) => {
    arcanos.add(m.arcano);
    arcanos.add(m.related_arcano);
  });
  return Array.from(arcanos);
}

/**
 * Get all relations for a specific arcano.
 * @param arcano - Arcano name to find relations for
 * @returns Array of relations with spiritual meaning
 */
export function getRelationsForArcano(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(
    (m) => m.arcano === arcano || m.related_arcano === arcano
  );
}

/**
 * Get relations by path type.
 * @param pathType - Type of path to filter
 * @returns Array of mappings for that path type
 */
export function getRelationsByPathType(pathType: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.path_type === pathType);
}

/**
 * Get the path type between two arcanos.
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns PathType or null if no relationship exists
 */
export function getPathTypeBetween(
  arcano1: string,
  arcano2: string
): TarotPathType | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  return mapping ? mapping.path_type : null;
}

/**
 * Get the spiritual meaning between two arcanos.
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns Spiritual meaning object or null if no relationship
 */
export function getSpiritualMeaningBetween(
  arcano1: string,
  arcano2: string
): TarotTarotMapping['spiritual_meaning'] | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  return mapping ? mapping.spiritual_meaning : null;
}

/**
 * Check if two arcanos have a relationship.
 * @param arcano1 - First arcano name
 * @param arcano2 - Second arcano name
 * @returns True if relationship exists
 */
export function hasRelation(arcano1: string, arcano2: string): boolean {
  return TAROT_TAROT_MAPPINGS.some(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
}

/**
 * Get arcano by its number.
 * @param number - Arcano number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoByNumber(number: number): string | null {
  if (number < 0 || number > 21) return null;
  return ALL_MAJOR_ARCANOS[number] || null;
}

/**
 * Default export with all functions and constants
 */
const tarotTarotDefaultExport = {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getRelationsForArcano,
  getRelationsByPathType,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  getArcanoByNumber,
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
};

export default tarotTarotDefaultExport;
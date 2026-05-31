/**
 * Element type for spiritual correlations
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Tarot-Tarot Arcana Spiritual Correlation
 * Maps Tarot Major Arcana cards (0-21) to related cards within the Major Arcana
 * based on elemental, numerological, and archetypal relationships.
 * 
 * This correlation reveals the interconnected nature of the Major Arcana,
 * showing how each card resonates with others through shared energy patterns.
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and related cards
 */
export interface TarotTarotMapping {
  /** The Major Arcana arcano name */
  arcano: string;
  /** Card number in the Major Arcana sequence (0-21) */
  numero_carta: number;
  /** Elemental association */
  elemento: Elemento;
  /** Card that represents the complementary energy */
  energia_oposta: {
    arcano: string;
    numero_carta: number;
    razão: string;
  };
  /** Card that amplifies or continues the journey */
  energia_amplificada: {
    arcano: string;
    numero_carta: number;
    razão: string;
  };
  /** Card that represents the shadow or lesson to integrate */
  sombra_integrada: {
    arcano: string;
    numero_carta: number;
    razão: string;
  };
  /** Full spiritual meaning and symbolism */
  significado_espiritual: string;
  /** Archetype represented by this arcano */
  arquétipo: string;
  /** Associated Orixá from Candomblé tradition */
  orixá: string;
  /** Associated Kabbalistic Sephirah */
  sephirah: string;
  /** Chakra alignment */
  chakra: string;
  /** Key spiritual lesson */
  lição_espiritual: string;
  /** Affirmation for meditation */
  afirmação: string;
  /** Keywords for this card */
  palavras_chave: string[];
}

// ─── Tarot Major Arcana to Related Cards Mapping ─────────────────────────────

/**
 * Complete mapping of Major Arcana (0-21) to their correlated cards within the tradition.
 */
export const TAROT_TAROT_MAP: Record<number, TarotTarotMapping> = {
  0: {
    arcano: 'O Louco',
    numero_carta: 0,
    elemento: 'Ar',
    energia_oposta: {
      arcano: 'O Mundo',
      numero_carta: 21,
      razão: 'O Louco inicia a jornada espiritual enquanto O Mundo a completa. Ambos transcendem a realidade ordinária, mas O Louco representa o salto no desconhecido e O Mundo representa a realização completa da jornada.',
    },
    energia_amplificada: {
      arcano: 'O Mago',
      numero_carta: 1,
      razão: 'O Louco carrega a energia potencial não manifestada; O Mago canaliza essa energia em ação concreta. O Louco sem O Mago é dispersão; O Mago sem O Louco é limitação.',
    },
    sombra_integrada: {
      arcano: 'A Torre',
      numero_carta: 16,
      razão: 'O Louco personifica a disposição para mudança e upheaval; A Torre é a transformação forçada. Integrar a sombra do Louco significa abraçar tanto a mudança voluntária quanto a inevitável.',
    },
    significado_espiritual: 'O início selvagem da jornada espiritual. A liberdade absoluta que transcende todas as regras. O salto de fé que abraça o desconhecido. Representa o potencial puro, a espontaneidade sagrada e a confiança no universo que sustenta todos os passos.',
    arquétipo: 'O Louco / O Aventureiro Espiritual',
    orixá: 'Nanã / Omolu / Olobón',
    sephirah: 'Malkuth',
    chakra: '7º Coronário',
    lição_espiritual: 'Às vezes você precisa saltar sem olhar para trás. O universo sustenta seus passos quando você confia.',
    afirmação: 'Eu abraço a aventura da vida com coração aberto e confiança no caminho.',
    palavras_chave: ['liberdade', 'início', 'salto', 'fé', 'espontaneidade', 'potencial'],
  },
  1: {
    arcano: 'O Mago',
    numero_carta: 1,
    elemento: 'Água',
    energia_oposta: {
      arcano: 'A Alta Sacerdotisa',
      numero_carta: 2,
      razão: 'O Mago representa a vontade consciente e a capacidade de manifestar; a Alta Sacerdotisa representa a sabedoria oculta e o conhecimento intuitivo. Juntos representam o equilíbrio entre ação e receptividade.',
    },
    energia_amplificada: {
      arcano: 'A Imperatriz',
      numero_carta: 2,
      razão: 'O Mago canaliza recursos; a Imperatriz cria com eles. O Mago sem a Imperatriz é potencial não realizado; a Imperatriz sem o Mago não tem ferramentas para criar.',
    },
    sombra_integrada: {
      arcano: 'O Diabo',
      numero_carta: 15,
      razão: 'O Mago pode usar seus dons para manipulação; o Diabo representa o uso distorcido da vontade. Integrar a sombra do Mago significa reconhecer o poder de manifestar tanto luz quanto sombra.',
    },
    significado_espiritual: 'A vontade consciente e a capacidade de manifestar realidade. A interconexão de todos os elementos e ferramentas à disposição. Representa o poder da intenção focalizada, a mestria sobre os sentidos e a capacidade de transformar visão em realidade.',
    arquétipo: 'O Mago / O Manipulador de Energias',
    orixá: 'Oxum / Logun-Edé',
    sephirah: 'Chokmah',
    chakra: '6º Frontal',
    lição_espiritual: 'Você tem todas as ferramentas que precisa. A questão é como você as usa.',
    afirmação: 'Eu canalizo minha vontade com propósito e manipulo as energias com responsabilidade sagrada.',
    palavras_chave: ['vontade', 'manifestação', 'mestria', 'ferramentas', 'intenção', 'ação'],
  },
  2: {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    elemento: 'Água',
    energia_oposta: {
      arcano: 'A Sacerdotisa',
      numero_carta: 2,
      razão: 'Na versão alternativa (II), A Sacerdotisa é a sabedoria oculta. Este arcano representa a intuição profunda e o conhecimento que transcende a lógica.',
    },
    energia_amplificada: {
      arcano: 'A Lua',
      numero_carta: 18,
      razão: 'A Alta Sacerdotisa é a guardiã dos mistérios; a Lua é a residência do inconsciente. A Lua amplifica a energia intuitiva da Sacerdotisa para revelar as sombras.',
    },
    sombra_integrada: {
      arcano: 'O Hierofante',
      numero_carta: 5,
      razão: 'A Alta Sacerdotisa guarda o conhecimento secreto; o Hierofante Dogmatiza o conhecimento revelado. Integrar a sombra significa integrar tanto tradição quanto mistério.',
    },
    significado_espiritual: 'A sabedoria intuitiva que habita no silêncio. O véu entre os mundos visível e invisível. A receptividade sagrada que recebe sem julgamento. Representa o discernimento profundo, o conhecimento oculto e a conexão com os mistérios ancestrais.',
    arquétipo: 'A Sacerdotisa / A Guardiã dos Mistérios',
    orixá: 'Ibeji / Ejiokô',
    sephirah: 'Chokmah',
    chakra: '6º Frontal',
    lição_espiritual: 'Confie na sua intuição e na sabedoria que vem do silêncio interior.',
    afirmação: 'Eu escuto a voz da minha alma e confio nos mistérios do universo.',
    palavras_chave: ['intuição', 'mistério', 'sabedoria', 'véu', 'receptividade', 'segredo'],
  },
  3: {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    elemento: 'Terra',
    energia_oposta: {
      arcano: 'O Imperador',
      numero_carta: 4,
      razão: 'A Imperatriz representa a energia criativa e fertilidade; o Imperador representa a ordem e estrutura. Juntos representam o equilíbrio entre caos criativo e ordem necessária.',
    },
    energia_amplificada: {
      arcano: 'A Estrela',
      numero_carta: 17,
      razão: 'A Imperatriz é a terra fertilizada; a Estrela é a esperança que brota da fertilidade. Ambas representam abundância e restauração após provações.',
    },
    sombra_integrada: {
      arcano: 'A Tempestade',
      numero_carta: 16,
      razão: 'A Imperatriz pode se tornar supersaturação ou negligência; a Torre representa a destruição do que é estagnado. Integrar a sombra significa acolher a destruição necessária.',
    },
    significado_espiritual: 'A fertilidade criativa em todas as suas formas. A abundância natural que flui da conexão com a natureza. A expressão artística e a beleza sagrada. Representa a criação, o nurturing, a conexão com a terra e a manifestação da abundância.',
    arquétipo: 'A Mãe Divina / A Criadora',
    orixá: 'Iemanjá / Irosun',
    sephirah: 'Binah',
    chakra: '4º Cardíaco',
    lição_espiritual: 'A abundância é seu direito de nascença quando você se conecta com a energia criativa do universo.',
    afirmação: 'Eu nutro minha essência criativa e permito que a abundância flua naturalmente.',
    palavras_chave: ['fertilidade', 'criação', 'abundância', 'natureza', 'beleza', 'nutrição'],
  },
  4: {
    arcano: 'O Imperador',
    numero_carta: 4,
    elemento: 'Fogo',
    energia_oposta: {
      arcano: 'A Imperatriz',
      numero_carta: 3,
      razão: 'O Imperador traz ordem; a Imperatriz traz criação. O Imperador sem a Imperatriz é tirania; a Imperatriz sem o Imperador é caos.',
    },
    energia_amplificada: {
      arcano: 'O Carro',
      numero_carta: 7,
      razão: 'O Imperador estabelece a estrutura; o Carro utiliza essa estrutura para avançar. O Carro é a conquista do Imperador em movimento.',
    },
    sombra_integrada: {
      arcano: 'O Mago',
      numero_carta: 1,
      razão: 'O Imperador pode se tornar rígido e controlador; o Mago lembra que a vontade pode criar ou destruir. Integrar a sombra significa manter flexibilidade na autoridade.',
    },
    significado_espiritual: 'A autoridade sagrada que estabelece ordem no caos. A disciplina e a estrutura que sustentam a realização. O princípio patriarcal que cria fronteiras e leis. Representa o poder de autodisciplina, a capacidade de criar estruturas duradouras e a liderança baseada em princípios.',
    arquétipo: 'O Pai / O Governante',
    orixá: 'Ogum / Etaogundá',
    sephirah: 'Chesed',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'A verdadeira autoridade vem de princípios, não de controle. Liderança é serviço.',
    afirmação: 'Eu estabeleço estruturas com sabedoria e lidero com princípios firmes.',
    palavras_chave: ['autoridade', 'estrutura', 'disciplina', 'liderança', 'ordem', 'poder'],
  },
  5: {
    arcano: 'O Hierofante',
    numero_carta: 5,
    elemento: 'Terra',
    energia_oposta: {
      arcano: 'A Lovers',
      numero_carta: 6,
      razão: 'O Hierofante representa tradição e dogmas; os Enamorados representam escolha pessoal. O Hierofante sem os Enamorados é fundamentalismo; os Enamorados sem o Hierofante é caos moral.',
    },
    energia_amplificada: {
      arcano: 'A Justiça',
      numero_carta: 8,
      razão: 'O Hierofante Dogmatiza a moralidade; a Justiça aplica-a com equilíbrio. O Hierofante sem a Justiça é hipocrisia religiosa.',
    },
    sombra_integrada: {
      arcano: 'A Morte',
      numero_carta: 13,
      razão: 'O Hierofante pode se apegar às tradições de forma rígida; a Morte representa a transformação necessária das velhas crenças. Integrar a sombra significa aceitar que algumas tradições precisam morrer.',
    },
    significado_espiritual: 'O guardião da sabedoria sagrada e dos ensinamentos tradicionais. O intermediário entre o humano e o divino. Representa a fé, a tradição, os rituais sagrados e a busca por significado através de sistemas estabelecidos.',
    arquétipo: 'O Guia Espiritual / O Sacerdote',
    orixá: 'Xangô / Iansã',
    sephirah: 'Tiphereth',
    chakra: '5º Laríngeo',
    lição_espiritual: 'A tradição tem valor, mas a sabedoria viva transcende fórmulas mortas.',
    afirmação: 'Eu busco a verdade sagrada através de práticas tradicionais e sabedoria viva.',
    palavras_chave: ['tradição', 'sabedoria', 'fé', 'ritual', 'ensino', 'guia'],
  },
  6: {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    elemento: 'Ar',
    energia_oposta: {
      arcano: 'O Hierofante',
      numero_carta: 5,
      razão: 'Os Enamorados representam escolha livre; o Hierofante representa conformidade. Os Enamorados sem o Hierofante é indecisão; o Hierofante sem os Enamorados é tirania.',
    },
    energia_amplificada: {
      arcano: 'A Temperança',
      numero_carta: 14,
      razão: 'Os Enamorados representam duality; a Temperança integra opostos. A Temperança é o.amor maduro que emerge dos Enamorados.',
    },
    sombra_integrada: {
      arcano: 'A Torre',
      numero_carta: 16,
      razão: 'Os Enamorados podem representar apego ou dependência; a Torre é a libertação forçada. Integrar a sombra significa equilibrar amor e liberdade.',
    },
    significado_espiritual: 'A escolha que define o caminho. A união de opostos complementares. Representa o amor em todas as suas formas, as decisões que moldam o destino e a conexão entre alma e propósito.',
    arquétipo: 'O Escolhedor / O Amante',
    orixá: 'Oxumaré / Logun-Edé',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    lição_espiritual: 'Escolher com o coração aberto é sempre melhor que escolher pelo medo.',
    afirmação: 'Eu faço escolhas com o coração aberto e confio no caminho do amor.',
    palavras_chave: ['escolha', 'amor', 'união', 'decisão', 'parceiro', 'harmonia'],
  },
  7: {
    arcano: 'O Carro',
    numero_carta: 7,
    elemento: 'Água',
    energia_oposta: {
      arcano: 'A Paz',
      numero_carta: 10,
      razão: 'O Carro é conquista através de esforço; a Paz é realização através de rendição. O Carro sem a Paz é conquista sem propósito; a Paz sem o Carro é inação.',
    },
    energia_amplificada: {
      arcano: 'A Força',
      numero_carta: 8,
      razão: 'O Carro conquista através da vontade; a Força conquista através da compaixão. A Força é a vitória gentil do Carro.',
    },
    sombra_integrada: {
      arcano: 'O Louco',
      numero_carta: 0,
      razão: 'O Carro pode se tornar controle rígido; o Louco lembra que nem tudo pode ser controlado. Integrar a sombra significa aceitar que alguns desenvolvimentos requerem rendição.',
    },
    significado_espiritual: 'A vitória conquistada através do equilíbrio de forças opostas. A capacidade de avançar apesar dos obstáculos. Representa a disciplina interior, a conquista de objectivos e a maestria sobre os opostos.',
    arquétipo: 'O Conquistador / O Guerreiro',
    orixá: 'Ogum / Oxóssi',
    sephirah: 'Geburah',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'A verdadeira vitória vem do equilíbrio entre ação e paciência.',
    afirmação: 'Eu avanço com propósito e integridade, conquistando meus objetivos com honra.',
    palavras_chave: ['conquista', 'vitória', 'avanço', 'controle', 'disciplina', 'determinação'],
  },
  8: {
    arcano: 'A Justiça',
    numero_carta: 8,
    elemento: 'Ar',
    energia_oposta: {
      arcano: 'A Inversão',
      numero_carta: 16,
      razão: 'A Justiça representa equilíbrio e verdade; a Torre representa o chaos que precede a verdade. A Justiça sem a Torre é inércia; a Torre sem a Justiça é destruição sem propósito.',
    },
    energia_amplificada: {
      arcano: 'O Julgamento',
      numero_carta: 20,
      razão: 'A Justiça julga ações passadas; o Julgamento representa o despertar para novos propósitos. O Julgamento é a resolução da Justiça.',
    },
    sombra_integrada: {
      arcano: 'O Diabo',
      numero_carta: 15,
      razão: 'A Justiça pode se tornar legalismo cruel; o Diabo representa a injustiça e manipulação. Integrar a sombra significa equilibrar justiça com compaixão.',
    },
    significado_espiritual: 'O equilíbrio divino entre ações e consequências. A verdade que se revela através da análise cuidadosa. Representa a lei cósmica, o karma e a integridade moral.',
    arquétipo: 'O Juiz / A Lei Cósmica',
    orixá: 'Obatalá / Oxalá',
    sephirah: 'Geburah',
    chakra: '6º Frontal',
    lição_espiritual: 'A verdadeira justiça vem do equilíbrio entre lei e compaixão.',
    afirmação: 'Eu atuo com integridade e reconheço que cada ação tem consequências.',
    palavras_chave: ['justiça', 'verdade', 'equilíbrio', 'karma', 'consequência', 'integridade'],
  },
  9: {
    arcano: 'O Eremita',
    numero_carta: 9,
    elemento: 'Terra',
    energia_oposta: {
      arcano: 'O Sol',
      numero_carta: 19,
      razão: 'O Eremita busca no escuro; o Sol brilha na claridade. O Eremita sem o Sol é isolamento; o Sol sem o Eremita é brilho sem profundidade.',
    },
    energia_amplificada: {
      arcano: 'A Lua',
      numero_carta: 18,
      razão: 'O Eremita busca a luz interior; a Lua revela o inconsciente. A Lua é o território que o Eremita explora.',
    },
    sombra_integrada: {
      arcano: 'O Carro',
      numero_carta: 7,
      razão: 'O Eremita pode se tornar isolado e躲避; o Carro lembra que a luz deve ser compartilhada. Integrar a sombra significa integrar solidão e serviço.',
    },
    significado_espiritual: 'A busca interior pela luz que guia. A solidão sagrada que permite a sabedoria emergir. Representa a introspecção, a busca espiritual e a iluminação interior.',
    arquétipo: 'O Sábio / O Iluminado',
    orixá: 'Nanã / Ossain',
    sephirah: 'Hod',
    chakra: '7º Coronário',
    lição_espiritual: 'A verdadeira luz que você busca está dentro de você. Silêncio e reflexão revelam o caminho.',
    afirmação: 'Eu busco a sabedoria interior e permito que minha luz guie os outros.',
    palavras_chave: ['iluminação', 'sabedoria', 'solidão', 'introspecção', 'busca', 'guia'],
  },
  10: {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    elemento: 'Fogo',
    energia_oposta: {
      arcano: 'O Destino',
      numero_carta: 10,
      razão: 'Este arcano representa o ciclo de destinos girando. A Roda representa o movimento constante entre ascensão e queda.',
    },
    energia_amplificada: {
      arcano: 'O Mundo',
      numero_carta: 21,
      razão: 'A Roda gira em direção ao destino; o Mundo representa o objetivo final. O Mundo é o ponto culminante do ciclo da Roda.',
    },
    sombra_integrada: {
      arcano: 'A Justiça',
      numero_carta: 8,
      razão: 'A Roda pode parecer cega e arbitrária; a Justiça representa a ordem por trás do apparent caos. Integrar a sombra significa reconhecer o equilíbrio cósmico.',
    },
    significado_espiritual: 'O ciclo eterno de destino e mudança. A lei de causa e efeito em movimento constante. Representa o karma, a sorte, os ciclos da vida e a compreensão de que tudo muda.',
    arquétipo: 'O Destino / O Ciclo',
    orixá: 'Ibeji / Exu',
    sephirah: ' Netzach',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'Aceitar a mudança é aceitar a vida. A roda gira para todos eventualmente.',
    afirmação: 'Eu abraço os ciclos da vida e confio no movimento do destino.',
    palavras_chave: ['destino', 'mudança', 'ciclo', 'karma', 'sorte', 'rotação'],
  },
  11: {
    arcano: 'A Força',
    numero_carta: 11,
    elemento: 'Fogo',
    energia_oposta: {
      arcano: 'A Justiça',
      numero_carta: 8,
      razão: 'A Força representa compaixão e gentileza; a Justiça representa equilíbrio e lei. A Força sem a Justiça é complacência; a Justiça sem a Força é dureza.',
    },
    energia_amplificada: {
      arcano: 'O Carro',
      numero_carta: 7,
      razão: 'A Força é a vitória gentil; o Carro é a vitória determinada. O Carro é o conquistador que a Força refina.',
    },
    sombra_integrada: {
      arcano: 'A Imperatriz',
      numero_carta: 3,
      razão: 'A Força pode se tornar fraqueza por complacência; a Imperatriz lembra do poder da criação. Integrar a sombra significa equilibrar suavidade com poder.',
    },
    significado_espiritual: 'O poder da compaixão sobre a força bruta. A gentileza que vence através da coragem interior. Representa a força interior, a paciência, a compaixão e a domínio de si.',
    arquétipo: 'A Guerreira Gentil / O Protetor',
    orixá: 'Iemanjá / Oxum',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    lição_espiritual: 'A verdadeira força está na gentileza e na coragem de ser vulnerável.',
    afirmação: 'Eu conquisto com compaixão e minha gentileza é minha maior força.',
    palavras_chave: ['força', 'compaixão', 'coragem', 'gentileza', 'poder', 'disciplina interior'],
  },
  12: {
    arcano: 'O Enforcado',
    numero_carta: 12,
    elemento: 'Água',
    energia_oposta: {
      arcano: 'O Mago',
      numero_carta: 1,
      razão: 'O Enforcado representa sacrificio e nova perspectiva; o Mago representa ação e vontade. O Enforcado sem o Mago é paralisia; o Mago sem o Enforcado é impaciência.',
    },
    energia_amplificada: {
      arcano: 'A Morte',
      numero_carta: 13,
      razão: 'O Enforcado sacrifica perspectiva; a Morte é a transformação completa. A Morte é o sacrifício do Enforcado levado ao extremo.',
    },
    sombra_integrada: {
      arcano: 'O Imperador',
      numero_carta: 4,
      razão: 'O Enforcado pode se tornar martyrdom passivo; o Imperador lembra do poder de agir. Integrar a sombra significa saber quando agir e quando ceder.',
    },
    significado_espiritual: 'O sacrifício que traz nova perspectiva. A capacidade de ver além do aparente quando você está disposto a deixar ir. Representa a pausa, a entrega, a mudança de perspectiva e o sacrificio voluntário.',
    arquétipo: 'O Sacrificador / O Martir',
    orixá: 'Omolu / Obaluaiê',
    sephirah: 'Daath',
    chakra: '6º Frontal',
    lição_espiritual: 'Às vezes você precisa deixar ir para avançar. O sacrificio consciente traz iluminação.',
    afirmação: 'Eu entrego o que não serve mais e abraço nova perspectiva através do sacrifício sagrado.',
    palavras_chave: ['sacrifício', 'perspectiva', 'pausa', 'entrega', 'renúncia', 'inversão'],
  },
  13: {
    arcano: 'A Morte',
    numero_carta: 13,
    elemento: 'Água',
    energia_oposta: {
      arcano: 'O Sol',
      numero_carta: 19,
      razão: 'A Morte representa transformação; o Sol representa renovação. A Morte sem o Sol é destruição sem esperança; o Sol sem a Morte é permanência sem crescimento.',
    },
    energia_amplificada: {
      arcano: 'O Mundo',
      numero_carta: 21,
      razão: 'A Morte é a transformação; o Mundo é a síntese de todo o ciclo. A Morte é o portal para o Mundo.',
    },
    sombra_integrada: {
      arcano: 'O Hierofante',
      numero_carta: 5,
      razão: 'A Morte pode gerar medo; o Hierofante oferece esperança através da tradição. Integrar a sombra significa encontrar esperança na transformação.',
    },
    significado_espiritual: 'A transformação necessária que permite renascimento. A morte do velho para dar espaço ao novo. Representa mudança profunda, fim de ciclo, metamorfose e o renascimento que segue a destruição.',
    arquétipo: 'O Transformador / O Metamorfose',
    orixá: 'Omolu / Obaluaiê',
    sephirah: ' Netzach',
    chakra: '2º Sacral',
    lição_espiritual: 'A morte é apenas outro começo. Cada fim carrega em si uma nova oportunidade.',
    afirmação: 'Eu aceito a transformação como parte natural da vida e abraço o renascimento.',
    palavras_chave: ['transformação', 'morte', 'renascimento', 'mudança', 'fim', 'metamorfose'],
  },
  14: {
    arcano: 'A Temperança',
    numero_carta: 14,
    elemento: 'Fogo',
    energia_oposta: {
      arcano: 'O Diabo',
      numero_carta: 15,
      razão: 'A Temperança integra opostos; o Diabo prende nos extremos. A Temperança sem o Diabo nega a sombra; o Diabo sem a Temperança é caos.',
    },
    energia_amplificada: {
      arcano: 'O Mundo',
      numero_carta: 21,
      razão: 'A Temperança é o equilíbrio; o Mundo é a síntese completa. O Mundo é a harmonização final que a Temperança antecipa.',
    },
    sombra_integrada: {
      arcano: 'Os Enamorados',
      numero_carta: 6,
      razão: 'A Temperança pode se tornar mediocridade; os Enamorados lembram da intensidade. Integrar a sombra significa encontrar harmonia sem perder paixão.',
    },
    significado_espiritual: 'A integração sagrada de opostos. O equilíbrio entre extremos que permite harmonia duradoura. Representa a paciência, a moderação, a síntese e a integração de facetas opostas do self.',
    arquétipo: 'O Integrador / O Equilibrador',
    orixá: 'Oxum / Ibeji',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    lição_espiritual: 'O equilíbrio não é mediocridade; é a harmonia sagrada que permite todas as coisas existirem.',
    afirmação: 'Eu integro os opostos dentro de mim e encontro harmonia na diversidade.',
    palavras_chave: ['equilíbrio', 'harmonia', 'integração', 'moderação', 'síntese', 'paciência'],
  },
  15: {
    arcano: 'O Diabo',
    numero_carta: 15,
    elemento: 'Terra',
    energia_oposta: {
      arcano: 'O Anjo',
      numero_carta: 20,
      razão: 'O Diabo representa a escravidão aos vícios; o Anjo representa libertação. O Diabo sem o Anjo é prisão permanente; o Anjo sem o Diabo não tem história de redenção.',
    },
    energia_amplificada: {
      arcano: 'A Torre',
      numero_carta: 16,
      razão: 'O Diabo prende; a Torre liberta através de destruição. A Torre é a libertação do Diabo.',
    },
    sombra_integrada: {
      arcano: 'O Mago',
      numero_carta: 1,
      razão: 'O Diabo é o Mago corrompido; o Mago lembra que o poder pode ser usado ou mal usado. Integrar a sombra significa reconhecer o poder em si.',
    },
    significado_espiritual: 'A sombra que prende e a libertação que liberta. Os grilhões que você mesmo coloca e a chave para libertação. Representa a tentação, a compulsão, a sombra e a libertação através do autoconhecimento.',
    arquétipo: 'O Prisioneiro / O Shadow Self',
    orixá: 'Exu / Pomba Gira',
    sephirah: 'Yesod',
    chakra: '1º Raiz',
    lição_espiritual: 'Os grilhões que você carrega são feitos por você mesmo. A liberdade está em reconhecer isso.',
    afirmação: 'Eu reconheço minhas sombras e transformo cadeias em asas.',
    palavras_chave: ['sombra', 'tentação', 'libertação', 'prisão', 'compulsão', 'shadow'],
  },
  16: {
    arcano: 'A Torre',
    numero_carta: 16,
    elemento: 'Fogo',
    energia_oposta: {
      arcano: 'A Estrela',
      numero_carta: 17,
      razão: 'A Torre é destruição; a Estrela é esperança. A Torre sem a Estrela é nihilismo; a Estrela sem a Torre não há necessidade de esperança.',
    },
    energia_amplificada: {
      arcano: 'O Sol',
      numero_carta: 19,
      razão: 'A Torre destrói o falso; o Sol revela a verdade. O Sol é a iluminação que segue a Torre.',
    },
    sombra_integrada: {
      arcano: 'A Imperatriz',
      numero_carta: 3,
      razão: 'A Torre pode destruir estrutura necessária; a Imperatriz lembra do valor da estabilidade. Integrar a sombra significa destruir apenas o que deve ser destruído.',
    },
    significado_espiritual: 'A destruição do falso para revelar a verdade. O upheaval que precede renovação. Representa revelação súbita, libertação, mudança dramática e a destruição necessária para renascimento.',
    arquétipo: 'O Destruidor / O Libertador',
    orixá: 'Xangô / Iansã',
    sephirah: 'Hod',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'Às vezes o prédio precisa cair para que a luz entre. A destruição pode ser libertação.',
    afirmação: 'Eu permito que velha estrutura colapse e abra espaço para nova verdade.',
    palavras_chave: ['destruição', 'revelação', 'libertação', 'upheaval', 'mudança', 'renovação'],
  },
  17: {
    arcano: 'A Estrela',
    numero_carta: 17,
    elemento: 'Ar',
    energia_oposta: {
      arcano: 'A Lua',
      numero_carta: 18,
      razão: 'A Estrela traz esperança; a Lua traz ilusão. A Estrela sem a Lua perde realidade; a Lua sem a Estrela perde esperança.',
    },
    energia_amplificada: {
      arcano: 'O Sol',
      numero_carta: 19,
      razão: 'A Estrela é esperança; o Sol é clareza. O Sol é a concretização da esperança da Estrela.',
    },
    sombra_integrada: {
      arcano: 'A Justiça',
      numero_carta: 8,
      razão: 'A Estrela pode se tornar ilusão de otimismo; a Justiça traz realidade. Integrar a sombra significa equilibrar esperança com verdade.',
    },
    significado_espiritual: 'A esperança que brilha mesmo após a destruição. A estrela guía que indica o caminho. Representa esperança, inspiração, renovação e a luz que guia através da escuridão.',
    arquétipo: 'A Esperança / O Farol',
    orixá: 'Oxum / Iemanjá',
    sephirah: 'Chesed',
    chakra: '5º Laríngeo',
    lição_espiritual: 'Quando tudo parece perdido, uma estrela aparece para guiar seu caminho de volta.',
    afirmação: 'Eu sou a estrela que guia através da escuridão e minha luz nunca se apaga.',
    palavras_chave: ['esperança', 'luz', 'guia', 'inspiração', 'renovação', 'paz'],
  },
  18: {
    arcano: 'A Lua',
    numero_carta: 18,
    elemento: 'Água',
    energia_oposta: {
      arcano: 'O Sol',
      numero_carta: 19,
      razão: 'A Lua governa o inconsciente; o Sol governa a consciência. A Lua sem o Sol é confusão; o Sol sem a Lua é superficialidade.',
    },
    energia_amplificada: {
      arcano: 'O Sonhador',
      numero_carta: 18,
      razão: 'Este arcano representa o mundo dos sonhos e inconsciente. A Lua amplia os mistérios do inconsciente.',
    },
    sombra_integrada: {
      arcano: 'A Alta Sacerdotisa',
      numero_carta: 2,
      razão: 'A Lua pode enganar; a Alta Sacerdotisa revela verdade. Integrar a sombra significa distinguir realidade de ilusão.',
    },
    significado_espiritual: 'O reino do inconsciente e dos sonhos. A ilusão que pode guiar ou enganar. Representa o inconsciente, os sonhos, a intuição, a ilusão e a navegação através da incerteza.',
    arquétipo: 'O Sonhador / O Iludido',
    orixá: 'Iemanjá / Nanã',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
    lição_espiritual: 'Nem tudo é o que parece. Navegue pelas águas da ilusão com sabedoria e discernimento.',
    afirmação: 'Eu navego pelas águas do inconsciente com sabedoria e confio na minha intuição.',
    palavras_chave: ['lua', 'sonhos', 'inconsciente', 'ilusão', 'intuição', 'misterio'],
  },
  19: {
    arcano: 'O Sol',
    numero_carta: 19,
    elemento: 'Fogo',
    energia_oposta: {
      arcano: 'A Lua',
      numero_carta: 18,
      razão: 'O Sol é clareza; a Lua é mistério. O Sol sem a Lua perde profundidade; a Lua sem o Sol perde direção.',
    },
    energia_amplificada: {
      arcano: 'O Mundo',
      numero_carta: 21,
      razão: 'O Sol é iluminação; o Mundo é realização. O Mundo é a síntese completa que o Sol ilumina.',
    },
    sombra_integrada: {
      arcano: 'O Eremita',
      numero_carta: 9,
      razão: 'O Sol pode ser brilho sem profundidade; o Eremita busca a luz interior. Integrar a sombra significa encontrar sol interno.',
    },
    significado_espiritual: 'A iluminação e vitalidade que aquece e sustenta. A claridade que dissolve a escuridão. Representa sucesso, alegria, vitalidade, esperança, criança interior e a energia que sustenta a vida.',
    arquétipo: 'O Iluminado / O Radiante',
    orixá: 'Oxalá / Obatalá',
    sephirah: 'Kether',
    chakra: '7º Coronário',
    lição_espiritual: 'A luz que você busca está ao seu redor. Você é a luz que busca.',
    afirmação: 'Eu brilho com minha própria luz e aqueço a todos ao meu redor.',
    palavras_chave: ['sol', 'luz', 'alegria', 'iluminação', 'sucesso', 'vitalidade'],
  },
  20: {
    arcano: 'O Julgamento',
    numero_carta: 20,
    elemento: 'Fogo',
    energia_oposta: {
      arcano: 'O Mundo',
      numero_carta: 21,
      razão: 'O Julgamento é a avaliação final; o Mundo é a conclusão. O Julgamento sem o Mundo é julgamento sem resolução; o Mundo sem o Julgamento é conclusão sem avaliação.',
    },
    energia_amplificada: {
      arcano: 'O Louco',
      numero_carta: 0,
      razão: 'O Julgamento é o despertar; o Louco é o novo início. O Louco é o despertar do Julgamento levada à sua conclusão lógica.',
    },
    sombra_integrada: {
      arcano: 'A Justiça',
      numero_carta: 8,
      razão: 'O Julgamento pode ser severo; a Justiça traz equilíbrio. Integrar a sombra significa julgar com compaixão.',
    },
    significado_espiritual: 'O despertar da consciência e o julgamento final. A chamada para um novo propósito. Representa renascimento, redenção, avaliação e o chamado para despertar para seu destino.',
    arquétipo: 'O Julgador / O Desperto',
    orixá: 'Obatalá / Oxalá',
    sephirah: 'Malkuth',
    chakra: '7º Coronário',
    lição_espiritual: 'O despertar acontece quando você responde ao chamado da sua alma.',
    afirmação: 'Eu respondo ao chamado da minha alma e abraço meu novo propósito.',
    palavras_chave: ['julgamento', 'despertar', 'renascimento', 'redenção', 'propósito', 'avaliação'],
  },
  21: {
    arcano: 'O Mundo',
    numero_carta: 21,
    elemento: 'Terra',
    energia_oposta: {
      arcano: 'O Louco',
      numero_carta: 0,
      razão: 'O Mundo completa a jornada; o Louco a inicia. O Mundo sem o Louco é fechamento sem abertura; o Louco sem o Mundo é movimento sem destino.',
    },
    energia_amplificada: {
      arcano: 'A Roda da Fortuna',
      numero_carta: 10,
      razão: 'O Mundo é a conclusão do ciclo; a Roda é o ciclo em movimento. A Roda leva ao Mundo.',
    },
    sombra_integrada: {
      arcano: 'O Eremita',
      numero_carta: 9,
      razão: 'O Mundo pode ser complacência; o Eremita busca sempre mais. Integrar a sombra significa manter busca mesmo na réalisation.',
    },
    significado_espiritual: 'A realização completa da jornada espiritual. A síntese de todos os opostos em harmonia. Representa completude, realização, integração, paz interior e o fim de um ciclo com sabedoria.',
    arquétipo: 'O Realizado / O Todo',
    orixá: 'Oxalá / Iemanjá',
    sephirah: 'Kether',
    chakra: '7º Coronário',
    lição_espiritual: 'Você já é completo. A jornada estava no caminho, não no destino.',
    afirmação: 'Eu me realizo na completude do meu ser e abraço a unidade de tudo que existe.',
    palavras_chave: ['realização', 'completude', 'unidade', 'síntese', 'integração', 'paz'],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_TAROT_MAP);
// Freeze nested objects
Object.values(TAROT_TAROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Returns the tarot correlation mapping for a given Major Arcana card number (0-21)
 * @param numeroCarta - Card number (0-21)
 * @returns The correlation mapping or throws if out of range
 */
export function getTarotTarotByNumber(numeroCarta: number): TarotTarotMapping {
  if (numeroCarta < 0 || numeroCarta > 21 || !Number.isInteger(numeroCarta)) {
    throw new Error('Número do arcano fora do intervalo válido (0-21)');
  }
  return TAROT_TAROT_MAP[numeroCarta];
}

/**
 * Get the related arcano information for a given arcano name
 * @param arcano - The arcano name (e.g., 'O Louco', 'A Sacerdotisa')
 * @returns The tarot correlation mapping or null if not found
 */
export function getTarotTarotByArcano(arcano: string): TarotTarotMapping | null {
  const found = Object.values(TAROT_TAROT_MAP).find(
    (m) => m.arcano.toLowerCase() === arcano.toLowerCase()
  );
  return found || null;
}

/**
 * Get all Tarot-Tarot mappings
 * @returns Array of all TarotTarotMapping objects for cards 0-21
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Check if a card number exists in the mapping
 * @param numeroCarta - Card number to check (0-21)
 * @returns True if card number exists in mapping
 */
export function hasTarotTarot(numeroCarta: number): boolean {
  return numeroCarta in TAROT_TAROT_MAP;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of TarotTarotMapping objects matching the element
 */
export function getTarotTarotByElement(elemento: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) => m.elemento === elemento);
}

/**
 * Get mappings filtered by Orixá
 * @param orixá - Orixá name to search for
 * @returns Array of TarotTarotMapping objects associated with the Orixá
 */
export function getTarotTarotByOrixa(orixá: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) =>
    m.orixá.toLowerCase().includes(orixá.toLowerCase())
  );
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of TarotTarotMapping objects with the matching Sephirah
 */
export function getTarotTarotBySephirah(sephirah: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) =>
    m.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
}

/**
 * Get mappings filtered by Chakra
 * @param chakra - Chakra name or number to search for
 * @returns Array of TarotTarotMapping objects with the matching Chakra
 */
export function getTarotTarotByChakra(chakra: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) =>
    m.chakra.toLowerCase().includes(chakra.toLowerCase())
  );
}

/**
 * Get the complementary (opposite) arcano mapping
 * @param numeroCarta - Card number (0-21)
 * @returns The complementary arcano information
 */
export function getComplementaryArcano(numeroCarta: number): TarotTarotMapping['energia_oposta'] {
  const mapping = getTarotTarotByNumber(numeroCarta);
  return mapping.energia_oposta;
}

/**
 * Get the amplified energy arcano mapping
 * @param numeroCarta - Card number (0-21)
 * @returns The amplified energy arcano information
 */
export function getAmplifiedArcano(numeroCarta: number): TarotTarotMapping['energia_amplificada'] {
  const mapping = getTarotTarotByNumber(numeroCarta);
  return mapping.energia_amplificada;
}

/**
 * Get the shadow integration arcano mapping
 * @param numeroCarta - Card number (0-21)
 * @returns The shadow integration arcano information
 */
export function getShadowArcano(numeroCarta: number): TarotTarotMapping['sombra_integrada'] {
  const mapping = getTarotTarotByNumber(numeroCarta);
  return mapping.sombra_integrada;
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_TAROT_MAP)
    .map(Number)
    .sort((a, b) => a - b)
    .map((n) => TAROT_TAROT_MAP[n].arcano);
}

/**
 * Get all arcano numbers
 * @returns Array of card numbers (0-21)
 */
export function getAllArcanoNumbers(): number[] {
  return Object.keys(TAROT_TAROT_MAP).map(Number).sort((a, b) => a - b);
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarotByNumber,
  getTarotTarotByArcano,
  getAllTarotTarots,
  hasTarotTarot,
  getTarotTarotByElement,
  getTarotTarotByOrixa,
  getTarotTarotBySephirah,
  getTarotTarotByChakra,
  getComplementaryArcano,
  getAmplifiedArcano,
  getShadowArcano,
  getAllArcanos,
  getAllArcanoNumbers,
  TAROT_TAROT_MAP,
};
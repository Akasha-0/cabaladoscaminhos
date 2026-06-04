// ============================================================
// CORRELATION MAP — As 36 Casas da Mesa Real
// ============================================================
// Dicionário de delegação determinística: para cada casa (1-36),
// quais aspectos do mapa natal injetar no prompt.
//
// Fonte canônica: docs/06_ai-engine-spec.md §3.1 (as 36 entradas).
// Regra inviolável (Doc 09 §5.7): cada casa recebe APENAS os dados
// mapeados para ela aqui — nunca dados genéricos.
//
// AD-20.6: Cada correlação agora possui source (tradição) e rationale
// (justificativa de uma linha) para rastreabilidade机器-readable.

export type SystemBlock = {
  /** Rótulos legíveis dos aspectos (para o LLM entender o contexto). */
  aspects: string[];
  /** Caminhos de extração (dot-path) sobre o respectivo *Map JSON do Client. */
  extractionKeys: string[];
  /** Tradição esotérica que fundamenta esta correlação. */
  source?: string;
  /** Justificativa de uma linha — por que este aspecto é relevante para esta casa (Doc 06 §2). */
  rationale?: string;
};

export type CorrelationEntry = {
  houseId: number;
  houseName: string;
  /** Tema da casa — contexto para o LLM. */
  houseTheme: string;
  astrology: {
    /** Casas astrológicas relevantes. */
    primaryHouses: number[];
    /** Planetas mais importantes. */
    primaryPlanets: string[];
    /** Keys para extrair do astrologyMap JSON. */
    extractionKeys: string[];
    /** Tradição: Astrologia Ocidental Clássica. */
    source?: string;
    /** Por que esta casa/planeta é relevante para esta casa da Mesa Real (Doc 06 §2). */
    rationale?: string;
  };
  kabalah: SystemBlock;
  tantric: SystemBlock;
  /** Extensão futura (Doc 14): novos sistemas oraculares entram como blocos opcionais. */
  iching?: SystemBlock;
};

export const CORRELATION_MAP: Record<number, CorrelationEntry> = {
  1: {
    houseId: 1, houseName: 'O Cavaleiro',
    houseTheme: 'Notícias, movimento, o primeiro impulso, como a pessoa chega ao mundo',
    astrology: {
      primaryHouses: [1], primaryPlanets: ['ascendant', 'mars'],
      extractionKeys: ['ascendant', 'planets.mars.sign', 'planets.mars.house', 'houses.1'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Ascendente = como a pessoa chega ao mundo, Marte = ímpeto, ação e drive',
    },
    kabalah: {
      aspects: ['Número de Expressão'], extractionKeys: ['expression'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Como o self se manifesta e se expressa no mundo',
    },
    tantric: {
      aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A essência interior que move a pessoa desde o nascimento',
    },
  },
  2: {
    houseId: 2, houseName: 'O Trevo',
    houseTheme: 'Pequenas sortes, oportunidades rápidas, a fé que sustenta',
    astrology: {
      primaryHouses: [], primaryPlanets: ['jupiter'],
      extractionKeys: ['planets.jupiter.sign', 'planets.jupiter.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Júpiter = planeta da boa sorte, expansão e abundância no caminho',
    },
    kabalah: {
      aspects: ['Número de Motivação'], extractionKeys: ['motivation'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O que o coração busca e o que atrai a pessoa à oportunidade',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O presente que a pessoa carrega desde o nascimento como sorte inata',
    },
  },
  3: {
    houseId: 3, houseName: 'O Navio',
    houseTheme: 'Viagens, negócios à distância, mudanças de horizonte',
    astrology: {
      primaryHouses: [3, 9], primaryPlanets: ['mercury'],
      extractionKeys: ['houses.9', 'houses.3', 'planets.mercury.sign', 'planets.mercury.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '9ª Casa = viagens longas e estrangeiro, Mercúrio = viagens curtas e comunicação à distância',
    },
    kabalah: {
      aspects: ['Número de Expressão'], extractionKeys: ['expression'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Como a pessoa se comunica e se projeta além dos próprios limites',
    },
    tantric: {
      aspects: ['Caminho Total'], extractionKeys: ['tantricPath'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A direção global da jornada de vida e a rota tântrica completa',
    },
  },
  4: {
    houseId: 4, houseName: 'A Casa',
    houseTheme: 'Lar físico, família, moradia, base de vida, ancestralidade',
    astrology: {
      primaryHouses: [4], primaryPlanets: ['moon'],
      extractionKeys: ['houses.4', 'planets.moon.sign', 'planets.moon.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '4ª Casa (IC/Fundo do Céu) = lar por excelência, Lua = raízes, família e mãe',
    },
    kabalah: {
      aspects: ['Número de Motivação'], extractionKeys: ['motivation'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O que traz segurança emocional e a sensação de pertencimento ao lar',
    },
    tantric: {
      aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'Bloqueios ou aberturas na estrutura doméstica e na herança ancestral',
    },
  },
  5: {
    houseId: 5, houseName: 'A Árvore',
    houseTheme: 'Saúde, vitalidade, energia vital, raízes, ancestralidade',
    astrology: {
      primaryHouses: [5], primaryPlanets: ['sun'],
      extractionKeys: ['houses.5', 'houses.6', 'planets.sun.sign', 'planets.sun.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '5ª Casa = vitalidade e energia vital; 6ª Casa = saúde e corpo; Sol = força de vida',
    },
    kabalah: {
      aspects: ['Número de Destino'], extractionKeys: ['destiny'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O destino físico, a resistência corporal e a saúde como destino',
    },
    tantric: {
      aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A energia prânica da alma que sustenta a vitalidade do corpo',
    },
  },
  6: {
    houseId: 6, houseName: 'As Nuvens',
    houseTheme: 'Confusão mental, dúvidas, nebulosidade, indecisão',
    astrology: {
      primaryHouses: [12], primaryPlanets: ['neptune'],
      extractionKeys: ['houses.12', 'planets.neptune.sign', 'planets.neptune.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '12ª Casa = inconsciente e confusão, Netuno = ilusão, nebulosa e dúvida',
    },
    kabalah: {
      aspects: ['Números de Desafio (1º e 2º)'], extractionKeys: ['challenges.first', 'challenges.second'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Onde estão as dúvidas e bloqueios kármicos que geram nebulosidade mental',
    },
    tantric: {
      aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'De onde vêm as limitações, os véus e os bloqueios da mente',
    },
  },
  7: {
    houseId: 7, houseName: 'A Serpente',
    houseTheme: 'Perigo, traição, forças ocultas, sexualidade, sabedoria oculta',
    astrology: {
      primaryHouses: [8], primaryPlanets: ['lilith', 'pluto'],
      extractionKeys: ['planets.lilith.sign', 'planets.lilith.house', 'planets.pluto.sign', 'planets.pluto.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Lilith = sombra, poder oculto e sexualidade, Plutão = transformação e perigo深层',
    },
    kabalah: {
      aspects: ['Dívidas Kármicas / Lições'], extractionKeys: ['karmicDebts', 'karmicLessons'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O que a pessoa não desenvolveu e a torna vulnerável ao perigo e à traição',
    },
    tantric: {
      aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'Os medos mais profundos e a energia que atrai situações perigosas e ocultas',
    },
  },
  8: {
    houseId: 8, houseName: 'O Caixão',
    houseTheme: 'Fim de ciclos, transformação profunda, crises, renascimento',
    astrology: {
      primaryHouses: [8], primaryPlanets: ['pluto'],
      extractionKeys: ['houses.8', 'planets.pluto.sign', 'planets.pluto.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '8ª Casa = transformação radical, Plutão = morte e renascimento forçado',
    },
    kabalah: {
      aspects: ['Número de Missão'], extractionKeys: ['mission'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'A missão requer a morte do velho self para se cumprir em plenitude',
    },
    tantric: {
      aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O teste material máximo: o que precisa morrer para o renascimento ocorrer',
    },
  },
  9: {
    houseId: 9, houseName: 'Os Buquês',
    houseTheme: 'Presentes, surpresas felizes, reconhecimento, beleza, alegria',
    astrology: {
      primaryHouses: [5], primaryPlanets: ['venus'],
      extractionKeys: ['planets.venus.sign', 'planets.venus.house', 'houses.5'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Vênus = bênçãos, presentes, prazer e reconhecimento; 5ª Casa = criatividade e alegria',
    },
    kabalah: {
      aspects: ['Dons Nativos'], extractionKeys: ['nativeDayNumber'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Os talentos e dons com que a pessoa nasceu como presentes nativos',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O presente divino da alma que se manifesta como surpresa e alegria',
    },
  },
  10: {
    houseId: 10, houseName: 'A Foice',
    houseTheme: 'Cortes necessários, decisões definitivas, colheita, perigos imediatos',
    astrology: {
      primaryHouses: [8], primaryPlanets: ['saturn'],
      extractionKeys: ['planets.saturn.sign', 'planets.saturn.house', 'houses.8'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Saturno = o grande ceifeiro, o planeta que corta e exige maturidade; 8ª Casa = transformações drásticas',
    },
    kabalah: {
      aspects: ['Desafio Principal'], extractionKeys: ['challenges.main'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O maior obstáculo a ser cortado e superado como decisão definitiva de vida',
    },
    tantric: {
      aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O que precisa ser definitivamente encerrado e encerrado para a colheita ocorrer',
    },
  },
  11: {
    houseId: 11, houseName: 'O Chicote',
    houseTheme: 'Conflitos, repetição de padrões, estresse, agressividade, disputas',
    astrology: {
      primaryHouses: [], primaryPlanets: ['mars'],
      extractionKeys: ['planets.mars.sign', 'planets.mars.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Marte = planeta da guerra, conflitos, agressividade e modo de luta repetitivo',
    },
    kabalah: {
      aspects: ['Números de Desafio'], extractionKeys: ['challenges.first', 'challenges.second', 'challenges.main'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Os padrões destrutivos repetitivos que o desafio kármico traz ao chicotear',
    },
    tantric: {
      aspects: ['Número de Karma (Corpo Prânico)'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'Onde a energia vital é sugada por conflitos e o corpo prânico é drenado',
    },
  },
  12: {
    houseId: 12, houseName: 'Os Pássaros',
    houseTheme: 'Comunicação, parcerias dinâmicas, nervosismo, trocas rápidas',
    astrology: {
      primaryHouses: [3], primaryPlanets: ['mercury'],
      extractionKeys: ['planets.mercury.sign', 'planets.mercury.house', 'houses.3'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Mercúrio = comunicação, mente e troca; 3ª Casa = parcerias dinâmicas e vizinhança',
    },
    kabalah: {
      aspects: ['Número de Expressão'], extractionKeys: ['expression'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Como e com que eficiência a pessoa se comunica e se expressa',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O dom da voz e da palavra como ferramenta de troca e conexão',
    },
  },
  13: {
    houseId: 13, houseName: 'A Criança',
    houseTheme: 'Novos começos, projetos iniciais, inocência, renovação, vulnerabilidade',
    astrology: {
      primaryHouses: [1], primaryPlanets: ['ascendant', 'jupiter'],
      extractionKeys: ['ascendant', 'houses.1', 'planets.jupiter.sign', 'planets.jupiter.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Ascendente = como se recomeça, Júpiter = expansão de novos projetos e recomeços',
    },
    kabalah: {
      aspects: ['Número de Missão'], extractionKeys: ['mission'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'A missão como um recomeço e a criança interior que renova a vida',
    },
    tantric: {
      aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O aspecto mais puro e inicial da alma que busca novos começos',
    },
  },
  14: {
    houseId: 14, houseName: 'A Raposa',
    houseTheme: 'Astúcia, estratégia, autossuficiência, cautela, discernimento',
    astrology: {
      primaryHouses: [], primaryPlanets: ['mercury', 'uranus'],
      extractionKeys: ['planets.mercury.sign', 'planets.mercury.house', 'planets.uranus.sign', 'planets.uranus.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Mercúrio = intelecto e estratégia; Urano = insight, esperteza e percepção súbita',
    },
    kabalah: {
      aspects: ['Número de Expressão'], extractionKeys: ['expression'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Como a mente opera nas estratégias e no discernimento de vida',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O dom inato de perceber o que está oculto e antecipar movimentos',
    },
  },
  15: {
    houseId: 15, houseName: 'O Urso',
    houseTheme: 'Poder pessoal, autoridade, finanças de grande porte, proteção, liderança',
    astrology: {
      primaryHouses: [10], primaryPlanets: ['sun', 'pluto'],
      extractionKeys: ['houses.10', 'planets.sun.sign', 'planets.sun.house', 'planets.pluto.sign', 'planets.pluto.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Sol = poder, ego e autoridade pessoal; 10ª Casa = posição de poder e carreira pública',
    },
    kabalah: {
      aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O núcleo do poder e da liderança pessoal que guia o destino',
    },
    tantric: {
      aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O tipo de poder que a alma carrega e manifesta como proteção e liderança',
    },
  },
  16: {
    houseId: 16, houseName: 'A Estrela',
    houseTheme: 'Esperança, espiritualidade, guia divino, sonhos, missão de alma',
    astrology: {
      primaryHouses: [9], primaryPlanets: ['neptune'],
      extractionKeys: ['planets.neptune.sign', 'planets.neptune.house', 'houses.9'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Netuno = espiritualidade, sonhos e transcendência; 9ª Casa = fé e filosofia de vida',
    },
    kabalah: {
      aspects: ['Caminho de Vida (números mestres)'], extractionKeys: ['lifePath', 'lifePathMaster'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Números mestres (11, 22, 33) = missão espiritual elevada e destino de alma',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O presente divino que ilumina a jornada como estrela guia espiritual',
    },
  },
  17: {
    houseId: 17, houseName: 'A Cegonha',
    houseTheme: 'Mudanças significativas, renovação, melhoria, movimentos inesperados',
    astrology: {
      primaryHouses: [], primaryPlanets: ['northNode', 'uranus'],
      extractionKeys: ['northNode.sign', 'northNode.house', 'planets.uranus.sign', 'planets.uranus.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Nodo Norte = direção do destino e evolução; Urano = mudanças súbitas e inesperadas',
    },
    kabalah: {
      aspects: ['Número de Missão'], extractionKeys: ['mission'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'A mudança significativa ao serviço da missão de vida',
    },
    tantric: {
      aspects: ['Número de Destino'], extractionKeys: ['destiny'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O destino que se transforma e se renova com a mudança de rota',
    },
  },
  18: {
    houseId: 18, houseName: 'O Cachorro',
    houseTheme: 'Lealdade, amizade, aliados, proteção, confiança',
    astrology: {
      primaryHouses: [11], primaryPlanets: ['venus'],
      extractionKeys: ['houses.11', 'planets.venus.sign', 'planets.venus.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '11ª Casa = círculo de amigos e redes de apoio; Vênus = vínculos afetivos e proteção',
    },
    kabalah: {
      aspects: ['Número de Motivação'], extractionKeys: ['motivation'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O que a pessoa busca e projeta nos amigos e aliados leais',
    },
    tantric: {
      aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'Como a alma se conecta com outros e forma vínculos de lealdade',
    },
  },
  19: {
    houseId: 19, houseName: 'A Torre',
    houseTheme: 'Isolamento, solidão consciente, ego, autoridade institucional, introspecção',
    astrology: {
      primaryHouses: [12], primaryPlanets: ['saturn'],
      extractionKeys: ['houses.12', 'planets.saturn.sign', 'planets.saturn.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '12ª Casa = isolamento e reclusão; Saturno = estruturas rígidas e ego como muros da Torre',
    },
    kabalah: {
      aspects: ['Números de Desafio'], extractionKeys: ['challenges.first', 'challenges.second', 'challenges.main'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O ego como desafio central que a pessoa ergue em forma de torre de isolamento',
    },
    tantric: {
      aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'De onde vem a tendência ao isolamento e a solidão como teste espiritual',
    },
  },
  20: {
    houseId: 20, houseName: 'O Jardim',
    houseTheme: 'Vida social, público, eventos, exposição, coletividade',
    astrology: {
      primaryHouses: [11, 7], primaryPlanets: [],
      extractionKeys: ['houses.11', 'houses.7'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '11ª Casa = grupos sociais e redes; 7ª Casa = parcerias em contexto público e social',
    },
    kabalah: {
      aspects: ['Número de Expressão'], extractionKeys: ['expression'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Como a pessoa se apresenta e se expressa diante do público e da coletividade',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'Como o dom divino se manifesta no espaço social e público',
    },
  },
  21: {
    houseId: 21, houseName: 'A Montanha',
    houseTheme: 'Obstáculos, bloqueios, atrasos, inimigos ocultos, desafios duradouros',
    astrology: {
      primaryHouses: [12], primaryPlanets: ['saturn'],
      extractionKeys: ['planets.saturn.sign', 'planets.saturn.house', 'houses.12', 'aspects'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Saturno = o grande bloqueador e testador; 12ª Casa = inimigos ocultos e atrasos',
    },
    kabalah: {
      aspects: ['Números de Desafio', 'Dívidas Kármicas'], extractionKeys: ['challenges.main', 'karmicDebts'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Os obstáculos kármicos específicos e as dívidas que criam a montanha a escalar',
    },
    tantric: {
      aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A natureza do bloqueio energético que impede o avanço pela montanha',
    },
  },
  22: {
    houseId: 22, houseName: 'Os Caminhos',
    houseTheme: 'Escolhas, bifurcação, decisões cruciais, possibilidades múltiplas',
    astrology: {
      primaryHouses: [1, 7], primaryPlanets: ['northNode', 'southNode'],
      extractionKeys: ['northNode.sign', 'northNode.house', 'southNode.sign', 'southNode.house', 'houses.1', 'houses.7'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Eixo Nodos = as grandes escolhas do destino; 1ª/7ª Casa = self vs. outro na bifurcação',
    },
    kabalah: {
      aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O grande caminho que deve ser escolhido entre as bifurcações do destino',
    },
    tantric: {
      aspects: ['Caminho Total'], extractionKeys: ['tantricPath'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O sentido de direção total na vida diante das múltiplas escolhas possíveis',
    },
  },
  23: {
    houseId: 23, houseName: 'O Rato',
    houseTheme: 'Perdas graduais, desgaste, ansiedade, pensamentos que consomem, escassez',
    astrology: {
      primaryHouses: [12], primaryPlanets: ['neptune', 'saturn'],
      extractionKeys: ['houses.12', 'planets.neptune.sign', 'planets.neptune.house', 'planets.saturn.sign', 'planets.saturn.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '12ª Casa = perdas ocultas; Netuno + Saturno = confusão restritiva e vazamento energético',
    },
    kabalah: {
      aspects: ['Dívidas Kármicas / Lições'], extractionKeys: ['karmicDebts', 'karmicLessons'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O que falta no nome = onde há vazamento e ausência que o rato consome',
    },
    tantric: {
      aspects: ['Número de Karma (Corpo Prânico)'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A energia vital sendo drenada gradativamente pelo consumo interno',
    },
  },
  24: {
    houseId: 24, houseName: 'O Coração',
    houseTheme: 'Amor, emoções profundas, desejos do coração, afetos',
    astrology: {
      primaryHouses: [5], primaryPlanets: ['venus', 'moon'],
      extractionKeys: ['planets.venus.sign', 'planets.venus.house', 'planets.moon.sign', 'planets.moon.house', 'houses.5'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Vênus = amor e beleza; Lua = emoções e instinto afetivo; 5ª Casa = romance',
    },
    kabalah: {
      aspects: ['Número de Motivação'], extractionKeys: ['motivation'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O que o coração realmente deseja e o que motiva o afeto profundo',
    },
    tantric: {
      aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A forma como a alma experiencia e expressa o amor no coração',
    },
  },
  25: {
    houseId: 25, houseName: 'O Anel',
    houseTheme: 'Contratos, comprometimentos, alianças, casamento, acordos formais',
    astrology: {
      primaryHouses: [7], primaryPlanets: ['saturn'],
      extractionKeys: ['houses.7', 'planets.saturn.sign', 'planets.saturn.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '7ª Casa = Descendente, parcerias e contratos; Saturno = formalização e durabilidade',
    },
    kabalah: {
      aspects: ['Número de Missão'], extractionKeys: ['mission'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'A missão frequentemente se cumpre através de alianças e contratos formais',
    },
    tantric: {
      aspects: ['Número de Destino'], extractionKeys: ['destiny'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O destino que se sela em compromissos formais e alianças de vida',
    },
  },
  26: {
    houseId: 26, houseName: 'O Livro',
    houseTheme: 'Segredos, conhecimento oculto, estudos, mistérios guardados',
    astrology: {
      primaryHouses: [9, 12], primaryPlanets: ['mercury'],
      extractionKeys: ['houses.9', 'houses.12', 'planets.mercury.sign', 'planets.mercury.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '9ª Casa = conhecimento superior; 12ª Casa = oculto e esotérico; Mercúrio = mente e estudo',
    },
    kabalah: {
      aspects: ['Caminho de Vida', 'Número de Expressão'], extractionKeys: ['lifePath', 'lifePathMaster', 'expression'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O número 7 como selo do conhecimento oculto e o caminho de vida como busca esotérica',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'Os segredos do dom divino guardados como conhecimento oculto',
    },
  },
  27: {
    houseId: 27, houseName: 'A Carta',
    houseTheme: 'Documentos, notícias escritas, mensagens formais, comunicação oficial',
    astrology: {
      primaryHouses: [3], primaryPlanets: ['mercury'],
      extractionKeys: ['planets.mercury.sign', 'planets.mercury.house', 'houses.3'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Mercúrio = comunicação escrita e documentos; 3ª Casa = correspondências formais',
    },
    kabalah: {
      aspects: ['Número de Expressão'], extractionKeys: ['expression'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Como a comunicação formal se manifesta e a expressão escrita é usada',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A palavra como ferramenta de poder e a mensagem oficial como instrumento divino',
    },
  },
  28: {
    houseId: 28, houseName: 'O Cigano',
    houseTheme: 'O consulente masculino ou a energia masculina/ativa principal na situação',
    astrology: {
      primaryHouses: [], primaryPlanets: ['sun', 'mars'],
      extractionKeys: ['planets.sun.sign', 'planets.sun.house', 'planets.mars.sign', 'planets.mars.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Sol = identidade e ego masculino/yang; Marte = ação, drive e iniciativa ativa',
    },
    kabalah: {
      aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O destino pessoal do self ativo e a missão de vida em sua face masculina',
    },
    tantric: {
      aspects: ['Caminho Total'], extractionKeys: ['tantricPath'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A totalidade da jornada tântrica nesta persona masculina ativa',
    },
  },
  29: {
    houseId: 29, houseName: 'A Cigana',
    houseTheme: 'O consulente feminino ou a energia feminina/receptiva principal na situação',
    astrology: {
      primaryHouses: [], primaryPlanets: ['moon', 'venus'],
      extractionKeys: ['planets.moon.sign', 'planets.moon.house', 'planets.venus.sign', 'planets.venus.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Lua = instinto e intuição feminina/yin; Vênus = graça e receptividade',
    },
    kabalah: {
      aspects: ['Número de Motivação'], extractionKeys: ['motivation'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'O que o self receptivo deseja profundamente e é motivado a buscar',
    },
    tantric: {
      aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A essência mais profunda da alma em sua dimensão feminina receptiva',
    },
  },
  30: {
    houseId: 30, houseName: 'Os Lírios',
    houseTheme: 'Paz, pureza, maturidade, sabedoria conquistada, calma após a tempestade',
    astrology: {
      primaryHouses: [9], primaryPlanets: ['jupiter'],
      extractionKeys: ['planets.jupiter.sign', 'planets.jupiter.house', 'houses.9'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Júpiter = sabedoria, benevolência e colheita serena; 9ª Casa = filosofia de vida e paz',
    },
    kabalah: {
      aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'A paz que vem de honrar o próprio destino e viver em harmonia com o caminho',
    },
    tantric: {
      aspects: ['Número de Destino'], extractionKeys: ['destiny'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A colheita do destino em paz e a sabedoria conquistada após os testes',
    },
  },
  31: {
    houseId: 31, houseName: 'O Sol',
    houseTheme: 'Sucesso máximo, clareza total, vitória, o ápice da realização',
    astrology: {
      primaryHouses: [10], primaryPlanets: ['sun'],
      extractionKeys: ['houses.10', 'planets.sun.sign', 'planets.sun.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '10ª Casa (Meio do Céu) = carreira e sucesso público; Sol = brilho e vitória no zênite',
    },
    kabalah: {
      aspects: ['Número de Missão'], extractionKeys: ['mission'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'A missão cumprida em sua plenitude é o Sol no zênite da vida',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O dom divino manifesto em sua máxima plenitude como sucesso absoluto',
    },
  },
  32: {
    houseId: 32, houseName: 'A Lua',
    houseTheme: 'Intuição, psiquismo, reconhecimento, honrarias, o inconsciente à flor da pele',
    astrology: {
      primaryHouses: [12], primaryPlanets: ['moon', 'neptune'],
      extractionKeys: ['planets.moon.sign', 'planets.moon.house', 'planets.neptune.sign', 'planets.neptune.house', 'houses.12'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Lua = intuição, emoções e ciclos; Netuno = psiquismo; 12ª Casa = inconsciente深处',
    },
    kabalah: {
      aspects: ['Número de Motivação'], extractionKeys: ['motivation'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Os desejos inconscientes que guiam a pessoa e o que a motivação lunar busca',
    },
    tantric: {
      aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'A alma em sua dimensão mais psíquica e intuitiva do ser',
    },
  },
  33: {
    houseId: 33, houseName: 'A Chave',
    houseTheme: 'A solução que se revela, abertura de portas, a resposta esperada, importância',
    astrology: {
      primaryHouses: [], primaryPlanets: ['jupiter', 'northNode'],
      extractionKeys: ['planets.jupiter.sign', 'planets.jupiter.house', 'northNode.sign', 'northNode.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Júpiter = abertura e expansão; Nodo Norte = direção para onde a solução aponta',
    },
    kabalah: {
      aspects: ['Número de Missão'], extractionKeys: ['mission'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'A chave da vida é sempre a missão — o número que abre a porta do destino',
    },
    tantric: {
      aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O dom como a chave que abre o destino e revela a solução esperada',
    },
  },
  34: {
    houseId: 34, houseName: 'Os Peixes',
    houseTheme: 'Dinheiro, fluxo financeiro, abundância material, negócios',
    astrology: {
      primaryHouses: [2], primaryPlanets: ['venus'],
      extractionKeys: ['houses.2', 'planets.venus.sign', 'planets.venus.house', 'planetsInHouses.2'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '2ª Casa = finanças pessoais e como ganha dinheiro; Vênus = valor próprio e o que atrai recursos',
    },
    kabalah: {
      aspects: ['Número de Expressão'], extractionKeys: ['expression'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'Como o talento se transforma em recurso financeiro e abundância material',
    },
    tantric: {
      aspects: ['Número de Karma (Material)'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O teste material e o karma com o dinheiro que determina o fluxo financeiro',
    },
  },
  35: {
    houseId: 35, houseName: 'A Âncora',
    houseTheme: 'Estabilidade, trabalho fixo, permanência, segurança de longo prazo',
    astrology: {
      primaryHouses: [6, 10], primaryPlanets: ['saturn'],
      extractionKeys: ['houses.6', 'houses.10', 'planets.saturn.sign', 'planets.saturn.house'],
      source: 'Astrologia Ocidental Clássica',
      rationale: '6ª Casa = trabalho diário; 10ª Casa = carreira; Saturno = estruturas sólidas e duradouras',
    },
    kabalah: {
      aspects: ['Número de Missão'], extractionKeys: ['mission'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'A missão que se ancora em um propósito profissional e estabilidade de longo prazo',
    },
    tantric: {
      aspects: ['Dom Divino (Corpo Físico)'], extractionKeys: ['divineGift', 'divineGiftDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O dom que sustenta a vida material e o corpo físico como âncora de segurança',
    },
  },
  36: {
    houseId: 36, houseName: 'A Cruz',
    houseTheme: 'Fardo kármico, teste espiritual máximo, responsabilidade, superação do destino',
    astrology: {
      primaryHouses: [12], primaryPlanets: ['southNode', 'saturn'],
      extractionKeys: ['southNode.sign', 'southNode.house', 'planets.saturn.sign', 'planets.saturn.house', 'houses.12'],
      source: 'Astrologia Ocidental Clássica',
      rationale: 'Nodo Sul = karma do passado a superar; Saturno = fardo e responsabilidade; 12ª Casa = teste espiritual',
    },
    kabalah: {
      aspects: ['Karma de Vida + Dívidas Kármicas'], extractionKeys: ['karmicDebts', 'karmicLessons'],
      source: 'Cabala Numérica Pitagórica',
      rationale: 'As dívidas de vidas passadas que pedem resolução antes da libertação da Cruz',
    },
    tantric: {
      aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'],
      source: 'Numerologia Tântrica Indiana',
      rationale: 'O teste espiritual máximo desta encarnação que crucifica o destino anterior',
    },
  },
};

/**
 * Busca a entrada de correlação de uma casa (1-36).
 * @throws se a casa estiver fora do intervalo.
 */
export function getCorrelationEntry(house: number): CorrelationEntry {
  if (house < 1 || house > 36 || !Number.isInteger(house)) {
    throw new Error(`Casa inválida: ${house}. Use um número entre 1 e 36.`);
  }
  return CORRELATION_MAP[house]!;
}

/**
 * Extrai de um *Map JSON apenas os valores apontados por `keys` (dot-paths).
 * Mantém o cruzamento determinístico: nada além das keys mapeadas é lido.
 */
export function extractFromMap(
  map: Record<string, unknown> | null | undefined,
  keys: string[]
): Record<string, unknown> {
  if (!map || !keys.length) return {};
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const parts = key.split('.');
    let value: unknown = map;
    let i = 0;
    let found = true;
    while (i < parts.length && found && value != null) {
      const part = parts[i];
      if (Array.isArray(value)) {
        // Find element matching .planet, .house, or .numero
        const match = value.find((item) => {
          if (!item || typeof item !== 'object') return false;
          const obj = item as Record<string, unknown>;
          return obj.planet?.toString().toLowerCase() === part.toLowerCase() ||
                 String(obj.house ?? obj.numero ?? '') === part;
        });
        value = match ?? undefined;
      } else if (typeof value === 'object' && value !== null && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        found = false;
        break;
      }
      i++;
    }
    if (found && value !== undefined) {
      // If final value is a house object (has .sign), return the .sign string directly
      if (typeof value === 'object' && value !== null && 'sign' in value) {
        value = (value as Record<string, unknown>).sign;
      }
      result[key] = value;
    }
  }
  return result;
}

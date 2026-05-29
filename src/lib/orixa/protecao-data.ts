// @ts-nocheck
// SKIP_LINT

/**
 * Proteção Data Module
 * Spiritual protection data integrating Orixá wisdom with guardian energies and shield practices
 */

export interface ProteçãoData {
  id: string;
  name: string;
  orisha: string;
  element: string;
  type: string;
  associatedOrishas: string[];
  colors: string[];
  symbols: string[];
  dayOfWeek: string;
  offeringTime: string;
  conditions: string[];
  powers: string[];
  characteristics: string[];
  protectionTypes: string[];
  shieldMethods: string[];
  temples: string[];
  offerings: string[];
  chants: string[];
  meditation: string;
  affirmation: string;
  sacredObjects: string[];
  forbiddenPractices: string[];
  signs: string[];
  wards: string[];
  rituals: {
    protection: string[];
    cleansing: string[];
    strengthening: string[];
    banishment: string[];
  };
  divination: {
    tools: string[];
    methods: string[];
    interpretations: string[];
  };
  healing: {
    physical: string[];
    spiritual: string[];
    energetic: string[];
  };
  warnings: string[];
  blessings: string[];
  seasons: {
    dormant: string;
    awakening: string;
    peak: string;
    declining: string;
  };
  enemies: string[];
  vulnerabilities: string[];
  strengths: string[];
  mythology: string;
  spiritualLesson: string;
  messages: string[];
}

const PROTEÇÃO_DATA: ProteçãoData[] = [
  {
    id: "protecao-oxala",
    name: "Proteção de Oxalá",
    orisha: "Oxalá",
    element: "Luz",
    type: "Divina",
    associatedOrishas: ["Iemanjá", "Oxum", "Orunmilá"],
    colors: ["Branco", "Dourado", "Prata"],
    symbols: ["Cruz de Ifá", "Alabastro", "Pombos"],
    dayOfWeek: "Sexta-feira",
    offeringTime: "Manhã cedo",
    conditions: ["Pureza de intenção", "Corpo limpo", "Coração aberto", "Fé verdadeira"],
    powers: ["Proteção divina", "Escudo de luz", "Auração protetora", "Purificação absoluta"],
    characteristics: ["Paz", "Misericórdia", "Pureza", "Sabedoria", "Criação"],
    protectionTypes: ["Escudo de luz", "Barreira divina", "Auração branca", "Purificação etérea"],
    shieldMethods: ["Oração silenciosa", "Ejá com alabastro", "Invocação da luz", "Mantra de paz"],
    temples: ["Ebá", "Sala de orixá", "Espaços com luz natural"],
    offerings: ["Akará", "Era", "Pão branco", "Água de obi"],
    chants: ["Ora ô ô xalá", "Oxalá ogunheê", "Eleda mi o", "Alabê"],
    meditation: "Visualize uma luz branca pura envolvendo seu corpo como um escudo. Oxalá é a fonte de toda proteção. Peça que sua luz o envolve e protege.",
    affirmation: "Eu sou envolto na luz protetora de Oxalá. Nada de mal pode me alcançar.",
    sacredObjects: ["Alabastro", "Cruz de Ifá", "Panos brancos"],
    forbiddenPractices: ["Mentira", "Desonestidade", "Malícia"],
    signs: ["Luz dourada", "Sons de sino", "Presença de pombas"],
    wards: ["Negatividade", "Malogros", "Energias densas", "Escudos quebrados"],
    rituals: {
      protection: ["Ablade com água de obi", "Invocação de Oxalá", "Ejá com alabastro branco", "Oração do escudo"],
      cleansing: ["Banho branco", "Sálvia branca", "Água de alabastro", "Purificação com luz"],
      strengthening: ["Jejum semanal", "Oração ao amanhecer", "Ofereça akará nas sextas", "Ejá sagrado"],
      banishment: ["Queime ervas brancas", "Recuse energias negativas", "Quebrar corrientes"],
    },
    divination: {
      tools: ["Opon", "EkODARA", "Merindilogun"],
      methods: ["Leitura de Opón Ifá", "Interpretação de luz", "Avisos brancos"],
      interpretations: ["Luz indica proteção forte", "Paz confirma escudo ativo"]
    },
    healing: {
      physical: ["Luz solar pela manhã", "Alabastro no corpo", "Água purificada"],
      spiritual: ["Oração a Oxalá", "Ejá de proteção", "Fé verdadeira"],
      energetic: ["Auração branca", "Escudo de luz", "Purificação completa"]
    },
    warnings: ["Não abuse da proteção", "Mantenha a pureza", "Não use para fins egoístas"],
    blessings: ["Proteção divina", "Paz interior", "Pureza de coração", "Escudo inquebrável"],
    seasons: {
      dormant: "Quando a pureza é comprometida",
      awakening: "Ao amanhecer de novos começos",
      peak: "Sextas-feiras",
      declining: "Quando a malícia se manifesta"
    },
    enemies: ["Ogum", "Exú", "Malogros"],
    vulnerabilities: ["Desonestidade", "Malícia", "Impureza"],
    strengths: ["Fé", "Pureza", "Misericórdia", "Paz"],
    mythology: "Oxalá é o Criador supremo, o pai de todos os orixás. Sua proteção é a mais pura, criando um escudo de luz que afastam todos os males.",
    spiritualLesson: "A verdadeira proteção vem da pureza do coração e da conexão com a luz divina.",
    messages: ["Você está protegido", "A luz de Oxalá o envolve", "Nada de mal pode alcançá-lo"]
  },
  {
    id: "protecao-oxossi",
    name: "Proteção de Oxossi",
    orisha: "Oxossi",
    element: "Floresta",
    type: "Caçador",
    associatedOrishas: ["Ogum", "Oxalá", "Iansã"],
    colors: ["Azul", "Verde", "Marrom"],
    symbols: ["Arco", "Flechas", "Mato"],
    dayOfWeek: "Quarta-feira",
    offeringTime: "Tarde",
    conditions: ["Determinação", "Observação", "Liberdade de ação", "Conexão com a mata"],
    powers: ["Proteção da mata", "Escudo selvagem", "Invisibilidade espiritual", "Sentidos aguçados"],
    characteristics: ["Liberdade", "Justiça", "Caça", "Conhecimento", "Sobrevivência"],
    protectionTypes: ["Escudo da mata", "Manto de invisibilidade", "Sentidos protetores", "Intuição caçadora"],
    shieldMethods: ["Caminhada na mata", "Meditação com arco", "Ritual de pito", "Oferta à floresta"],
    temples: ["Floresta", "Mata", "Santuários de caça"],
    offerings: ["Eira", "Pito", "Flechas", "Comida de caça", "Mel"],
    chants: ["Oxossi O", "Ogunhê Oxossi", "Caçador do mato", "Mansuê"],
    meditation: "Sinta a floresta ao seu redor como um escudo vivo. Oxossi ensina a se proteger através da observação e da consciência aguçada. Peça que sua intuição seja seu escudo.",
    affirmation: "Eu tenho a visão do caçador. Eu enxergo além das sombras e me protejo com consciência.",
    sacredObjects: ["Arco", "Flechas", "Pena de ave", "Pito"],
    forbiddenPractices: ["Fuga da verdade", "Permanência na ignorância", "Visão turva"],
    signs: ["Aves voando em V", "Caminhos abertos", "Animais protetores"],
    wards: ["Armadilhas espirituais", "Influências ocultas", "Malogros", "Energias de competição"],
    rituals: {
      protection: ["Enterre pito na mata", "Invocação de Oxossi", "Flecha de proteção", "Ritual do arquista"],
      cleansing: ["Banho de mata", "Água de rio", "Ervas da floresta", "Touro de verde"],
      strengthening: ["Caminhe na mata", "Pratique observação", "Ofereça pito às quartas", "Ejá na mata"],
      banishment: ["Pito poderoso", "Flechas de luz", "Fumaça protetora", "Dispersão"]
    },
    divination: {
      tools: ["Opon", "Arco e flechas", "Penas"],
      methods: ["Leitura de pistas", "Interpretação de caminhos", "Observação de animais"],
      interpretations: ["Caminho aberto indica proteção forte", "Animais indicam guardians presentes"]
    },
    healing: {
      physical: ["Caminhada na mata", "Ar fresco", "Sombra de árvores"],
      spiritual: ["Conexão com a floresta", "Prática de observação", "Intuição caçadora"],
      energetic: ["Enraizamento", "Aterramento", "Sentidos aguçados"]
    },
    warnings: ["Não ignore os sinais", "Mantenha a consciência aguçada", "Observe antes de agir"],
    blessings: ["Visão clara", "Proteção da mata", "Sentidos aguçados", "Invisibilidade espiritual"],
    seasons: {
      dormant: "Quando a observância falha",
      awakening: "Ao iniciar uma jornada",
      peak: "Quartas-feiras",
      declining: "Quando a ignorância é preferida"
    },
    enemies: ["Ogum", "Exú", "Armadilhas"],
    vulnerabilities: ["Impulsividade", "Falta de visão", "Desatenção"],
    strengths: ["Observação", "Determinação", "Liberdade", "Intuição"],
    mythology: "Oxossi é o caçador divino, o senhor da floresta. Sua proteção vem da observação atenta e da consciência aguçada que vê além das aparências.",
    spiritualLesson: "A verdadeira proteção está em ver claramente e agir com consciência.",
    messages: ["Sua visão está clara", "Os caminhos se abrem", "Nenhum malagroso o alcançará"]
  },
  {
    id: "protecao-ogum",
    name: "Proteção de Ogum",
    orisha: "Ogum",
    element: "Ferro",
    type: "Guerreiro",
    associatedOrishas: ["Oxossi", "Oxalá", "São Jorge"],
    colors: ["Vermelho", "Laranja", "Preto"],
    symbols: ["Espada", "Escudo", "Ferramentas"],
    dayOfWeek: "Terça-feira",
    offeringTime: "Qualquer hora",
    conditions: ["Determinação", "Coragem", "Vontade de ferro", "Justice"],
    powers: ["Proteção guerreira", "Escudo de ferro", "Invulnerabilidade", "Força protetora"],
    characteristics: ["Força", "Coragem", "Determinação", "Conquista", "Proteção"],
    protectionTypes: ["Escudo de ferro", "Armadura divina", "Força guerreira", "Invulnerabilidade"],
    shieldMethods: ["Ritual de espada", "Invocação de Ogum", "Forja sagrada", "Guerra espiritual"],
    temples: ["Encruzilhadas", "Forjas", "Campanhas", "Arenas"],
    offerings: ["Espada", "Galinha negra", "Palanca", "Dendê", "Palmeiras"],
    chants: ["Ogum com上将", "Ogum ogunhê", "Ogum safariê", "Ogum malaiê"],
    meditation: "Sinta o poder do ferro. Ogum é o guerreiro que protege atraves da força e da coragem. Peça que sua espada afaste todos os inimigos espirituais.",
    affirmation: "Eu sou forte como o ferro. Minha vontade é inquebrável e minha proteção é absoluta.",
    sacredObjects: ["Espada", "Escudo", "Ferramentas", "Palanca"],
    forbiddenPractices: ["Fraqueza", "Covardia", "Injustiça", "Deslealdade"],
    signs: ["Aço brilhando", "Som de espada", "Força inexplicável"],
    wards: ["Inimigos declarados", "Ataques abertos", "Energias de guerra", "Malogros"],
    rituals: {
      protection: ["Espada na porta", "Invocação de Ogum", "Sangue de galinha", "Ritual do guerreiro"],
      cleansing: ["Ferro na água", "Fogo sagrado", "Descascar dendê", "Banho de aço"],
      strengthening: ["Forja espiritual", "Ofereça espeto às terças", "Aço na pele", "Ejá guerreiro"],
      banishment: ["Cortar ties", "Espada de luz", "Força de Ogum", "Dispersão"]
    },
    divination: {
      tools: ["Opô", "Espada", "Palanca"],
      methods: ["Leitura de espada", "Interpretação de lâmina", "Guerra divinação"],
      interpretations: ["Aço brilhante indica proteção forte", "Espada erguida confirma guardado"]
    },
    healing: {
      physical: ["Ferro no corpo", "Aço na pele", "Descanso guerreiro"],
      spiritual: ["Força de Ogum", "Determinação", "Coragem"],
      energetic: ["Armadura de ferro", "Força guerreira", "Escudo de aço"]
    },
    warnings: ["Não inicie batalhas desnecessárias", "Use a espada com sabedoria", "Proteja, não ataque"],
    blessings: ["Força guerreira", "Proteção absoluta", "Couragem", "Vitória sobre inimigos"],
    seasons: {
      dormant: "Quando a coragem falha",
      awakening: "Ao enfrentar adversidades",
      peak: "Terças-feiras",
      declining: "Quando a injustiça impera"
    },
    enemies: ["Exú", "Malogros", "Inimigos abertos"],
    vulnerabilities: ["Impulsividade", "Violência desnecessária", "Orgulho"],
    strengths: ["Força", "Coragem", "Determinação", "Justiça"],
    mythology: "Ogum é o guerreiro divino, o senhor das batalhas e das estradas. Sua proteção é a mais forte, criando um escudo de ferro que nenhuma arma pode penetrar.",
    spiritualLesson: "A verdadeira proteção vem da força interior e da disposição para lutar pelo que é certo.",
    messages: ["Você está protegido por Ogum", "A espada de Ogum afasta seus inimigos", "Nenhum mal pode atravessar seu escudo"]
  },
  {
    id: "protecao-iemanjá",
    name: "Proteção de Iemanjá",
    orisha: "Iemanjá",
    element: "Água",
    description: "Maternal",
    associatedOrishas: ["Oxalá", "Oxum", "Ogum"],
    colors: ["Azul", "Branco", "Rosa"],
    symbols: ["Espelho", "Conchas", "Mar"],
    dayOfWeek: "Sábado",
    offeringTime: "Noite",
    offeringTime: "Noite",
    conditions: ["Respeito à água", "Conexão maternal", "Intuição aberta", "Honra às ancestrais"],
    powers: ["Proteção maternal", "Escudo das águas", "Amortecimento de ondas", "Refúgio seguro"],
    characteristics: ["Maternalidade", "Proteção", "Transformação", "Profundidade", "Ciclicidade"],
    protectionTypes: ["Manto das águas", "Refúgio seguro", "Amortecimento", "Abraço materno"],
    shieldMethods: ["Banho de mar", "Meditação à beira d'água", "Ritual de espelho", "Invocação maternal"],
    temples: ["Praia", "Beira de rio", "Santuários de Iemanjá"],
    offerings: ["Milho", "Canela", "Flores brancas", "Perfume", "Balas"],
    chants: ["Iemanjá O", "Odò iyá", "Omo ale", "Mãezinha do mar"],
    meditation: "Imagine-se envolta nas águas calmas do oceano. Iemanjá é a mãe que protege seus filhos. Permita-se ser abraçada por sua proteção maternal.",
    affirmation: "Eu sou protegido pela mãe das águas. Seu manto me envolve e me mantém seguro.",
    sacredObjects: ["Espelho", "Conchas do mar", "Pérolas"],
    forbiddenPractices: ["Rejeição da emoção", "Crueldade maternal", "Falta de carinho"],
    signs: ["Ondas calmas", "Lua cheia", "Presença de gaivotas"],
    wards: ["Tempestades", "Afogamentos", "Energias traumáticas", "Perda"],
    rituals: {
      protection: ["Lave com água do mar", "Invocação de Iemanjá", "Espelho protetor", "Ritual do mar"],
      cleansing: ["Banho de mar", "Água de rio", "Flores na água", "Purificação aquática"],
      strengthening: ["Mergulho simbólico", "Visita ao mar", "Ofereça milho na beira", "Ejá de mar"],
      banishment: ["Água corrente", "Mar aberto", "Ondas de dispersão", "Purificação"]
    },
    divination: {
      tools: ["Búzios", "Mar", "Espelho"],
      methods: ["Jogo de búzios", "Interpretação de água", "Leitura de ondas"],
      interpretations: ["Água calma indica proteção forte", "Maré alta confirma guardado"]
    },
    healing: {
      physical: ["Banho de mar", "Água sagrada", "Flores aquáticas"],
      spiritual: ["Conexão maternal", "Honra aos ancestres", "Abraço de Iemanjá"],
      energetic: ["Manto das águas", "Refúgio seguro", "Amortecimento"]
    },
    warnings: ["Não abuse da gentileza", "Mantenha o respeito ao mar", "Honre sua história"],
    blessings: ["Proteção maternal", "Refúgio seguro", "Amortecimento de males", "Conexão ancestral"],
    seasons: {
      dormant: "Quando a dureza domina",
      awakening: "Ao buscar abrigo",
      peak: "Lua cheia",
      declining: "Quando a crueldade impera"
    },
    enemies: ["Ogum", "Tempestades", "Afogamentos"],
    vulnerabilities: ["Dureza", "Rejeição da emoção", "Crueldade"],
    strengths: ["Amor maternal", "Conexão profunda", "Proteção", "Abraço"],
    mythology: "Iemanjá é a rainha do mar, a mãe de todos. Sua proteção é o abraço materno que amortece todas as tempestades da vida.",
    spiritualLesson: "A verdadeira proteção vem do amor incondicional e da conexão com nossa mãe ancestral.",
    messages: ["Você está nos braços de Iemanjá", "A mãe das águas o protege", "Nada pode afundá-lo"]
  },
  {
    id: "protecao-oxum",
    name: "Proteção de Oxum",
    orisha: "Oxum",
    element: "Água doce",
    type: "Prosperidade",
    associatedOrishas: ["Oxalá", "Iemanjá", "Logunedé"],
    colors: ["Dourado", "Amarelo", "Azul claro"],
    symbols: ["Abano", "Espelho de mão", "Água corrente"],
    dayOfWeek: "Sábado",
    offeringTime: "Manhã",
    conditions: ["Auto-estima", "Beleza interior", "Valorização pessoal", "Prosperidade sagrada"],
    powers: ["Proteção da prosperidade", "Escudo de abundância", "Charme protetor", "Beleza como armadura"],
    characteristics: ["Beleza", "Prosperidade", "Charme", "Sensibilidade", "Elegância"],
    protectionTypes: ["Manto dourado", "Charme protetor", "Beleza como escudo", "Abundância protetora"],
    shieldMethods: ["Banho de Oxum", "Ritual de espelho", "Invocação de abundância", "Ejá doce"],
    temples: ["Cachoeiras", "Rios", "Santuários de Oxum"],
    offerings: ["Mel", "Canela", "Flores amarelas", "Ouro", "Dindin"],
    chants: ["Oxum oo", "Iê iê Oxum", "Oxum afins", "Mãezinha do ouro"],
    meditation: "Imagine-se envolta em água dourada. Oxum é a deusa que protege através da beleza e da prosperidade. Peça que seu manto dourado o shielding.",
    affirmation: "Eu sou protegido pela abundância de Oxum. Minha prosperidade é meu escudo.",
    sacredObjects: ["Abano de Oxum", "Espelho de mão", "Colares dourados"],
    forbiddenPractices: ["Inveja", "Mesquinhez", "Auto-rejeição", "Pobreza mental"],
    signs: ["Água dourada", "Borboletas amarelas", "Presença deiris"],
    wards: ["Escassez", "Inveja", "Malogros de prosperidade", "Roubo"],
    rituals: {
      protection: ["Banho de Oxum", "Invocação de Oxum", "Espelho protetor", "Ejá de ouro"],
      cleansing: ["Banho de cachoeira", "Água com mel", "Flores douradas", "Purificação doce"],
      strengthening: ["Ofereça mel nas sextas", "Visite cachoeiras", "Dança sagrada", "Ejá de Oxum"],
      banishment: ["Mel com água", "Canela dispersa", "Dourado de proteção", "Abundância"]
    },
    divination: {
      tools: ["Opon", "Mel", "Água"],
      methods: ["Jogo de búzios", "Interpretação de mel", "Leitura de água doce"],
      interpretations: ["Doçura indica proteção forte", "Dourado confirma prosperidade guardada"]
    },
    healing: {
      physical: ["Banho deOxum", "Água dourada", "Mel na pele"],
      spiritual: ["Auto-estima", "Amor próprio", "Prosperidade consciente"],
      energetic: ["Manto dourado", "Charme protetor", "Abundância como escudo"]
    },
    warnings: ["Evite a inveja", "Não confunda vaidade com beleza", "Valorize-se"],
    blessings: ["Proteção da prosperidade", "Charme protetor", "Abundância segura", "Beleza como armadura"],
    seasons: {
      dormant: "Quando a auto-estima falha",
      awakening: "Ao buscar prosperidade",
      peak: "Dias de Oxum",
      declining: "Quando a inveja domina"
    },
    enemies: ["Inveja", "Escassez", "Malogros"],
    vulnerabilities: ["Inveja alheia", "Escassez", "Pobreza mental"],
    strengths: ["Auto-estima", "Prosperidade", "Beleza", "Charme"],
    mythology: "Oxum é a amante do ouro, a deusa da prosperidade. Sua proteção vem da abundância que atrai e repele energias negativas.",
    spiritualLesson: "A verdadeira proteção vem de se valorizar e honrar a abundância que é seu direito.",
    messages: ["Você é protegido pela abundância", "A prosperidade é seu escudo", "Brilhe com luz dourada"]
  },
  {
    id: "protecao-shango",
    name: "Proteção de Xangô",
    orisha: "Xangô",
    element: "Fogo",
    type: "Tempestade",
    associatedOrishas: ["Oyá", "Iansã", "Ogum"],
    colors: ["Vermelho", "Branco", "Preto"],
    symbols: ["Machado", "Pedras", "Raios"],
    dayOfWeek: "Quinta-feira",
    offeringTime: "Tarde",
    conditions: ["Justiça", "Coragem", "Verdade", "Equilíbrio"],
    powers: ["Proteção do raio", "Escudo de fogo", "Justiceiro", "Cortador de ties"],
    characteristics: ["Justiça", "Tempestade", "Equilíbrio", "雷", "Autoridade"],
    protectionTypes: ["Escudo de fogo", "Raio protetor", "Machado cortador", "Tempestade guardiã"],
    shieldMethods: ["Ritual de fogo", "Invocação de Xangô", "Machado de proteção", "Raios de luz"],
    temples: ["Pedreiras", "Encruzilhadas", "Santuários de Xangô"],
    offerings: ["Fogo", "Pedras", "Galinha", "Akará"],
    chants: ["Xangô o", "Oba ará", "XangôSafariê", "Tempestade justa"],
    meditation: "Sinta o fogo ardente. Xangô é o deus da justiça cujo raio corta tudo o que é falso. Peça que seu fogo queime os inimigos e seu raio proteja a verdade.",
    affirmation: "Eu sou protegido pela justiça de Xangô. Seu raio corta todo mal e seu fogo purifica tudo.",
    sacredObjects: ["Machado de Xangô", "Pedras", "Raios"],
    forbiddenPractices: ["Injustiça", "Mentira", "Falsidade"],
    signs: ["Raios", "Trovões", "Fogo sem queimar"],
    wards: ["Injustiça", "Falsidade", "Mentiras", "Armadilhas"],
    rituals: {
      protection: ["Fogo sagrado", "Invocação de Xangô", "Machado de raios", "Ritual de pedra"],
      cleansing: ["Fogo purificador", "Água e fogo", "Pedras quentes", "Purificação de raio"],
      strengthening: ["Queime seguro às quintas", "Ofereça akará", "Fogo na pedra", "Ejá de trovão"],
      banishment: ["Raio cortador", "Fogo de Xangô", "Machado de luz", "Verdade"]
    },
    divination: {
      tools: ["Opô", "Pedras", "Fogo"],
      methods: ["Leitura de raios", "Interpretação de fogo", "Avisos de Xangô"],
      interpretations: ["Raio indica proteção ativa", "Trovões confirmam guarda"]
    },
    healing: {
      physical: ["Fogo sagrado", "Pedras aquecidas", "Calor do raio"],
      spiritual: ["Justiça de Xangô", "Verdade", "Equilíbrio"],
      energetic: ["Escudo de fogo", "Raio cortador", "Tempestade guardiã"]
    },
    warnings: ["Não abuse da justiça", "Não use para atacar", "Mantenha a verdade"],
    blessings: ["Justiça", "Proteção do raio", "Verdade", "Equilíbrio"],
    seasons: {
      dormant: "Quando a injustiça impera",
      awakening: "Ao buscar verdade",
      peak: "Quintas-feiras",
      declining: "Quando a falsidade domina"
    },
    enemies: ["Mentira", "Injustiça", "Falsidade"],
    vulnerabilities: ["Injustiça", "Falsidade", "Desonestidade"],
    strengths: ["Justiça", "Verdade", "Coragem", "Equilíbrio"],
    mythology: "Xangô é o rei das tempestades, o deus da justiça. Seu raio corta a falsidade e seu fogo purifica tudo o que é impuro.",
    spiritualLesson: "A verdadeira proteção vem da justiça e da verdade, não da força bruta.",
    messages: ["A justiça de Xangô o protege", "Seu raio corta a mentira", "A verdade é seu escudo"]
  },
  {
    id: "protecao-oya",
    name: "Proteção de Oyá",
    orisha: "Oyá",
    element: "Tempestade",
    type: "Tempestade",
    associatedOrishas: ["Xangô", "Iansã", "Ogum"],
    colors: ["Vermelho", "Marrom", "Amarelo"],
    symbols: ["Abanico", "Espada", "Irokun"],
    dayOfWeek: "Quinta-feira",
    offeringTime: "Noite",
    conditions: ["Força", "Transformação", "Liberdade", "Mutabilidade"],
    powers: ["Proteção da tempestade", "Manto de vento", "Transformação protetora", "Libertação"],
    characteristics: ["Tempestade", "Força", "Transformação", "Libertação", "Irokun"],
    protectionTypes: ["Manto de vento", "Tempestade guardiã", "Ventania protetora", "Transformação como escudo"],
    shieldMethods: ["Dança de Oyá", "Ritual de tempestad", "Abanico de fogo", "Invocação de Irokun"],
    temples: ["Cemitério", "Tempestade", "Santuários de Oyá"],
    offerings: ["Pepino", "Inhame", "Galinha", "Velas", "Dendê"],
    chants: ["Oyá O", "Irokun", "Tempestade do cemitério", "Mãezinha do vento"],
    meditation: "Sinta o vento como um escudo. Oyá é a senhora das tempestades que sopra e varre tudo. Peça que sua ventania afaste energias negativas e traga liberdade.",
    affirmation: "Eu sou forte como a tempestade. O vento de Oyá me protege e me libera.",
    sacredObjects: ["Abanico", "Espada", "Irokun"],
    forbiddenPractices: ["Fraqueza", "Medo da mudança", "Acomodação", "Rigidez"],
    signs: ["Ventania", "Rajadas", "Mudanças rápidas"],
    wards: ["Energias fixas", "Acomodação", "Rigidez", "Malogros"],
    rituals: {
      protection: ["Abanico de vento", "Invocação de Oyá", "Tempestade sagrada", "Ritual do vento"],
      cleansing: ["Ventania", "Mudança de ar", "Pepino na cabeça", "Purificação de tempestade"],
      strengthening: ["Abraçe a mudança", "Ofereça pepino às quintas", "Dança de Oyá", "Ejá de trovão"],
      banishment: ["Ventania forte", "Rajada de luz", "Rajada cortadora", "Limpeza"]
    },
    divination: {
      tools: ["Opô", "Abanico", "Espada"],
      methods: ["Leitura de tempestade", "Interpretação de vento", "Avisos de Oyá"],
      interpretations: ["Ventania indica proteção ativa", "Mudanças confirmam guarda"]
    },
    healing: {
      physical: ["Ar fresco", "Mudança de ambiente", "Vento natural"],
      spiritual: ["Libertação", "Transformação", "Força"],
      energetic: ["Manto de vento", "Ventania protetora", "Mudança como escudo"]
    },
    warnings: ["Evite a acomodação", "Abrace a mudança", "Não se fixe"],
    blessings: ["Libertação", "Transformação", "Força", "Flexibilidade Protetora"],
    seasons: {
      dormant: "Quando a acomodação impera",
      awakening: "Ao buscar mudança",
      peak: "Tempestades",
      declining: "Quando o medo domina"
    },
    enemies: ["Rigidez", "Acomodação", "Medo"],
    vulnerabilities: ["Rigidez", "Acomodação", "Medo de mudança"],
    strengths: ["Flexibilidade", "Liberdade", "Transformação", "Força"],
    mythology: "Oyá é a senhora das tempestades, a guardiã do cemitério e do vento. Sua proteção vem da transformação constante que Varre tudo o que é fixo.",
    spiritualLesson: "A verdadeira proteção está em aceitar a mudança e deixar o vento levar o que não serve.",
    messages: ["O vento de Oyá o protege", "A transformação está vindo", "Liberte-se do que não serves"]
  },
  {
    id: "protecao-iansa",
    name: "Proteção de Iansã",
    orisha: "Iansã",
    element: "Vento",
    type: "Tempestade",
    associatedOrishas: ["Xangô", "Oyá", "Ogum"],
    colors: ["Roxo", "Laranja", "Azul"],
    symbols: ["Espada", "Leque"],
    dayOfWeek: "Quarta-feira",
    offeringTime: "Qualquer hora",
    conditions: ["Adaptabilidade", "Comunicação", "Velocidade"],
    powers: ["Proteção do vento", "Mensagens divinas", "Agilidade", "Conexão celestial"],
    characteristics: ["Comunicação", "Adaptabilidade", "Velocidade", "Mensagens"],
    protectionTypes: ["Manto de vento", "Mensageira protetora", "Agilidade como escudo", "Voo celestial"],
    shieldMethods: ["Ritual de vento", "Invocação de Iansã", "Mensagem de trovão", "Ejá de Iansã"],
    temples: ["Cemitério", "Altos", "Santuários de Iansã"],
    offerings: ["Galinha", "Akará", "Dendê", "Velas"],
    chants: ["Iansã O", "Ogunhê Iansã", "Tempestade de mensagens"],
    meditation: "Sinta o vento como mensageiro. Iansã corre entre mundos trazendo proteção e sabedoria. Peça que suas mensagens o mantenham informado e protegido.",
    affirmation: "Eu sou ágil como o vento. As mensagens de Iansã me protegem e me guiam.",
    sacredObjects: ["Espada", "Leite", "Leque"],
    forbiddenPractices: ["Rigidez", "Silêncio", "Paralisia"],
    signs: ["Ventania", "Mensagens inesperadas", "Mudanças rápidas"],
    wards: ["Paralisia", "Confusão", "Falha de comunicação", "Estagnação"],
    rituals: {
      protection: ["Vento sagrado", "Invocação de Iansã", "Mensagem de proteção", "Ritual do mensageiro"],
      cleansing: ["Mudança de ar", "Akará na cabeça", "Purificação de vento", "Leite sagrado"],
      strengthening: ["Comunique-se mais", "Ofereça às quartas", "Ejá de Iansã", "Voe com o vento"],
      banishment: ["Ventania forte", "Mudança rápida", "Rajada de luz", "Dispersão"],
    },
    divination: {
      tools: ["Opô", "Espada", "Leite"],
      methods: ["Leitura de mensagens", "Interpretação de ventos", "Avisos de Iansã"],
      interpretations: ["Vento indica mensagens protetoras", "Rapid changes confirmam mudança segura"]
    },
    healing: {
      physical: ["Ar fresco", "Mudança de ambiente", "Ejá rápido"],
      spiritual: ["Comunicação", "Conexão", "Agilidade"],
      energetic: ["Manto de vento", "Mensagens protetoras", "Voo celestial"]
    },
    warnings: ["Não paralise", "Mantenha a comunicação aberta", "Seja adaptável"],
    blessings: ["Comunicação clara", "Proteção das mensagens", "Agilidade", "Conexão celestial"],
    seasons: {
      dormant: "Quando a comunicação falhar",
      awakening: "Ao buscar mensagens",
      peak: "Quartas-feiras",
      declining: "Quando a paralisia impera"
    },
    enemies: ["Paralisia", "Confusão", "Falha"],
    vulnerabilities: ["Silence", "Rigidez", "Estagnação"],
    strengths: ["Comunicação", "Adaptabilidade", "Velocidade", "Conexão"],
    mythology: "Iansã é a rainha do trovão, a mensageira entre mundos. Sua proteção vem da agilidade e da capacidade de se adaptar rapidamente às mudanças.",
    spiritualLesson: "A verdadeira proteção está em manter-se em movimento e conectado com as mensagens do universo.",
    messages: ["As mensagens de Iansã o protegem", "O vento traz notícias", "Mantenha-se em movimento"]
  }
];

export function getData(): ProteçãoData[] {
  return PROTEÇÃO_DATA;
}

export function getDataById(id: string): ProteçãoData | undefined {
  return PROTEÇÃO_DATA.find((p) => p.id === id);
}

export function searchData(query: string): ProteçãoData[] {
  const lowerQuery = query.toLowerCase();
  return PROTEÇÃO_DATA.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.orisha.toLowerCase().includes(lowerQuery) ||
      p.characteristics.some((c) => c.toLowerCase().includes(lowerQuery)) ||
      p.protectionTypes.some((pt) => pt.toLowerCase().includes(lowerQuery))
  );
}

export function getProteçãoByOrisha(orisha: string): ProteçãoData[] {
  return PROTEÇÃO_DATA.filter((p) => p.orisha.toLowerCase() === orisha.toLowerCase());
}

export function getProteçãoByElement(element: string): ProteçãoData[] {
  return PROTEÇÃO_DATA.filter((p) => p.element.toLowerCase() === element.toLowerCase());
}

export function getProteçãoByType(type: string): ProteçãoData[] {
  return PROTEÇÃO_DATA.filter((p) => p.type.toLowerCase() === type.toLowerCase());
}

export function getProteçãoByPower(power: string): ProteçãoData[] {
  return PROTEÇÃO_DATA.filter((p) =>
    p.powers.some((pw) => pw.toLowerCase().includes(power.toLowerCase()))
  );
}

export function getCompatibleProteçãoPractices(id: string): string[] {
  const proteção = getDataById(id);
  return proteção?.characteristics || [];
}

export function getEnemiesOfProteção(id: string): string[] {
  const proteção = getDataById(id);
  return proteção?.enemies || [];
}

/**
 * Oracle data - sacred wisdom and spiritual guidance
 * Cabala Dos Caminhos system
 */

/**
 * Oracle card structure
 */
export interface OracleData {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  meaning: string;
  element: string;
  orixa?: string;
  sephirah?: string;
  affirmation: string;
  message: string;
  keywords: string[];
}

/**
 * Complete oracle deck data - 36 cards of sacred wisdom
 */
const ORACLE_DATA: OracleData[] = [
  {
    id: "oracle-001",
    name: "A Aurora",
    nameEn: "The Dawn",
    description: "O primeiro raio de luz rompe a escuridão, trazendo renovação e novos começos.",
    meaning: "Início, renovação, esperança, novo ciclo espiritual",
    element: "Fogo",
    sephirah: "Kether",
    affirmation: "Eu acolho cada novo amanhecer como uma oportunidade de recomeçar.",
    message: "Um ciclo está terminando. Abrace o novo com coragem e esperança.",
    keywords: ["amanhecer", "renascimento", "luz", "início"],
  },
  {
    id: "oracle-002",
    name: "A Sombra Iluminada",
    nameEn: "The Illuminated Shadow",
    description: "A luz revela o que estava oculto nas sombras, integrando todas as partes de você.",
    meaning: "Integração, autoconhecimento, cura de sombras",
    element: "Água",
    sephirah: "Yesod",
    affirmation: "Eu aceito todas as partes de mim mesma, até as que prefiro não ver.",
    message: "Explore seus cantos escuros com compaixão. Eles são parte da sua totalidade.",
    keywords: ["sombra", "integração", "cura", "aceitação"],
  },
  {
    id: "oracle-003",
    name: "O Elo Ancestral",
    nameEn: "The Ancestral Link",
    description: "Conexão com gerações passadas, sabedoria que伝承 através do tempo.",
    meaning: "Ancestralidade, conexão familiar, proteção dos ancestrais",
    element: "Terra",
    orixa: "Omolu",
    sephirah: "Malkuth",
    affirmation: "Eu honro meus ancestrais e absorvo a sabedoria que eles desejam compartilhar.",
    message: "Você carrega a força dos seus ancestrais. Permita que guiem seus passos.",
    keywords: ["ancestrais", "tradição", "herança", "proteção"],
  },
  {
    id: "oracle-004",
    name: "A Intuição Sagrada",
    nameEn: "Sacred Intuition",
    description: "A voz interior se torna clara quando você aprende a escutar.",
    meaning: "Intuição, voz interior, sabedoria divina",
    element: "Éter",
    sephirah: "Chokmah",
    affirmation: "Eu confio na minha voz interior e a deixo guiar minhas decisões.",
    message: "Sua intuição fala em sussurros. Faça silêncio para ouvi-la.",
    keywords: ["intuição", "escuta", "sabedoria", "guia"],
  },
  {
    id: "oracle-005",
    name: "A Árvore da Vida",
    nameEn: "The Tree of Life",
    description: "Raízes profundas se conectam com a terra enquanto galhos tocam o céu.",
    meaning: "Crescimento, ancoramento, vida, conexão entre mundos",
    element: "Terra",
    orixa: "Oxóssi",
    sephirah: "Netzach",
    affirmation: "Eu sou uma expressão única da vida, enraizado e em expansão constante.",
    message: "Você está fundamentado e conectado. Seu crescimento é inevitável.",
    keywords: ["crescimento", "enraizamento", "vida", "conexão"],
  },
  {
    id: "oracle-006",
    name: "O Espelho",
    nameEn: "The Mirror",
    description: "Reflexo da alma mostra verdades ocultas e potenciais adormecidos.",
    meaning: "Auto-reflexão, verdade interior, autodescobrimento",
    element: "Água",
    sephirah: "Tiphereth",
    affirmation: "Eu me olho com amor e aceitação, vendo minha verdadeira essência.",
    message: "O que você vê no espelho é uma projeção do seu estado interior.",
    keywords: ["espelho", "reflexão", "verdade", "essência"],
  },
  {
    id: "oracle-007",
    name: "A Lua",
    nameEn: "The Moon",
    description: "Ciclos lunares governam emoções e mistérios do inconsciente.",
    meaning: "Emocional, ciclos, inconsciente, mistério",
    element: "Água",
    orixa: "Iemanjá",
    sephirah: "Yesod",
    affirmation: "Eu fluo com os ciclos da lua, aceitando todas as fases de mim.",
    message: "Honre seus ciclos emocionais. Eles são naturais e necessários.",
    keywords: ["lua", "ciclos", "emoção", "misterio"],
  },
  {
    id: "oracle-008",
    name: "A Estrela",
    nameEn: "The Star",
    description: "Luz eterna que guia através das noites mais escuras.",
    meaning: "Esperança, proteção espiritual, destino, guia",
    element: "Éter",
    sephirah: "Kether",
    affirmation: "Eu sou a luz que brilha nas horas mais escuras, inabalável e presente.",
    message: "Mesmo quando tudo parece perdido, há uma estrela esperando por você.",
    keywords: ["estrela", "luz", "esperança", "destino"],
  },
  {
    id: "oracle-009",
    name: "O Caminho",
    nameEn: "The Path",
    description: "Estrada sinuosa que leva ao centro de si mesmo.",
    meaning: "Jornada, caminho espiritual, destino",
    element: "Ar",
    sephirah: "Hod",
    affirmation: "Eu abraço cada passo da minha jornada, confiando na direção que surge.",
    message: "Não há atalhos. O caminho é a experiência, e a experiência é o destino.",
    keywords: ["caminho", "jornada", "destino", "experiência"],
  },
  {
    id: "oracle-010",
    name: "A Flor",
    nameEn: "The Flower",
    description: "Beleza efêmera que guarda a essência da criação.",
    meaning: "Beleza, florescimento, criação, fertilidade",
    element: "Água",
    orixa: "Oxum",
    sephirah: "Hod",
    affirmation: "Eu me abro para receber e dar beleza, sabendo que sou suficiente.",
    message: "Permita-se florescer. Sua beleza é uma dádiva para o mundo.",
    keywords: ["flor", "beleza", "florescimento", "criação"],
  },
  {
    id: "oracle-011",
    name: "O Vale",
    nameEn: "The Valley",
    description: "Depressão profunda onde tesouros são encontrados na stillness.",
    meaning: "Resiliência, superação, profundidade, força interior",
    element: "Terra",
    sephirah: "Malkuth",
    affirmation: "Eu honro os vales da minha vida como espaços de descoberta interior.",
    message: "Nos vales da vida, encontramos as fontes mais profundas de força.",
    keywords: ["vale", "resiliência", "profundidade", "força"],
  },
  {
    id: "oracle-012",
    name: "A Montanha",
    nameEn: "The Mountain",
    description: "Elevação que oferece perspectiva e clareza de visão.",
    meaning: "Superação, perspectiva, evolução, conquista",
    element: "Terra",
    orixa: "Oxóssi",
    sephirah: "Chesed",
    affirmation: "Eu me elevo acima dos problemas do momento para ver o padrão maior.",
    message: "Suba para ter uma visão mais ampla. Você verá além das atuais limitações.",
    keywords: ["montanha", "elevação", "perspectiva", "conquista"],
  },
  {
    id: "oracle-013",
    name: "A Fênix",
    nameEn: "The Phoenix",
    description: "Ressurreição das cinzas, renascimento através da transformação.",
    meaning: "Renascimento, transformação, morte e vida, poder de regeneração",
    element: "Fogo",
    orixa: "Xangô",
    sephirah: "Geburah",
    affirmation: "Eu renasço de minhas próprias cinzas, mais forte e mais luminoso.",
    message: "O que precisa morrer para que algo novo nasça em você?",
    keywords: ["fênix", "renascimento", "transformação", "regeneração"],
  },
  {
    id: "oracle-014",
    name: "O Rio",
    nameEn: "The River",
    description: "Fluxo constante que carrega águas antigas e promessas novas.",
    meaning: "Fluidez, movimento, vida, transformação constante",
    element: "Água",
    orixa: "Iansã",
    sephirah: "Chesed",
    affirmation: "Eu me permito ser carregado pela correnteza da vida, confiando no fluxo.",
    message: "Siga o fluxo. A correnteza conhece o caminho que você ainda não vê.",
    keywords: ["rio", "fluxo", "movimento", "correnteza"],
  },
  {
    id: "oracle-015",
    name: "A Semente",
    nameEn: "The Seed",
    description: "Potencial contido no silêncio, esperando o momento certo para brotar.",
    meaning: "Potencial, germinação, futuro, possibilidade",
    element: "Terra",
    orixa: "Oxum",
    sephirah: "Malkuth",
    affirmation: "Eu nutro as sementes da minha intenção com fé e paciência.",
    message: "Algo está germinando no silêncio. Tenha paciência com seu crescimento.",
    keywords: ["semente", "potencial", "paciência", "germinação"],
  },
  {
    id: "oracle-016",
    name: "O Portal",
    nameEn: "The Portal",
    description: "Passagem entre mundos, umbral que transforma ao ser cruzado.",
    meaning: "Transição, transformação, novos começos, limiar",
    element: "Éter",
    sephirah: "Binah",
    affirmation: "Eu atravesso portais com coragem, aceitando as transformações que vêm.",
    message: "Um portal se abre. Você pode escolher cruzá-lo ou não. Ambos são válidos.",
    keywords: ["portal", "transição", "limiar", "transformação"],
  },
  {
    id: "oracle-017",
    name: "A Chama",
    nameEn: "The Flame",
    description: "Fogo interior que nunca se apaga, paixão e propósito ardente.",
    meaning: "Paixão, propósito, transformação, energia vital",
    element: "Fogo",
    orixa: "Xangô",
    sephirah: "Geburah",
    affirmation: "Eu alimento minha chama interior com propósito e paixão ardente.",
    message: "Sua chama interior nunca morreu. Ela apenas esperava ser reconhecida.",
    keywords: ["chama", "paixão", "propósito", "fogo"],
  },
  {
    id: "oracle-018",
    name: "A Caverna",
    nameEn: "The Cave",
    description: "Espaço íntimo de meditação onde tesouros ocultos aguardam.",
    meaning: "Contemplação, introspecção, sabedoria oculta, meditação",
    element: "Terra",
    sephirah: "Binah",
    affirmation: "Eu me retiro para o silêncio da minha caverna interior para ouvir.",
    message: "Vá para dentro. Nos recessos mais profundos, você encontrará respostas.",
    keywords: ["caverna", "contemplação", "introspecção", "silêncio"],
  },
  {
    id: "oracle-019",
    name: "A Tempestade",
    nameEn: "The Storm",
    description: "Turbilhão que purifica e transforma paisagens e pensamentos.",
    meaning: "Purificação, transformação, crise, limpeza",
    element: "Fogo",
    orixa: "Iansã",
    sephirah: "Geburah",
    affirmation: "Eu permito que a tempestade passe através de mim, mantendo minha paz.",
    message: "A tempestade vai passar. Permaneça centrado enquanto ela passa.",
    keywords: ["tempestade", "purificação", "transformação", "crise"],
  },
  {
    id: "oracle-020",
    name: "O Arco-íris",
    nameEn: "The Rainbow",
    description: "Ponte entre céu e terra, promessa de que melhores virão.",
    meaning: "Promessa, esperança, paz após conflito, novos céus",
    element: "Água",
    orixa: "Oxumaré",
    sephirah: "Tiphereth",
    affirmation: "Eu sou a ponte entre meu estado atual e minha visão do possível.",
    message: "Após a tempestade, o arco-íris. Ele sempre aparece quando você espera menos.",
    keywords: ["arco-íris", "promessa", "esperança", "paz"],
  },
  {
    id: "oracle-021",
    name: "A Maré",
    nameEn: "The Tide",
    description: "Movimento cíclico de avanço e recuo, sucesso e descanso.",
    meaning: "Ritmo, ciclos, descanso, recuo estratégico",
    element: "Água",
    orixa: "Iemanjá",
    sephirah: "Yesod",
    affirmation: "Eu fluo com a maré da vida, descansando quando necessário.",
    message: "Honre o ritmo da maré. Nem tudo precisa ser ação constante.",
    keywords: ["maré", "ritmo", "ciclos", "descanso"],
  },
  {
    id: "oracle-022",
    name: "O Espelho d'Água",
    nameEn: "The Water Mirror",
    description: "Reflexão perfeita que mostra verdades sem julgamento.",
    meaning: "Clareza, objetividade, auto-observação, paz",
    element: "Água",
    sephirah: "Tiphereth",
    affirmation: "Eu observo minhas reflexões com compaixão e aceitação.",
    message: "Olhe para a água. O que você vê é um espelho do seu estado de espírito.",
    keywords: ["espelho", "água", "clareza", "reflexão"],
  },
  {
    id: "oracle-023",
    name: "A Ponte",
    nameEn: "The Bridge",
    description: "Conexão entre margens, união de opostos aparentemente irreconciliáveis.",
    meaning: "Conexão, reconciliação, mediação, união",
    element: "Ar",
    sephirah: "Chesed",
    affirmation: "Eu sou a ponte que conecta diferentes partes da minha experiência.",
    message: "Uma ponte pode ser construída onde parecia impossível. Você é essa ponte.",
    keywords: ["ponte", "conexão", "mediação", "união"],
  },
  {
    id: "oracle-024",
    name: "A Noite Estrelada",
    nameEn: "The Starry Night",
    description: "Escuro profundo pontilhado de luz, mistério e infinidade.",
    meaning: "Mistério, infinito, transcendência, cosmos",
    element: "Éter",
    sephirah: "Kether",
    affirmation: "Eu brilho mesmo na escuridão, porque a luz é minha natureza.",
    message: "No escuro, as estrelas são mais visíveis. Você é uma estrela.",
    keywords: ["noite", "estrelas", "mistério", "infinito"],
  },
  {
    id: "oracle-025",
    name: "O Labirinto",
    nameEn: "The Labyrinth",
    description: "Caminho intrincado que leva ao centro e retorna transformado.",
    meaning: "Descoberta interior, jornada espiritual, auto-transformação",
    element: "Terra",
    sephirah: "Malkuth",
    affirmation: "Eu navego pelo labirinto da minha mente com paciência e curiosidade.",
    message: "O labirinto não é para ser escapado. É para ser percorrido com atenção.",
    keywords: ["labirinto", "descoberta", "jornada", "transformação"],
  },
  {
    id: "oracle-026",
    name: "A Fonte",
    nameEn: "The Spring",
    description: "Nascente de águas puras, origem de tudo que flui.",
    meaning: "Origem, pureza, vida nova, renovação",
    element: "Água",
    orixa: "Oxum",
    sephirah: "Chokmah",
    affirmation: "Eu permito que águas puras fluam através de mim, renovando minha essência.",
    message: "Você é uma fonte inesgotável. Nunca seque, apenas espere.",
    keywords: ["fonte", "pureza", "renovação", "origem"],
  },
  {
    id: "oracle-027",
    name: "O Vento",
    nameEn: "The Wind",
    description: "Força invisível que move, carrega e transforma.",
    meaning: "Mudança, liberdade, transformação, espírito",
    element: "Ar",
    orixa: "Iansã",
    sephirah: "Hod",
    affirmation: "Eu me abro para as mudanças que o vento traz, confiando em sua sabedoria.",
    message: "O vento traz mudanças. Deixe que ele leve o que não serve mais.",
    keywords: ["vento", "mudança", "liberdade", "espírito"],
  },
  {
    id: "oracle-028",
    name: "A Raiz",
    nameEn: "The Root",
    description: "Conexão com a terra-mãe, base que sustenta toda existência.",
    meaning: "Fundação, ancoramento, pertencimento, força",
    element: "Terra",
    orixa: "Omolu",
    sephirah: "Malkuth",
    affirmation: "Eu me conexiono profundamente com minhas raízes, ganhando estabilidade.",
    message: "Volte às suas raízes. Elas são a fonte da sua força.",
    keywords: ["raiz", "fundação", "ancoramento", "estabilidade"],
  },
  {
    id: "oracle-029",
    name: "O Abismo",
    nameEn: "The Abyss",
    description: "Espaço profundo de transformação onde o ego se dissolve.",
    meaning: "Surrender, dissolução, transformação radical, renascimento",
    element: "Água",
    sephirah: "Binah",
    affirmation: "Eu desço ao abismo com coragem, sabendo que lá encontrarei minha verdade.",
    message: "O abismo não é seu inimigo. Ele é onde você encontra seu verdadeiro eu.",
    keywords: ["abismo", "surrender", "transformação", "verdade"],
  },
  {
    id: "oracle-030",
    name: "A Coroa",
    nameEn: "The Crown",
    description: "Luz dourada que emana do topo, liderança espiritual.",
    meaning: "Soberania, sabedoria divina, coroação, propósito",
    element: "Éter",
    orixa: "Oxalá",
    sephirah: "Kether",
    affirmation: "Eu portando minha coroa com humildade, servindo ao bem maior.",
    message: "Você foi ungido com sabedoria. Use sua coroa para servir.",
    keywords: ["coroa", "soberania", "sabedoria", "liderança"],
  },
  {
    id: "oracle-031",
    name: "O Espelho Quebrado",
    nameEn: "The Broken Mirror",
    description: "Fragmentos que refletem múltiplas versões de uma mesma verdade.",
    meaning: "Integração, fragmentação, wholeness, cura de partes",
    element: "Terra",
    sephirah: "Tiphereth",
    affirmation: "Eu colho os fragmentos do meu ser para ver a imagem completa.",
    message: "Cada fragmento mostra uma parte da verdade. Junte-os todos.",
    keywords: ["espelho", "fragmentos", "integração", "wholeness"],
  },
  {
    id: "oracle-032",
    name: "A Jornada Noturna",
    nameEn: "The Night Journey",
    description: "Travessia pelo escuro onde a alma encontra seus medos e vence.",
    meaning: "Superação, coragem, jornada interior, vitória",
    element: "Água",
    sephirah: "Yesod",
    affirmation: "Eu atravesso a noite com fé, sabendo que o amanhecer virá.",
    message: "A noite mais escura precede o amanhecer mais brilhante.",
    keywords: ["noite", "jornada", "superación", "amanhecer"],
  },
  {
    id: "oracle-033",
    name: "O Altar",
    nameEn: "The Altar",
    description: "Espaço sagrado onde oferendas são feitas e pedidos são concedidos.",
    meaning: "Sagrado, devoção, oferenda, conexão divina",
    element: "Terra",
    orixa: "Oxalá",
    sephirah: "Malkuth",
    affirmation: "Eu crio um espaço sagrado onde posso me conectar com o divino.",
    message: "Construa seu altar com intenção. Nele, suas preces serão ouvidas.",
    keywords: ["altar", "sagrado", "oferenda", "devocão"],
  },
  {
    id: "oracle-034",
    name: "A Manta",
    nameEn: "The Mantle",
    description: "Cobertura reconfortante que aquece e protege nas horas frias.",
    meaning: "Proteção, conforto, abrigo, amor incondicional",
    element: "Água",
    sephirah: "Chesed",
    affirmation: "Eu me embrulho na manta do amor divino, aquecido e seguro.",
    message: "Você está envolvido por amor. Sinta a manta como um abraço.",
    keywords: ["manta", "proteção", "conforto", "abrigo"],
  },
  {
    id: "oracle-035",
    name: "A Memória",
    nameEn: "Memory",
    description: "Guardiã do passado que liberta ou aprisiona conforme a intenção.",
    meaning: "Memória, passado, libertação, honra",
    element: "Água",
    sephirah: "Binah",
    affirmation: "Eu honro minhas memórias sem deixar que elas me definam.",
    message: "Honre suas memórias, mas não seja escravo delas. Solte o que precisa ir.",
    keywords: ["memória", "passado", "libertação", "honra"],
  },
  {
    id: "oracle-036",
    name: "A Alvorada",
    nameEn: "The First Light",
    description: "Primeira luz que surge no horizonte, promessa de um novo dia.",
    meaning: "Novo início, esperança, clareza, despertar",
    element: "Fogo",
    sephirah: "Kether",
    affirmation: "Eu saúdo cada alvorada com gratidão, antecipando as bênçãos do dia.",
    message: "A alvorada chega para todos. Sua vez está chegando.",
    keywords: ["alvorada", "luz", "início", "esperança"],
  },
];

/**
 * Get all oracle data as an array
 */
export function getData(): OracleData[] {
  return ORACLE_DATA;
}

/**
 * Get oracle data by ID
 */
export function getOracleDataById(id: string): OracleData | undefined {
  return ORACLE_DATA.find((card) => card.id === id);
}

/**
 * Get oracle data by element
 */
export function getOracleDataByElement(element: string): OracleData[] {
  return ORACLE_DATA.filter((card) => card.element.toLowerCase() === element.toLowerCase());
}

/**
 * Get oracle data by orixá
 */
export function getOracleDataByOrixa(orixa: string): OracleData[] {
  return ORACLE_DATA.filter((card) => card.orixa?.toLowerCase() === orixa.toLowerCase());
}

/**
 * Get oracle data by sephirah
 */
export function getOracleDataBySephirah(sephirah: string): OracleData[] {
  return ORACLE_DATA.filter((card) => card.sephirah?.toLowerCase() === sephirah.toLowerCase());
}

/**
 * Get random oracle data
 */
export function getRandomOracleData(): OracleData {
  return ORACLE_DATA[Math.floor(Math.random() * ORACLE_DATA.length)];
}

/**
 * Get oracle data count
 */
export function getOracleDataCount(): number {
  return ORACLE_DATA.length;
}
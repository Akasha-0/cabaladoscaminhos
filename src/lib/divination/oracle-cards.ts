/**
 * Oracle cards — wisdom and guidance through sacred imagery
 */

export interface OracleCard {
  id: string;
  name: string;
  description: string;
  message: string;
  affirmation: string;
  theme: string;
}

export interface OracleDeck {
  cards: OracleCard[];
}

/**
 * The 36 oracle cards in the deck
 * Each card carries a unique theme, message, and affirmation
 */
const ORACLE_CARDS: OracleCard[] = [
  {
    id: "oracle-001",
    name: "A Aurora",
    description: "O primeiro raio de luz rompe a escuridão, trazendo renovação e novos começos.",
    message: "Um ciclo está terminando. Abrace o novo com coragem e esperança.",
    affirmation: "Eu acolho cada novo amanhecer como uma oportunidade de recomeçar.",
    theme: "renewal",
  },
  {
    id: "oracle-002",
    name: "A Sombra Illuminada",
    description: "A luz revela o que estava oculto nas sombras, integrando todas as partes de você.",
    message: "Explore seus cantos escuros com compaixão. Eles são parte da sua totalidade.",
    affirmation: "Eu aceito todas as partes de mim mesma, até as que prefiro não ver.",
    theme: "shadow-work",
  },
  {
    id: "oracle-003",
    name: "O Elo Ancestral",
    description: "Conexão com gerações passadas, sabedoria que血脉相传 através do tempo.",
    message: "Você carrega a força dos seus ancestrais. Permita que guiem seus passos.",
    affirmation: "Eu honro meus ancestrais e absorvo a sabedoria que eles desejam compartilhar.",
    theme: "ancestry",
  },
  {
    id: "oracle-004",
    name: "A Intuição Sagrada",
    description: "A voz interior se torna clara quando você aprende a escutar.",
    message: "Sua intuição fala em sussurros. Faça silêncio para ouvi-la.",
    affirmation: "Eu confio na minha voz interior e a deixo guiar minhas decisões.",
    theme: "intuition",
  },
  {
    id: "oracle-005",
    name: "A Árvore da Vida",
    description: "Raízes profundas se conectam com a terra enquanto galhos tocam o céu.",
    message: "Você está fundamentado e conectado. Seu crescimento é inevitável.",
    affirmation: "Eu sou uma expressão única da vida, enraizado e em expansão constante.",
    theme: "grounding",
  },
  {
    id: "oracle-006",
    name: "O Espelho",
    description: "Reflexo da alma mostra verdades ocultas e potenciais adormecidos.",
    message: "O que você vê no espelho é uma projeção do seu estado interior.",
    affirmation: "Eu me olho com amor e aceitação, vendo minha verdadeira essência.",
    theme: "self-reflection",
  },
  {
    id: "oracle-007",
    name: "A Lua",
    description: "Ciclos lunares governam emoções e mistérios do inconsciente.",
    message: "Honre seus ciclos emocionais. Eles são naturais e necessários.",
    affirmation: "Eu fluo com os ciclos da lua, aceitando todas as fases de mim.",
    theme: "cycles",
  },
  {
    id: "oracle-008",
    name: "A Estrela",
    description: "Luz eterna que guia através das noites mais escuras.",
    message: "Mesmo quando tudo parece perdido, há uma estrela esperando por você.",
    affirmation: "Eu sou a luz que brilha nas horas mais escuras, inabalável e presente.",
    theme: "hope",
  },
  {
    id: "oracle-009",
    name: "O Caminho",
    description: "Estrada sinuosa que leva ao centro de si mesmo.",
    message: "Não há atalhos. O caminho é a experiência, e a experiência é o destino.",
    affirmation: "Eu abraço cada passo da minha jornada, confiando na direção que surge.",
    theme: "journey",
  },
  {
    id: "oracle-010",
    name: "A Flor",
    description: "Beleza efêmera que guarda a essência da criação.",
    message: "Permita-se florescer. Sua beleza é uma dádiva para o mundo.",
    affirmation: "Eu me abro para receber e dar beleza, sabendo que sou suficiente.",
    theme: "beauty",
  },
  {
    id: "oracle-011",
    name: "O Vale",
    description: "Depression profound where treasures are found in stillness.",
    message: "Nos vales da vida, encontramos as fontes mais profundas de força.",
    affirmation: "Eu honro os vales da minha vida como espaços de descoberta interior.",
    theme: "resilience",
  },
  {
    id: "oracle-012",
    name: "A Montanha",
    description: "Elevação que oferece perspectiva e clareza de visão.",
    message: "Suba para ter uma visão mais ampla. Você verá além das atuais limitações.",
    affirmation: "Eu me elevo acima dos problemas do momento para ver o padrão maior.",
    theme: "perspective",
  },
  {
    id: "oracle-013",
    name: "A Fênix",
    description: "Ressurreição das cinzas, renascimento através da transformação.",
    message: "O que precisa morrer para que algo novo nasça em você?",
    affirmation: "Eu renasço de minhas próprias cinzas, mais forte e mais luminoso.",
    theme: "transformation",
  },
  {
    id: "oracle-014",
    name: "O Rio",
    description: "Fluxo constante que carrega águas antigas e promises novas.",
    message: "Siga o fluxo. A correnteza conhece o caminho que você ainda não vê.",
    affirmation: "Eu me permito ser carregado pela correnteza da vida, confiando no fluxo.",
    theme: "flow",
  },
  {
    id: "oracle-015",
    name: "A Semente",
    description: "Potencial contido no silêncio, esperando o momento certo para brotar.",
    message: "Algo está germinando no silêncio. Tenha paciência com seu crescimento.",
    affirmation: "Eu nutro as sementes da minha intenção com fé e paciência.",
    theme: "potential",
  },
  {
    id: "oracle-016",
    name: "O Portal",
    description: "Passagem entre mundos, umbral que transforma ao ser cruzado.",
    message: "Um portal se abre. Você pode escolher cruzá-lo ou não. Ambos são válidos.",
    affirmation: "Eu atravesso portais com coragem, aceitando as transformações que vêm.",
    theme: "transition",
  },
  {
    id: "oracle-017",
    name: "A Chama",
    description: "Fogo interior que nunca se apaga, paixão e propósito ardente.",
    message: "Sua chama interior nunca morreu. Ela apenas esperava ser reconhecida.",
    affirmation: "Eu alimento minha chama interior com propósito e paixão ardente.",
    theme: "passion",
  },
  {
    id: "oracle-018",
    name: "A Caverna",
    description: "Espaço íntimo de meditação onde tesouros ocultos aguardam.",
    message: "Vá para dentro. Nos recessos mais profundos, você encontrará respostas.",
    affirmation: "Eu me retiro para o silêncio da minha caverna interior para ouvir.",
    theme: "contemplation",
  },
  {
    id: "oracle-019",
    name: "A Tempestade",
    description: "Turbilhão que purifica e transforma paisagens e pensamentos.",
    message: "A tempestade vai passar. Permaneça centrado enquanto ela passa.",
    affirmation: "Eu permito que a tempestade passe através de mim, mantendo minha paz.",
    theme: "purification",
  },
  {
    id: "oracle-020",
    name: "O Arco-íris",
    description: "Ponte entre céu e terra, promessa de que melhoras virão.",
    message: "Após a tempestade, o arco-íris. Ele sempre aparece quando você espera menos.",
    affirmation: "Eu sou a ponte entre meu estado atual e minha visão do possível.",
    theme: "promise",
  },
  {
    id: "oracle-021",
    name: "A Maré",
    description: "Movimento cíclico de avanço e recuo, sucesso e descanso.",
    message: "Honre o ritmo da maré. Nem tudo precisa ser ação constante.",
    affirmation: "Eu fluo com a maré da vida, descansando quando necessário.",
    theme: "rhythm",
  },
  {
    id: "oracle-022",
    name: "O Espelho d'Água",
    description: "Reflexão perfeita que mostra verdades sem julgamento.",
    message: "Olhe para a água. O que você vê é um espelho do seu estado de espírito.",
    affirmation: "Eu observo minhas reflexões com compaixão e aceitação.",
    theme: "clarity",
  },
  {
    id: "oracle-023",
    name: "A Ponte",
    description: "Conexão entre margens, união de opostos aparentemente irreconciliáveis.",
    message: "Uma ponte pode ser construída onde parecia impossível. Você é essa ponte.",
    affirmation: "Eu sou a ponte que conecta diferentes partes da minha experiência.",
    theme: "connection",
  },
  {
    id: "oracle-024",
    name: "A Noite Estrelada",
    description: "Escuro profundo pontilhado de luz, mistério e infinidade.",
    message: "No escuro, as estrelas são mais visíveis. Você é uma estrela.",
    affirmation: "Eu brilho mesmo na escuridão, porque a luz é minha natureza.",
    theme: "infinity",
  },
  {
    id: "oracle-025",
    name: "O Labirinto",
    description: "Caminho intrincado que leva ao centro e retorna transformado.",
    message: "O labirinto não é para ser escapado. É para ser percorrido com atenção.",
    affirmation: "Eu navego pelo labirinto da minha mente com paciência e curiosidade.",
    theme: "inner-work",
  },
  {
    id: "oracle-026",
    name: "A Fonte",
    description: "Nascente de águas puras, origem de tudo que flui.",
    message: "Você é uma fonte inesgotável. Nunca seque, apenas espere.",
    affirmation: "Eu permito que águas puras fluam através de mim, renovando minha essência.",
    theme: "source",
  },
  {
    id: "oracle-027",
    name: "O Vento",
    description: "Força invisível que move, carrega e transforma.",
    message: "O vento traz mudanças. Deixe que ele leve o que não serve mais.",
    affirmation: "Eu me abro para as mudanças que o vento traz, confiando em sua sabedoria.",
    theme: "change",
  },
  {
    id: "oracle-028",
    name: "A Raiz",
    description: "Conexão com a terra-mãe, base que sustenta toda existência.",
    message: "Volte às suas raízes. Elas são a fonte da sua força.",
    affirmation: "Eu me conexiono profundamente com minhas raízes, ganhando estabilidade.",
    theme: "foundation",
  },
  {
    id: "oracle-029",
    name: "O Abismo",
    description: "Espaço profundo de transformação onde o ego se dissolve.",
    message: "O abismo não é seu inimigo. Ele é onde você encontra seu verdadeiro eu.",
    affirmation: "Eu desço ao abismo com coragem, sabendo que lá encontrarei minha verdade.",
    theme: "surrender",
  },
  {
    id: "oracle-030",
    name: "A Coroa",
    description: "Luz dourada que emana do topo, liderança espiritual.",
    message: "Você foi ungido com sabedoria. Use sua coroa para servir.",
    affirmation: "Eu portando minha coroa com humildade, servindo ao bem maior.",
    theme: "sovereignty",
  },
  {
    id: "oracle-031",
    name: "O Espelho Quebrado",
    description: "Fragmentos que refletem múltiplas versões de uma mesma verdade.",
    message: "Cada fragmento mostra uma parte da verdade. Junte-os todos.",
    affirmation: "Eu colho os fragmentos do meu ser para ver a imagem completa.",
    theme: "integration",
  },
  {
    id: "oracle-032",
    name: "A Jornada Noturna",
    description: "Travessia pelo escuro onde a alma encontra seus medos e vence.",
    message: "A noite mais escura precede o amanhecer mais brilhante.",
    affirmation: "Eu atravesso a noite com fé, sabendo que o amanhecer virá.",
    theme: "night-journey",
  },
  {
    id: "oracle-033",
    name: "O Altar",
    description: "Espaço sagrado onde oferendas são feitas e pedidos são concedidos.",
    message: "Construa seu altar com intención. Nele, suas preces serão ouvidas.",
    affirmation: "Eu crio um espaço sagrado onde posso me conectar com o divino.",
    theme: "altar",
  },
  {
    id: "oracle-034",
    name: "A Manta",
    description: "Cobertura reconfortante que aquece e protege nas horas frias.",
    message: "Você está envolvido por amor. Sinta a manta como um abraço.",
    affirmation: "Eu me embrulho na manta do amor divino, aquecido e seguro.",
    theme: "comfort",
  },
  {
    id: "oracle-035",
    name: "A Memória",
    description: "Guardiã do passado que liberta ou aprisiona conforme a intenção.",
    message: "Honre suas memórias, mas não seja escravo delas. Solte o que precisa ir.",
    affirmation: "Eu honro minhas memórias sem deixar que elas me definam.",
    theme: "memory",
  },
  {
    id: "oracle-036",
    name: "A Alvorada",
    description: "Primeira luz que surge no horizonte, promessa de um novo dia.",
    message: "A alvorada chega para todos. Sua vez está chegando.",
    affirmation: "Eu saúdo cada alvorada com gratidão, antecipando as bênçãos do dia.",
    theme: "new-beginning",
  },
];

/**
 * Get all oracle cards as a deck
 */
export function getOracleCards(): OracleDeck {
  return {
    cards: ORACLE_CARDS,
  };
}

/**
 * Get all oracle cards as a flat array
 */
export function getAllOracleCards(): OracleCard[] {
  return ORACLE_CARDS;
}

/**
 * Get a specific card by id
 */
export function getOracleCardById(id: string): OracleCard | undefined {
  return ORACLE_CARDS.find(card => card.id === id);
}

/**
 * Get a random oracle card
 */
export function getRandomOracleCard(): OracleCard {
  return ORACLE_CARDS[Math.floor(Math.random() * ORACLE_CARDS.length)];
}

/**
 * Get cards by theme
 */
export function getOracleCardsByTheme(theme: string): OracleCard[] {
  return ORACLE_CARDS.filter(card => card.theme === theme);
}
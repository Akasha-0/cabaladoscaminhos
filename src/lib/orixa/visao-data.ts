// @ts-nocheck
// SKIP_LINT

/**
 * Visão Data Module
 * Spiritual vision data integrating Orixá wisdom with prophetic sight and insight
 */

export interface VisãoData {
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
  visionTypes: string[];
  channelingMethods: string[];
  temples: string[];
  offerings: string[];
  chants: string[];
  meditation: string;
  affirmation: string;
  sacredObjects: string[];
  forbiddenPractices: string[];
  signs: string[];
  omens: string[];
  rituals: {
    opening: string[];
    closing: string[];
    strengthening: string[];
    protection: string[];
  };
  divination: {
    tools: string[];
    methods: string[];
    interpretations: string[];
  };
  healing: {
    mental: string[];
    spiritual: string[];
    emotional: string[];
  };
  warnings: string[];
  blessings: string[];
  seasons: {
    dormant: string;
    awakening: string;
    peak: string;
    declining: string;
  };
  compatiblePractices: string[];
  incompatiblePractices: string[];
  mythology: string;
  spiritualLesson: string;
  messages: string[];
}

const VISÃO_DATA: VisãoData[] = [
  {
    id: "visao-oxala",
    name: "Visão de Oxalá",
    orisha: "Oxalá",
    element: "Luz",
    type: "Transcendental",
    associatedOrishas: ["Oxum", "Iemanjá", "Orunmilá"],
    colors: ["Branco", "Dourado", "Prata"],
    symbols: ["Cruz de Ifá", "Alabastro", "Pombos"],
    dayOfWeek: "Sexta-feira",
    offeringTime: "Manhã cedo",
    conditions: ["Pureza mental", "Corpo limpo", "Intenção sagrada"],
    powers: ["Clareza interior", "Guia divina", "Proteção da alma", "Sabedoria eterna"],
    characteristics: ["Iluminação", "Paz interior", "Sabedoria", "Misericórdia", "Verdade"],
    visionTypes: ["Visão do Criador", "Luz primordial", "Clareza absoluta"],
    channelingMethods: ["Oração silenciosa", "Meditação com alabastro", "Canto de oriki"],
    temples: ["Ebá", "Sala de orixá", "Espaços com luz natural"],
    offerings: ["Akará", "Era", "Pão branco", "Água de obi"],
    chants: ["Ora ô ô xalá", "Oxalá ogunheê", "Eleda mi o"],
    meditation: "Sente-se em paz, visualize uma luz branca envolvendo seu terceiro olho. Peça a Oxalá que abra sua visão para a verdade.",
    affirmation: "Eu sou luz, eu sou paz, eu sou guiado pela sabedoria divina de Oxalá.",
    sacredObjects: ["Alabastro", "Cruz de Ifá", "Panos brancos"],
    forbiddenPractices: ["Mentira", "Desonestidade", "Superficialidade"],
    signs: ["Luz dourada", "Pássaros brancos", "Paz inexplicável"],
    omens: ["Sonhos com luz branca", "Paz interior repentina"],
    rituals: {
      opening: ["Ablade com água de obi", "Reze para Oxalá", "Carregue alabastro"],
      closing: ["Agradeça a Oxalá", "Guarde o alabastro", "Lave as mãos"],
      strengthening: ["Jejum semanal", "Oração ao amanhecer", "Ofereça akará nas sextas"],
      protection: ["Use branco", "Evite conflitos", "Mantenha a paz"]
    },
    divination: {
      tools: ["Opon", "EkODARA", "Merindilogun"],
      methods: ["Leitura de Opón Ifá", "Interpretação de sonhos", "Meditação sagrada"],
      interpretations: ["Luz significa aprovação", "Paz indica proteção"]
    },
    healing: {
      mental: ["Medite em paz", "visualize luz branca"],
      spiritual: ["Ore para Oxalá", "Pratique misericórdia"],
      emotional: ["Busque reconciliação", "Perdoe"]
    },
    warnings: ["Evite orgulho", "Não superestime sua visão"],
    warnings: ["Evite orgulho", "Não superestime sua visão"],
    blessings: ["Sabedoria", "Paz", "Proteção divina"],
    seasons: {
      dormant: "Durante períodos de confusão",
      awakening: "Ao amanhecer de novos começos",
      peak: "Sextas-feiras",
      declining: "Quando a ego se manifesta"
    },
    compatiblePractices: ["Meditação", "Oração", "Estudo das escrituras"],
    incompatiblePractices: ["Manipulação", "Falsidade", "Orgulho"],
    mythology: "Oxalá é o Criador supremo, o pai de todos os orixás. Sua visão é a mais pura, alcançando os segredos do início de tudo.",
    spiritualLesson: "A verdadeira visão vem da pureza do coração e da intenção sagrada.",
    messages: ["Você está protegido", "A verdade será revelada", "Siga com fé"]
  },
  {
    id: "visao-oyemanjá",
    name: "Visão de Iemanjá",
    orisha: "Iemanjá",
    element: "Água",
    type: "Profundo",
    associatedOrishas: ["Oxalá", "Oxum", "Ogum"],
    colors: ["Azul", "Branco", "Rosa"],
    symbols: ["Espelho", "Conchas", "Mar"],
    dayOfWeek: "Sábado",
    offeringTime: "Noite",
    conditions: ["Respeito à água", "Intuição aberta", "Escuta interior"],
    powers: ["Visão do destino", "Proteção maternal", "Intuição profunda", "Memória cósmica"],
    characteristics: ["Profundidade", "Maternalidade", "Mistério", "Transformação", "Ciclicidade"],
    visionTypes: ["Visão das águas", "Intuição de mar", "Memórias ancestrais"],
    channelingMethods: ["Meditação à beira d'água", "Canto de iyawó", "Sessões de água sagrada"],
    temples: ["Praia", "Beira de rio", "Santuários de Iemanjá"],
    offerings: ["Milho", "Canela", "Flores brancas", "Perfume"],
    chants: ["Iemanjá O", "Odò iyá", "Omo ale"],
    meditation: "Imagine-se nas profundezas do oceano. Deixe a água revelar seus segredos ocultos. Iemanjá fala através das ondas.",
    affirmation: "Eu sou as águas profundas, eu carrego a sabedoria dos oceanos.",
    sacredObjects: ["Espelho", "Conchas do mar", "Pérolas"],
    forbiddenPractices: ["Superficialidade", "Rejeição da emoção", "Crueldade"],
    signs: ["Ondas calmas", "Lua cheia", "Espelhos que não mancham"],
    omens: ["Sons de mar em sonhos", "Água que flui sem explicação"],
    rituals: {
      opening: ["Lave o rosto com água do mar", "Agradeça a Iemanjá", "Acenda vela azul"],
      closing: ["Ofereça flores ao mar", "Agradeça a proteção", "Guarde uma concha"],
      strengthening: ["Mergulhe simbolicamente", "Visite o mar", "Ofereça milho na beira"],
      protection: ["Use azul nas sextas", "Evite conflitos à noite", "Honre sua mãe"]
    },
    divination: {
      tools: ["Búzios", "Mar", "Espelho"],
      methods: ["Jogo de búzios", "Interpretação de água", "Leitura de dreams"],
      interpretations: ["Água calma indica aprovação", "Água agitada indica transformação necessária"]
    },
    healing: {
      mental: ["Mergulhe em águas profundas", "Ouça sua intuição"],
      spiritual: ["Honre a ciclos femininos", "Pratique auto-carinho"],
      emotional: ["Chore quando precisar", "Honre suas emoções"]
    },
    warnings: ["Não ignore sua intuição", "Não rejeite sua maternalidade"],
    blessings: ["Intuição poderosa", "Proteção maternal", "Sabedoria das águas"],
    seasons: {
      dormant: "Quando você ignora suas emoções",
      awakening: "No início de novos ciclos",
      peak: "Lua cheia",
      declining: "Quando a superficialidade domina"
    },
    compatiblePractices: ["Intuição", "Ciclicidade", "Sanguefemínea"],
    incompatiblePractices: ["Racionalização extrema", "Rejeição da emoção"],
    mythology: "Iemanjá é a rainha do mar, a mãe de todos os orixás. Sua visão alcança os caminhos do destino e revela o que está oculto nas profundezas.",
    spiritualLesson: "A verdadeira visão vem quando você honra suas emoções e mergulha nas profundezas de sua alma.",
    messages: ["Mergulhe mais fundo", "Confie em sua intuição", "Você é protegida"]
  },
  {
    id: "visao-oxum",
    name: "Visão de Oxum",
    orisha: "Oxum",
    element: "Água doce",
    type: "Iluminado",
    associatedOrishas: ["Oxalá", "Iemanjá", "Logunedé"],
    colors: ["Dourado", "Amarelo", "Azul claro"],
    symbols: ["Abano", "Espelho de mão", "Água corrente"],
    dayOfWeek: "Sábado",
    offeringTime: "Manhã",
    conditions: ["Beleza interior", "Amor próprio", "Prosperidade sagrada"],
    powers: ["Visão da abundancia", "Charme magnético", "Sabedoria financeira", "Amor divino"],
    characteristics: ["Beleza", "Prosperidade", "Charme", "Sensibilidade", "Elegância"],
    visionTypes: ["Visão dourada", "Prosperidade", "Beleza interior"],
    channelingMethods: ["Banho de Oxum", "Canto de iyawó", "Oração com abano"],
    temples: ["Cachoeiras", "Rios", "Santuários de Oxum"],
    offerings: ["Mel", "Canela", "Flores amarelas", "Ouro"],
    chants: ["Oxum oo", "Iê iê Oxum", "Oxum afins"],
    meditation: "Visualize água dourada fluindo sobre você. Oxum revela a beleza oculta em cada situação e a abundância disponível.",
    affirmation: "Eu sou próspero, eu sou belo, eu sou abençoado por Oxum.",
    sacredObjects: ["Abano de Oxum", "Espelho de mão", "Colares dourados"],
    forbiddenPractices: ["Inveja", "Mesquinhez", "vaidade vazia"],
    signs: ["Água dourada", "Borboletas amarelas", "Sorrisos espontâneos"],
    omens: ["Ver dourado em sonhos", "Sensação de beleza inexplicável"],
    rituals: {
      opening: ["Banho de Oxum", "Aplique perfume doce", "Agradeça a Oxum"],
      closing: ["Guarde o abano", "Agradeça a prosperidade", "Lave-se"],
      strengthening: ["Ofereça mel nas sextas", "Visite cachoeiras", "Dança sagrada"],
      protection: ["Use amarelo e dourado", "Evite inveja", "Honre a beleza"]
    },
    divination: {
      tools: ["Opon", "Mel", "Água"],
      methods: ["Jogo de búzios", "Interpretação de mel", "Leitura de água doce"],
      interpretations: ["Doçura indica bênção", "Dourado indica prosperidade"]
    },
    healing: {
      mental: ["Visualize abundância", "Honre sua beleza interior"],
      spiritual: ["Pratique amor próprio", "Ofereça mel a Oxum"],
      emotional: ["Permita-se ser amado", "Valorize-se"]
    },
    warnings: ["Evite inveja", "Não confunda vaidade com auto-estima"],
    blessings: ["Prosperidade", "Charme", "Beleza", "Amor"],
    seasons: {
      dormant: "Quando você se sente indigno",
      awakening: "Ao buscar prosperidade",
      peak: "Dias de Oxum",
      declining: "Quando a inveja domina"
    },
    compatiblePractices: ["Auto-estima", "Prosperidade consciente", "Beleza sagrada"],
    incompatiblePractices: ["Inveja", "Mesquinhez", "Auto-rejeição"],
    mythology: "Oxum é a amante do ouro, a deusa da prosperidade e da beleza. Sua visão revela a abundância oculta e transforma o comum em extraordinário.",
    spiritualLesson: "A verdadeira visão reconhece a beleza em tudo e a abundância em todos.",
    messages: ["Você é digno de prosperidade", "A abundância é seu direito", "Brilhe com luz dourada"]
  },
  {
    id: "visao-oxossi",
    name: "Visão de Oxossi",
    orisha: "Oxossi",
    element: "Floresta",
    type: "Caçador",
    associatedOrishas: ["Oxalá", "Ogum", "Iansã"],
    colors: ["Azul", "Verde", "Marrom"],
    symbols: ["Arco", "Flechas", "Mato"],
    dayOfWeek: "Quarta-feira",
    offeringTime: "Tarde",
    conditions: ["Busca constante", "Observação atenta", "Liberdade interior"],
    powers: ["Visão longínqua", "Busca da verdade", "Sobrevivência", "Conhecimento salvaje"],
    characteristics: ["Liberdade", "Justiça", "Verdade", "Caça", "Conhecimento"],
    visionTypes: ["Visão do caçador", "Busca infinita", "Conhecimento salvaje"],
    channelingMethods: ["Caminhada na mata", "Meditação com arco", "Oração antes da busca"],
    temples: ["Floresta", "Mata", "Santuários de caça"],
    offerings: ["Eira", "Pito", "Flechas", "Comida de caça"],
    chants: ["Oxossi O", "Ogunhê Oxossi", "Caçador do mato"],
    meditation: "Sinta a floresta ao seu redor. Oxossi vê além das árvores e revela o caminho oculto através da vegetação densa.",
    affirmation: "Eu sou livre como o vento, eu encontro meu caminho na escuridão.",
    sacredObjects: ["Arco", "Flechas", "Pena de ave"],
    forbiddenPractices: ["Fuga da verdade", "Permanência na ignorância", "Crueldade desnecessária"],
    signs: ["Aves voando em V", "Caminhos abertos", "Animais cruzando"],
    omens: ["Sons de floresta em sonhos", "Animais aparecem"],
    rituals: {
      opening: ["Enterre pito na mata", "Agradeça a Oxossi", "Carregue flecha"],
      closing: ["Ofereça comida à floresta", "Agradeça a caça", "Guarde uma pena"],
      strengthening: ["Caminhe na mata", "Pratique observação", "Ofereça pito às quartas"],
      protection: ["Use verde e azul", "Evite fugir da verdade", "Busque conhecimento"]
    },
    divination: {
      tools: ["Opon", "Arco e flechas", "Penas"],
      methods: ["Leitura de pistas", "Interpretação de caminhos", "Observação de animais"],
      interpretations: ["Caminho aberto indica sucesso", "Animais indicam mensagens"]
    },
    healing: {
      mental: ["Busque conhecimento", "Caminhe na natureza"],
      spiritual: ["Pratique observação", "Honre a liberdade"],
      emotional: ["Encare a verdade", "Não fuja de desafios"]
    },
    warnings: ["Não ignore sinais", "Não fuja da verdade"],
    blessings: ["Conhecimento", "Liberdade", "Justiça", "Sucesso na busca"],
    seasons: {
      dormant: "Quando você evita a verdade",
      awakening: "Ao iniciar uma busca",
      peak: "Quartas-feiras",
      declining: "Quando a ignorância é preferida"
    },
    compatiblePractices: ["Estudo", "Observação", "Liberdade"],
    incompatiblePractices: ["Ignorância deliberada", "Fuga de desafios"],
    mythology: "Oxossi é o caçador divino, o senhor da floresta. Sua visão alcança os cantos mais distantes da mata e encontra a verdade onde outros veem apenas escuridão.",
    spiritualLesson: "A verdadeira visão requer busca constante e disposição para encontrar a verdade.",
    messages: ["O caminho se abre", "A verdade está à sua frente", "Siga com coragem"]
  },
  {
    id: "visao-ogum",
    name: "Visão de Ogum",
    orisha: "Ogum",
    element: "Ferro",
    type: "Conquistador",
    associatedOrishas: ["Oxalá", "Oxossi", "São Jorge"],
    colors: ["Vermelho", "Laranja", "Preto"],
    symbols: ["Espada", "Escudo", "Ferramentas"],
    dayOfWeek: "Terça-feira",
    offeringTime: "Qualquer hora",
    conditions: ["Determinação", "Coragem", "Vontade de ferro"],
    powers: ["Visão da batalha", "Conquista", "Proteção", "Vencedor"],
    characteristics: ["Força", "Coragem", "Determinação", "Conquista", "Proteção"],
    visionTypes: ["Visão do guerreiro", "Estratégia", "Vitória"],
    channelingMethods: ["Oração antes da batalha", "Ferramentas sagradas", "Canto de ogum"],
    temples: ["Ferreira", "Oficina", "Santuários de Ogum"],
    offerings: ["Espada de ferro", "Galinha", "Palanquim", "Fio de ferro"],
    chants: ["Ogum O", "Ogum de ferro", "Ogum Maculele"],
    meditation: "Sinta o ferro em suas mãos. Ogum revela o caminho da vitória e a estratégia para superar obstáculos.",
    affirmation: "Eu sou forte como o ferro, eu conquisto meus objetivos.",
    sacredObjects: ["Espada", "Chave", "Ferramentas de ferro"],
    forbiddenPractices: ["Covardia", "Desistência", "Fraqueza deliberada"],
    signs: ["Ferro brilhando", "Espadas cruzadas", "Força inexplicável"],
    omens: ["Sonhos de batalha", "Força aparece"],
    rituals: {
      opening: ["Pegue uma chave", "Ore para Ogum", "Carregue ferro"],
      closing: ["Agradeça a vitória", "Guarde a espada", "Limpe as ferramentas"],
      strengthening: ["Use ferramentas", "Ofereça ferro às terças", "Conquiste desafios"],
      protection: ["Use vermelho e preto", "Evite covardia", "Lute pelo que é certo"]
    },
    divination: {
      tools: ["Opon", "Espada", "Ferramentas"],
      methods: ["Leitura de batalha", "Interpretação de ferramentas", "Estratégia"],
      interpretations: ["Ferrro quente indica vitória", "Espada erguida indica conquista"]
    },
    healing: {
      mental: ["Visualize vitória", "Determine-se"],
      spiritual: ["Ore para Ogum", "Use ferramentas sagradas"],
      emotional: ["Lute por você mesmo", "Não desista"]
    },
    warnings: ["Não fuja da batalha", "Evite indecisão"],
    blessings: ["Força", "Coragem", "Vitória", "Proteção"],
    seasons: {
      dormant: "Quando você evita batalhas",
      awakening: "Ao enfrentar desafios",
      peak: "Terças-feiras",
      declining: "Quando a covardia domina"
    },
    compatiblePractices: ["Determinação", "Coragem", "Estratégia"],
    incompatiblePractices: ["Covardia", "Desistência", "Fraqueza"],
    mythology: "Ogum é o guerreiro divino, o senhor do ferro e das batalhas. Sua visão revela o caminho da vitória e a estratégia para superar qualquer obstáculo.",
    spiritualLesson: "A verdadeira visão é a capacidade de ver a batalha antes que ela comece e vencê-la.",
    messages: ["A vitória é sua", "Lute com coragem", "Ogum está com você"]
  },
  {
    id: "visao-xango",
    name: "Visão de Xangô",
    orisha: "Xangô",
    element: "Fogo",
    type: "Tempestade",
    associatedOrishas: ["Oxalá", "Iansã", "Obá"],
    colors: ["Vermelho", "Branco", "Preto"],
    symbols: ["Machado de dois gumes", "Pedra de raio", "Trovão"],
    dayOfWeek: "Quarta-feira",
    offeringTime: "Tarde da noite",
    conditions: ["Justiça", "Coragem", "Transformação"],
    powers: ["Visão do trovão", "Transformação", "Justiça divina", "Tempestade"],
    characteristics: ["Força", "Justiça", "Transformação", "Orgulho", "Dignidade"],
    visionTypes: ["Visão do trovão", "Tempestade", "Raio"],
    channelingMethods: ["Oração durante tempestade", "Ritual de fogo", "Canto de Xangô"],
    temples: ["Casa de Santo", "Fogueira", "Santuários de Xangô"],
    offerings: ["Galinha", "Amendoim", "Massa", "Pedra de raio"],
    chants: ["Xangô O", "Oruko Xangô", "Xangô Ayra"],
    meditation: "Ouça o trovão. Xangô revela a verdade com a força de um raio e transforma situações com a intensidade de uma tempestade.",
    affirmation: "Eu sou justo como Xangô, eu transformo a escuridão em luz.",
    sacredObjects: ["Machado de dois gumes", "Pedra de raio", "Baiano"],
    forbiddenPractices: ["Injustiça", "Desonestidade", "Fraude"],
    signs: ["Raio", "Trovão", "Fogo espontâneo"],
    omens: ["Tempestade durante oração", "Pedras aparecem"],
    rituals: {
      opening: ["Acenda fogo", "Ore durante trovão", "Levante o machado"],
      closing: ["Agradeça a justiça", "Guarde a pedra", "Limpe o machado"],
      strengthening: ["Pratique justiça", "Ofereça amendoim às quartas", "Transforme situações"],
      protection: ["Use vermelho e branco", "Evite injustiça", "Lute pela verdade"]
    },
    divination: {
      tools: ["Opon", "Machado", "Pedra de raio"],
      methods: ["Leitura de tempestade", "Interpretação de raios", "Fogo divino"],
      interpretations: ["Raio indica verdade revelada", "Trovão indica transformação"]
    },
    healing: {
      mental: ["Visualize raios", "Transforme pensamentos"],
      spiritual: ["Ore para Xangô", "Pratique justiça"],
      emotional: ["Lute pelo que é certo", "Não tolere injustiça"]
    },
    warnings: ["Evite injustiça", "Não fraudule"],
    blessings: ["Justiça", "Transformação", "Força", "Verdade"],
    seasons: {
      dormant: "Quando a injustiça impera",
      awakening: "Ao buscar verdade",
      peak: "Tempestades",
      declining: "Quando a fraude se instala"
    },
    compatiblePractices: ["Justiça", "Transformação", "Coragem"],
    incompatiblePractices: ["Fraude", "Injustiça", "Covardia"],
    mythology: "Xangô é o deus do trovão e da justiça. Sua visão revela a verdade com a força de um raio e transforma situações com a intensidade de uma tempestade.",
    spiritualLesson: "A verdadeira visão exige coragem para revelar a verdade e força para transformar.",
    messages: ["A verdade será revelada", "Tempestade está chegando", "Justiça será feita"]
  },
  {
    id: "visao-iansa",
    name: "Visão de Iansã",
    orisha: "Iansã",
    element: "Tempestade",
    type: "Rajada",
    associatedOrishas: ["Xangô", "Ogum", "Oxossi"],
    colors: ["Vermelho", "Laranja", "Amarelo"],
    symbols: ["Leque", "Espada", "Vento"],
    conditions: ["Determinação", "Adaptabilidade", "Velocidade"],
    powers: ["Visão do vento", "Adaptação", "Comunicação", "Tempestade"],
    characteristics: ["Velocidade", "Adaptabilidade", "Comunicação", "Assertividade", "Libertação"],
    visionTypes: ["Visão do vento", "Rajada", "Mudança rápida"],
    channelingMethods: ["Ritual ao vento", "Dança de Iansã", "Canto de rajada"],
    temples: ["Telhado", "Lugares altos", "Santuários de Iansã"],
    offerings: ["Galinha", "Massa", "Pepino", "Velas vermelhas"],
    chants: ["Iansã O", "Orixá storm", "Iansã Makan"],
    meditation: "Sinta o vento. Iansã revela mudanças rápidas e o caminho através da tempestade.",
    affirmation: "Eu sou livre como o vento, eu me adapto a todas as situações.",
    sacredObjects: ["Leque", "Espada", "Penas"],
    forbiddenPractices: ["Rigidez", "Imobilidade", "Medo"],
    signs: ["Vento forte", "Mudanças rápidas", "Penas voando"],
    omens: ["Rajadas durante oração", "Mudanças súbitas"],
    rituals: {
      opening: ["Sinta o vento", "Ore para Iansã", "Levante o leque"],
      closing: ["Agradeça a adaptação", "Guarde a pena", "Descanse"],
      strengthening: ["Mude com o vento", "Ofereça pepino às quartas", "Adapte-se"],
      protection: ["Use vermelho e laranja", "Evite rigidez", "Siga o fluxo"]
    },
    divination: {
      tools: ["Opon", "Leque", "Vento"],
      methods: ["Leitura de ventos", "Interpretação de mudanças", "Adaptação"],
      interpretations: ["Vento forte indica mudança", "Rajadas indicam oportunidade"]
    },
    healing: {
      mental: ["Visualize vento", "Mude pensamentos"],
      spiritual: ["Ore para Iansã", "Adapte-se ao divino"],
      emotional: ["Liberte-se", "Não se apegue"]
    },
    warnings: ["Evite rigidez", "Não se paralyze"],
    blessings: ["Adaptabilidade", "Comunicação", "Libertação", "Velocidade"],
    seasons: {
      dormant: "Quando a rigidez domina",
      awakening: "Ao mudar de situação",
      peak: "Tempestades",
      declining: "Quando a imobilidade se instala"
    },
    compatiblePractices: ["Adaptação", "Comunicação", "Flexibilidade"],
    incompatiblePractices: ["Rigidez", "Imobilidade", "Medo"],
    mythology: "Iansã é a deusa das tempestades e das mudanças rápidas. Sua visão revela o caminho através da confusão e a oportunidade na mudança.",
    spiritualLesson: "A verdadeira visão é a capacidade de se adaptar rapidamente e encontrar o caminho através da tempestade.",
    messages: ["Mudança está chegando", "Adapte-se rapidamente", "Libere-se"]
  },
  {
    id: "visao-orunmila",
    name: "Visão de Orunmilá",
    orisha: "Orunmilá",
    element: "Conhecimento",
    type: "Divinatório",
    associatedOrishas: ["Oxalá", "Ogbe", "Ifá"],
    colors: ["Verde", "Amarelo", "Branco"],
    symbols: ["Opón Ifá", "Colares de Ifá", "Ikó"],
    dayOfWeek: "Segunda-feira",
    offeringTime: "Manhã",
    conditions: ["Sabedoria", "Humildade", "Busca do conhecimento"],
    powers: ["Visão do destino", "Conhecimento sagrado", "Guia divino", "Divinação"],
    characteristics: ["Sabedoria", "Conhecimento", "Guia", "Destino", "Ifá"],
    visionTypes: ["Visão de Ifá", "Destino", "Conhecimento oculto"],
    channelingMethods: ["Leitura de Opón", "Odu de Ifá", "Oração sagrada"],
    temples: ["Casa de Ifá", "Opón Ifá", "Santuários de Orunmilá"],
    offerings: ["Kola", "Amendoim", "Coco", "Ekó"],
    chants: ["Orunmilá O", "Awo Ifá", "Olorun me"],
    meditation: "Abra o Opón Ifá. Orunmilá revela os caminhos do destino e o conhecimento oculto que guia todas as vidas.",
    affirmation: "Eu sou guiado pela sabedoria de Orunmilá, eu conheço meu destino.",
    sacredObjects: ["Opón Ifá", "Ikó", "Merindilogun"],
    forbiddenPractices: ["Arrogância", "Rejeição do conhecimento", "Ignorância deliberada"],
    signs: ["Kola no caminho", "Sinais de Ifá", "Sabedoria aparece"],
    omens: ["Sonhos com Opón", "Conhecimento chega"],
    rituals: {
      opening: ["Prepare o Opón", "Agradeça a Orunmilá", "Pense no destino"],
      closing: ["Guarde os ferramentas", "Agradeça a sabedoria", "Reflita"],
      strengthening: ["Estude Ifá", "Ofereça kola às segundas", "Busque conhecimento"],
      protection: ["Use verde e amarelo", "Evite arrogância", "Busque sabedoria"]
    },
    divination: {
      tools: ["Opón Ifá", "Ikó", "Merindilogun"],
      methods: ["Leitura de Odu", "Interpretação de signs", "Guia de destino"],
      interpretations: ["Kola indica aprovação", "Odu indica caminho do destino"]
    },
    healing: {
      mental: ["Estude Ifá", "Busque conhecimento"],
      spiritual: ["Ore para Orunmilá", "Pratique humildade"],
      emotional: ["Aceitos seu destino", "Não se rebele contra o destino"]
    },
    warnings: ["Evite arrogância", "Não rejeite conhecimento"],
    blessings: ["Sabedoria", "Conhecimento", "Guia do destino", "Divinação"],
    seasons: {
      dormant: "Quando a ignorância impera",
      awakening: "Ao buscar conhecimento",
      peak: "Segundas-feiras",
      declining: "Quando a arrogância domina"
    },
    compatiblePractices: ["Estudo", "Humildade", "Divinação"],
    incompatiblePractices: ["Arrogância", "Ignorância", "Rejeição de orientação"],
    mythology: "Orunmilá é o senhor de Ifá, o guardião do conhecimento sagrado. Sua visão alcança todos os caminhos do destino e revela o que foi, é e será.",
    spiritualLesson: "A verdadeira visão é o conhecimento do destino e a sabedoria para seguí-lo.",
    messages: ["Seu destino está claro", "Busque conhecimento", "Você será guiado"]
  },
  {
    id: "visao-obaluaie",
    name: "Visão de Obaluaiê",
    orisha: "Obaluaiê",
    element: "Doença",
    type: "Curador",
    associatedOrishas: ["Omolu", "Oxalá", "Xangô"],
    colors: ["Preto", "Vermelho", "Roxo"],
    symbols: ["Cabaça", "Palha", "Ramos"],
    dayOfWeek: "Segunda-feira",
    offeringTime: "Qualquer hora",
    conditions: ["Respeito à doença", "Reconhecimento da morte", "Humildade"],
    powers: ["Visão da cura", "Conhecimento da doença", "Transformação da morte", "Proteção de pragas"],
    characteristics: ["Cura", "Doença", "Morte", "Transformação", "Samaritano"],
    visionTypes: ["Visão da doença", "Cura", "Transformação"],
    channelingMethods: ["Ritual de cura", "Oração para Omolu", "Canto de cabaça"],
    temples: ["Cemitério", "Sala de doença", "Santuários de Obaluaiê"],
    offerings: ["Galinha preta", "Pão", "Água", "Palha"],
    chants: ["Obaluaiê O", "Omolu aye", "Orixá da doença"],
    meditation: "Reconheça a doença. Obaluaiê revela tanto a causa da doença quanto o caminho da cura.",
    affirmation: "Eu reconheço a doença e a cura, eu sou transformado por ambas.",
    sacredObjects: ["Cabaça", "Palha", "Ramos pretos"],
    forbiddenPractices: ["Orgulho", "Rejeição da doença", "Desrespeito à morte"],
    signs: ["Feridas se curam", "Doença desaparece", "Transformação ocorre"],
    omens: ["Sonhos com cabaça", "Doença se transforma"],
    rituals: {
      opening: ["Prepare a cabaça", "Ore para Obaluaiê", "Reconheça a doença"],
      closing: ["Agradeça a cura", "Guarde a palha", "Descanse"],
      strengthening: ["Honre a doença", "Ofereça pão às segundas", "Pratique humildade"],
      protection: ["Use preto e vermelho", "Evite orgulho", "Respeite a morte"]
    },
    divination: {
      tools: ["Opon", "Cabaça", "Palha"],
      methods: ["Leitura de doença", "Interpretação de feridas", "Caminho da cura"],
      interpretations: ["Ferida indica transformação", "Cura indica proteção"]
    },
    healing: {
      mental: ["Reconheça a doença", "Aceitos a transformação"],
      spiritual: ["Ore para Obaluaiê", "Honre a morte"],
      emotional: ["Não tenha medo da doença", "Pratique humildade"]
    },
    warnings: ["Evite orgulho", "Não rejeite a doença"],
    blessings: ["Cura", "Proteção de pragas", "Transformação", "Humildade"],
    seasons: {
      dormant: "Quando a doença não é reconhecida",
      awakening: "Ao buscar cura",
      peak: "Pandemias",
      declining: "Quando o orgulho domina"
    },
    compatiblePractices: ["Humildade", "Cura", "Transformação"],
    incompatiblePractices: ["Orgulho", "Rejeição da doença", "Desrespeito"],
    mythology: "Obaluaiê é o senhor das doenças e da cura. Sua visão revela tanto a causa da doença quanto o caminho da cura, transformando a morte em vida.",
    spiritualLesson: "A verdadeira visão reconhece que a doença é parte da vida e que a cura vem pela humildade.",
    messages: ["A cura está próxima", "Reconheça sua vulnerabilidade", "Transformação virá"]
  },
  {
    id: "visao-osun",
    name: "Visão de Osun",
    orisha: "Osun",
    element: "Proteção",
    type: "Guardiã",
    associatedOrishas: ["Olokun", "Oxalá", "Obatalá"],
    colors: ["Azul", "Dourado", "Verde"],
    symbols: ["Vaso de Osun", "Cordões", "Arrows"],
    dayOfWeek: "Domingo",
    offeringTime: "Qualquer hora",
    conditions: ["Proteção ativa", "Devoção", "Sangue doce"],
    powers: ["Visão da proteção", "Abençoar", "Guia", "Salvação"],
    characteristics: ["Proteção", "Salvação", "Guia", "Abençoar", "Devoção"],
    visionTypes: ["Visão protetora", "Salvação", "Abençoar"],
    channelingMethods: ["Ritual de Osun", "Canto de proteção", "Oração sagrada"],
    temples: ["Santuário de Osun", "Vaso de Osun", "Cordões sagrados"],
    offerings: ["Mel", "Canela", "Flores", "Velas azuis"],
    chants: ["Osun O", "Orixá salvadora", "Guardiã de todos"],
    meditation: "Peça proteção. Osun revela o caminho da salvação e abençoa aqueles que a chamam.",
    affirmation: "Eu sou protegido por Osun, eu sou abençoado e salvo.",
    sacredObjects: ["Vaso de Osun", "Cordões", "Mel"],
    forbiddenPractices: ["Desatenção à proteção", "Rejeição de ajuda", "Superficialidade espiritual"],
    signs: ["Proteção aparece", "Salvação acontece", "Cordões brilham"],
    omens: ["Sonhos com azul", "Proteção inexplicável"],
    rituals: {
      opening: ["Prepare o vaso", "Ore para Osun", "Abrace a proteção"],
      closing: ["Agradeça a salvação", "Guarde o vaso", "Limpe os cordões"],
      strengthening: ["Use cordões de Osun", "Ofereça mel aos domingos", "Pratique devoção"],
      protection: ["Use azul", "Evite desatenção", "Honre a proteção"]
    },
    divination: {
      tools: ["Opon", "Vaso", "Cordões"],
      methods: ["Leitura de proteção", "Interpretação de sinais", "Abençoar"],
      interpretations: ["Azul indica proteção", "Cordões indicam salvação"]
    },
    healing: {
      mental: ["Visualize proteção azul", "Confie na salvação"],
      spiritual: ["Ore para Osun", "Use cordões"],
      emotional: ["Permita-se ser protegido", "Não recuse ajuda"]
    },
    warnings: ["Evite desatenção", "Não rejeite proteção"],
    blessings: ["Proteção", "Salvação", "Guia", "Abençoar"],
    seasons: {
      dormant: "Quando a proteção é recusada",
      awakening: "Ao buscar salvação",
      peak: "Dias de Osun",
      declining: "Quando a superficialidade domina"
    },
    compatiblePractices: ["Proteção", "Devoção", "Gratidão"],
    incompatiblePractices: ["Desatenção", "Rejeição de ajuda", "Orgulho"],
    mythology: "Osun é a protetora divina, a salvadora de todos. Sua visão revela a proteção que está sempre disponível para aqueles que a chamam.",
    spiritualLesson: "A verdadeira visão é reconhecer que você é sempre protegido e guiado.",
    messages: ["Você está protegido", "Salvação está perto", "Confie em Osun"]
  },
  {
    id: "visao-elegua",
    name: "Visão de Elegua",
    orisha: "Elegua",
    element: "Caminho",
    type: "Abridor",
    associatedOrishas: ["Orunmilá", "Oxalá", "Todos os orixás"],
    colors: ["Vermelho", "Preto", "Branco"],
    symbols: ["Cadeado", "Chave", "Estatueta de Elegua"],
    dayOfWeek: "Segunda-feira",
    offeringTime: "Qualquer hora",
    conditions: ["Abertura de caminhos", "Reconhecimento do bloqueio", "Vontade de mudança"],
    powers: ["Visão dos caminhos", "Abertura", "Bloqueio", "Início"],
    characteristics: ["Abertura", "Bloqueio", "Início", "Mudança", "Liberdade"],
    visionTypes: ["Visão de caminhos", "Abertura", "Bloqueio"],
    channelingMethods: ["Ritual de abertura", "Canto de Elegua", "Oração com chave"],
    temples: ["Portas", "Cruzamentos", "Santuários de Elegua"],
    offerings: ["Coco", "Pão", "Mel", "Chave"],
    chants: ["Elegua O", "Abre caminhos", "Orixá bloqueador"],
    meditation: "Peça para abrir os caminhos. Elegua revela onde estão os bloqueios e como desbloqueá-los.",
    affirmation: "Eu abro meus caminhos com Elegua, eu sou livre para seguir meu destino.",
    sacredObjects: ["Cadeado", "Chave", "Estatueta"],
    forbiddenPractices: ["Medo de mudança", "Acomodação", "Aceitação do bloqueio"],
    signs: ["Portas se abrem", "Caminhos aparecem", "Chaves encontram"],
    omens: ["Sonhos com chaves", "Portas aparecem"],
    rituals: {
      opening: ["Gire a chave", "Ore para Elegua", "Reconheça o bloqueio"],
      closing: ["Agradeça a abertura", "Guarde a chave", "Siga em frente"],
      strengthening: ["Abra portas", "Ofereça coco às segundas", "Não acomode"],
      protection: ["Use vermelho e preto", "Evite medo de mudança", "Busque liberdade"]
    },
    divination: {
      tools: ["Opon", "Chave", "Cadeado"],
      methods: ["Leitura de caminhos", "Interpretação de portas", "Abertura"],
      interpretations: ["Chave indica oportunidade", "Porta aberta indica sucesso"]
    },
    healing: {
      mental: ["Visualize portas abrindo", "Identifique bloqueios"],
      spiritual: ["Ore para Elegua", "Peça abertura"],
      emotional: ["Não tenha medo de mudança", "Busque liberdade"]
    },
    warnings: ["Evite acomodação", "Não aceite bloqueios"],
    blessings: ["Abertura de caminhos", "Liberdade", "Início", "Mudança"],
    seasons: {
      dormant: "Quando bloqueios imperam",
      awakening: "Ao buscar mudança",
      peak: "Segundas-feiras",
      declining: "Quando a acomodação domina"
    },
    compatiblePractices: ["Mudança", "Abertura", "Liberdade"],
    incompatiblePractices: ["Medo de mudança", "Acomodação", "Aceitação passiva"],
    mythology: "Elegua é o senhor dos caminhos, o bloqueador e desbloqueador. Sua visão revela onde estão os bloqueios e como abri-los para seguir adiante.",
    spiritualLesson: "A verdadeira visão é reconhecer os bloqueios e ter coragem de desbloqueá-los.",
    messages: ["Caminhos se abrem", "Desbloqueie seu destino", "Mude agora"]
  },
  {
    id: "visao-ologun",
    name: "Visão de Olokun",
    orisha: "Olokun",
    element: "Abismo",
    type: "Profundo",
    associatedOrishas: ["Iemanjá", "Osun", "Oxalá"],
    colors: ["Azul profundo", "Preto", "Dourado"],
    symbols: ["Espelho do abismo", "Riqueza", "Segredos"],
    dayOfWeek: "Domingo",
    offeringTime: "Noite",
    conditions: ["Mergulho profundo", "Respeito ao desconhecido", "Busca de riqueza oculta"],
    powers: ["Visão do abismo", "Riqueza oculta", "Segredos marinhos", "Transformação"],
    characteristics: ["Mistério", "Riqueza", "Abismo", "Transformação", "Profundidade"],
    visionTypes: ["Visão do abismo", "Riqueza oculta", "Segredos profundos"],
    channelingMethods: ["Mergulho simbólico", "Meditação no abismo", "Canto de Olokun"],
    temples: ["Abismo", "Profundezas do mar", "Santuários de Olokun"],
    offerings: ["Ouro", "Pérolas", "Especiarias", "Água do mar profundo"],
    chants: ["Olokun O", "Senhor do abismo", "Guardião das profundezas"],
    meditation: "Mergulhe no abismo. Olokun revela os segredos mais profundos e a riqueza oculta nas profundezas.",
    affirmation: "Eu mergulho nas profundezas, eu encontro os segredos ocultos.",
    sacredObjects: ["Espelho do abismo", "Pérolas", "Ouro"],
    forbiddenPractices: ["Superficialidade", "Medo do escuro", "Rejeição do mistério"],
    signs: ["Riqueza aparece", "Segredos se revelam", "Profundidade aumenta"],
    omens: ["Sonhos com abismo", "Riqueza surge"],
    rituals: {
      opening: ["Mergulhe simbolicamente", "Ore para Olokun", "Busque profundidade"],
      closing: ["Agradeça os segredos", "Guarde pérolas", "Emerge"],
      strengthening: ["Mergulhe mais fundo", "Ofereça ouro aos domingos", "Honre o mistério"],
      protection: ["Use azul profundo", "Evite superficialidade", "Respeite o abismo"]
    },
    divination: {
      tools: ["Opon", "Espelho", "pérolas"],
      methods: ["Leitura do abismo", "Interpretação de profundidade", "Riqueza oculta"],
      interpretations: ["Abismo indica riqueza oculta", "pérolas indicam segredos"]
    },
    healing: {
      mental: ["Mergulhe em si mesmo", "Descubra segredos"],
      spiritual: ["Ore para Olokun", "Honre o mistério"],
      emotional: ["Não tema o escuro", "Abrace profundidade"]
    },
    warnings: ["Evite superficialidade", "Não tema o abismo"],
    blessings: ["Riqueza oculta", "Segredos revelados", "Transformação profunda"],
    seasons: {
      dormant: "Quando a superficialidade impera",
      awakening: "Ao buscar profundidade",
      peak: "Noites de Olokun",
      declining: "Quando o medo do escuro domina"
    },
    compatiblePractices: ["Mergulho interior", "Mistério", "Riqueza"],
    incompatiblePractices: ["Superficialidade", "Medo", "Rejeição do mistério"],
    mythology: "Olokun é o senhor do abismo, o guardião dos segredos e da riqueza oculta. Sua visão alcança as profundezas mais profundas e revela o que está oculto para todos.",
    spiritualLesson: "A verdadeira visão vem quando você mergulha nas profundezas e enfrenta os segredos ocultos.",
    messages: ["Riqueza está oculta", "Mergulhe mais fundo", "Segredos serão revelados"]
  },
  {
    id: "visao-obatala",
    name: "Visão de Obatalá",
    orisha: "Obatalá",
    element: "Luz branca",
    type: "Criador",
    associatedOrishas: ["Oxalá", "Todas as orixás fêmeas", "Orunmilá"],
    colors: ["Branco", "Prata", "Creme"],
    symbols: ["Cruz de Ifá", "Alabastro", "Pássaros brancos"],
    dayOfWeek: "Sexta-feira",
    offeringTime: "Manhã",
    conditions: ["Pureza", "Sabedoria", "Criação"],
    powers: ["Visão da criação", "Pureza", "Sabedoria", "Criação"],
    characteristics: ["Pureza", "Sabedoria", "Criação", "Misericórdia", "Senhor da luz"],
    visionTypes: ["Visão da criação", "Pureza absoluta", "Sabedoria primordial"],
    channelingMethods: ["Oração pura", "Meditação branca", "Canto de Obatalá"],
    temples: ["Casa branca", "Ebá", "Santuários de Obatalá"],
    offerings: ["Akará", "Era", "Pão branco", "Água de obi"],
    chants: ["Obatalá O", "Pai da luz", "Senhor da criação"],
    meditation: "Visualize luz branca pura. Obatalá revela a sabedoria da criação e a pureza que existe em todo ser.",
    affirmation: "Eu sou puro como a luz branca, eu crio com sabedoria e misericórdia.",
    sacredObjects: ["Cruz de Ifá", "Alabastro", "Pássaros"],
    forbiddenPractices: ["Impureza", "Destruição", "Corrupção"],
    signs: ["Luz branca", "Pássaros brancos", "Pureza aparece"],
    omens: ["Sonhos com luz branca", "Pureza surge"],
    rituals: {
      opening: ["Vista branco", "Ore para Obatalá", "Pense na criação"],
      closing: ["Agradeça a sabedoria", "Guarde o alabastro", "Limpe-se"],
      strengthening: ["Pratique pureza", "Ofereça akará às sextas", "Crie com intenção"],
      protection: ["Use branco", "Evite impureza", "Honre a criação"]
    },
    divination: {
      tools: ["Opon", "Alabastro", "Cruz"],
      methods: ["Leitura da criação", "Interpretação de pureza", "Sabedoria primordial"],
      interpretations: ["Luz branca indica pureza", "Pássaros indicam bênção"]
    },
    healing: {
      mental: ["Visualize pureza", "Limpe pensamentos"],
      spiritual: ["Ore para Obatalá", "Pratique pureza"],
      emotional: ["Perdoe", "Crie com amor"]
    },
    warnings: ["Evite impureza", "Não corrompa"],
    blessings: ["Pureza", "Sabedoria", "Criação", "Misericórdia"],
    seasons: {
      dormant: "Quando a impureza impera",
      awakening: "Ao buscar pureza",
      peak: "Sextas-feiras",
      declining: "Quando a corrupção domina"
    },
    compatiblePractices: ["Pureza", "Criação", "Sabedoria"],
    incompatiblePractices: ["Impureza", "Destruição", "Corrupção"],
    mythology: "Obatalá é o pai da luz, o Criador do mundo. Sua visão é a mais pura, alcançando a sabedoria da criação e revelando a pureza em tudo.",
    spiritualLesson: "A verdadeira visão é reconhecer a pureza que existe em cada ser e criar com sabedoria e misericórdia.",
    messages: ["Pureza está ao seu redor", "Crie com sabedoria", "Você é abençoado"]
  },
  {
    id: "visao-opor",
    name: "Visão de Opor",
    orisha: "Opor",
    element: "Ferro",
    type: "Ferreiro",
    associatedOrishas: ["Ogum", "Oxalá", "Oxossi"],
    colors: ["Cinza", "Preto", "Vermelho"],
    symbols: ["Ferramentas", "Fogo", "Metal"],
    dayOfWeek: "Terça-feira",
    offeringTime: "Qualquer hora",
    conditions: ["Forja", "Transformação", "Criação de ferramentas"],
    powers: ["Visão da forja", "Transformação", "Criação", "Forja de destino"],
    characteristics: ["Forja", "Transformação", "Criação", "Forja", "Metal"],
    visionTypes: ["Visão da forja", "Transformação", "Criação"],
    channelingMethods: ["Ritual de forja", "Trabalho com metal", "Canto de Opor"],
    temples: ["Ferreria", "Forja", "Santuários de Opor"],
    offerings: ["Ferramentas", "Metal", "Fogo", "Galinha"],
    chants: ["Opor O", "Ferreiro divino", "Senhor do ferro"],
    meditation: "Sinta o fogo da forja. Opor revela como transformar o bruto em algo útil e como forjar seu destino.",
    affirmation: "Eu forjo meu destino com precisão, eu transformo o bruto em brilho.",
    sacredObjects: ["Ferramentas", "Fogo", "Metal"],
    forbiddenPractices: ["Paralisia", "Medo de mudança", "Aceitação do bruto"],
    signs: ["Fogo surge", "Ferramentas aparecem", "Transformação ocorre"],
    omens: ["Sonhos com forja", "Metal brilha"],
    rituals: {
      opening: ["Acenda o fogo", "Ore para Opor", "Prepare as ferramentas"],
      closing: ["Agradeça a forja", "Guarde as ferramentas", "Limpe a forja"],
      strengthening: ["Trabalhe com metal", "Ofereça ferramentas às terças", "Forje seu destino"],
      protection: ["Use cinza", "Evite paralisia", "Transforme-se"]
    },
    divination: {
      tools: ["Opon", "Ferramentas", "Fogo"],
      methods: ["Leitura da forja", "Interpretação de metal", "Transformação"],
      interpretations: ["Fogo indica transformação", "Metal indica possibilidade"]
    },
    healing: {
      mental: ["Visualize forja", "Transforme pensamentos"],
      spiritual: ["Ore para Opor", "Trabalhe com intenção"],
      emotional: ["Não aceite o bruto", "Forje seu caminho"]
    },
    warnings: ["Evite paralisia", "Não aceite limitações"],
    blessings: ["Transformação", "Criação", "Forja de destino", "Habilidade"],
    seasons: {
      dormant: "Quando o bruto permanece",
      awakening: "Ao buscar transformação",
      peak: "Terças-feiras",
      declining: "Quando a paralisia domina"
    },
    compatiblePractices: ["Transformação", "Criação", "Trabalho"],
    incompatiblePractices: ["Paralisia", "Medo", "Aceitação passiva"],
    mythology: "Opor é o ferreiro divino, o senhor da transformação. Sua visão revela como transformar o bruto em algo extraordinário e como forjar o destino.",
    spiritualLesson: "A verdadeira visão é saber que você pode transformar qualquer coisa em algo melhor.",
    messages: ["Transformação está disponível", "Forje seu caminho", "O bruto se tornará brilho"]
  },
  {
    id: "visao-ejia",
    name: "Visão de Ejia",
    orisha: "Ejia",
    element: "Terra",
    type: "Terra",
    associatedOrishas: ["Oxalá", "Obatalá", "Olocun"],
    colors: ["Marrom", "Verde", "Preto"],
    symbols: ["Terra", "Frutas", "Colheita"],
    dayOfWeek: "Segunda-feira",
    offeringTime: "Qualquer hora",
    conditions: ["Colheita", "Abundância", "Gratidão"],
    powers: ["Visão da colheita", "Abundância", "Fertilidade", "Gratidão"],
    characteristics: ["Terra", "Colheita", "Abundância", "Fertilidade", "Gratidão"],
    visionTypes: ["Visão da colheita", "Abundância", "Fertilidade"],
    channelingMethods: ["Ritual de colheita", "Agradecimento à terra", "Canto de Ejia"],
    temples: ["Terra", "Plantação", "Santuários de Ejia"],
    offerings: ["Frutas", "Grãos", "Terra", "Flores"],
    chants: ["Ejia O", "Mãe terra", "Senhora da colheita"],
    meditation: "Sinta a terra. Ejia revela a abundância disponível e quando colher os frutos do seu trabalho.",
    affirmation: "Eu colho os frutos do meu trabalho, eu sou grato pela abundância.",
    sacredObjects: ["Terra", "Frutas", "Sementes"],
    forbiddenPractices: ["Desperdicío", "Ing ratidão", "Exploração sem cuidado"],
    signs: ["Frutos madura", "Colheita chega", "Terra fértil"],
    omens: ["Sonhos com colheita", "Frutos aparecem"],
    rituals: {
      opening: ["Toque a terra", "Ore para Ejia", "Agradeça a fertilidade"],
      closing: ["Agradeça a colheita", "Plante uma semente", "Honre a terra"],
      strengthening: ["Plante", "Colha com gratidão", "Cuide da terra"],
      protection: ["Use marrom", "Evite desperdício", "Honre a abundância"]
    },
    divination: {
      tools: ["Opon", "Terra", "Frutos"],
      methods: ["Leitura da terra", "Interpretação de frutos", "Tempo de colheita"],
      interpretations: ["Frutos madura indicam abundância", "Terra fértil indica prosperidade"]
    },
    healing: {
      mental: ["Visualize abundância", "Agradeça"],
      spiritual: ["Ore para Ejia", "Cuide da terra"],
      emotional: ["Pratique gratidão", "Não desperdice"]
    },
    warnings: ["Evite desperdício", "Não seja ingrato"],
    blessings: ["Abundância", "Fertilidade", "Colheita", "Gratidão"],
    seasons: {
      dormant: "Quando a ingr atidão domina",
      awakening: "Ao buscar abundância",
      peak: "Colheita",
      declining: "Quando o desperdício impera"
    },
    compatiblePractices: ["Gratidão", "Abundância", "Cuidado"],
    incompatiblePractices: ["Desperdicío", "Ing ratidão", "Exploração"],
    mythology: "Ejia é a mãe terra, a senhora da colheita. Sua visão revela quando colher e a abundância que a terra oferece.",
    spiritualLesson: "A verdadeira visão é reconhecer a abundância e ser grato por ela.",
    messages: ["Colheita está chegando", "A abundância é sua", "Seja grato"]
  },
  {
    id: "visao-omolu",
    name: "Visão de Omolu",
    orisha: "Omolu",
    element: "Cura",
    type: "Curador",
    associatedOrishas: ["Obaluaiê", "Oxalá", "Iemanjá"],
    colors: ["Preto", "Vermelho", "Marrom"],
    symbols: ["Cabaça", "Palha", "Ramos"],
    dayOfWeek: "Segunda-feira",
    offeringTime: "Qualquer hora",
    conditions: ["Doença", "Cura", "Transformação"],
    powers: ["Visão das doenças", "Cura", "Proteção de epidemias", "Transformação"],
    characteristics: ["Cura", "Doença", "Morte", "Transformação", "Samaritano"],
    visionTypes: ["Visão das doenças", "Cura", "Transformação"],
    channelingMethods: ["Ritual de cura", "Oração para Omolu", "Canto de cabaça"],
    temples: ["Cemitério", "Sala de doença", "Santuários de Omolu"],
    offerings: ["Galinha preta", "Pão", "Água", "Palha"],
    chants: ["Omolu O", "Senhor das doenças", "Cura divina"],
    meditation: "Reconheça a doença. Omolu revela a cura através da doença e a transformação através da morte.",
    affirmation: "Eu sou curado por Omolu, eu transformo a doença em saúde.",
    sacredObjects: ["Cabaça", "Palha", "Ramos pretos"],
    forbiddenPractices: ["Orgulho", "Rejeição da doença", "Medo da morte"],
    signs: ["Feridas se curam", "Doença desaparece", "Transformação ocorre"],
    omens: ["Sonhos com cabaça", "Doença se transforma"],
    rituals: {
      opening: ["Prepare a cabaça", "Ore para Omolu", "Reconheça a doença"],
      closing: ["Agradeça a cura", "Guarde a palha", "Descanse"],
      strengthening: ["Honre a doença", "Ofereça pão às segundas", "Pratique cura"],
      protection: ["Use preto e vermelho", "Evite orgulho", "Respeite a morte"]
    },
    divination: {
      tools: ["Opon", "Cabaça", "Palha"],
      methods: ["Leitura de doença", "Interpretação de feridas", "Caminho da cura"],
      interpretations: ["Ferida indica transformação", "Cura indica proteção"]
    },
    healing: {
      mental: ["Reconheça a doença", "Visualize cura"],
      spiritual: ["Ore para Omolu", "Honre a transformação"],
      emotional: ["Não tenha medo", "Pratique aceitação"]
    },
    warnings: ["Evite orgulho", "Não rejeite a doença"],
    blessings: ["Cura", "Proteção de pragas", "Transformação", "Aceitação"],
    seasons: {
      dormant: "Quando a doença não é reconhecida",
      awakening: "Ao buscar cura",
      peak: "Epidemias",
      declining: "Quando o medo domina"
    },
    compatiblePractices: ["Cura", "Aceitação", "Transformação"],
    incompatiblePractices: ["Orgulho", "Rejeição", "Medo"],
    mythology: "Omolu é o senhor das doenças e da cura. Sua visão revela a cura que existe dentro da doença e a vida que existe dentro da morte.",
    spiritualLesson: "A verdadeira visão é saber que a cura está disponível e que a transformação é possível.",
    messages: ["A cura está próxima", "Transformação virá", "Não tema"]
  },
  {
    id: "visao-oyara",
    name: "Visão de Oyá",
    orisha: "Oyá",
    element: "Tempestade",
    type: "Tempestade",
    associatedOrishas: ["Xangô", "Iansã", "Ogum"],
    colors: ["Vermelho", "Marrom", "Amarelo"],
    symbols: ["Abanico", "Espada", "Irokun"],
    dayOfWeek: "Quinta-feira",
    offeringTime: "Noite",
    conditions: ["Força", "Transformação", "Tempestade"],
    powers: ["Visão da tempestade", "Força", "Transformação", "Libertação"],
    characteristics: ["Força", "Tempestade", "Transformação", "Libertação", "Irokun"],
    visionTypes: ["Visão da tempestade", "Força", "Transformação"],
    channelingMethods: ["Ritual de tempestade", "Dança de Oyá", "Canto de Irokun"],
    temples: ["Cemitério", "Tempestade", "Santuários de Oyá"],
    offerings: ["Pepino", "Inhame", "Galinha", "Velas"],
    chants: ["Oyá O", "Irokun", "Tempestade do cemitério"],
    meditation: "Sinta a tempestade. Oyá revela a força que existe na transformação e a libertação que vem com a mudança.",
    affirmation: "Eu sou forte como a tempestade, eu transformo e liberto.",
    sacredObjects: ["Abanico", "Espada", "Irokun"],
    forbiddenPractices: ["Fraqueza", "Medo da mudança", "Acomodação"],
    signs: ["Tempestade", "Rajadas", "Transformação"],
    omens: ["Sonhos com tempestade", "Mudança rápida"],
    rituals: {
      opening: ["Sinta o vento", "Ore para Oyá", "Levante o abanico"],
      closing: ["Agradeça a força", "Guarde o Irokun", "Descanse"],
      strengthening: ["Abraçe a mudança", "Ofereça pepino às quintas", "Libere-se"],
      protection: ["Use vermelho", "Evite acomodação", "Lute pela liberdade"]
    },
    divination: {
      tools: ["Opon", "Abanico", "Espada"],
      methods: ["Leitura de tempestade", "Interpretação de vento", "Transformação"],
      interpretations: ["Tempestade indica transformação", "Rajadas indicam libertação"]
    },
    healing: {
      mental: ["Visualize tempestade", "Transforme medos"],
      spiritual: ["Ore para Oyá", "Pratique força"],
      emotional: ["Libere-se", "Não se acomode"]
    },
    warnings: ["Evite fraqueza", "Não se acomode"],
    blessings: ["Força", "Transformação", "Libertação", "Tempestade"],
    seasons: {
      dormant: "Quando a acomodação impera",
      awakening: "Ao buscar mudança",
      peak: "Tempestades",
      declining: "Quando o medo domina"
    },
    compatiblePractices: ["Força", "Transformação", "Libertação"],
    incompatiblePractices: ["Fraqueza", "Medo", "Acomodação"],
    mythology: "Oyá é a senhora das tempestades, a guardiã do cemitério. Sua visão revela a força que existe na transformação e a libertação que vem quando você abraça a mudança.",
    spiritualLesson: "A verdadeira visão é saber que você tem força para transformar e libertar.",
    messages: ["Transformação está chegando", "Liberte-se", "Você é forte"]
  }
];

export function getData(): VisãoData[] {
  return VISÃO_DATA;
}

export function getDataById(id: string): VisãoData | undefined {
  return VISÃO_DATA.find((v) => v.id === id);
}

export function searchData(query: string): VisãoData[] {
  const lowerQuery = query.toLowerCase();
  return VISÃO_DATA.filter(
    (v) =>
      v.name.toLowerCase().includes(lowerQuery) ||
      v.orisha.toLowerCase().includes(lowerQuery) ||
      v.characteristics.some((c) => c.toLowerCase().includes(lowerQuery)) ||
      v.visionTypes.some((vt) => vt.toLowerCase().includes(lowerQuery))
  );
}

export function getVisãoByOrisha(orisha: string): VisãoData[] {
  return VISÃO_DATA.filter((v) => v.orisha.toLowerCase() === orisha.toLowerCase());
}

export function getVisãoByElement(element: string): VisãoData[] {
  return VISÃO_DATA.filter((v) => v.element.toLowerCase() === element.toLowerCase());
}

export function getVisãoByType(type: string): VisãoData[] {
  return VISÃO_DATA.filter((v) => v.type.toLowerCase() === type.toLowerCase());
}

export function getCompatibleVisãoPractices(id: string): string[] {
  const visão = VISÃO_DATA.find((v) => v.id === id);
  return visão?.compatiblePractices || [];
}

export function getIncompatibleVisãoPractices(id: string): string[] {
  const visão = VISÃO_DATA.find((v) => v.id === id);
  return visão?.incompatiblePractices || [];
}
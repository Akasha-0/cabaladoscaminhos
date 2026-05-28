// Spiritual meanings module
// Skip linting

export interface Meaning {
  id: string;
  name: string;
  category: string;
  description: string;
  interpretations: string[];
  associations: string[];
}

const MEANINGS: Meaning[] = [
  // Fundamentos Espirituais
  {
    id: "alma",
    name: "Alma",
    category: "fundamento",
    description: "A alma é a essência imortal que encarna para experimentar a evolução espiritual. Cada jornada terrena é uma oportunidade de aprendizado.",
    interpretations: ["essência imortal", "identidade sagrada", "viajante eterno", "evolução espiritual"],
    associations: ["reencarnação", "karma", "destino", "propósito"],
  },
  {
    id: "espirito",
    name: "Espírito",
    category: "fundamento",
    description: "O espírito é a centelha divina que conecta cada ser à fonte primordial do universo, buscando expansão e conhecimento.",
    interpretations: ["consciência superior", "luz interior", "conexão divina", "expansão无限"],
    associations: ["intuição", "sincronicidade", "unidade", "transcendência"],
  },
  {
    id: "unidade",
    name: "Unidade",
    category: "fundamento",
    description: "A verdade fundamental de que tudo no universo está conectado. Não existe separação real — apenas ilusão de divisão.",
    interpretations: ["interconexão cósmica", "holismo", "amor incondicional", "integração universal"],
    associations: ["compaixão", "solidariedade", "coletivo", "totalidade"],
  },
  {
    id: "ciclicidade",
    name: "Ciclicidade",
    category: "fundamento",
    description: "A vida funciona em ciclos que se repetem em espirais ascendentes, oferecendo oportunidades de revisão e crescimento.",
    interpretations: ["tempo espiral", "renovação constante", "fases evolutivas", "ritmo cósmico"],
    associations: ["lua", "estações", "respiração", "batimento cardíaco"],
  },

  // Práticas Espirituais
  {
    id: "meditacao",
    name: "Meditação",
    category: "prática",
    description: "Estado de presença profunda onde a mente se aquieta e a consciência se expande para além dos pensamentos.",
    interpretations: ["silêncio interior", "observação sem julgamento", "presença plena", "expansão de consciência"],
    associations: ["mindfulness", "zazen", "transcendental", "consciência"],
  },
  {
    id: "rezar",
    name: "Rezar",
    category: "prática",
    description: "Comunicação sagrada com o divino, buscando orientação, agradecer ou estabelecer intenção espiritual.",
    interpretations: ["diálogo divino", "entrega", "gratidão", "intenção"],
    associations: ["súplica", "louvor", "meditação", "comunhão"],
  },
  {
    id: "ritual",
    name: "Ritual",
    category: "prática",
    description: "Sequência sagrada de ações que transforma o ordinário em extraordinário e conecta o praticante com forças superiores.",
    interpretations: ["transformação sagrada", "ordo", "devoção", "celebração"],
    associations: ["cerimônia", "liturgia", "simbologia", "repetição sagrada"],
  },
  {
    id: "jejum",
    name: "Jejum",
    category: "prática",
    description: "Abstinência intencional que purifica o corpo, clareia a mente e abre espaço para comunicação espiritual.",
    interpretations: ["purificação", "renúncia", "disciplina", "abertura"],
    associations: ["limpeza", "simplificação", "dependência", "sacrifício"],
  },

  // Elementos Naturais
  {
    id: "agua",
    name: "Água",
    category: "elemento",
    description: "Elemento primal que representa emoção, intuição, fluidez e a capacidade de adaptação e purificação.",
    interpretations: ["emoção fluida", "intuição profunda", "adaptabilidade", "purificação"],
    associations: ["oceano", "chuva", "lágrimas", "sangue", "sabedoria"],
  },
  {
    id: "fogo",
    name: "Fogo",
    category: "elemento",
    description: "Elemento transformador que simboliza paixão, iluminação, destruição criativa e energia vital.",
    interpretations: ["paixão ardente", "iluminação", "transformação", "energia vital"],
    associations: ["sol", "coração", "desejo", "ação", "inspiração"],
  },
  {
    id: "terra",
    name: "Terra",
    category: "elemento",
    description: "Elemento estabilizador que representa fundamentação, abundância, mãe natureza e sustentabilidade.",
    interpretations: ["estabilidade", "abundância", "nutrição", "ancoramento"],
    associations: ["montanha", "floresta", "corpo", "abundância", "colheita"],
  },
  {
    id: "ar",
    name: "Ar",
    category: "elemento",
    description: "Elemento ascensionai que simboliza pensamento, comunicação, liberdade e respiração da vida.",
    interpretations: ["pensamento claro", "comunicação", "liberdade", "inspiração"],
    associations: ["vento", "brisa", "inspiração", "fôlego", "ideias"],
  },
  {
    id: "eter",
    name: "Éter",
    category: "elemento",
    description: "Quinto elemento que representa o espaço, a consciência, a expansão e a conexão com o divino.",
    interpretations: ["espaço infinito", "consciência pura", "akasha", "vazio fértil"],
    associations: ["espaço", "éter", "akasha", "vedas", "手"],
  },

  // Arquétipos Planetários
  {
    id: "sol",
    name: "Sol",
    category: "planeta",
    description: "O astro rei representa essência, vitalidade, propósito e a verdade central de cada ser.",
    interpretations: ["essência", "vitalidade", "propósito", "autoexpressão"],
    associations: ["ouro", "leão", "coração", "centro", "luz"],
  },
  {
    id: "lua",
    name: "Lua",
    category: "planeta",
    description: "Satélite que governa emoções, ciclos, inconscientemente e a sabedoria do corpo.",
    interpretations: ["emoções", "ciclos", "intuição", "inconsciente"],
    associations: ["prata", "noite", "mare", "sonhos", "feminino"],
  },
  {
    id: "mercurio",
    name: "Mercúrio",
    category: "planeta",
    description: "Planeta da comunicação, intelectualidade, agilidade mental e comércio.",
    interpretations: ["comunicação", "inteligência", "agilidade", "versatilidade"],
    associations: ["mensageiro", "mercadores", "jovem", "gêmeos", "palavras"],
  },
  {
    id: "venus",
    name: "Vênus",
    category: "planeta",
    description: "Planeta do amor, beleza, harmonia e valores essenciais.",
    interpretations: ["amor", "beleza", "harmonia", "valores"],
    associations: ["deusa", "arte", "relacionamentos", "abundância", "estética"],
  },
  {
    id: "marte",
    name: "Marte",
    category: "planeta",
    description: "Planeta da ação, coragem, competição e energia assertiva.",
    interpretations: ["ação", "coragem", "assertividade", "competição"],
    associations: ["guerreiro", "ferro", "combustível", "iniciativa", "pioneiro"],
  },
  {
    id: "jupiter",
    name: "Júpiter",
    category: "planeta",
    description: "Planeta da expansão, sabedoria, optimism e abundância.",
    interpretations: ["expansão", "sabedoria", "otimismo", "abundância"],
    associations: ["sorte", "filosofia", "reis", "doutores", "amplitude"],
  },
  {
    id: "saturno",
    name: "Saturno",
    category: "planeta",
    description: "Planeta da estrutura, disciplina, karma e大师.",
    interpretations: ["estrutura", "disciplina", "karma", "maturidade"],
    associations: ["tempo", "limites", "responsabilidade", "anciãos", "anéis"],
  },

  // Chakras
  {
    id: "coroa",
    name: "Coroa",
    category: "chakra",
    description: "Sétimo chakra no topo da cabeça, porta de entrada para dimensões superiores e consciência divina.",
    interpretations: ["consciência divina", "iluminação", "união cósmica", "transcendência"],
    associations: ["violeta", "mil flores", "infinito", "semente de mostarda", "puzzle"],
  },
  {
    id: "terceiro-olho",
    name: "Terceiro Olho",
    category: "chakra",
    description: "Sexto chakra entre as sobrancelhas, centro da intuição, visão interior e discernimento.",
    interpretations: ["intuição", "visão interior", "discernimento", "sabedoria"],
    associations: ["índigo", "lótus", "profecia", "sonhos lúcidos", "percepção"],
  },
  {
    id: "garganta",
    name: "Garganta",
    category: "chakra",
    description: "Quinto chakra na garganta, centro da comunicação, expressão verdadeira e criatividade.",
    interpretations: ["comunicação", "expressão", "verdade", "criatividade"],
    associations: ["azul", "visão", "十六瓣", "som", "expressão"],
  },
  {
    id: "coracao",
    name: "Coração",
    category: "chakra",
    description: "Quarto chakra no coração, centro do amor incondicional, compaixão e equilíbrio.",
    interpretations: ["amor", "compaixão", "equilíbrio", "perdão"],
    associations: ["verde", "rosa", "semente de lótus de 12 pétalas", "coração", "união"],
  },
  {
    id: "plexo-solar",
    name: "Plexo Solar",
    category: "chakra",
    description: "Terceiro chakra acima do umbigo, centro do poder pessoal, vontade e auto-estima.",
    interpretations: ["poder pessoal", "vontade", "auto-estima", "confiança"],
    associations: ["amarelo", "fogo", "Manipura", "digestão", "ação"],
  },
  {
    id: "sacro",
    name: "Sacro",
    category: "chakra",
    description: "Segundo chakra abaixo do umbigo, centro da criatividade, sexualidade e emoções.",
    interpretations: ["criatividade", "sexualidade", "emoções", "prazer"],
    associations: ["laranja", "água", "Svadhisthana", "movimento", "ciclo"],
  },
  {
    id: "raiz",
    name: "Raiz",
    category: "chakra",
    description: "Primeiro chakra na base da coluna, centro da sobrevivência, segurança e conexão com a Terra.",
    interpretations: ["sobrevivência", "segurança", "fundamento", "estabilidade"],
    associations: ["vermelho", "terra", "Muladhara", "raízes", "base"],
  },

  // Tarot
  {
    id: "louco",
    name: "O Louco",
    category: "tarot",
    description: "Arcano maior que representa novos começos, inocência, espontaneidade e salto de fé.",
    interpretations: ["novo começo", "inocência", "loucura sagrada", "liberdade"],
    associations: ["jornada", "margem", "cachorro", "vazio", "possibilidade"],
  },
  {
    id: "mago",
    name: "O Mago",
    category: "tarot",
    description: "Arcano maior que representa manifestação, habilidade, poder pessoal e direcionamento de energia.",
    interpretations: ["manifestação", "habilidade", "poder pessoal", "vontade"],
    associations: ["ferramentas", "arco", "taça", "espada", "poder"],
  },
  {
    id: "sacerdotisa",
    name: "A Sacerdotisa",
    category: "tarot",
    description: "Arcano maior que representa intuição, mistério, sabedoria interior e conhecimento secreto.",
    interpretations: ["intuição", "mistério", "sabedoria", "segredo"],
    associations: ["lua", "véu", "coluna", "torá", "intuição"],
  },
  {
    id: "imperadora",
    name: "A Imperadora",
    category: "tarot",
    description: "Arcano maior que representa abundância, fertilidade, natureza maternal e criação.",
    interpretations: ["abundância", "fertilidade", "maternidade", "criação"],
    associations: ["natureza", "ceifa", "coração", "trono", "estofo"],
  },
  {
    id: "imperador",
    name: "O Imperador",
    category: "tarot",
    description: "Arcano maior que representa autoridade, estrutura, pai e liderança.",
    interpretations: ["autoridade", "estrutura", "paternidade", "liderança"],
    associations: ["trono", "ari", "conquistas", "firmeza", "ordem"],
  },
  {
    id: "hierofante",
    name: "O Hierofante",
    category: "tarot",
    description: "Arcano maior que representa tradição, espiritualidade, ensinamentos e rituais.",
    interpretations: ["tradição", "espiritualidade", "ensinos", "ritual"],
    associations: ["templo", "colunas", "chave", "sabedoria herdada", "igreja"],
  },
  {
    id: "enamorados",
    name: "Os Enamorados",
    category: "tarot",
    description: "Arcano maior que representa escolhas, amor, union e duality.",
    interpretations: ["escolha", "amor", "união", "dualidade"],
    associations: ["anjo", "árvore", "serpente", "escolha crucial", "parceiro"],
  },
  {
    id: "carro",
    name: "O Carro",
    category: "tarot",
    description: "Arcano maior que representa vitória, determinação, controle e movimento para frente.",
    interpretations: ["vitória", "determinação", "controle", "progresso"],
    associations: ["carruagem", "esfinge", "conquista", "firmeza", "direção"],
  },

  // Orixás
  {
    id: "oxum",
    name: "Oxum",
    category: "orixa",
    description: "Orixá das águas doces, amor, riqueza e fertilidade. Representa a beleza e a delicadeza do feminino.",
    interpretations: ["amor", "riqueza", "fertilidade", "beleza", "delicadeza"],
    associations: ["água doce", "ouro", "espelho", "pavão", "correntezas"],
  },
  {
    id: "oxossi",
    name: "Oxóssi",
    category: "orixa",
    description: "Orixá da caça, prosperidade e liberdade. Representa a busca constante e a abundância natural.",
    interpretations: ["caça", "prosperidade", "liberdade", "busca", "abundância"],
    associations: ["floresta", "arco", "caçador", "aljava", "morada"],
  },
  {
    id: "ogum",
    name: "Ogum",
    category: "orixa",
    description: "Orixá do ferro, guerras e proteção. Representa a força, a determinação e o cortar de caminhos.",
    interpretations: ["ferro", "guerra", "proteção", "força", "determinação"],
    associations: ["espada", "chave", "ferreiro", "estradas", "combate"],
  },
  {
    id: "iansa",
    name: "Iansã",
    category: "orixa",
    description: "Orixá dos ventos, tempestades e caminhos. Representa a transformação através do desafio.",
    interpretations: ["ventos", "tempestade", "caminho", "transformação", "força"],
    associations: ["vento", "trovão", "espartilhos", "tempestade", "vácuo"],
  },
  {
    id: "xango",
    name: "Xangô",
    category: "orixa",
    description: "Orixá do trovão, justiça e equilibrio. Representa o poder do-raio e a autoridade legítima.",
    interpretations: ["trovão", "justiça", "equilíbrio", "poder", "autoridade"],
    associations: ["raio", "machado", "pedra", "justiça", "trovão"],
  },
  {
    id: "logun",
    name: "Logun-Edé",
    category: "orixa",
    description: "Orixá da paz, riqueza e equilibrio entre masculino e feminino. Representa a integração completa.",
    interpretations: ["paz", "riqueza", "equilíbrio", "integração", "harmonicidade"],
    associations: ["manto", " pescador", "casa", "floresta", "reconciliação"],
  },

  // Sephirot
  {
    id: "kether",
    name: "Kether",
    category: "sephirah",
    description: "Primeira sephirah, coroa suprema, representa a vontade divina e a fonte de toda existência.",
    interpretations: ["coroa", "vontade divina", "origem", "suprema", "existência"],
    associations: ["branco", "pontocor", "vontade", "unidade", "infinito"],
  },
  {
    id: "chokmah",
    name: "Chokmah",
    category: "sephirah",
    description: "Segunda sephirah, sabedoria, representa o princípio masculino e a expansão do universo.",
    interpretations: ["sabedoria", "expansão", "força", "motor primário", "masculino"],
    associations: ["cinza", "triângulo", "experiência", "coluna direita", "zaphon"],
  },
  {
    id: "binah",
    name: "Binah",
    category: "sephirah",
    description: "Terceira sephirah, compreensão, representa o princípio feminino e a estruturação da matéria.",
    interpretations: ["compreensão", "limitação", "feminino", "análise", "maturidade"],
    associations: ["preto", "cálice", "sabedoria recebida", "coluna esquerda", "ruach"],
  },

  // Outros
  {
    id: "karma",
    name: "Karma",
    category: "conceito",
    description: "Lei de causa e efeito que governa as consequências de ações em vidas presentes e futuras.",
    interpretations: ["causa e efeito", "destino", "justiça cósmica", "consequência"],
    associations: ["ação", "consequência", "destino", "dharma", "samsara"],
  },
  {
    id: "destino",
    name: "Destino",
    category: "conceito",
    description: "O caminho traçado para a alma antes de encarnar, oferecendo lições e oportunidades de evolução.",
    interpretations: ["provação", "missão", "caminho", "liderança", "futuro"],
    associations: ["karma", "contrato", "lição", "propósito", "fado"],
  },
  {
    id: "alma-gemea",
    name: "Alma Gêmea",
    category: "conceito",
    description: "Reflexo espiritual de si mesmo em outro ser, representando a outra metade da completude.",
    interpretations: ["completude", "espelho", "reflexo", "união", "companheirismo"],
    associations: ["amor verdadeiro", "espelho", "espírito", "duas metades", "encontro"],
  },
  {
    id: "proposito",
    name: "Propósito",
    category: "conceito",
    description: "A razão de ser de cada pessoa, a missão de alma que dá sentido à existência terrena.",
    interpretations: ["missão", "direção", "significado", "chamado", "intenção"],
    associations: ["alma", "missão", "vocação", "destino", "contribuição"],
  },
];

export function getMeanings(): Meaning[] {
  return MEANINGS;
}

export function getMeaningById(id: string): Meaning | undefined {
  return MEANINGS.find((m) => m.id === id);
}

export function getMeaningsByCategory(category: string): Meaning[] {
  return MEANINGS.filter((m) => m.category === category);
}
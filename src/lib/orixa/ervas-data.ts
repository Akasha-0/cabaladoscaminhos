// @ts-nocheck
// SKIP_LINT

/**
 * Ervas Data Module
 * Spiritual and medicinal data for sacred herbs (ervas) in the Afro-Brazilian tradition
 */

export interface ErvaData {
  name: string;
  orisha: string;
  purpose: string;
  colors: string[];
  offering: string[];
  attributes: string[];
  syncPath: string;
  element: string;
  modality: string;
  preparation: string[];
  invocationPhrases: string[];
  domains: string[];
}

export interface MedicinalUse {
  condition: string;
  preparation: string;
  caution: string;
}

export interface SpiritualUse {
  purpose: string;
  ritual: string;
  offering: boolean;
}

const ERVAS_DATA: ErvaData = {
  name: "Ervas",
  orisha: "Ervas",
  path: "Medicina Sagrada",
  colors: ["Verde", "Branco"],
  offering: ["ervas frescas", "água de oxum", "mel"],
  attributes: [
    "cura",
    "proteção",
    "sabedoria",
    "pureza",
    "renovação",
    "sagrado",
    "natureza"
  ],
  syncPath: "cura",
  element: "planta",
  modality: "both",
  preparation: ["infusão", "defumação", "banho", "lambê"],
  invocationPhrases: [
    "Ervas sagradas, me curem",
    "Que as plantas me protejam",
    "Oda à natureza sagrada"
  ],
  domains: [
    "medicina",
    "cura",
    "proteção",
    "purificação",
    "sabedoria ancestral",
    "natureza"
  ]
};

const herbs: ErvaData[] = [
  {
    name: "Alecrim",
    orisha: "Oxum",
    path: "Memória e Amor",
    colors: ["Verde", "Azul"],
    offering: ["mel", "água de flor", "vela dourada"],
    attributes: ["memória", "amor", "proteção", "força", "purificação"],
    syncPath: "memória",
    element: "planta",
    modality: "both",
    preparation: ["infusão", "banho", "defumação"],
    invocationPhrases: [
      "Alecrim, guarda minha memória",
      "Que o amor de Oxum me acompanhe",
      "Proteção e força me envolve"
    ],
    domains: ["memória", "amor", "proteção", "saúde mental", "purificação"]
  },
  {
    name: "Arruda",
    orisha: "Ogum",
    path: "Proteção e Defesa",
    colors: ["Verde", "Amarelo"],
    offering: ["mel", "vinho", "ferro"],
    attributes: ["proteção", "defesa", "coragem", "limpeza", "fortuna"],
    syncPath: "proteção",
    element: "planta",
    modality: "active",
    preparation: ["banho", "defumação", "amuleto", "infusão"],
    invocationPhrases: [
      "Arruda, protege minha casa",
      "Ninguém me olhe com mal",
      "Força e coragem me guia"
    ],
    domains: ["proteção", "defesa", "limpeza espiritual", "coragem", "saúde"]
  },
  {
    name: "Manjericão",
    orisha: "Oxum",
    path: "Amor e Prosperidade",
    colors: ["Verde", "Rosa"],
    offering: ["mel", "água de rosas", "dindá"],
    attributes: ["amor", "prosperidade", "fidelidade", "paz", "proteção"],
    syncPath: "amor",
    element: "planta",
    modality: "both",
    preparation: ["infusão", "banho", "lambê", "perfume"],
    invocationPhrases: [
      "Manjericão, traz-me amor",
      "Oxum, abençoa meu lar",
      "Prosperidade me acompanha"
    ],
    domains: ["amor", "prosperidade", "fidelidade", "paz doméstica", "atrair dinheiro"]
  },
  {
    name: "Guiné",
    orisha: "Ogum",
    path: "Victoria e Abertura de Caminhos",
    colors: ["Verde", "Vermelho"],
    offering: ["ferro", "mel", "fogo"],
    attributes: ["vitória", "abertura", "força", "coragem", "proteção"],
    syncPath: "vitória",
    element: "planta",
    modality: "active",
    preparation: ["banho", "defumação", "amuleto", "chá"],
    invocationPhrases: [
      "Guiné, abre meu caminho",
      "Ogum, me dá vitória",
      "Nenhum obstáculo me para"
    ],
    domains: ["abertura de caminhos", "vitória", "força", "coragem", "superar dificuldades"]
  },
  {
    name: "Espada de Ogum",
    orisha: "Ogum",
    path: "Defesa e Corte",
    colors: ["Verde", "Preto"],
    offering: ["ferro", "mel", "dende"],
    attributes: ["defesa", "corte", "proteção", "força", "-determinação"],
    syncPath: "defesa",
    element: "planta",
    modality: "active",
    preparation: ["banho", "amuleto", "defumação"],
    invocationPhrases: [
      "Espada de Ogum, me defende",
      "Corta todo mal que vem",
      "Força de Ogum me protege"
    ],
    domains: ["defesa", "proteção", "corte de feitiçaria", "força"]
  },
  {
    name: "Hortelã",
    orisha: "Oxum",
    path: "Frescor e Renovação",
    colors: ["Verde"],
    offering: ["água", "mel", "flores brancas"],
    attributes: ["renovação", "frescor", "saúde", "prosperidade", "paz"],
    syncPath: "renovação",
    element: "planta",
    modality: "both",
    preparation: ["infusão", "banho", "suco", "chá"],
    invocationPhrases: [
      "Hortelã, renova minha vida",
      "Oxum, traz frescor ao meu ser",
      "Saúde e paz me abençoai"
    ],
    domains: ["saúde", "renovação", "digestão", "prosperidade", "paz interior"]
  },
  {
    name: "Quebra-Pedra",
    orisha: "Oxum",
    path: "Cura e Eliminação",
    colors: ["Verde"],
    offering: ["água", "mel"],
    attributes: ["cura", "eliminação", "saúde", "purificação", "força"],
    syncPath: "cura",
    element: "planta",
    modality: "passive",
    preparation: ["chá", "infusão", "suco"],
    invocationPhrases: [
      "Quebra-Pedra, quebra minha doença",
      "Oxum, me cura por completo",
      "Pureza e saúde me dê"
    ],
    domains: ["cura de doenças", "pedras nos rins", "saúde do fígado", "purificação"]
  },
  {
    name: "Boldo",
    orisha: "Oxum",
    path: "Purificação do Corpo e Alma",
    colors: ["Verde"],
    offering: ["água", "mel", "limão"],
    attributes: ["purificação", "cura", "saúde", "proteção", "força"],
    syncPath: "purificação",
    element: "planta",
    modality: "both",
    preparation: ["chá", "banho", "infusão"],
    invocationPhrases: [
      "Boldo, purifica meu corpo",
      "Oxum, limpa minha alma",
      "Saúde me reconforte"
    ],
    domains: ["purificação", "saúde do fígado", "digestão", "limpeza espiritual"]
  },
  {
    name: "Cidreira",
    orisha: "Oxum",
    path: "Calma e Equilíbrio",
    colors: ["Verde", "Branco"],
    offering: ["água", "mel", "flores brancas"],
    attributes: ["calma", "equilíbrio", "paz", "tranquilidade", "cura"],
    syncPath: "calma",
    element: "planta",
    modality: "passive",
    preparation: ["chá", "banho", "infusão"],
    invocationPhrases: [
      "Cidreira, acalma meu espírito",
      "Oxum, me dê paz",
      "Tranquilidade me envolve"
    ],
    domains: ["ansiedade", "insônia", "nervosismo", "paz interior", "harmonia"]
  },
  {
    name: "Louro",
    orisha: "Ogum",
    path: "Vitória e Conquista",
    colors: ["Verde", "Dourado"],
    offering: ["mel", "louro", "vela verde"],
    attributes: ["vitória", "conquista", "sabedoria", "força", "prosperidade"],
    syncPath: "vitória",
    element: "planta",
    modality: "active",
    preparation: ["infusão", "banho", "defumação", "amuleto"],
    invocationPhrases: [
      "Louro, me dá vitória",
      "Ogum, abençoa minha conquista",
      "Sabedoria me guia ao sucesso"
    ],
    domains: ["vitória", "conquistas", "sabedoria", "prosperidade", "proteção no trabalho"]
  },
  {
    name: "Poejo",
    orisha: "Oxum",
    path: "Cura de Males",
    colors: ["Verde"],
    offering: ["mel", "água"],
    attributes: ["cura", "saúde", "limpeza", "força", "proteção"],
    syncPath: "cura",
    element: "planta",
    modality: "both",
    preparation: ["chá", "banho", "lambê"],
    invocationPhrases: [
      "Poejo, cura meus males",
      "Oxum, me restabelece",
      "Força e saúde me deem"
    ],
    domains: ["gripes", "resfriados", "saúde geral", "cura de energias negativas"]
  },
  {
    name: "Sálvia",
    orisha: "Oxum",
    path: "Purificação e Sabedoria",
    colors: ["Verde", "Roxo"],
    offering: ["brasa", "incenso", "água"],
    attributes: ["purificação", "sabedoria", "proteção", "cura", "meditação"],
    syncPath: "purificação",
    element: "planta",
    modality: "both",
    preparation: ["defumação", "infusão", "banho"],
    invocationPhrases: [
      "Sálvia, purifica meu espaço",
      "Oxum, me dá sabedoria",
      "Proteção me envolve"
    ],
    domains: ["purificação", "limpeza de ambientes", "sabedoria", "meditação", "proteção"]
  },
  {
    name: "Funcho",
    orisha: "Oxum",
    path: "Proteção e Fertilidade",
    colors: ["Verde"],
    offering: ["mel", "dindá"],
    attributes: ["proteção", "fertilidade", "saúde", "prosperidade", "força"],
    syncPath: "proteção",
    element: "planta",
    modality: "both",
    preparation: ["chá", "banho", "infusão"],
    invocationPhrases: [
      "Funcho, protege minha família",
      "Oxum, abençoa minha fertilidade",
      "Saúde e prosperidade me seguem"
    ],
    domains: ["fertilidade", "saúde feminina", "proteção familiar", "digestão"]
  },
  {
    name: "Endro",
    orisha: "Oxum",
    path: "Amor e Harmonia",
    colors: ["Verde"],
    offering: ["mel", "flores"],
    attributes: ["amor", "harmonia", "saúde", "proteção", "força"],
    syncPath: "amor",
    element: "planta",
    modality: "both",
    preparation: ["infusão", "banho", "chá"],
    invocationPhrases: [
      "Endro, traz amor ao meu lar",
      "Oxum, harmoniza meu coração",
      "Proteção me abençoia"
    ],
    domains: ["amor", "harmonia conjugal", "saúde geral", "proteção"]
  },
  {
    name: "Coentro",
    orisha: "Oxum",
    path: "Amor e Saúde",
    colors: ["Verde"],
    offering: ["mel", "água de flor"],
    attributes: ["amor", "saúde", "proteção", "prosperidade", "paz"],
    syncPath: "amor",
    element: "planta",
    modality: "both",
    preparation: ["chá", "banho", "infusão"],
    invocationPhrases: [
      "Coentro, atrai amor para mim",
      "Oxum, protege minha saúde",
      "Paz e prosperidade me abençoai"
    ],
    domains: ["amor", "saúde", "prosperidade", "proteção"]
  },
  {
    name: "Capim Santo",
    orisha: "Oxum",
    path: "Renovação e Paz",
    colors: ["Verde"],
    offering: ["água", "flores brancas"],
    attributes: ["renovação", "paz", "tranquilidade", "cura", "proteção"],
    syncPath: "renovação",
    element: "planta",
    modality: "both",
    preparation: ["chá", "banho", "defumação"],
    invocationPhrases: [
      "Capim Santo, renova minha energia",
      "Oxum, me dê paz",
      "Tranquilidade me envolve"
    ],
    domains: ["estresse", "ansiedade", "renovação energética", "paz interior"]
  },
  {
    name: "Camomila",
    orisha: "Oxum",
    path: "Calma e Descanso",
    colors: ["Branco", "Verde"],
    offering: ["mel", "flores brancas"],
    attributes: ["calma", "descanso", "paz", "cura", "tranquilidade"],
    syncPath: "calma",
    element: "planta",
    modality: "passive",
    preparation: ["chá", "banho", "infusão"],
    invocationPhrases: [
      "Camomila, acalma meu ser",
      "Oxum, me dê descanso",
      "Paz me reconforte"
    ],
    domains: ["insônia", "ansiedade", "estresse", "relaxamento", "paz"]
  },
  {
    name: "Menta",
    orisha: "Oxum",
    path: "Frescor e Clareza",
    colors: ["Verde"],
    offering: ["água", "mel"],
    attributes: ["frescor", "clareza", "cura", "proteção", "força"],
    syncPath: "frescor",
    element: "planta",
    modality: "both",
    preparation: ["chá", "banho", "suco", "infusão"],
    invocationPhrases: [
      "Menta, traz frescor à minha vida",
      "Oxum, clareza me dê",
      "Força e proteção me abençoai"
    ],
    domains: ["clareza mental", "digestão", "dor de cabeça", "frescor", "energia"]
  },
  {
    name: "Erva Doce",
    orisha: "Oxum",
    path: "Paz e Harmonia",
    colors: ["Verde"],
    offering: ["mel", "flores"],
    attributes: ["paz", "harmonia", "calma", "saúde", "proteção"],
    syncPath: "paz",
    element: "planta",
    modality: "both",
    preparation: ["chá", "banho", "infusão"],
    invocationPhrases: [
      "Erva Doce, traz paz ao meu lar",
      "Oxum, harmoniza minha vida",
      "Calma e proteção me envolvam"
    ],
    domains: ["paz interior", "harmonia familiar", "calma", "saúde digestiva"]
  },
  {
    name: "Gengibre",
    orisha: "Ogum",
    path: "Força e Vitalidade",
    colors: ["Amarelo", "Verde"],
    offering: ["mel", "limão"],
    attributes: ["força", "vitalidade", "coragem", "cura", "proteção"],
    syncPath: "força",
    element: "planta",
    modality: "active",
    preparation: ["chá", "suco", "banho", "lambê"],
    invocationPhrases: [
      "Gengibre, me dá força",
      "Ogum, vitalidade me abençoai",
      "Coragem e proteção me guiem"
    ],
    domains: ["força física", "imunidade", "coragem", "vitalidade", "energia"]
  },
  {
    name: "Banha de Galinha",
    orisha: "Omolu",
    path: "Cura Seca e Pele",
    colors: ["Amarelo", "Preto"],
    offering: ["pipoca", "carne seca", "dindá"],
    attributes: ["cura", "proteção", "saúde", "força", "limpeza"],
    syncPath: "cura",
    element: "animal",
    modality: "both",
    preparation: ["unguento", "cataplasma", "amuleto"],
    invocationPhrases: [
      "Omolu, cura minhas chagas",
      "Banha, protege minha pele",
      "Saúde me restabeleça"
    ],
    domains: ["doenças de pele", "cura", "proteção contra epidemics", "saúde"]
  },
  {
    name: "Mastruz",
    orisha: "Ogum",
    path: "Limpeza e Descarrego",
    colors: ["Verde"],
    offering: ["mel", "ferro"],
    attributes: ["limpeza", "descarrego", "proteção", "cura", "força"],
    syncPath: "limpeza",
    element: "planta",
    modality: "active",
    preparation: ["banho", "chá", "defumação", "lambê"],
    invocationPhrases: [
      "Mastruz, limpa toda negativez",
      "Ogum, me protege de todo mal",
      "Descarrego e força me deem"
    ],
    domains: ["descarrego", "limpeza espiritual", "proteção contra olho grosso", "cura"]
  },
  {
    name: "Artemísia",
    orisha: "Oxum",
    path: "Purificação Elevada",
    colors: ["Verde", "Prata"],
    offering: ["incenso", "água lunar", "flores brancas"],
    attributes: ["purificação", "proteção", "sabedoria", "cura", "elevação"],
    syncPath: "purificação",
    element: "planta",
    modality: "both",
    preparation: ["defumação", "infusão", "banho"],
    invocationPhrases: [
      "Artemísia, purifica meu ser",
      "Oxum, eleva minha consciência",
      "Sabedoria sagrada me guie"
    ],
    domains: ["purificação espiritual", "proteção elevada", "sabedoria", "meditação"]
  },
  {
    name: "Losna",
    orisha: "Oxum",
    path: "Cura Profunda",
    colors: ["Verde", "Cinza"],
    offering: ["mel", "absinto"],
    attributes: ["cura", "purificação", "proteção", "força", "limpeza"],
    syncPath: "cura",
    element: "planta",
    modality: "both",
    preparation: ["infusão", "banho", "amuleto"],
    invocationPhrases: [
      "Losna, cura meus males profundos",
      "Oxum, limpa minha alma",
      "Força me restabeleça"
    ],
    domains: ["cura profunda", "limpeza espiritual", "proteção", "saúde geral"]
  },
  {
    name: "Cebolinha",
    orisha: "Oxum",
    path: "Amor e Comunicação",
    colors: ["Verde"],
    offering: ["mel", "flores"],
    attributes: ["amor", "comunicação", "prosperidade", "proteção", "saúde"],
    syncPath: "amor",
    element: "planta",
    modality: "both",
    preparation: ["chá", "banho", "infusão"],
    invocationPhrases: [
      "Cebolinha, atrai amor",
      "Oxum, me ajuda a me expressar",
      "Prosperidade me acompanha"
    ],
    domains: ["amor", "comunicação", "prosperidade", "saúde do sangue"]
  },
  {
    name: "Salsa",
    orisha: "Oxum",
    path: "Saúde e Longevidade",
    colors: ["Verde"],
    offering: ["mel", "limão"],
    attributes: ["saúde", "longevidade", "força", "purificação", "proteção"],
    syncPath: "saúde",
    element: "planta",
    modality: "both",
    preparation: ["chá", "suco", "banho"],
    invocationPhrases: [
      "Salsa, me dê saúde",
      "Oxum, longevity me abençoai",
      "Força e proteção me guiem"
    ],
    domains: ["saúde geral", "sangue", "rim", "longevidade", "força"]
  },
  {
    name: "Aipo",
    orisha: "Oxum",
    path: "Vitalidade e Saúde",
    colors: ["Verde"],
    offering: ["mel", "água"],
    attributes: ["vitalidade", "saúde", "força", "limpeza", "proteção"],
    syncPath: "vitalidade",
    element: "planta",
    modality: "both",
    preparation: ["suco", "chá", "banho"],
    invocationPhrases: [
      "Aipo, me dá vitalidade",
      "Oxum, saúde me abençoai",
      "Força e limpeza me deem"
    ],
    domains: ["vitalidade", "saúde geral", "pressão arterial", "força"]
  },
  {
    name: "Couve",
    orisha: "Oxum",
    path: "Força e Recuperação",
    colors: ["Verde"],
    offering: ["mel", "água"],
    attributes: ["força", "recuperação", "saúde", "proteção", "vitalidade"],
    syncPath: "força",
    element: "planta",
    modality: "both",
    preparation: ["suco", "chá", "cataplasma"],
    invocationPhrases: [
      "Couve, me dá força para recuperar",
      "Oxum, saúde me restabeleça",
      "Vitalidade me renove"
    ],
    domains: ["recuperação", "saúde", "força", "inflamações", "vitalidade"]
  },
  {
    name: "Alface",
    orisha: "Oxum",
    path: "Calma e Sono",
    colors: ["Verde", "Branco"],
    offering: ["mel", "flores brancas"],
    attributes: ["calma", "sono", "paz", "tranquilidade", "cura"],
    syncPath: "calma",
    element: "planta",
    modality: "passive",
    preparation: ["suco", "chá", "banho"],
    invocationPhrases: [
      "Alface, me dá sono tranquilo",
      "Oxum, paz me conceda",
      "Tranquilidade me envolve"
    ],
    domains: ["insônia", "ansiedade", "calma", "sono reparador", "paz"]
  },
  {
    name: "Beterraba",
    orisha: "Oxum",
    path: "Sangue e Energia",
    colors: ["Vermelho", "Verde"],
    offering: ["mel", "sangue de boi"],
    attributes: ["energia", "sangue", "força", "vitalidade", "saúde"],
    syncPath: "energia",
    element: "planta",
    modality: "both",
    preparation: ["suco", "chá", "comida ritual"],
    invocationPhrases: [
      "Beterraba, fortalece meu sangue",
      "Oxum, energia me dê",
      "Força vital me abençoai"
    ],
    domains: ["anemia", "energia", "sangue", "força", "vitalidade"]
  },
  {
    name: "Berinjela",
    orisha: "Oxum",
    path: "Pureza e Limpeza",
    colors: ["Roxo", "Verde"],
    offering: ["mel", "água"],
    attributes: ["pureza", "limpeza", "saúde", "proteção", "força"],
    syncPath: "pureza",
    element: "planta",
    modality: "both",
    preparation: ["suco", "chá", "comida ritual"],
    invocationPhrases: [
      "Berinjela, purifica meu corpo",
      "Oxum, limpeza me dê",
      "Saúde e proteção me abençoai"
    ],
    domains: ["pureza do sangue", "colesterol", "saúde geral", "limpeza"]
  },
  {
    name: "Goiaba",
    orisha: "Oxum",
    path: "Fecundidade e Cura",
    colors: ["Verde", "Rosa"],
    offering: ["folhas", "fruta", "mel"],
    attributes: ["fecundidade", "cura", "saúde", "força", "proteção"],
    syncPath: "fecundidade",
    element: "planta",
    modality: "both",
    preparation: ["chá de folhas", "fruta fresca", "banho"],
    invocationPhrases: [
      "Goiaba, abençoa minha fecundidade",
      "Oxum, cura me dê",
      "Saúde e força me acompanhm"
    ],
    domains: ["fecundidade", "saúde intestinal", "cura", "força"]
  },
  {
    name: "Mamão",
    orisha: "Oxum",
    path: "Digestão e Limpeza",
    colors: ["Laranja", "Verde"],
    offering: ["fruta", "mel"],
    attributes: ["digestão", "limpeza", "saúde", "força", "vitalidade"],
    syncPath: "digestão",
    element: "planta",
    modality: "both",
    preparation: ["fruta fresca", "suco", "chá de folhas"],
    invocationPhrases: [
      "Mamão, limpa meu sistema",
      "Oxum, saúde digestiva me dê",
      "Força me abençoai"
    ],
    domains: ["digestão", "limpeza intestinal", "saúde", "vitalidade"]
  },
  {
    name: "Laranja",
    orisha: "Oxum",
    path: "Alegría e Saúde",
    colors: ["Laranja", "Verde"],
    offering: ["fruta", "sumo", "flores amarelas"],
    attributes: ["alegria", "saúde", "prosperidade", "força", "limpeza"],
    syncPath: "alegria",
    element: "planta",
    modality: "both",
    preparation: ["sumo", "chá de casca", "banho"],
    invocationPhrases: [
      "Laranja, traz-me alegria",
      "Oxum, saúde me abençoai",
      "Prosperidade me acompanha"
    ],
    domains: ["alegria", "saúde", "vitamina C", "prosperidade", "limpeza"]
  },
  {
    name: "Limão",
    orisha: "Oxum",
    path: "Purificação e Força",
    colors: ["Amarelo", "Verde"],
    offering: ["limão", "mel", "sal"],
    attributes: ["purificação", "força", "limpeza", "proteção", "saúde"],
    syncPath: "purificação",
    element: "planta",
    modality: "both",
    preparation: ["sumo", "banho", "defumação", "chá"],
    invocationPhrases: [
      "Limão, purifica meu ser",
      "Oxum, força me dê",
      "Proteção me abençoai"
    ],
    domains: ["purificação", "limpeza", "imunidade", "força", "proteção"]
  },
  {
    name: "Manga",
    orisha: "Oxum",
    path: "Doçura e Prosperidade",
    colors: ["Amarelo", "Verde", "Laranja"],
    offering: ["fruta madura", "mel"],
    attributes: ["doçura", "prosperidade", "saúde", "força", "alegria"],
    syncPath: "prosperidade",
    element: "planta",
    modality: "both",
    preparation: ["fruta fresca", "suco", "comida ritual"],
    invocationPhrases: [
      "Manga, traz-me prosperidade",
      "Oxum, doçura em minha vida",
      "Saúde e alegria me abençoai"
    ],
    domains: ["prosperidade", "saúde", "alegria", "força", "doçura de vida"]
  },
  {
    name: "Cacimba",
    orisha: "Oxum",
    path: "Água Sagrada",
    colors: ["Azul", "Branco"],
    offering: ["água de cacimba", "flores", "velas azuis"],
    attributes: ["pureza", "cura", "sabedoria", "paz", "renovação"],
    syncPath: "pureza",
    element: "água",
    modality: "passive",
    preparation: ["água de beber", "banho", "defumação com água"],
    invocationPhrases: [
      "Água sagrada, purifica-me",
      "Oxum, sabedoria me dê",
      "Paz me envolve"
    ],
    domains: ["purificação", "cura", "sabedoria", "paz interior", "renovação"]
  }
];

export function getData(): ErvaData {
  return ERVAS_DATA;
}

function getDataById(id: string): ErvaData | undefined {
  const normalizedId = id.toLowerCase().replace(/[_\s-]/g, '-');
  return herbs.find(h => h.name.toLowerCase().replace(/[_\s-]/g, '-') === normalizedId || h.name.toLowerCase() === normalizedId);
}

function getHerbs(): ErvaData[] {
  return herbs;
}

function getHerbsByOrisha(orisha: string): ErvaData[] {
  return herbs.filter(h => h.orisha.toLowerCase() === orisha.toLowerCase());
}

function getHerbsByElement(element: string): ErvaData[] {
  return herbs.filter(h => h.element.toLowerCase().includes(element.toLowerCase()));
}

function getHerbsByModality(modality: string): ErvaData[] {
  return herbs.filter(h => h.modality === modality || h.modality === 'both');
}

function getHerbsByAttribute(attribute: string): ErvaData[] {
  return herbs.filter(h => 
    h.attributes.some(attr => attr.toLowerCase().includes(attribute.toLowerCase()))
  );
}

function getHerbsByDomain(domain: string): ErvaData[] {
  return herbs.filter(h => 
    h.domains.some(d => d.toLowerCase().includes(domain.toLowerCase()))
  );
}

function getHerbByName(name: string): ErvaData | undefined {
  return herbs.find(h => h.name.toLowerCase() === name.toLowerCase());
}

function getPreparationMethods(): string[] {
  return ERVAS_DATA.preparation;
}

function getInvocationPhrases(): string[] {
  return ERVAS_DATA.invocationPhrases;
}

function getDomains(): string[] {
  return ERVAS_DATA.domains;
}

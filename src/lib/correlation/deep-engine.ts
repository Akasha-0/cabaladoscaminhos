/**
 * Deep Correlation Engine - Cross-System Spiritual Correlations
 * Based on IDEIA.md - Complete unified correlation matrix
 * 
 * Supports 15+ correlation types:
 * - day-orixa, day-chakra, day-planet
 * - planet-orixa, planet-chakra
 * - odu-orixa, odu-element
 * - orixa-colors, orixa-day, orixa-chakra, orixa-herbs
 * - chakra-element, chakra-planet
 * - tarot-deck, solfeggio-chakra
 * - numerology-odú
 */

// =============================================================================
// CORE TYPES
// =============================================================================

export type CorrelationType =
  | 'day-orixa' | 'day-chakra' | 'day-planet'
  | 'planet-orixa' | 'planet-chakra'
  | 'odu-orixa' | 'odu-element'
  | 'orixa-colors' | 'orixa-day' | 'orixa-chakra' | 'orixa-herbs'
  | 'chakra-element' | 'chakra-planet'
  | 'tarot-deck' | 'solfeggio-chakra'
  | 'numerology-odú';

export type StrengthLevel = 'weak' | 'medium' | 'strong' | 'perfect';

export interface CorrelationResult {
  source: string;
  target: string;
  type: CorrelationType;
  score: number; // 0-100
  description: string;
  strength: StrengthLevel;
}

export interface DayCorrelations {
  dia: string;
  chakras: string[];
  planetas: string[];
  orixas: string[];
  sephirot: string[];
  arcanos: string[];
  faseLua: string;
  oduRegentes: string[];
  cores: string[];
  mistério: string;
}

export interface OrixaCorrelations {
  orixa: string;
  dia: string;
  chakras: string[];
  planetas: string[];
  cores: string[];
  ervas: string[];
  quizilas: string[];
  saudacao: string;
  sephirah: string[];
  mistério: string;
}

export interface OduCorrelations {
  odu: string;
  numero: number;
  significado: string;
  elementos: string[];
  orixas: string[];
  quizilas: string[];
  preceptos: string[];
  ebó: string;
}

export interface SpiritualProfileInput {
  birthDate?: string; // DD/MM/YYYY format
  dayOfBirth?: number; // Day number (1-31)
  monthOfBirth?: number; // Month (1-12)
  yearOfBirth?: number; // Year (full 4 digits)
  lifePathNumber?: number; // Calculated numerology number
  oduBirth?: number; // Odú de Nascimento (1-16)
  oduName?: string; // Odú name (e.g., "Okaran", "Ejiokô")
  sunSign?: string; // Western zodiac sign
  dominantOrixa?: string;
  dominantChakra?: string;
  dominantPlanet?: string;
}

export interface ConvergenceResult {
  overallScore: number; // 0-100
  strength: StrengthLevel;
  breakdown: {
    type: string;
    score: number;
    description: string;
  }[];
  patterns: string[];
  dominantAxis: string;
  warnings: string[];
  recommendations: string[];
}

export interface CorrelationMatrix {
  systems: string[];
  matrix: number[][];
  labels: string[];
}

// =============================================================================
// DATA: DAY PORTAL MAPPINGS (from IDEIA.md pages 19-27, 136-148)
// =============================================================================

const DAY_PORTAL_DATA: Record<string, DayCorrelations> = {
  "segunda-feira": {
    dia: "Segunda-feira",
    chakras: ["1º Básico", "6º Frontal"],
    planetas: ["Lua", "Saturno"],
    orixas: ["Omolu", "Exu"],
    sephirot: ["Malkuth", "Yesod"],
    arcanos: ["A Sacerdotisa", "O Mundo"],
    faseLua: "Lua Minguante / Nova",
    oduRegentes: ["Okaran (1)", "Obará (6)"],
    cores: ["Vermelho", "Branco", "Preto"],
    mistério: "Dia de aterramento, limpeza espiritual, transmutação e respeito às almas e antepassados."
  },
  "terça-feira": {
    dia: "Terça-feira",
    chakras: ["2º Sacro"],
    planetas: ["Marte", "Plutão"],
    orixas: ["Iansã", "Ogum"],
    sephirot: ["Geburah"],
    arcanos: ["A Torre", "O Carro"],
    faseLua: "Lua Nova / Crescente",
    oduRegentes: ["Odi (7)", "Ejilsebora (12)"],
    cores: ["Laranja", "Vermelho"],
    mistério: "Dia de força, movimento, coragem, corte de demandas e quebra de energias paradas."
  },
  "quarta-feira": {
    dia: "Quarta-feira",
    chakras: ["3º Plexo Solar"],
    planetas: ["Mercúrio"],
    orixas: ["Xangô", "Iansã"],
    sephirot: ["Hod"],
    arcanos: ["O Mago", "O Eremita"],
    faseLua: "Lua Crescente",
    oduRegentes: ["Obará (6)", "Ejilsebora (12)"],
    cores: ["Amarelo"],
    mistério: "Dia da justiça divina, dos estudos, da mente concreta, da verdade e da razão."
  },
  "quinta-feira": {
    dia: "Quinta-feira",
    chakras: ["4º Cardíaco"],
    planetas: ["Júpiter"],
    orixas: ["Oxóssi"],
    sephirot: ["Chesed"],
    arcanos: ["O Hierofante"],
    faseLua: "Lua Crescente / Cheia",
    oduRegentes: ["Irosun (4)", "Oxé (5)"],
    cores: ["Verde"],
    mistério: "Dia da fartura, da busca por conhecimento, da expansão e da cura através das matas."
  },
  "sexta-feira": {
    dia: "Sexta-feira",
    chakras: ["7º Coronário"],
    planetas: ["Vênus"],
    orixas: ["Oxalá"],
    sephirot: ["Kether"],
    arcanos: ["O Imperador", "O Louco"],
    faseLua: "Lua Cheia",
    oduRegentes: ["EjiOníle (8)", "Alafia (16)"],
    cores: ["Branco", "Violeta"],
    mistério: "Dia da paz, da pureza, do silêncio, da gratidão e da conexão direta com o Divino."
  },
  "sábado": {
    dia: "Sábado",
    chakras: ["4º Cardíaco", "6º Frontal"],
    planetas: ["Saturno", "Urano"],
    orixas: ["Oxum", "Iemanjá"],
    sephirot: ["Binah", "Tiphereth"],
    arcanos: ["A Imperatriz", "A Estrela"],
    faseLua: "Lua Cheia",
    oduRegentes: ["Oxé (5)", "Ossá (9)"],
    cores: ["Rosa", "Azul Escuro"],
    mistério: "Dia das Grandes Mães. Rege o amor incondicional, a intuição, a fertilidade e as águas geradoras."
  },
  "domingo": {
    dia: "Domingo",
    chakras: ["3º Plexo Solar"],
    planetas: ["Sol"],
    orixas: ["Xangô"],
    sephirot: ["Tiphereth"],
    arcanos: ["O Sol"],
    faseLua: "Lua Cheia / Crescente",
    oduRegentes: ["Obará (6)", "EjiOníle (8)"],
    cores: ["Amarelo", "Dourado"],
    mistério: "Dia de recarregar a energia vital, focar no poder pessoal, no brilho próprio e no propósito de vida."
  }
};

// =============================================================================
// DATA: ORIXÁ FULL CORRELATIONS (from IDEIA.md pages 65-77)
// =============================================================================

const ORIXA_DATA: Record<string, OrixaCorrelations> = {
  "Oxalá": {
    orixa: "Oxalá",
    dia: "Sexta-feira",
    chakras: ["7º Coronário"],
    planetas: ["Sol", "Júpiter"],
    cores: ["Branco", "Marfim", "Opala"],
    ervas: ["Boldo", "Saião", "Manjericão Branco", "Algodoeiro", "Colônia"],
    quizilas: ["Bebidas alcoólicas", "Azeite de dendê", "Sal", "Roupas escuras"],
    saudacao: "Epà Babá!",
    sephirah: ["Kether"],
    mistério: "Fé, paz, pureza, equilíbrio espiritual e criação."
  },
  "Iemanjá": {
    orixa: "Iemanjá",
    dia: "Sábado",
    chakras: ["6º Frontal"],
    planetas: ["Lua", "Netuno"],
    cores: ["Azul Escuro", "Branco", "Transparente"],
    ervas: ["Colônia", "Alcaparra", "Folha de Lágrima-de-Nossa-Senhora", "Pata-de-vaca", "Erva-de-Santa-Luzia"],
    quizilas: ["Poeira", "Lama", "Caranguejo", "Carne de porco"],
    saudacao: "Odoyá!",
    sephirah: ["Binah", "Tiphereth"],
    mistério: "Maternidade, geração, equilíbrio mental e águas salgadas."
  },
  "Oxum": {
    orixa: "Oxum",
    dia: "Sábado",
    chakras: ["4º Cardíaco"],
    planetas: ["Vênus"],
    cores: ["Rosa", "Amarelo-ouro", "Azul-celeste"],
    ervas: ["Erva-doce", "Calêndula", "Camomila", "Folha de Dinheiro-em-penca", "Melissa", "Rosa Branca/Amarela"],
    quizilas: ["Ovos", "Abóbora", "Caranguejo", "Falar de miséria", "Chorar miséria"],
    saudacao: "Ora Yê Yê Ô!",
    sephirah: ["Tiphereth"],
    mistério: "Amor incondicional, doçura, ouro, fertilidade e águas doces."
  },
  "Ogum": {
    orixa: "Ogum",
    dia: "Terça-feira",
    chakras: ["5º Laríngeo"],
    planetas: ["Marte"],
    cores: ["Azul Claro", "Vermelho", "Verde"],
    ervas: ["Espada-de-são-jorge", "Quebra-demanda", "Guiné", "Aroeira", "Losna", "Folha de Manga"],
    quizilas: ["Quiabo", "Galo", "Mentira", "Traição", "Ferramentas cegas"],
    saudacao: "Patakori Ogum! / Ogunhê!",
    sephirah: ["Geburah"],
    mistério: "Lei, ordenação, caminhos abertos, coragem e execução."
  },
  "Oxóssi": {
    orixa: "Oxóssi",
    dia: "Quinta-feira",
    chakras: ["4º Cardíaco"],
    planetas: ["Júpiter"],
    cores: ["Verde", "Azul-turquesa"],
    ervas: ["Guiné", "Alecrim", "Samambaia", "Folha de Jurema", "Arruda", "Eucalipto", "Peregum Verde"],
    quizilas: ["Carne de caça", "Mel (em alguns terreiros)", "Cabeça de bicho"],
    saudacao: "Okê Arô!",
    sephirah: ["Chesed"],
    mistério: "Fartura, conhecimento, busca, direcionamento e cura pelas matas."
  },
  "Xangô": {
    orixa: "Xangô",
    dia: "Quarta-feira / Domingo",
    chakras: ["3º Plexo Solar"],
    planetas: ["Sol"],
    cores: ["Amarelo", "Marrom", "Vermelho", "Branco"],
    ervas: ["Quebra-pedra", "Erva-de-são-joão", "Folha de Café", "Manjericão Roxo", "Levante"],
    quizilas: ["Abóbora", "Caranguejo", "Injustiça", "Mentiras", "Caruru amanhecido"],
    saudacao: "Kaô Kabecilé!",
    sephirah: ["Hod", "Tiphereth"],
    mistério: "Justiça divina, razão, firmeza, equilíbrio e fogo purificador."
  },
  "Iansã": {
    orixa: "Iansã",
    dia: "Terça-feira / Quarta-feira",
    chakras: ["2º Sacro"],
    planetas: ["Urano", "Plutão"],
    cores: ["Laranja", "Amarelo", "Vermelho", "Coral"],
    ervas: ["Pinhão Roxo", "Espada-de-santa-bárbara", "Bambu", "Folha de Fumo", "Louro", "Manjericão Roxo"],
    quizilas: ["Abóbora", "Carne de carneiro", "Poeira acumulada", "Estagnação"],
    saudacao: "Eparrei Iansã! / Eparrei Oyá!",
    sephirah: ["Geburah", "Hod"],
    mistério: "Movimento, transformação, direção dos ventos, tempestades e eguns."
  },
  "Omolu": {
    orixa: "Omolu",
    dia: "Segunda-feira",
    chakras: ["1º Básico"],
    planetas: ["Saturno"],
    cores: ["Preto e Branco", "Vermelho e Preto", "Violeta"],
    ervas: ["Canela-de-velho", "Assa-peixe", "Erva-de-bicho", "Vassourinha de Relógio", "Manjericão Roxo"],
    quizilas: ["Carne de porco", "Pipoca queimada", "Clarity excessiva (no mistério)"],
    saudacao: "Atotô!",
    sephirah: ["Malkuth"],
    mistério: "Cura física, transmutação de doenças, terra, fim de ciclos e estrutura."
  },
  "Nanã": {
    orixa: "Nanã",
    dia: "Terça-feira / Sábado",
    chakras: ["1º Básico"],
    planetas: ["Saturno", "Lua"],
    cores: ["Lilás", "Roxo", "Azul-violeta"],
    ervas: ["Manjericão Roxo", "Assa-peixe", "Folha de Mostarda", "Trapoeraba Roxa", "Avenca"],
    quizilas: ["Objetos de metal ou ferro cortantes", "Velocidade excessiva", "Ansiedade"],
    saudacao: "Saluba Nanã!",
    sephirah: ["Malkuth", "Yesod"],
    mistério: "Sabedoria ancestral, paciência, o lodo primitivo, decantação e reencarnação."
  },
  "Oxumaré": {
    orixa: "Oxumaré",
    dia: "Terça-feira",
    chakras: ["2º Sacro"],
    planetas: ["Mercúrio", "Vênus"],
    cores: ["Arco-íris", "Amarelo", "Verde"],
    ervas: ["Dinheiro-em-penca", "Folha da Fortuna", "Samambaia", "Alfazema"],
    quizilas: ["Monotonia", "Ingratidão", "Maltratar répteis (cobras)"],
    saudacao: "Arroboboi Oxumaré!",
    sephirah: ["Hod"],
    mistério: "Ciclos, renovação, dualidade, movimento da vida e a riqueza flutuante."
  },
  "Exu": {
    orixa: "Exu",
    dia: "Segunda-feira",
    chakras: ["1º Básico"],
    planetas: ["Plutão"],
    cores: ["Preto e Vermelho", "Preto"],
    ervas: ["Pinhão Roxo", "Arruda", "Guiné", "Cactos", "Urtiga", "Folha de Fogo", "Folha de Manga"],
    quizilas: ["Sal puro", "Água fria sobre firmeza (sem reza)"],
    saudacao: "Laroyé Exu! / Exu Mojubá!",
    sephirah: ["Malkuth"],
    mistério: "Comunicação, dinamismo, o início de tudo, ordem, vitalidade e caminhos."
  }
};

// =============================================================================
// DATA: ODÚ FULL CORRELATIONS (from IDEIA.md pages 39-56)
// =============================================================================

const ODÚ_DATA: Record<string, OduCorrelations> = {
  "Okaran": {
    odu: "Okaran",
    numero: 1,
    significado: "O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado.",
    elementos: ["Terra", "Fogo"],
    orixas: ["Exu", "Omolu"],
    quizilas: ["Carne de porco", "Cachaça em excesso", "Andar na rua ao meio-dia ou meia-noite"],
    preceptos: ["Cultivar a paciência", "Não agir por impulso", "Cuidar rigorosamente de Exu e dos antepassados"],
    ebó: "Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos."
  },
  "Ejiokô": {
    odu: "Ejiokô",
    numero: 2,
    significado: "A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.",
    elementos: ["Ar", "Terra"],
    orixas: ["Ibeji", "Ogum"],
    quizilas: ["Comer ovos", "Rã", "Mentir ou trair a confiança dos outros"],
    preceptos: ["Manter a alegria interna", "Cuidar da criança interior", "Buscar sociedades justas"],
    ebó: "Doces, frutas para Ibeji, e comidas leves em praças ou jardins."
  },
  "Etaogundá": {
    odu: "Etaogundá",
    numero: 3,
    significado: "A revolta, a força física, a criação de ferramentas. O corte e a separação.",
    elementos: ["Fogo", "Terra"],
    orixas: ["Ogum", "Obaluaê"],
    quizilas: ["Usar facas ou objetos cortantes sem necessidade", "Carne de galo", "Violência verbal"],
    preceptos: ["Evitar brigas e discussões", "Manter o foco no trabalho e na justiça", "Não demandar contra os outros"],
    ebó: "Inhames assados, paliteiros de Ogum, limpeza com folhas de mariô e limpeza com ferro."
  },
  "Irosun": {
    odu: "Irosun",
    numero: 4,
    significado: "O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.",
    elementos: ["Fogo", "Terra"],
    orixas: ["Iemanjá", "Oxóssi", "Egum"],
    quizilas: ["Olhar para buracos vazios", "Usar roupas muito vermelhas em momentos de crise", "Mentira"],
    preceptos: ["Desenvolver a intuição", "Não ignorar avisos e sonhos", "Cuidar da saúde do sangue e dos olhos"],
    ebó: "Alimentos brancos, canjica na beira mar para Iemanjá, banhos de folhas frias (colônia, saião)."
  },
  "Oxé": {
    odu: "Oxé",
    numero: 5,
    significado: "O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Sangue menstrual.",
    elementos: ["Água"],
    orixas: ["Oxum", "Logun Edé"],
    quizilas: ["Comer ovos", "Comidas muito salgadas ou azedas", "Chorar miséria ou reclamar da vida"],
    preceptos: ["Cuidar da autoestima", "Usar perfumes", "Manter a higiene espiritual", "Buscar a diplomacia"],
    ebó: "Banhos de mel, caldas de frutas, oferendas com girassóis e moedas douradas em águas doces."
  },
  "Obará": {
    odu: "Obará",
    numero: 6,
    significado: "A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo.",
    elementos: ["Ar", "Fogo"],
    orixas: ["Xangô", "Oxóssi", "Logun Edé"],
    quizilas: ["Inveja", "Contar planos antes de realizá-los", "Comer abóbora", "Teimosia extrema"],
    preceptos: ["Ser generoso", "Estudar", "Manter a cabeça erguida", "Praticar a gratidão para atraer a riqueza"],
    ebó: "Oferecer seis tipos de frutas, amalá para Xangô, dar comida à terra e partilhar banquetes."
  },
  "Odi": {
    odu: "Odi",
    numero: 7,
    significado: "A teimosia, o renascimento, as coisas ocultas, o poço profundo.",
    elementos: ["Terra", "Água"],
    orixas: ["Omolu", "Oxumaré", "Exu"],
    quizilas: ["Dormir no escuro absoluto se estiver com medo", "Comer carne de caça", "Persistir no erro"],
    preceptos: ["Praticar o desapego", "Aceitar as mudanças da vida", "Não cavar o próprio buraco com mágoas"],
    ebó: "Pipoca (Deburu) para Omolu, banhos de lama ou argila, defumações pesadas com resinas."
  },
  "EjiOníle": {
    odu: "EjiOníle",
    numero: 8,
    significado: "A cabeça (Ori), a liderança, o topo do mundo, o sangue branco.",
    elementos: ["Ar", "Água"],
    orixas: ["Oxalá", "Jagun"],
    quizilas: ["Usar roupas pretas ou escuras", "Comer carne de sangue (carne vermelha) em dias de preceito"],
    preceptos: ["Cuidar muito bem do próprio Ori (cabeça)", "Buscar a paz", "Evitar o orgulho e a arrogância"],
    ebó: "Oferendas de canjica branca, algodão, banhos de boldo (tapete de Oxalá) e velas brancas."
  },
  "Ossá": {
    odu: "Ossá",
    numero: 9,
    significado: "O vento, as transformações rápidas, o reino das Iyami (as bruxas ancestrais).",
    elementos: ["Ar", "Água"],
    orixas: ["Iansã", "Iemanjá"],
    quizilas: ["Espalhar fofocas", "Ventanias fortes na praia (evitar banho de mar)", "Usar roupas rasgadas"],
    preceptos: ["Respeitar o poder feminino", "Controlar a impulsividade e as palavras", "Fluir com as mudanças"],
    ebó: "Sacudimentos com folhas de fumo ou pinhão roxo, oferendas de acarajé para Iansã no vento."
  },
  "Ofun": {
    odu: "Ofun",
    numero: 10,
    significado: "O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação.",
    elementos: ["Ar", "Água"],
    orixas: ["Oxalá", "Obá"],
    quizilas: ["Usar roupas pretas", "Comer comida amanhecida", "Faltar com o respeito aos mais velhos"],
    preceptos: ["Vestir-se de branco", "Manter o silêncio e a quietude", "Estudar a espiritualidade profunda"],
    ebó: "Tudo neste Odú pede rezas mansas, frutas brancas, banhos de leite de cabra ou ervas calmas."
  },
  "Owarin": {
    odu: "Owarin",
    numero: 11,
    significado: "A pressa, a ansiedade, a mudança de rumo rápida. O vento que espalha as folhas.",
    elementos: ["Fogo", "Ar"],
    orixas: ["Iansã", "Exu", "Ogum"],
    quizilas: ["Guardar objetos quebrados ou velhos em casa", "Procrastinar", "Roupas muito escuras"],
    preceptos: ["Organizar a mente e a rotina", "Canalizar a ansiedade em atividades físicas ou artísticas"],
    ebó: "Rodar chaves, acender velas nas esquinas, banhos de ervas quentes (guiné, arruda)."
  },
  "Ejilsebora": {
    odu: "Ejilsebora",
    numero: 12,
    significado: "A justiça, o fogo purificador, a guerra justa, os terremotos.",
    elementos: ["Fogo"],
    orixas: ["Xangô", "Obá"],
    quizilas: ["Praticar a injustiça", "Acoatrar mentiras", "Comer abóbora ou quiabo em excesso nas crises"],
    preceptos: ["Manter a integridade a todo custo", "Não julgar os outros sem provas", "Equilibrar a razão e a emoção"],
    ebó: "Firmezas com pedras de raio (meteoritos/quartzo marrom), amalá bem quente com folhas de fumo."
  },
  "Olobón": {
    odu: "Olobón",
    numero: 13,
    significado: "A doença, as transformações físicas, o fim de ciclos. O recolhimento.",
    elementos: ["Terra", "Água"],
    orixas: ["Nanã", "Omolu"],
    quizilas: ["Ambientes sujos ou bagunçados", "Comer carne de rã ou tartaruga", "Reclamar da velhice"],
    preceptos: ["Respeitar o tempo das coisas", "Buscar a sabedoria dos mais velhos", "Cuidar da saúde das articulações"],
    ebó: "Oferendas na lama ou no mangue para Nanã, ebó com feijão preto, velas lilases."
  },
  "Iká": {
    odu: "Iká",
    numero: 14,
    significado: "A traição, a cobra que morde, a sabedoria oculta e a renovação da pele.",
    elementos: ["Água", "Terra"],
    orixas: ["Oxumaré", "Ossain"],
    quizilas: ["Falsidade", "Maltratar animais (especialmente répteis)", "Revelar segredos confiados a você"],
    preceptos: ["Manter a discrição absoluta sobre sua vida pessoal", "Cultivar a flexibilidade perante os obstáculos"],
    ebó: "Banhos com folhas de fortuna e dinheiro-em-penca, amarrar fitas coloridas (7 cores)."
  },
  "Ogbogbé": {
    odu: "Ogbogbé",
    numero: 15,
    significado: "A feitiçaria, o corte pesado, as disputas por espaço ou poder.",
    elementos: ["Fogo", "Terra"],
    orixas: ["Obá", "Ewá", "Ogum"],
    quizilas: ["Invejar o espaço alheio", "Comer comidas muito apimentadas perto de dormir", "Brigas domésticas"],
    preceptos: ["Buscar a paz no lar", "Proteger a própria energia contra feitiçarias e inveja", "Focar no amor próprio"],
    ebó: "Oferendas com acarajés recheados, banhos de erva-de-bicho ou espada-de-santa-bárbara."
  },
  "Alafia": {
    odu: "Alafia",
    numero: 16,
    significado: "A paz absoluta, a luz total, a confirmação dos Deuses. Tudo está bem.",
    elementos: ["Ar", "Luz"],
    orixas: ["Orunmilá", "Oxalá"],
    quizilas: ["Duvidar da própria espiritualidade", "Orgulho", "Arrogância", "Não ouvir conselhos"],
    preceptos: ["Manter as práticas espirituais em dia", "Compartilhar a sabedoria com quem precisa", "Ser grato"],
    ebó: "Flores brancas, oferendas de frutas doces e claras, acender lâmpadas ou muitas velas brancas."
  }
};

// =============================================================================
// DATA: SOLFEGGIO FREQUENCIES TO CHAKRAS (from IDEIA.md pages 193-205)
// =============================================================================

const SOLFEGGIO_CHAKRA_MAP: Record<string, { chakra: string; frequency: string; elemento: string; geometry: string }> = {
  "963Hz": { chakra: "7º Coronário", frequency: "963Hz", elemento: "Éter", geometry: "Esfera" },
  "852Hz": { chakra: "6º Frontal", frequency: "852Hz", elemento: "Éter/Ar", geometry: "Icosaedro" },
  "741Hz": { chakra: "5º Laríngeo", frequency: "741Hz", elemento: "Ar", geometry: "Dodecaedro" },
  "639Hz": { chakra: "4º Cardíaco", frequency: "639Hz", elemento: "Ar/Água", geometry: "Octaedro" },
  "528Hz": { chakra: "3º Plexo Solar", frequency: "528Hz", elemento: "Fogo", geometry: "Tetraedro" },
  "417Hz": { chakra: "2º Sacro", frequency: "417Hz", elemento: "Água", geometry: "Cubo/Hexaedro" },
  "396Hz": { chakra: "1º Básico", frequency: "396Hz", elemento: "Terra", geometry: "Ponto/Cubo" }
};

// =============================================================================
// DATA: NUMEROLOGY TO ODÚ (from IDEIA.md pages 150-166)
// =============================================================================

const NUMEROLOGY_ODU_MAP: Record<number, { odu: string; numero: number; arcano: string; sephirahVector: string }> = {
  1: { odu: "Okaran", numero: 1, arcano: "O Mago / O Louco", sephirahVector: "Kether para Chokmah" },
  2: { odu: "Ejiokô", numero: 2, arcano: "A Sacerdotisa", sephirahVector: "Chokmah para Binah" },
  3: { odu: "Etaogundá", numero: 3, arcano: "A Imperatriz", sephirahVector: "Binah para Chesed" },
  4: { odu: "Irosun", numero: 4, arcano: "O Imperador", sephirahVector: "Chesed para Geburah" },
  5: { odu: "Oxé", numero: 5, arcano: "O Hierofante", sephirahVector: "Geburah para Tiphereth" },
  6: { odu: "Obará", numero: 6, arcano: "Os Enamorados", sephirahVector: "Tiphereth para Netzach" },
  7: { odu: "Odi", numero: 7, arcano: "O Carro", sephirahVector: "Tiphereth para Hod" },
  8: { odu: "EjiOníle", numero: 8, arcano: "A Justiça / A Força", sephirahVector: "Hod para Yesod" },
  9: { odu: "Ossá", numero: 9, arcano: "O Eremita", sephirahVector: "Yesod para Malkuth" },
  10: { odu: "Ofun", numero: 10, arcano: "A Roda da Fortuna", sephirahVector: "Malkuth" },
  11: { odu: "Alafia", numero: 16, arcano: "A Força / O Pendurado", sephirahVector: "Alinhamento Completo" }
};

// =============================================================================
// DATA: LENORMAND MESA REAL CRITICAL HOUSES (from IDEIA.md pages 85-122)
// =============================================================================

const LENORMAND_CRITICAL_HOUSES: Record<number, { carta: string; significado: string; area: string }> = {
  24: { carta: "O Coração", significado: "Amor, paixão, entrega emocional", area: "Amor" },
  34: { carta: "Os Peixes", significado: "Dinheiro, bens materiais, fluxo financeiro", area: "Dinheiro" },
  14: { carta: "A Raposa", significado: "Estratégia, armadilhas, falsidade, trabalho", area: "Trabalho" },
  5: { carta: "A Árvore", significado: "Saúde, crescimento lento, ancestralidade", area: "Saúde" },
  8: { carta: "O Caixão", significado: "Fim de ciclo, transformações radicais", area: "Transformação" },
  13: { carta: "A Criança", significado: "Novos começos, pureza, filhos", area: "Novos Projetos" },
  16: { carta: "A Estrela", significado: "Sucesso, brilho pessoal, destino", area: "Destino" },
  33: { carta: "A Chave", significado: "Soluções, abertura de portas, destino final", area: "Resultado Final" }
};

// =============================================================================
// DATA: CHAKRA TO PLANET (from IDEIA.md)
// =============================================================================

const CHAKRA_PLANET_MAP: Record<string, string[]> = {
  "1º Básico": ["Saturno"],
  "2º Sacro": ["Marte", "Plutão", "Mercúrio", "Vênus"],
  "3º Plexo Solar": ["Sol", "Mercúrio"],
  "4º Cardíaco": ["Vênus", "Júpiter"],
  "5º Laríngeo": ["Marte", "Mercúrio"],
  "6º Frontal": ["Lua", "Netuno"],
  "7º Coronário": ["Sol", "Júpiter"]
};

// =============================================================================
// DATA: CHAKRA TO ELEMENT (from IDEIA.md)
// =============================================================================

const CHAKRA_ELEMENT_MAP: Record<string, string[]> = {
  "1º Básico": ["Terra"],
  "2º Sacro": ["Água"],
  "3º Plexo Solar": ["Fogo"],
  "4º Cardíaco": ["Ar", "Água"],
  "5º Laríngeo": ["Ar"],
  "6º Frontal": ["Éter", "Ar"],
  "7º Coronário": ["Éter"]
};

// =============================================================================
// DATA: ELEMENT COMBINATIONS FOR SCORING (from IDEIA.md)
// =============================================================================

const ELEMENT_HIERARCHY: Record<string, Record<string, number>> = {
  "Terra": { "Terra": 100, "Água": 60, "Fogo": 40, "Ar": 50 },
  "Água": { "Terra": 60, "Água": 100, "Fogo": 40, "Ar": 70 },
  "Fogo": { "Terra": 40, "Água": 40, "Fogo": 100, "Ar": 70 },
  "Ar": { "Terra": 50, "Água": 70, "Fogo": 70, "Ar": 100 },
  "Éter": { "Terra": 50, "Água": 60, "Fogo": 60, "Ar": 70, "Éter": 100, "Luz": 80 }
};

// =============================================================================
// SCORING WEIGHTS BY CORRELATION TYPE
// =============================================================================

const CORRELATION_WEIGHTS: Record<CorrelationType, number> = {
  'day-orixa': 1.0,
  'day-chakra': 1.0,
  'day-planet': 0.8,
  'planet-orixa': 1.2,
  'planet-chakra': 1.1,
  'odu-orixa': 1.5,
  'odu-element': 1.3,
  'orixa-colors': 0.8,
  'orixa-day': 0.9,
  'orixa-chakra': 1.4,
  'orixa-herbs': 0.7,
  'chakra-element': 1.2,
  'chakra-planet': 1.1,
  'tarot-deck': 0.9,
  'solfeggio-chakra': 1.0,
  'numerology-odú': 1.2
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function normalizeDay(day: string): string {
  const dayLower = day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dayMap: Record<string, string> = {
    "segunda": "segunda-feira",
    "terca": "terça-feira",
    "quarta": "quarta-feira",
    "quinta": "quinta-feira",
    "sexta": "sexta-feira",
    "sabado": "sábado",
    "domingo": "domingo",
    "monday": "segunda-feira",
    "tuesday": "terça-feira",
    "wednesday": "quarta-feira",
    "thursday": "quinta-feira",
    "friday": "sexta-feira",
    "saturday": "sábado",
    "sunday": "domingo"
  };
  return dayMap[dayLower] || dayLower;
}

function normalizeOrixa(orixa: string): string {
  const orixaLower = orixa.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const orixaMap: Record<string, string> = {
    "oxala": "Oxalá",
    "iemanjá": "Iemanjá",
    "oxum": "Oxum",
    "ogum": "Ogum",
    "oxossi": "Oxóssi",
    "xangô": "Xangô",
    "iansã": "Iansã",
    "omolu": "Omolu",
    "nanã": "Nanã",
    "oxumaré": "Oxumaré",
    "exu": "Exu"
  };
  return orixaMap[orixaLower] || orixa;
}

function normalizeOdu(odu: string): string {
  const oduLower = odu.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const oduMap: Record<string, string> = {
    "okaran": "Okaran",
    "ejiokô": "Ejiokô",
    "etaogundá": "Etaogundá",
    "irosun": "Irosun",
    "oxé": "Oxé",
    "obará": "Obará",
    "odi": "Odi",
    "ejioníle": "EjiOníle",
    "ossá": "Ossá",
    "ofun": "Ofun",
    "owarin": "Owarin",
    "ejilsebora": "Ejilsebora",
    "olobón": "Olobón",
    "iká": "Iká",
    "ogbogbé": "Ogbogbé",
    "alafia": "Alafia"
  };
  return oduMap[oduLower] || odu;
}

function getStrengthFromScore(score: number): StrengthLevel {
  if (score >= 90) return 'perfect';
  if (score >= 70) return 'strong';
  if (score >= 50) return 'medium';
  return 'weak';
}

function calculateElementScore(el1: string, el2: string): number {
  const e1 = el1.split('/')[0].trim();
  const e2 = el2.split('/')[0].trim();
  return ELEMENT_HIERARCHY[e1]?.[e2] ?? 50;
}

// =============================================================================
// PRIMARY CORRELATION LOOKUP
// =============================================================================

/**
 * Get all correlations between two spiritual elements
 */
export function correlate(a: string, b: string): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  const aNorm = normalizeOrixa(a) || normalizeOdu(a) || a;
  const bNorm = normalizeOrixa(b) || normalizeOdu(b) || b;

  // Check day-orixa correlations
  for (const [day, data] of Object.entries(DAY_PORTAL_DATA)) {
    if (data.orixas.some(o => normalizeOrixa(o) === aNorm || normalizeOrixa(o) === bNorm)) {
      if (day.includes(aNorm.toLowerCase()) || day.includes(bNorm.toLowerCase()) ||
          data.orixas.some(o => o === aNorm || o === bNorm)) {
        results.push({
          source: a,
          target: b,
          type: 'day-orixa',
          score: 85,
          description: `${day} está correlacionado com ${data.orixas.join(' e ')}`,
          strength: 'strong'
        });
      }
    }
  }

  // Check orixa-chakra correlations
  for (const [orixa, data] of Object.entries(ORIXA_DATA)) {
    if ((aNorm === orixa || bNorm === orixa)) {
      const other = aNorm === orixa ? bNorm : aNorm;
      if (data.chakras.some(c => c.toLowerCase().includes(other.toLowerCase()))) {
        results.push({
          source: a,
          target: b,
          type: 'orixa-chakra',
          score: 95,
          description: `${orixa} está associado ao chakra ${data.chakras.join(' e ')}`,
          strength: 'perfect'
        });
      }
    }
  }

  // Check odu-orixa correlations
  for (const [odu, data] of Object.entries(ODÚ_DATA)) {
    if ((normalizeOdu(a) === odu || normalizeOdu(b) === odu)) {
      const other = normalizeOdu(a) === odu ? bNorm : aNorm;
      if (data.orixas.some(o => normalizeOrixa(o) === normalizeOrixa(other))) {
        results.push({
          source: a,
          target: b,
          type: 'odu-orixa',
          score: 100,
          description: `${odu} (Odú ${data.numero}) está associado a ${data.orixas.join(' e ')}`,
          strength: 'perfect'
        });
      }
    }
  }

  // Check odu-element correlations
  for (const [odu, data] of Object.entries(ODÚ_DATA)) {
    if (normalizeOdu(a) === odu || normalizeOdu(b) === odu) {
      const other = normalizeOdu(a) === odu ? bNorm : aNorm;
      if (data.elementos.some(e => e.toLowerCase().includes(other.toLowerCase()))) {
        results.push({
          source: a,
          target: b,
          type: 'odu-element',
          score: 80,
          description: `${odu} possui o elemento ${data.elementos.join(' / ')}`,
          strength: 'strong'
        });
      }
    }
  }

  return results;
}

// =============================================================================
// DAY CORRELATIONS
// =============================================================================

/**
 * Get all correlations for a given day of the week
 */
export function getDayCorrelations(dia: string): DayCorrelations | null {
  const normalizedDay = normalizeDay(dia);
  return DAY_PORTAL_DATA[normalizedDay] || null;
}

// =============================================================================
// ORIXÁ CORRELATIONS
// =============================================================================

/**
 * Get all correlations for an Orixá
 */
export function getOrixaCorrelations(orixa: string): OrixaCorrelations | null {
  const normalizedOrixa = normalizeOrixa(orixa);
  return ORIXA_DATA[normalizedOrixa] || null;
}

// =============================================================================
// ODÚ CORRELATIONS
// =============================================================================

/**
 * Get all correlations for an Odú
 */
export function getOduCorrelations(odu: string | number): OduCorrelations | null {
  if (typeof odu === 'number') {
    for (const data of Object.values(ODÚ_DATA)) {
      if (data.numero === odu) return data;
    }
    return null;
  }
  const normalizedOdu = normalizeOdu(odu);
  return ODÚ_DATA[normalizedOdu] || null;
}

// =============================================================================
// SOLFEGGIO TO CHAKRA
// =============================================================================

/**
 * Get chakra correlation for a Solfeggio frequency
 */
export function getSolfeggioChakra(frequency: string): { chakra: string; frequency: string; elemento: string } | null {
  const freq = frequency.replace('Hz', '') + 'Hz';
  return SOLFEGGIO_CHAKRA_MAP[freq] || null;
}

// =============================================================================
// NUMEROLOGY TO ODÚ
// =============================================================================

/**
 * Get Odú correlation for a numerology number
 */
export function getNumerologyOdu(numero: number): { odu: string; numero: number; arcano: string; sephirahVector: string } | null {
  return NUMEROLOGY_ODU_MAP[numero] || null;
}

// =============================================================================
// SCORING ALGORITHM
// =============================================================================

/**
 * Calculate score between two elements
 */
export function calculateScore(a: string, b: string): number {
  const aNorm = a.split('/')[0].trim().toLowerCase();
  const bNorm = b.split('/')[0].trim().toLowerCase();

  // Same element = perfect score
  if (aNorm === bNorm) return 100;

  // Complementary elements
  const complementary: Record<string, string[]> = {
    "fogo": ["ar"],
    "ar": ["fogo", "água"],
    "água": ["terra"],
    "terra": ["água"]
  };

  if (complementary[aNorm]?.includes(bNorm) || complementary[bNorm]?.includes(aNorm)) {
    return 70;
  }

  // Harmonious combinations
  const harmonious: Record<string, string[]> = {
    "água": ["água", "terra"],
    "terra": ["terra", "água"],
    "ar": ["ar"],
    "fogo": ["fogo"]
  };

  if (harmonious[aNorm]?.includes(bNorm)) return 80;

  // Complex elements (fire + water)
  if ((aNorm === 'fogo' && bNorm === 'água') || (aNorm === 'água' && bNorm === 'fogo')) {
    return 40;
  }

  // Default
  return calculateElementScore(a, b);
}

// =============================================================================
// CONVERGENCE DETECTION
// =============================================================================

/**
 * Calculate convergence score for a spiritual profile
 * 
 * Detects when multiple elements point to the same spiritual axis,
 * indicating strong karmic patterns or spiritual alignment.
 */
export function calculateConvergence(profile: SpiritualProfileInput): ConvergenceResult {
  const breakdown: ConvergenceResult['breakdown'] = [];
  const patterns: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let totalScore = 0;
  let weightSum = 0;

  // Calculate Life Path to Odú correlation
  if (profile.lifePathNumber) {
    const numerologyData = getNumerologyOdu(profile.lifePathNumber);
    if (numerologyData) {
      if (profile.oduBirth && (profile.oduBirth === numerologyData.numero || 
          (profile.lifePathNumber === 11 && profile.oduBirth === 16))) {
        const score = 100;
        totalScore += score * CORRELATION_WEIGHTS['numerology-odú'];
        weightSum += CORRELATION_WEIGHTS['numerology-odú'];
        breakdown.push({
          type: 'numerology-odú',
          score,
          description: `Life Path ${profile.lifePathNumber} alinha com ${numerologyData.odu} (${numerologyData.sephirahVector})`
        });
        patterns.push(`Alinhamento completo: Life Path e Odú de Nascimento convergem`);
      } else {
        const score = 60;
        totalScore += score * CORRELATION_WEIGHTS['numerology-odú'];
        weightSum += CORRELATION_WEIGHTS['numerology-odú'];
        breakdown.push({
          type: 'numerology-odú',
          score,
          description: `Life Path ${profile.lifePathNumber} → ${numerologyData.odu}`
        });
      }
    }
  }

  // Calculate Day energy correlation
  if (profile.birthDate) {
    const parts = profile.birthDate.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      // Get day of week for birth date
      const date = new Date(year, month - 1, day);
      const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
      const dayOfWeek = days[date.getDay()];
      const dayData = getDayCorrelations(dayOfWeek);
      
      if (dayData) {
        // Check if day energy matches dominant Orixá
        if (profile.dominantOrixa && dayData.orixas.some(o => normalizeOrixa(o) === normalizeOrixa(profile.dominantOrixa!))) {
          const score = 95;
          totalScore += score * CORRELATION_WEIGHTS['day-orixa'];
          weightSum += CORRELATION_WEIGHTS['day-orixa'];
          breakdown.push({
            type: 'day-orixa',
            score,
            description: `Nascido em ${dayOfWeek}, alinhado com ${profile.dominantOrixa}`
          });
          patterns.push(`Energia do dia de nascimento converge com Orixá dominante`);
        }

        // Check if day chakra matches dominant Chakra
        if (profile.dominantChakra && dayData.chakras.includes(profile.dominantChakra)) {
          const score = 90;
          totalScore += score * CORRELATION_WEIGHTS['day-chakra'];
          weightSum += CORRELATION_WEIGHTS['day-chakra'];
          breakdown.push({
            type: 'day-chakra',
            score,
            description: `Dia ${dayOfWeek} vibra no chakra ${profile.dominantChakra}`
          });
        }
      }
    }
  }

  // Calculate Odú to Orixá correlation
  if (profile.oduName || profile.oduBirth) {
    const oduData = getOduCorrelations(profile.oduName || profile.oduBirth!);
    if (oduData && profile.dominantOrixa) {
      if (oduData.orixas.some(o => normalizeOrixa(o) === normalizeOrixa(profile.dominantOrixa!))) {
        const score = 100;
        totalScore += score * CORRELATION_WEIGHTS['odu-orixa'];
        weightSum += CORRELATION_WEIGHTS['odu-orixa'];
        breakdown.push({
          type: 'odu-orixa',
          score,
          description: `${oduData.odu} aponta diretamente para ${profile.dominantOrixa}`
        });
        patterns.push(`Odú de Nascimento confirma Orixá dominante: convergência forte`);
      }
    }
  }

  // Calculate Sun Sign to Chakra correlation
  const sunChakraMap: Record<string, string> = {
    "aries": "3º Plexo Solar",
    "touro": "4º Cardíaco",
    "gemeos": "5º Laríngeo",
    "cancer": "6º Frontal",
    "leao": "3º Plexo Solar",
    "virgem": "5º Laríngeo",
    "libra": "4º Cardíaco",
    "escorpiao": "2º Sacro",
    "sagitario": "4º Cardíaco",
    "capricornio": "1º Básico",
    "aquario": "5º Laríngeo",
    "peixes": "6º Frontal"
  };

  if (profile.sunSign) {
    const signLower = profile.sunSign.toLowerCase();
    const signChakra = sunChakraMap[signLower];
    if (signChakra) {
      const score = profile.dominantChakra === signChakra ? 90 : 50;
      totalScore += score * CORRELATION_WEIGHTS['chakra-planet'];
      weightSum += CORRELATION_WEIGHTS['chakra-planet'];
      breakdown.push({
        type: 'chakra-planet',
        score,
        description: `${profile.sunSign} vibra no chakra ${signChakra}`
      });

      if (profile.dominantChakra === signChakra) {
        patterns.push(`Sol em ${profile.sunSign} confirma chakra dominante`);
      }
    }
  }

  // Calculate convergence score
  const normalizedScore = weightSum > 0 ? Math.round(totalScore / weightSum) : 0;

  // Generate warnings based on patterns
  const hasMultipleOrixas = breakdown.filter(b => b.type === 'odu-orixa' || b.type === 'day-orixa').length > 1;
  if (hasMultipleOrixas) {
    warnings.push("Múltiplos Odús apontando para Orixás diferentes - verificar qual está mais ativo");
  }

  // Generate recommendations
  if (patterns.length >= 3) {
    recommendations.push("Alinhamento espiritual forte - momento propício para firmezas e ebós de proteção");
  }
  if (normalizedScore >= 80) {
    recommendations.push("Perfil altamente convergente - trabalho espiritual trará resultados rápidos");
  }

  return {
    overallScore: normalizedScore,
    strength: getStrengthFromScore(normalizedScore),
    breakdown,
    patterns,
    dominantAxis: patterns.length > 0 ? patterns[0].split(':')[0].trim() : "Sem eixo dominante detectado",
    warnings,
    recommendations
  };
}

// =============================================================================
// CORRELATION MATRIX BUILDER
// =============================================================================

/**
 * Build a correlation matrix for visualization
 * 
 * Creates a 2D matrix showing relationship strength between all spiritual systems:
 * - Days of week
 * - Orixás
 * - Chakras
 * - Planets
 * - Odús
 * - Elements
 */
export function buildCorrelationMatrix(profile?: SpiritualProfileInput): CorrelationMatrix {
  const systems = ['Dias', 'Orixás', 'Chakras', 'Planetas', 'Odús', 'Elementos'];
  const labels: string[] = [];
  
  // Collect all labels from each system
  const dayLabels = Object.values(DAY_PORTAL_DATA).map(d => d.dia);
  const orixaLabels = Object.keys(ORIXA_DATA);
  const chakraLabels = [...new Set(Object.values(ORIXA_DATA).flatMap(o => o.chakras))];
  const planetLabels = [...new Set(Object.values(DAY_PORTAL_DATA).flatMap(d => d.planetas))];
  const oduLabels = Object.keys(ODÚ_DATA);
  const elementLabels = [...new Set(Object.values(ODÚ_DATA).flatMap(o => o.elementos))];

  labels.push(...dayLabels, ...orixaLabels, ...chakraLabels, ...planetLabels, ...oduLabels, ...elementLabels);

  const n = labels.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

  // Build correlation matrix
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 100;
        continue;
      }

      const labelI = labels[i];
      const labelJ = labels[j];

      // Check day-orixa correlations
      for (const [day, data] of Object.entries(DAY_PORTAL_DATA)) {
        if (data.dia === labelI && data.orixas.includes(labelJ)) {
          matrix[i][j] = Math.max(matrix[i][j], 85);
        }
        if (data.orixas.includes(labelI) && data.dia === labelJ) {
          matrix[i][j] = Math.max(matrix[i][j], 85);
        }
      }

      // Check orixa-chakra correlations
      const orixaDataI = ORIXA_DATA[labelI];
      const orixaDataJ = ORIXA_DATA[labelJ];
      if (orixaDataI && orixaDataJ.chakras.includes(labelJ)) {
        matrix[i][j] = Math.max(matrix[i][j], 95);
      }
      if (orixaDataJ && orixaDataJ.chakras.includes(labelI)) {
        matrix[i][j] = Math.max(matrix[i][j], 95);
      }

      // Check orixa-day correlations
      if (orixaDataI && orixaDataI.dia.includes(labelJ)) {
        matrix[i][j] = Math.max(matrix[i][j], 90);
      }
      if (orixaDataJ && orixaDataJ.dia.includes(labelI)) {
        matrix[i][j] = Math.max(matrix[i][j], 90);
      }

      // Check odu-orixa correlations
      for (const [odu, oduData] of Object.entries(ODÚ_DATA)) {
        if (odu === labelI && oduData.orixas.some(o => normalizeOrixa(o) === normalizeOrixa(labelJ))) {
          matrix[i][j] = Math.max(matrix[i][j], 100);
        }
        if (odu === labelJ && oduData.orixas.some(o => normalizeOrixa(o) === normalizeOrixa(labelI))) {
          matrix[i][j] = Math.max(matrix[i][j], 100);
        }
      }

      // Check odu-element correlations
      for (const [odu, oduData] of Object.entries(ODÚ_DATA)) {
        if (odu === labelI && oduData.elementos.includes(labelJ)) {
          matrix[i][j] = Math.max(matrix[i][j], 80);
        }
        if (odu === labelJ && oduData.elementos.includes(labelI)) {
          matrix[i][j] = Math.max(matrix[i][j], 80);
        }
      }

      // Check chakra-planet correlations
      for (const [chakra, planets] of Object.entries(CHAKRA_PLANET_MAP)) {
        if (chakra === labelI && planets.includes(labelJ)) {
          matrix[i][j] = Math.max(matrix[i][j], 75);
        }
        if (chakra === labelJ && planets.includes(labelI)) {
          matrix[i][j] = Math.max(matrix[i][j], 75);
        }
      }

      // Check element scores
      if (labelI !== labelJ) {
        const elemScore = calculateElementScore(labelI, labelJ);
        matrix[i][j] = Math.max(matrix[i][j], elemScore);
      }
    }
  }

  return { systems, matrix, labels };
}

// =============================================================================
// LENORMAND MESA REAL ANALYSIS
// =============================================================================

/**
 * Get Lenormand critical house information
 */
export function getMesaRealHouse(houseNumber: number): { carta: string; significado: string; area: string } | null {
  return LENORMAND_CRITICAL_HOUSES[houseNumber] || null;
}

// =============================================================================
// EXPORT ALL DATA FOR EXTERNAL USE
// =============================================================================

export const CORRELATION_DATA = {
  DAY_PORTALS: DAY_PORTAL_DATA,
  ORIXA_DATA,
  ODÚ_DATA,
  SOLFEGGIO_CHAKRA_MAP,
  NUMEROLOGY_ODU_MAP,
  LENORMAND_CRITICAL_HOUSES,
  CHAKRA_PLANET_MAP,
  CHAKRA_ELEMENT_MAP,
  ELEMENT_HIERARCHY,
  CORRELATION_WEIGHTS
};

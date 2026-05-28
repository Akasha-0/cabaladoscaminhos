// Spiritual data collection
// Skip linting

export interface Orixa {
  name: string;
  day: string;
  colors: string[];
  chakra: string;
  planet: string;
  herbs: string[];
  quizilas: string[];
  greeting: string;
  mystery: string;
}

export interface Odu {
  number: number;
  name: string;
  meaning: string;
  elements: string;
  orixas: string[];
  quizilas: string;
  precepts: string;
  ebos: string;
}

export interface DayOfWeek {
  day: string;
  chakras: string[];
  colors: string[];
  planets: string[];
  orixas: string[];
  sephirot: string[];
  mystery: string;
}

export interface Chakra {
  number: number;
  name: string;
  sanskrit: string;
  color: string;
  element: string;
  frequency: string;
  planet: string;
  sephirah: string;
  orixas: string[];
}

export interface Sephirah {
  name: string;
  path: number;
  meaning: string;
  attribute: string;
  zodiac: string;
  planet: string;
  sephirahType: string;
}

export interface TarotArcane {
  number: number;
  name: string;
  keywords: string[];
  element: string;
  zodiac: string;
  meaning: string;
}

export interface LunarPhase {
  name: string;
  state: string;
  window: string;
  rituals: string;
  orixas: string[];
}

export interface HerbType {
  name: string;
  energy: string;
  function: string;
  herbs: string[];
  chakra: string;
  orixa: string;
  bathType: string;
}

// Orixás
const ORIXAS: Orixa[] = [
  {
    name: "Oxalá",
    day: "Sexta-feira",
    colors: ["Branco", "Marfim", "Opala"],
    chakra: "7º Coronário",
    planet: "Sol / Júpiter",
    herbs: ["Boldo", "Saião", "Manjericão Branco", "Algodoeiro", "Colônia"],
    quizilas: ["Bebidas alcoólicas", "Azeite de dendê", "Sal", "Roupas escuras"],
    greeting: "Epà Babá!",
    mystery: "Fé, paz, pureza, equilíbrio espiritual e criação.",
  },
  {
    name: "Iemanjá",
    day: "Sábado",
    colors: ["Azul Escuro", "Branco", "Transparente"],
    chakra: "6º Frontal",
    planet: "Lua / Netuno",
    herbs: ["Colônia", "Alcaparra", "Folha de Lágrima-de-Nossa-Senhora", "Pata-de-vaca"],
    quizilas: ["Poeira", "Lama", "Caranguejo", "Carne de porco"],
    greeting: "Odoyá!",
    mystery: "Maternidade, geração, equilíbrio mental e águas salgadas.",
  },
  {
    name: "Oxum",
    day: "Sábado",
    colors: ["Rosa", "Amarelo-ouro", "Azul-celeste"],
    chakra: "4º Cardíaco",
    planet: "Vênus",
    herbs: ["Erva-doce", "Calêndula", "Camomila", "Folha de Dinheiro-em-penca", "Melissa"],
    quizilas: ["Ovos", "Abóbora", "Caranguejo", "Falar de miséria"],
    greeting: "Ora Yê Yê Ô!",
    mystery: "Amor incondicional, doçura, ouro, fertilidade e águas doces.",
  },
  {
    name: "Ogum",
    day: "Terça-feira",
    colors: ["Azul Claro", "Vermelho", "Verde"],
    chakra: "5º Laríngeo",
    planet: "Marte",
    herbs: ["Espada-de-são-jorge", "Quebra-demanda", "Guiné", "Aroeira", "Losna"],
    quizilas: ["Quiabo", "Galo", "Mentira", "Traição", "Ferramentas cegas"],
    greeting: "Patakori Ogum! / Ogunhê!",
    mystery: "Lei, ordenação, caminhos abertos, coragem e execução.",
  },
  {
    name: "Oxóssi",
    day: "Quinta-feira",
    colors: ["Verde", "Azul-turquesa"],
    chakra: "4º Cardíaco",
    planet: "Júpiter",
    herbs: ["Guiné", "Alecrim", "Samambaia", "Folha de Jurema", "Arruda", "Eucalipto"],
    quizilas: ["Carne de caça", "Mel", "Cabeça de bicho"],
    greeting: "Okê Arô!",
    mystery: "Fartura, conhecimento, busca, direcionamento e cura pelas matas.",
  },
  {
    name: "Xangô",
    day: "Quarta-feira / Domingo",
    colors: ["Amarelo", "Marrom", "Vermelho", "Branco"],
    chakra: "3º Plexo Solar",
    planet: "Sol",
    herbs: ["Quebra-pedra", "Erva-de-são-joão", "Folha de Café", "Manjericão Roxo", "Levante"],
    quizilas: ["Abóbora", "Caranguejo", "Injustiça", "Mentiras", "Caruru amanhecido"],
    greeting: "Kaô Kabecilé!",
    mystery: "Justiça divina, razão, firmeza, equilíbrio e fogo purificador.",
  },
  {
    name: "Iansã",
    day: "Terça-feira / Quarta-feira",
    colors: ["Laranja", "Amarelo", "Vermelho", "Coral"],
    chakra: "2º Sacro",
    planet: "Urano / Plutão",
    herbs: ["Pinhão Roxo", "Espada-de-santa-bárbara", "Bambu", "Folha de Fumo", "Louro"],
    quizilas: ["Abóbora", "Carne de carneiro", "Poeira acumulada", "Estagnação"],
    greeting: "Eparrei Iansã!",
    mystery: "Movimento, transformação, direção dos ventos, tempestades e eguns.",
  },
  {
    name: "Omolu",
    day: "Segunda-feira",
    colors: ["Preto e Branco", "Vermelho e Preto", "Violeta"],
    chakra: "1º Básico",
    planet: "Saturno",
    herbs: ["Canela-de-velho", "Assa-peixe", "Erva-de-bicho", "Vassourinha de Relógio"],
    quizilas: ["Carne de porco", "Pipoca queimada", "Claridade excessiva"],
    greeting: "Atotô!",
    mystery: "Cura física, transmutação de doenças, terra, fim de ciclos e estrutura.",
  },
  {
    name: "Nanã Buruquê",
    day: "Terça-feira / Sábado",
    colors: ["Lilás", "Roxo", "Azul-violeta"],
    chakra: "1º Básico",
    planet: "Saturno / Lua",
    herbs: ["Manjericão Roxo", "Assa-peixe", "Folha de Mostarda", "Avenca"],
    quizilas: ["Objetos de metal", "Velocidade excessiva", "Ansiedade"],
    greeting: "Saluba Nanã!",
    mystery: "Sabedoria ancestral, paciência, o lodo primitivo e reencarnação.",
  },
  {
    name: "Oxumaré",
    day: "Terça-feira",
    colors: ["Cores do Arco-íris", "Amarelo", "Verde"],
    chakra: "2º Sacro",
    planet: "Mercúrio / Vênus",
    herbs: ["Dinheiro-em-penca", "Folha da Fortuna", "Samambaia", "Alfazema"],
    quizilas: ["Monotonia", "Ingratidão", "Maltratar répteis"],
    greeting: "Arroboboi Oxumaré!",
    mystery: "Ciclos, renovação, dualidade, movimento da vida e riqueza flutuante.",
  },
  {
    name: "Exu",
    day: "Segunda-feira",
    colors: ["Preto", "Vermelho", "Preto e Vermelho"],
    chakra: "1º Básico",
    planet: "Plutão",
    herbs: ["Pinhão Roxo", "Arruda", "Guiné", "Cactos", "Urtiga"],
    quizilas: ["Sal puro", "Água fria direto na firmeza"],
    greeting: "Laroyé Exu! / Exu Mojubá!",
    mystery: "Comunicação, dinamismo, início de tudo, ordem, vitalidade e caminhos.",
  },
];

// Odús do Merindilogun
const ODUS: Odu[] = [
  {
    number: 1,
    name: "Okaran",
    meaning: "O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado.",
    elements: "Terra / Fogo",
    orixas: ["Exu", "Omolu"],
    quizilas: "Carne de porco, cachaça em excesso, andar na rua ao meio-dia ou meia-noite.",
    precepts: "Cultivar a paciência; não agir por impulso; cuidar rigorosamente de Exu e dos antepassados.",
    ebos: "Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos.",
  },
  {
    number: 2,
    name: "Ejiokô",
    meaning: "A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.",
    elements: "Ar / Terra E",
    orixas: ["Ibeji", "Ogum"],
    quizilas: "Comer ovos, rã, mentir ou trair a confiança dos outros.",
    precepts: "Manter a alegria interna; cuidar da criança interior; buscar sociedades justas.",
    ebos: "Ebó de Prosperidade: Doces, frutas para Ibeji, e comidas leves em praças ou jardins.",
  },
  {
    number: 3,
    name: "Etaogundá",
    meaning: "A revolta, a força física, a criação de ferramentas. O corte e a separação.",
    elements: "Fogo / Terra",
    orixas: ["Ogum", "Obaluaê"],
    quizilas: "Usar facas ou objetos cortantes sem necessidade, carne de galo, violência verbal.",
    precepts: "Evitar brigas e discussões; manter o foco no trabalho e na justiça; não demandar contra os outros.",
    ebos: "Ebó de Defesa: Inhames assados, paliteiros de Ogum, limpeza com folhas de mariô e limpeza com ferro.",
  },
  {
    number: 4,
    name: "Irosun",
    meaning: "O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.",
    elements: "Fogo / Terra",
    orixas: ["Iemanjá", "Oxóssi", "Egum"],
    quizilas: "Olhar para buracos vazios, usar roupas muito vermelhas em momentos de crise, mentira.",
    precepts: "Desenvolver a intuição; não ignorar avisos e sonhos; cuidar da saúde do sangue e dos olhos.",
    ebos: "Ebó de Proteção: Alimentos brancos, canjica na beira mar para Iemanjá, banhos de folhas frias.",
  },
  {
    number: 5,
    name: "Oxé",
    meaning: "O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Sangue menstrual.",
    elements: "Água",
    orixas: ["Oxum", "Logun Edé"],
    quizilas: "Comer ovos, comidas muito salgadas ou azedas, chorar miséria ou reclamar da vida.",
    precepts: "Cuidar da autoestima; usar perfumes; manter a higiene espiritual; buscar a diplomacia.",
    ebos: "Ebó de Atração/Ouro: Banhos de mel, caldas de frutas, oferendas com girassóis e moedas douradas.",
  },
  {
    number: 6,
    name: "Obará",
    meaning: "A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo.",
    elements: "Ar / Fogo",
    orixas: ["Xangô", "Oxóssi", "Logun Edé"],
    quizilas: "Inveja, contar planos antes de realizá-los, comer abóbora, teimosia extrema.",
    precepts: "Ser generoso; estudar; manter a cabeça erguida; praticar a gratidão para atrair a riqueza.",
    ebos: "Ebó de Fartura: Oferecer seis tipos de frutas, amalá para Xangô, dar comida à terra.",
  },
  {
    number: 7,
    name: "Odi",
    meaning: "A teimosia, o renascimento, as coisas ocultas, o poço profundo.",
    elements: "Terra / Água",
    orixas: ["Omolu", "Oxumaré", "Exu"],
    quizilas: "Dormir no escuro absoluto se estiver com medo, comer carne de caça, persistir no erro.",
    precepts: "Praticar o desapego; aceitar as mudanças da vida; não cavar o próprio buraco com mágoas.",
    ebos: "Ebó de Transmutação: Pipoca (Deburu) para Omolu, banhos de lama ou argila, defumações pesadas.",
  },
  {
    number: 8,
    name: "EjiOníle",
    meaning: "A cabeça (Ori), a liderança, o topo do mundo, o sangue branco.",
    elements: "Ar / Água",
    orixas: ["Oxalá", "Jagun"],
    quizilas: "Usar roupas pretas ou escuras, comer carne de sangue em dias de preceito.",
    precepts: "Cuidar muito bem do próprio Ori (cabeça); buscar a paz; evitar o orgulho e a arrogância.",
    ebos: "Ebó de Alinhamento (Bori): Oferendas de canjica branca, algodão, banhos de boldo e velas brancas.",
  },
  {
    number: 9,
    name: "Ossá",
    meaning: "O vento, as transformações rápidas, o reino das Iyami (as bruxas ancestrais).",
    elements: "Ar / Água",
    orixas: ["Iansã", "Iemanjá"],
    quizilas: "Espalhar fofocas, ventanias fortes na praia, usar roupas rasgadas.",
    precepts: "Respeitar o poder feminino; controlar a impulsividade e as palavras; fluir com as mudanças.",
    ebos: "Ebó de Limpeza Astral: Sacudimentos com folhas de fumo ou pinhão roxo, oferendas de acarajé.",
  },
  {
    number: 10,
    name: "Ofun",
    meaning: "O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação.",
    elements: "Ar / Água",
    orixas: ["Oxalá", "Obá"],
    quizilas: "Usar roupas pretas, comer comida amanhecida, faltar com o respeito aos mais velhos.",
    precepts: "Vestir-se de branco; manter o silêncio e a quietude; estudar a espiritualidade profunda.",
    ebos: "Ebó de Alívio/Saúde: Tudo neste Odú pede rezas mansas, frutas brancas, banhos de leite de cabra.",
  },
  {
    number: 11,
    name: "Owarin",
    meaning: "A pressa, a ansiedade, a mudança de rumo rápida. O vento que espalha as folhas.",
    elements: "Fogo / Ar",
    orixas: ["Iansã", "Exu", "Ogum"],
    quizilas: "Guardar objetos quebrados ou velhos em casa, procrastinar, roupas muito escuras.",
    precepts: "Organizar a mente e a rotina; canalizar a ansiedade em atividades físicas ou artísticas.",
    ebos: "Ebó de Movimento: Rodar chaves, acender velas nas esquinas, banhos de ervas quentes.",
  },
  {
    number: 12,
    name: "Ejilsebora",
    meaning: "A justiça, o fogo purificador, a guerra justa, os terremotos.",
    elements: "Fogo",
    orixas: ["Xangô", "Obá"],
    quizilas: "Praticar a injustiça, acobertar mentiras, comer abóbora ou quiabo em excesso nas crises.",
    precepts: "Manter a integridade a todo custo; não julgar os outros sem provas; equilibrar razão e emoção.",
    ebos: "Ebó de Justiça: Firmezas com pedras de raio, amalá bem quente com folhas de fumo.",
  },
  {
    number: 13,
    name: "Olobón",
    meaning: "A doença, as transformações físicas, o fim de ciclos. O recolhimento.",
    elements: "Terra / Água",
    orixas: ["Nanã", "Omolu"],
    quizilas: "Ambientes sujos ou bagunçados, comer carne de rã ou tartaruga, reclamar da velhice.",
    precepts: "Respeitar o tempo das coisas; buscar a sabedoria dos mais velhos; cuidar da saúde.",
    ebos: "Ebó de Evolução: Oferendas na lama ou no mangue para Nanã, ebó com feijão preto, velas lilases.",
  },
  {
    number: 14,
    name: "Iká",
    meaning: "A traição, a cobra que morde, a sabedoria oculta e a renovação da pele.",
    elements: "Água / Terra",
    orixas: ["Oxumaré", "Ossain"],
    quizilas: "Falsidade, maltratar animais (especialmente répteis), revelar segredos confiados a você.",
    precepts: "Manter a discrição absoluta sobre sua vida pessoal; cultivar a flexibilidade perante obstáculos.",
    ebos: "Ebó de Renovação: Banhos com folhas de fortuna e dinheiro-em-penca, amarrar fitas coloridas.",
  },
  {
    number: 15,
    name: "Ogbogbé",
    meaning: "A feitiçaria, o corte pesado, as disputas por espaço ou poder.",
    elements: "Fogo / Terra",
    orixas: ["Obá", "Ewá", "Ogum"],
    quizilas: "Invejar o espaço alheio, comer comidas muito apimentadas perto de dormir, brigas domésticas.",
    precepts: "Buscar a paz no lar; proteger a própria energia contra feitiçarias e inveja; focar no amor próprio.",
    ebos: "Ebó de Defesa: Oferendas com acarajés recheados, banhos de erva-de-bicho ou espada-de-santa-bárbara.",
  },
  {
    number: 16,
    name: "Alafia",
    meaning: "A paz absoluta, a luz total, a confirmação dos Deuses. Tudo está bem.",
    elements: "Ar / Luz",
    orixas: ["Orunmilá", "Oxalá"],
    quizilas: "Duvidar da própria espiritualidade, orgulho, arrogância, não ouvir conselhos.",
    precepts: "Manter as práticas espirituais em dia; compartilhar a sabedoria com quem precisa; ser grato.",
    ebos: "Ebó de Agradecimento: Flores brancas, oferendas de frutas doces e claras, acender velas brancas.",
  },
];

// Dias da Semana
const DAYS_OF_WEEK: DayOfWeek[] = [
  {
    day: "Segunda-feira",
    chakras: ["1º Básico", "6º Frontal"],
    colors: ["Vermelho", "Branco", "Preto"],
    planets: ["Lua", "Saturno"],
    orixas: ["Omolu", "Obaluaê", "Exu"],
    sephirot: ["Malkuth", "Yesod"],
    mystery: "Dia de aterramento, limpeza espiritual, transmutação e respeito às almas e antepassados.",
  },
  {
    day: "Terça-feira",
    chakras: ["2º Sacro"],
    colors: ["Laranja", "Vermelho"],
    planets: ["Marte", "Plutão"],
    orixas: ["Iansã", "Oyá", "Ogum"],
    sephirot: ["Geburah"],
    mystery: "Dia de força, movimento, coragem, corte de demandas e quebra de energias paradas.",
  },
  {
    day: "Quarta-feira",
    chakras: ["3º Plexo Solar"],
    colors: ["Amarelo"],
    planets: ["Mercúrio"],
    orixas: ["Xangô", "Iansã"],
    sephirot: ["Hod"],
    mystery: "Dia da justiça divina, dos estudos, da mente concreta, da verdade e da razão.",
  },
  {
    day: "Quinta-feira",
    chakras: ["4º Cardíaco"],
    colors: ["Verde"],
    planets: ["Júpiter"],
    orixas: ["Oxóssi"],
    sephirot: ["Chesed"],
    mystery: "Dia da fartura, da busca por conhecimento, da expansão e da cura através das matas.",
  },
  {
    day: "Sexta-feira",
    chakras: ["7º Coronário"],
    colors: ["Branco", "Violeta"],
    planets: ["Vênus"],
    orixas: ["Oxalá"],
    sephirot: ["Kether"],
    mystery: "Dia da paz, da pureza, do silêncio, da gratidão e da conexão direta com o Divino.",
  },
  {
    day: "Sábado",
    chakras: ["4º Cardíaco", "6º Frontal"],
    colors: ["Rosa", "Azul Escuro"],
    planets: ["Saturno", "Urano"],
    orixas: ["Oxum", "Iemanjá"],
    sephirot: ["Binah", "Tiphereth"],
    mystery: "Dia das Grandes Mães. Rege o amor incondicional, a intuição, a fertilidade e as águas geradoras.",
  },
  {
    day: "Domingo",
    chakras: ["3º Plexo Solar"],
    colors: ["Amarelo", "Dourado"],
    planets: ["Sol"],
    orixas: ["Xangô"],
    sephirot: ["Tiphereth"],
    mystery: "Dia de recarregar a energia vital, focar no povoer pessoal, no brilho próprio e no propósito de vida.",
  },
];

// Chakras
const CHAKRAS: Chakra[] = [
  {
    number: 1,
    name: "Raiz",
    sanskrit: "Muladhara",
    color: "Vermelho",
    element: "Terra",
    frequency: "396 Hz",
    planet: "Saturno",
    sephirah: "Malkuth",
    orixas: ["Omolu", "Nanã", "Exu"],
  },
  {
    number: 2,
    name: "Sacro",
    sanskrit: "Svadhisthana",
    color: "Laranja",
    element: "Água",
    frequency: "417 Hz",
    planet: "Lua",
    sephirah: "Yesod",
    orixas: ["Iansã", "Oxumaré"],
  },
  {
    number: 3,
    name: "Plexo Solar",
    sanskrit: "Manipura",
    color: "Amarelo",
    element: "Fogo",
    frequency: "528 Hz",
    planet: "Sol",
    sephirah: "Tiphereth",
    orixas: ["Xangô", "Logun Edé"],
  },
  {
    number: 4,
    name: "Cardíaco",
    sanskrit: "Anahata",
    color: "Verde",
    element: "Ar",
    frequency: "639 Hz",
    planet: "Vênus",
    sephirah: " Netzach",
    orixas: ["Oxum", "Iemanjá", "Oxóssi"],
  },
  {
    number: 5,
    name: "Laríngeo",
    sanskrit: "Vishuddha",
    color: "Azul Claro",
    element: "Ar",
    frequency: "741 Hz",
    planet: "Mercúrio",
    sephirah: "Hod",
    orixas: ["Ogum", "Oxumaré"],
  },
  {
    number: 6,
    name: "Frontal",
    sanskrit: "Ajna",
    color: "Indigo",
    element: "Éter",
    frequency: "852 Hz",
    planet: "Lua",
    sephirah: "Hesed",
    orixas: ["Iemanjá", "Oxalá"],
  },
  {
    number: 7,
    name: "Coronário",
    sanskrit: "Sahasrara",
    color: "Violeta",
    element: "Éter",
    frequency: "963 Hz",
    planet: "Sol",
    sephirah: "Kether",
    orixas: ["Oxalá", "Obá"],
  },
];

// Sephirot da Árvore da Vida
const SEPHIROT: Sephirah[] = [
  { name: "Kether", path: 1, meaning: "Coroa - A fonte divina", attribute: "Vontade Divina", zodiac: "Espaço", planet: "Sem planeta", sephirahType: "Transcendente" },
  { name: "Chokmah", path: 2, meaning: "Sabedoria - O impulso inicial", attribute: "Força", zodiac: "Zodiaco Fixo", planet: "Kokh", sephirahType: "Transcendente" },
  { name: "Binah", path: 3, meaning: "Compreensão - A forma perfeita", attribute: "Formação", zodiac: "Zodiaco Fixo", planet: "Saturno", sephirahType: "Transcendente" },
  { name: "Chesed", path: 4, meaning: "Misericórdia - A expansão amorosa", attribute: "Bondade", zodiac: "Sagitário", planet: "Júpiter", sephirahType: "Pilares" },
  { name: "Geburah", path: 5, meaning: "Julho - A força的限制", attribute: "Severidade", zodiac: "Áries", planet: "Marte", sephirahType: "Pilares" },
  { name: "Tiphereth", path: 6, meaning: "Beleza - O equilíbrio central", attribute: "Harmonia", zodiac: "Leão", planet: "Sol", sephirahType: "Central" },
  { name: "Netzach", path: 7, meaning: "Vitória - A persistência", attribute: "Persistência", zodiac: "Touro", planet: "Vênus", sephirahType: "Pilares" },
  { name: "Hod", path: 8, meaning: "Glória - A integridade", attribute: "Glória", zodiac: "Gêmeos", planet: "Mercúrio", sephirahType: "Pilares" },
  { name: "Yesod", path: 9, meaning: "Fundação - A base mágica", attribute: "Fondação", zodiac: "Libra", planet: "Lua", sephirahType: "Central" },
  { name: "Malkuth", path: 10, meaning: "Reino - A manifestação", attribute: "Reino", zodiac: "Escorpião", planet: "Terra", sephirahType: "Sustentação" },
];

// Arcanos Maiores do Tarot
const TAROT_ARCANES: TarotArcane[] = [
  { number: 0, name: "O Louco", keywords: ["Liberdade", "Inocência", "Novo início"], element: "Ar", zodiac: "Urano", meaning: "O início da jornada, a coragem de dar o primeiro passo sem medo do desconhecido." },
  { number: 1, name: "O Mago", keywords: ["Iniciativa", "Poder pessoal", "Criatividade"], element: "Ar", zodiac: "Mercúrio", meaning: "O domínio dos elementos, a capacidade de transformar visão em realidade." },
  { number: 2, name: "A Sacerdotisa", keywords: ["Intuição", "Mistério", "Sabedoria Interior"], element: "Água", zodiac: "Lua", meaning: "O conhecimento oculto, a voz da alma que conhece os segredos guarded." },
  { number: 3, name: "A Imperatriz", keywords: ["Abundância", "Fertilidade", "Natureza"], element: "Terra", zodiac: "Vênus", meaning: "A expressão criativa da natureza, a fertilidade em todas as formas." },
  { number: 4, name: "O Imperador", keywords: ["Autoridade", "Estrutura", "Pai"], element: "Fogo", zodiac: "Áries", meaning: "A liderança firme, a ordem que estabelece limites protectores." },
  { number: 5, name: "O Hierofante", keywords: ["Tradição", "Espiritualidade", "Ensinamento"], element: "Terra", zodiac: "Touro", meaning: "A conexão com a sabedoria tradicional, o mestre espiritual." },
  { number: 6, name: "Os Enamorados", keywords: ["Amor", "Escolhas", "União"], element: "Ar", zodiac: "Gêmeos", meaning: "A escolha do coração, a união de opostos complementares." },
  { number: 7, name: "O Carro", keywords: ["Vitória", "Determinação", "Controle"], element: "Fogo", zodiac: "Câncer", meaning: "A conquista através da vontade, o controle das forças opostas." },
  { number: 8, name: "A Justiça", keywords: ["Equilíbrio", "Causa e efeito", "Verdade"], element: "Ar", zodiac: "Libra", meaning: "A lei cósmica de causa e efeito, a verdade que liberta." },
  { number: 9, name: "O Eremita", keywords: ["Introspecção", "Sabedoria", "Isolamento Voluntary"], element: "Terra", zodiac: "Virgem", meaning: "A jornada interior, a sabedoria conquistada na solidão." },
  { number: 10, name: "A Roda da Fortuna", keywords: ["Ciclos", "Destino", "Mudança"], element: "Fogo", zodiac: "Júpiter", meaning: "O giro inevitável dos turnos da vida, o destino em movimento." },
  { number: 11, name: "A Força", keywords: ["Coragem", "Compaixão", "Poder suave"], element: "Terra", zodiac: "Leão", meaning: "O poder que vem da delicade, a força interior que vence." },
  { number: 12, name: "O Enforcado", keywords: ["Sacrifício", "Nova perspectiva", "Inversão"], element: "Água", zodiac: "Netuno", meaning: "O sacrifício consciente, a mudança de perspectiva que transforma." },
  { number: 13, name: "A Morte", keywords: ["Transformação", "Fim de ciclo", "Renovação"], element: "Água", zodiac: "Escorpião", meaning: "O fim necessário para o novo começo, a transformação inevitável." },
  { number: 14, name: "A Temperança", keywords: ["Equilíbrio", "Alquimia", "Paciência"], element: "Fogo", zodiac: "Sagitário", meaning: "O equilíbrio das oposições, a alquimia de transformar chumbo em ouro." },
  { number: 15, name: "O Diabo", keywords: ["Sombra", "Escravidão", "Materialismo"], element: "Terra", zodiac: "Capricórnio", meaning: "As correntes da sombra, a ilusão da separação da luz." },
  { number: 16, name: "A Torre", keywords: ["Destruição", "Revelação", "Mudança brusca"], element: "Fogo", zodiac: "Marte", meaning: "A demolição das ilusões, a verdade que liberta pela força." },
  { number: 17, name: "A Estrela", keywords: ["Esperança", "Inspiração", "Renovação"], element: "Ar", zodiac: "Aquário", meaning: "A luz que guia após a tempestade, a esperança que renasce." },
  { number: 18, name: "A Lua", keywords: ["Ilusão", "Inconsciente", "Medo"], element: "Água", zodiac: "Peixes", meaning: "O mundo das sombras, a navegação pelos águas turbulentas do inconsciente." },
  { number: 19, name: "O Sol", keywords: ["Alegria", "Sucesso", "Vitalidade"], element: "Fogo", zodiac: "Sol", meaning: "O brilho da verdade, a alegria de viver em plenitude." },
  { number: 20, name: "O Julgamento", keywords: ["Renascimento", "Julgamento Interior", "Chamada"], element: "Fogo", zodiac: "Plutão", meaning: "O despertar final, o chamado para uma nova vida." },
  { number: 21, name: "O Mundo", keywords: ["Completude", "Integração", "Realização"], element: "Terra", zodiac: "Saturno", meaning: "A jornada completada, a integração de todos os opostos." },
];

// Fases da Lua
const LUNAR_PHASES: LunarPhase[] = [
  {
    name: "Lua Nova",
    state: "Introspecção, silêncio, planejamento invisível.",
    window: "Das 00:00 às 03:00 (Hora Astrológica)",
    rituals: "Início de projetos secretos, firmezas de proteção profunda, assentamento de Exu.",
    orixas: ["Exu", "Omolu", "Ogum"],
  },
  {
    name: "Lua Crescente",
    state: "Foco, ação disciplinada, força de vontade.",
    window: "Das 06:00 às 12:00 (Amanhecer/Zênite)",
    rituals: "Rituais de abertura de caminhos comerciais, banhos de prosperidade e atração.",
    orixas: ["Oxóssi", "Ogum", "Xangô"],
  },
  {
    name: "Lua Cheia",
    state: "Expansão áurica máxima, magnetismo, êxtase.",
    window: "Das 18:00 às 00:00 (Ascensão da Lua)",
    rituals: "Alta magia de atração, consagração de patuás, boris, rituais de amor e cura de Ori.",
    orixas: ["Oxalá", "Oxum", "Iemanjá"],
  },
  {
    name: "Lua Minguante",
    state: "Desapego, austeridade, banimento consciente.",
    window: "Das 12:00 às 18:00 (Ocaso Solar)",
    rituals: "Quebra de energias paradas, ebós de descarrego pesado, cura de vícios e doenças.",
    orixas: ["Omolu", "Nanã", "Iansã"],
  },
];

// Tipos de Ervas por Energia
const HERB_TYPES: HerbType[] = [
  {
    name: "Sol",
    energy: "Quente / Radiante",
    function: "Brilho, prosperidade, vitalidade, ego equilibrado.",
    herbs: ["Alecrim", "Canela", "Louro", "Girassol", "Folha de Café"],
    chakra: "3º Plexo Solar",
    orixa: "Xangô / Oxalá",
    bathType: "Infusão diurna: Jogar da cabeça aos pés para atrair magnetismo pessoal.",
  },
  {
    name: "Lua",
    energy: "Fria / Receptiva",
    function: "Intuição, clarividência, pacificação emocional.",
    herbs: ["Colônia", "Saião", "Alfazema", "Rosa Branca"],
    chakra: "6º Frontal / 4º Cardíaco",
    orixa: "Iemanjá / Oxum",
    bathType: "Macerado a frio: Deixar sob o luar e lavar o Ori antes de dormir.",
  },
  {
    name: "Marte",
    energy: "Quente / Ígnea",
    function: "Proteção contra demandas, quebra de feitiços, cortes.",
    herbs: ["Espada-de-são-jorge", "Guiné", "Pinhão Roxo", "Aroeira"],
    chakra: "2º Sacro / 5º Laríngeo",
    orixa: "Ogum / Iansã",
    bathType: "Decocção pesada: Apenas do pescoço para baixo. Descarrego absoluto.",
  },
  {
    name: "Mercúrio",
    energy: "Neutra / Volátil",
    function: "Movimento mental, comunicação, negócios rápidos.",
    herbs: ["Hortelã", "Manjericão", "Dinheiro-em-penca", "Abre-caminho"],
    chakra: "5º Laríngeo",
    orixa: "Oxumaré / Exu",
    bathType: "Abafado: Banho ou defumação residential às quartas-feiras pela manhã.",
  },
  {
    name: "Júpiter",
    energy: "Fria / Expansiva",
    function: "Fartura, sabedoria profunda, crescimento, sorte.",
    herbs: ["Samambaia", "Eucalipto", "Manjericão Branco", "Boldo"],
    chakra: "4º Cardíaco / 7º Coronário",
    orixa: "Oxóssi / Oxalá",
    bathType: "Infusão:Excelente para limpeza áurica e equilíbrio após desgastes profissionais.",
  },
  {
    name: "Vênus",
    energy: "Fria / Magnética",
    function: "Amor próprio, harmonização, doçura, feitiço de atração.",
    herbs: ["Erva-doce", "Camomila", "Calêndula", "Malva", "Rosas Coloridas"],
    chakra: "4º Cardíaco",
    orixa: "Oxum",
    bathType: "Macerado com mel: Banhos nas noites de Lua Cheia para potencializar o amor.",
  },
  {
    name: "Saturno",
    energy: "Quente / Densa",
    function: "Limpeza kármica, encerramento de ciclos, raízes.",
    herbs: ["Canela-de-velho", "Assa-peixe", "Peregum Verde", "Arruda"],
    chakra: "1º Básico",
    orixa: "Omolu / Nanã",
    bathType: "Decocção: Lavar os pés e o chão da casa para prender a energia intrusa na terra.",
  },
];

interface SpiritualData {
  orixas: Orixa[];
  odus: Odu[];
  daysOfWeek: DayOfWeek[];
  chakras: Chakra[];
  sephirot: Sephirah[];
  tarotArcanes: TarotArcane[];
  lunarPhases: LunarPhase[];
  herbTypes: HerbType[];
}

function getData(): SpiritualData {
  return {
    orixas: ORIXAS,
    odus: ODUS,
    daysOfWeek: DAYS_OF_WEEK,
    chakras: CHAKRAS,
    sephirot: SEPHIROT,
    tarotArcanes: TAROT_ARCANES,
    lunarPhases: LUNAR_PHASES,
    herbTypes: HERB_TYPES,
  };
}

export { getData, ORIXAS, ODUS, DAYS_OF_WEEK, CHAKRAS, SEPHIROT, TAROT_ARCANES, LUNAR_PHASES, HERB_TYPES };

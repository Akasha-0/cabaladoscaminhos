// ============================================================
// DADOS ESPIRITUAIS - CABALA DOS CAMINHOS
// ============================================================
// Dados extraídos de IDEIA.md com todas as correspondências
// baseadas em Cabala, Orixás, Odús, Tarot, Numerologia e Lua
// ============================================================

interface DiaSemanaData {
  dia: string;
  chakras: string[];
  cores: string[];
  planetas: string[];
  orixas: string[];
  sephirot: string[];
  arcano: string;
  faseLua: string;
  misterio: string;
  numTantrico: string;
  numCabalistico: string;
}

export interface OrixaData {
  id?: string;
  nome: string;
  dia: string;
  cores: string[];
  chakra: string;
  planeta: string;
  elemento?: string;
  numero?: number;
  ervas: string[];
  quizilas: string[];
  saudacao: string;
  misterio: string;
}

export interface OduData {
  numero: number;
  nome: string;
  significado: string;
  elementos: string;
  orixas: string[];
  quizilas: string[];
  preceitos: string;
  ebo: string;
}

interface ChakraData {
  numero: number;
  nome: string;
  cor: string;
  planeta: string;
  elemento: string;
  freqSolfeggio: string;
  mantram: string;
  nomeDivino: string;
  poliedro: string;
  funcao: string;
}

interface CartaTarot {
  numero: number;
  nome: string;
  arcano: string;
  significado: string;
  keywords: string[];
}
// ============================================================
// DIAS DA SEMANA E SUAS CORRESPONDÊNCIAS
// ============================================================

const diasSemana: Record<string, DiaSemanaData> = {
  segunda: {
    dia: 'Segunda-feira',
    chakras: ['1º Básico', '6º Frontal'],
    cores: ['Vermelho', 'Branco', 'Preto'],
    planetas: ['Lua', 'Saturno'],
    orixas: ['Omolu / Obaluaê', 'Exu'],
    sephirot: ['Malkuth', 'Yesod'],
    arcano: 'A Sacerdotisa / O Mundo',
    faseLua: 'Lua Minguante / Nova',
    misterio:
      'Dia de aterramento, limpeza espiritual, transmutação e respeito às almas e antepassados.',
    numTantrico: '2 (Mente Negativa)',
    numCabalistico: '2 / 4',
  },
  terca: {
    dia: 'Terça-feira',
    chakras: ['2º Sacro'],
    cores: ['Laranja', 'Vermelho'],
    planetas: ['Marte', 'Plutão'],
    orixas: ['Iansã / Oyá', 'Ogum'],
    sephirot: ['Geburah'],
    arcano: 'A Torre / O Carro',
    faseLua: 'Lua Nova / Crescente',
    misterio: 'Dia de força, movimento, coragem, corte de demandas e quebra de energias paradas.',
    numTantrico: '5 (Corpo Físico)',
    numCabalistico: '5 / 9',
  },
  quarta: {
    dia: 'Quarta-feira',
    chakras: ['3º Plexo Solar'],
    cores: ['Amarelo'],
    planetas: ['Mercúrio'],
    orixas: ['Xangô', 'Iansã'],
    sephirot: ['Hod'],
    arcano: 'O Mago / O Eremita',
    faseLua: 'Lua Crescente',
    misterio: 'Dia da justiça divina, dos estudos, da mente concreta, da verdade e da razão.',
    numTantrico: '4 (Mente Positiva)',
    numCabalistico: '3 / 5',
  },
  quinta: {
    dia: 'Quinta-feira',
    chakras: ['4º Cardíaco'],
    cores: ['Verde'],
    planetas: ['Júpiter'],
    orixas: ['Oxóssi'],
    sephirot: ['Chesed'],
    arcano: 'O Hierofante',
    faseLua: 'Lua Crescente / Cheia',
    misterio: 'Dia da fartura, da busca por conhecimento, da expansão e da cura através das matas.',
    numTantrico: '7 (Aura)',
    numCabalistico: '1 / 3',
  },
  sexta: {
    dia: 'Sexta-feira',
    chakras: ['7º Coronário'],
    cores: ['Branco', 'Violeta'],
    planetas: ['Vênus'],
    orixas: ['Oxalá'],
    sephirot: ['Kether'],
    arcano: 'O Imperador / O Louco',
    faseLua: 'Lua Cheia',
    misterio: 'Dia da paz, da pureza, do silêncio, da gratidão e da conexão direta com o Divino.',
    numTantrico: '1 (Alma) / 11',
    numCabalistico: '1 / 7',
  },
  sabado: {
    dia: 'Sábado',
    chakras: ['4º Cardíaco', '6º Frontal'],
    cores: ['Rosa', 'Azul Escuro'],
    planetas: ['Saturno', 'Urano'],
    orixas: ['Oxum', 'Iemanjá'],
    sephirot: ['Binah', 'Tiphereth'],
    arcano: 'A Imperatriz / A Estrela',
    faseLua: 'Lua Cheia',
    misterio:
      'Dia das Grandes Mães. Rege o amor incondicional, a intuição, a fertilidade e as águas geradoras.',
    numTantrico: '3 (Mente Neutra)',
    numCabalistico: '6 / 8',
  },
  domingo: {
    dia: 'Domingo',
    chakras: ['3º Plexo Solar'],
    cores: ['Amarelo', 'Dourado'],
    planetas: ['Sol'],
    orixas: ['Xangô (Solar)'],
    sephirot: ['Tiphereth'],
    arcano: 'O Sol',
    faseLua: 'Lua Cheia / Crescente',
    misterio:
      'Dia de recarregar a energia vital, focar no poder pessoal, no brilho próprio e no propósito de vida.',
    numTantrico: '9 (Corpo Prânico)',
    numCabalistico: '1 / 6',
  },
};

// ============================================================
// ORIXÁS E SUAS CORRESPONDÊNCIAS
// ============================================================

export const orixas: OrixaData[] = [
  {
    nome: 'Oxalá',
    dia: 'Sexta-feira',
    cores: ['Branco', 'Marfim', 'Opala'],
    chakra: '7º Coronário',
    planeta: 'Sol / Júpiter',
    ervas: ['Boldo (Tapete de Oxalá)', 'Saião', 'Manjericão Branco', 'Algodoeiro', 'Colônia'],
    quizilas: ['Bebidas alcoólicas', 'Azeite de dendê', 'Sal', 'Roupas escuras'],
    saudacao: 'Epà Babá!',
    misterio: 'Fé, paz, pureza, equilíbrio espiritual e criação.',
  },
  {
    nome: 'Iemanjá',
    dia: 'Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente'],
    chakra: '6º Frontal',
    planeta: 'Lua / Netuno',
    ervas: [
      'Colônia',
      'Alcaparra',
      'Folha de Lágrima-de-Nossa-Senhora',
      'Pata-de-vaca',
      'Erva-de-Santa-Luzia',
    ],
    quizilas: ['Poeira', 'Lama', 'Caranguejo', 'Carne de porco'],
    saudacao: 'Odoyá!',
    misterio: 'Maternidade, geração, equilíbrio mental e águas salgadas.',
  },
  {
    nome: 'Oxum',
    dia: 'Sábado',
    cores: ['Rosa', 'Amarelo-ouro', 'Azul-celeste'],
    chakra: '4º Cardíaco',
    planeta: 'Vênus',
    ervas: [
      'Erva-doce',
      'Calêndula',
      'Camomila',
      'Folha de Dinheiro-em-penca',
      'Melissa',
      'Rosa Branca/Amarela',
    ],
    quizilas: ['Ovos', 'Abóbora', 'Caranguejo', 'Falar de miséria', 'Chorar miséria'],
    saudacao: 'Ora Yê Yê Ô!',
    misterio: 'Amor incondicional, doçura, ouro, fertilidade e águas doces.',
  },
  {
    nome: 'Ogum',
    dia: 'Terça-feira',
    cores: ['Azul Claro', 'Vermelho (Candomblé)', 'Verde (Umbanda)'],
    chakra: '5º Laríngeo',
    planeta: 'Marte',
    ervas: ['Espada-de-são-jorge', 'Quebra-demanda', 'Guiné', 'Aroeira', 'Losna', 'Folha de Manga'],
    quizilas: ['Quiabo', 'Galo', 'Mentira', 'Traição', 'Ferramentas cegas'],
    saudacao: 'Patakori Ogum! / Ogunhê!',
    misterio: 'Lei, ordenação, caminhos abertos, coragem e execução.',
  },
  {
    nome: 'Oxóssi',
    dia: 'Quinta-feira',
    cores: ['Verde', 'Azul-turquesa'],
    chakra: '4º Cardíaco',
    planeta: 'Júpiter',
    ervas: [
      'Guiné',
      'Alecrim',
      'Samambaia',
      'Folha de Jurema',
      'Arruda',
      'Eucalipto',
      'Peregum Verde',
    ],
    quizilas: ['Carne de caça', 'Mel (em alguns terreiros)', 'Cabeça de bicho'],
    saudacao: 'Okê Arô!',
    misterio: 'Fartura, conhecimento, busca, direcionamento e cura pelas matas.',
  },
  {
    nome: 'Xangô',
    dia: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    chakra: '3º Plexo Solar',
    planeta: 'Sol',
    ervas: ['Quebra-pedra', 'Erva-de-são-joão', 'Folha de Café', 'Manjericão Roxo', 'Levante'],
    quizilas: ['Abóbora', 'Caranguejo', 'Injustiça', 'Mentiras', 'Caruru amanhecido'],
    saudacao: 'Kaô Kabecilé!',
    misterio: 'Justiça divina, razão, firmeza, equilíbrio e fogo purificador.',
  },
  {
    nome: 'Iansã / Oyá',
    dia: 'Terça-feira / Quarta-feira',
    cores: ['Laranja', 'Amarelo', 'Vermelho', 'Coral'],
    chakra: '2º Sacro',
    planeta: 'Urano / Plutão',
    ervas: [
      'Pinhão Roxo',
      'Espada-de-santa-bárbara',
      'Bambu',
      'Folha de Fumo',
      'Louro',
      'Manjericão Roxo',
    ],
    quizilas: ['Abóbora', 'Carne de carneiro', 'Poeira acumulada', 'Estagnação'],
    saudacao: 'Eparrei Iansã! / Eparrei Oyá!',
    misterio: 'Movimento, transformação, direção dos ventos, tempestades e eguns.',
  },
  {
    nome: 'Omolu / Obaluaê',
    dia: 'Segunda-feira',
    cores: ['Preto e Branco', 'Vermelho e Preto', 'Violeta'],
    chakra: '1º Básico',
    planeta: 'Saturno',
    ervas: [
      'Canela-de-velho',
      'Assa-peixe',
      'Erva-de-bicho',
      'Vassourinha de Relógio',
      'Manjericão Roxo',
    ],
    quizilas: ['Carne de porco', 'Pipoca queimada', 'Clareza excessiva (no mistério)'],
    saudacao: 'Atotô!',
    misterio: 'Cura física, transmutação de doenças, terra, fim de ciclos e estrutura.',
  },
  {
    nome: 'Nanã Buruquê',
    dia: 'Terça-feira / Sábado',
    cores: ['Lilás', 'Roxo', 'Azul-violeta'],
    chakra: '1º Básico',
    planeta: 'Saturno / Lua',
    ervas: ['Manjericão Roxo', 'Assa-peixe', 'Folha de Mostarda', 'Trapoeraba Roxa', 'Avenca'],
    quizilas: ['Objetos de metal ou ferro cortantes', 'Velocidade excessiva', 'Ansiedade'],
    saudacao: 'Saluba Nanã!',
    misterio: 'Sabedoria ancestral, paciência, o lodo primitivo, decantação e reencarnação.',
  },
  {
    nome: 'Oxumaré',
    dia: 'Terça-feira',
    cores: ['Cores do Arco-íris', 'Amarelo', 'Verde'],
    chakra: '2º Sacro',
    planeta: 'Mercúrio / Vênus',
    ervas: ['Dinheiro-em-penca', 'Folha da Fortuna', 'Samambaia', 'Alfazema'],
    quizilas: ['Monotonia', 'Ingratidão', 'Maltratar répteis (cobras)'],
    saudacao: 'Arroboboi Oxumaré!',
    misterio: 'Ciclos, renovação, dualidade, movimento da vida e a riqueza flutuante.',
  },
  {
    nome: 'Exu',
    dia: 'Segunda-feira',
    cores: ['Preto e Vermelho', 'Preto'],
    chakra: '1º Básico',
    planeta: 'Plutão',
    ervas: [
      'Pinhão Roxo',
      'Arruda',
      'Guiné',
      'Cactos',
      'Urtiga',
      'Folha de Fogo',
      'Folha de Manga',
    ],
    quizilas: ['Sal puro', 'Água fria jogada diretamente sobre sua firmeza (sem reza)'],
    saudacao: 'Laroyé Exu! / Exu Mojubá!',
    misterio: 'Comunicação, dinamismo, o início de tudo, ordem, vitalidade e caminhos.',
  },
];

// ============================================================
// ODÚS DO MERINDILOGUN
// ============================================================

export const odus: OduData[] = [
  {
    numero: 1,
    nome: 'Okaran',
    significado:
      'O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado.',
    elementos: 'Terra / Fogo',
    orixas: ['Exu', 'Omolu'],
    quizilas: ['Carne de porco', 'Cachaça em excesso', 'Andar na rua ao meio-dia ou meia-noite'],
    preceitos:
      'Cultivar a paciência; não agir por impulso; cuidar rigorosamente de Exu e dos antepassados.',
    ebo: 'Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos.',
  },
  {
    numero: 2,
    nome: 'Ejiokô',
    significado: 'A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.',
    elementos: 'Ar / Terra',
    orixas: ['Ibeji', 'Ogum'],
    quizilas: ['Comer ovos', 'Rã', 'Mentir ou trair a confiança dos outros'],
    preceitos: 'Manter a alegria interna; cuidar da criança interior; buscar sociedades justas.',
    ebo: 'Ebó de Prosperidade: Doces, frutas para Ibeji, e comidas leves em praças ou jardins.',
  },
  {
    numero: 3,
    nome: 'Etaogundá',
    significado: 'A revolta, a força física, a criação de ferramentas. O corte e a separação.',
    elementos: 'Fogo / Terra',
    orixas: ['Ogum', 'Obaluaê'],
    quizilas: [
      'Usar facas ou objetos cortantes sem necessidade',
      'Carne de galo',
      'Violência verbal',
    ],
    preceitos:
      'Evitar brigas e discussões; manter o foco no trabalho e na justiça; não demandar contra os outros.',
    ebo: 'Ebó de Defesa: Inhames assados, paliteiros de Ogum, limpeza com folhas de mariô e limpeza com ferro.',
  },
  {
    numero: 4,
    nome: 'Irosun',
    significado: 'O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.',
    elementos: 'Fogo / Terra',
    orixas: ['Iemanjá', 'Oxóssi', 'Egum'],
    quizilas: [
      'Olhar para buracos vazios',
      'Usar roupas muito vermelhas em momentos de crise',
      'Mentira',
    ],
    preceitos:
      'Desenvolver a intuição; não ignorar avisos e sonhos; cuidar da saúde do sangue e dos olhos.',
    ebo: 'Ebó de Proteção: Alimentos brancos, canjica na beira mar para Iemanjá, banhos de folhas frias (colônia, saião).',
  },
  {
    numero: 5,
    nome: 'Oxé',
    significado: 'O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Sangue menstrual.',
    elementos: 'Água',
    orixas: ['Oxum', 'Logun Edé'],
    quizilas: [
      'Comer ovos',
      'Comidas muito salgadas ou azedas',
      'Chorar miséria ou reclamar da vida',
    ],
    preceitos:
      'Cuidar da autoestima; usar perfumes; manter a higiene espiritual; buscar a diplomacia.',
    ebo: 'Ebó de Atração/Ouro: Banhos de mel, caldas de frutas, oferendas com girassóis e moedas douradas em águas doces.',
  },
  {
    numero: 6,
    nome: 'Obará',
    significado: 'A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo.',
    elementos: 'Ar / Fogo',
    orixas: ['Xangô', 'Oxóssi', 'Logun Edé'],
    quizilas: ['Inveja', 'Contar planos antes de realizá-los', 'Comer abóbora', 'Teimosia extrema'],
    preceitos:
      'Ser generoso; estudar; manter a cabeça erguida; praticar a gratidão para atrair a riqueza.',
    ebo: 'Ebó de Fartura: Oferecer seis tipos de frutas, amalá para Xangô, dar comida à terra e partilhar banquetes.',
  },
  {
    numero: 7,
    nome: 'Odi',
    significado: 'A teimosia, o renascimento, as coisas ocultas, o poço profundo.',
    elementos: 'Terra / Água',
    orixas: ['Omolu', 'Oxumaré', 'Exu'],
    quizilas: [
      'Dormir no escuro absoluto se estiver com medo',
      'Comer carne de caça',
      'Persistir no erro',
    ],
    preceitos:
      'Praticar o desapego; aceitar as mudanças da vida; não cavar o próprio buraco com mágoas.',
    ebo: 'Ebó de Transmutação: Pipoca (Deburu) para Omolu, banhos de lama ou argila, defumações pesadas com resinas.',
  },
  {
    numero: 8,
    nome: 'EjiOníle',
    significado: 'A cabeça (Ori), a liderança, o topo do mundo, o sangue branco.',
    elementos: 'Ar / Água',
    orixas: ['Oxalá', 'Jagun'],
    quizilas: [
      'Usar roupas pretas ou escuras',
      'Comer carne de sangue (carne vermelha) em dias de preceito',
    ],
    preceitos:
      'Cuidar muito bem do próprio Ori (cabeça); buscar a paz; evitar o orgulho e a arrogância.',
    ebo: 'Ebó de Alinhamento (Bori): Oferendas de canjica branca, algodão, banhos de boldo (tapete de Oxalá) e velas brancas.',
  },
  {
    numero: 9,
    nome: 'Ossá',
    significado: 'O vento, as transformações rápidas, o reino das Iyami (as bruxas ancestrais).',
    elementos: 'Ar / Água',
    orixas: ['Iansã', 'Iemanjá'],
    quizilas: [
      'Espalhar fofocas',
      'Ventanias fortes na praia (evitar banho de mar nesses dias)',
      'Usar roupas rasgadas',
    ],
    preceitos:
      'Respeitar o poder feminino; controlar a impulsividade e as palavras; fluir com as mudanças.',
    ebo: 'Ebó de Limpeza Astral: Sacudimentos com folhas de fumo ou pinhão roxo, oferendas de acarajé para Iansã no vento.',
  },
  {
    numero: 10,
    nome: 'Ofun',
    significado: 'O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação.',
    elementos: 'Ar / Água',
    orixas: ['Oxalá (Suficiente)', 'Obá'],
    quizilas: [
      'Usar roupas pretas',
      'Comer comida amanhecida',
      'Faltar com o respeito aos mais velhos',
    ],
    preceitos:
      'Vestir-se de branco; manter o silêncio e a quietude; estudar a espiritualidade profunda.',
    ebo: 'Ebó de Alívio/Saúde: Tudo neste Odú pede rezas mansas, frutas brancas, banhos de leite de cabra ou ervas calmas.',
  },
  {
    numero: 11,
    nome: 'Owarin',
    significado: 'A pressa, a ansiedade, a mudança de rumo rápida. O vento que espalha as folhas.',
    elementos: 'Fogo / Ar',
    orixas: ['Iansã', 'Exu', 'Ogum'],
    quizilas: [
      'Guardar objetos quebrados ou velhos em casa',
      'Procrastinar',
      'Roupas muito escuras',
    ],
    preceitos:
      'Organizar a mente e a rotina; canalizar a ansiedade em atividades físicas ou artísticas.',
    ebo: 'Ebó de Movimento: Rodar chaves, acender velas nas esquinas, banhos de ervas quentes (guiné, arruda).',
  },
  {
    numero: 12,
    nome: 'Ejilsebora',
    significado: 'A justiça, o fogo purificador, a guerra justa, os terremotos.',
    elementos: 'Fogo',
    orixas: ['Xangô', 'Obá'],
    quizilas: [
      'Praticar a injustiça',
      'Acobertar mentiras',
      'Comer abóbora ou quiabo em excesso nas crises',
    ],
    preceitos:
      'Manter a integridade a todo custo; não julgar os outros sem provas; equilibrar a razão e a emoção.',
    ebo: 'Ebó de Justiça: Firmezas com pedras de raio (meteoritos/quartzo marrom), amalá bem quente com folhas de fumo.',
  },
  {
    numero: 13,
    nome: 'Olobón',
    significado: 'A doença, as transformações físicas, o fim de ciclos. O recolhimento.',
    elementos: 'Terra / Água',
    orixas: ['Nanã', 'Omolu'],
    quizilas: [
      'Ambientes sujos ou bagunçados',
      'Comer carne de rã ou tartaruga',
      'Reclamar da velhice',
    ],
    preceitos:
      'Respeitar o tempo das coisas; buscar a sabedoria dos mais velhos; cuidar da saúde das articulações.',
    ebo: 'Ebó de Evolução: Oferendas na lama ou no mangue para Nanã, ebó com feijão preto, velas lilases.',
  },
  {
    numero: 14,
    nome: 'Iká',
    significado: 'A traição, a cobra que morde, a sabedoria oculta e a renovação da pele.',
    elementos: 'Água / Terra',
    orixas: ['Oxumaré', 'Ossain'],
    quizilas: [
      'Falsidade',
      'Maltratar animais (especialmente répteis)',
      'Revelar segredos confiados a você',
    ],
    preceitos:
      'Manter a discrição absoluta sobre sua vida pessoal; cultivar a flexibilidade perante os obstáculos.',
    ebo: 'Ebó de Renovação: Banhos com folhas de fortuna e dinheiro-em-penca, amarrar fitas coloridas (7 cores).',
  },
  {
    numero: 15,
    nome: 'Ogbogbé',
    significado: 'A feitiçaria, o corte pesado, as disputas por espaço ou poder.',
    elementos: 'Fogo / Terra',
    orixas: ['Obá', 'Ewá', 'Ogum'],
    quizilas: [
      'Invejar o espaço alheio',
      'Comer comidas muito apimentadas perto de dormir',
      'Brigas domésticas',
    ],
    preceitos:
      'Buscar a paz no lar; proteger a própria energia contra feitiçarias e inveja; focar no amor próprio.',
    ebo: 'Ebó de Defesa: Oferendas com acarajés recheados, banhos de erva-de-bicho ou espada-de-santa-bárbara.',
  },
  {
    numero: 16,
    nome: 'Alafia',
    significado: 'A paz absoluta, a luz total, a confirmação dos Deuses. Tudo está bem.',
    elementos: 'Ar / Luz',
    orixas: ['Orunmilá', 'Oxalá'],
    quizilas: [
      'Duvidar da própria espiritualidade',
      'Orgulho',
      'Arrogância',
      'Não ouvir conselhos',
    ],
    preceitos:
      'Manter as práticas espirituais em dia; compartilhar a sabedoria com quem precisa; ser grato.',
    ebo: 'Ebó de Agradecimento: Flores brancas, oferendas de frutas doces e claras, acender lâmpadas ou muitas velas brancas.',
  },
];

// ============================================================
// CHAKRAS E SUAS CORRESPONDÊNCIAS
// ============================================================

const chakras: ChakraData[] = [
  {
    numero: 1,
    nome: '1º Básico (Muladhara)',
    cor: 'Vermelho',
    planeta: 'Saturno',
    elemento: 'Terra',
    freqSolfeggio: '396 Hz',
    mantram: 'LAM',
    nomeDivino: 'ADONAI HA-ARETZ',
    poliedro: 'Cubo',
    funcao: 'Dissolução de medos de sobrevivência, ancoramento e firmeza material.',
  },
  {
    numero: 2,
    nome: '2º Sacro (Swadhisthana)',
    cor: 'Laranja',
    planeta: 'Lua',
    elemento: 'Água',
    freqSolfeggio: '417 Hz',
    mantram: 'VAM',
    nomeDivino: 'ELOHIM GIBOR',
    poliedro: 'Cubo / Hexaedro',
    funcao: 'Limpeza de traumas do passado, transmutação criativa e fluidez vital.',
  },
  {
    numero: 3,
    nome: '3º Plexo Solar (Manipura)',
    cor: 'Amarelo',
    planeta: 'Sol',
    elemento: 'Fogo',
    freqSolfeggio: '528 Hz',
    mantram: 'RAM',
    nomeDivino: 'SHADDAI EL CHAI',
    poliedro: 'Tetraedro',
    funcao: 'Transformação da força de vontade, quebra de medos e ativação do brilho.',
  },
  {
    numero: 4,
    nome: '4º Cardíaco (Anahata)',
    cor: 'Verde / Rosa',
    planeta: 'Vênus',
    elemento: 'Ar / Água',
    freqSolfeggio: '639 Hz',
    mantram: 'YAM',
    nomeDivino: 'YHVH ELOAH VA-DAATH',
    poliedro: 'Octaedro',
    funcao: 'Expansão do afeto incondicional, harmonização de relacionamentos e cura.',
  },
  {
    numero: 5,
    nome: '5º Laríngeo (Vishuddha)',
    cor: 'Azul Claro',
    planeta: 'Mercúrio',
    elemento: 'Ar',
    freqSolfeggio: '741 Hz',
    mantram: 'HAM',
    nomeDivino: 'ELOHIM SABAOTH',
    poliedro: 'Dodecaedro',
    funcao: 'Expressão da verdade interna, purificação e poder da palavra falada.',
  },
  {
    numero: 6,
    nome: '6º Frontal (Ajna)',
    cor: 'Indigo',
    planeta: 'Lua',
    elemento: 'Éter / Ar',
    freqSolfeggio: '852 Hz',
    mantram: 'OM',
    nomeDivino: 'YAH',
    poliedro: 'Icosaedro',
    funcao: 'Despertar da intuição profunda, visão clara e dissolução de ilusões.',
  },
  {
    numero: 7,
    nome: '7º Coronário (Sahasrara)',
    cor: 'Violeta / Branco',
    planeta: 'Sol',
    elemento: 'Éter (Quintessência)',
    freqSolfeggio: '963 Hz',
    mantram: 'AUM / SILÊNCIO',
    nomeDivino: 'EHEIEH',
    poliedro: 'Esfera',
    funcao: 'Conexão espiritual direta com a Fonte e iluminação da mente.',
  },
];

// ============================================================
const fasesLua = [
  {
    fase: 'Lua Nova',
    estado: 'Introspecção, silêncio, planejamento invisível.',
    janela: 'Das 00:00 às 03:00 (Hora Astrológica).',
    ritual: 'Início de projetos secretos, firmezas de proteção profunda, assentamento de Exu.',
    orixas: 'Exu, Omolu, Ogum',
    cartas: 'Casa 1 (O Cavaleiro) / Casa 26 (O Livro)',
    praticas: 'Meditação silenciosa, journaling, firmezas de proteção',
  },
  {
    fase: 'Lua Crescente',
    estado: 'Foco, ação disciplinada, força de vontade.',
    janela: 'Das 06:00 às 12:00 (Amanhecer/Zênite).',
    ritual: 'Rituais de abertura de caminhos comerciais, banhos de prosperidade e atração.',
    orixas: 'Oxóssi, Ogum, Xangô',
    cartas: 'Casa 13 (A Criança) / Casa 34 (Os Peixes)',
    praticas: 'Iniciação de projetos e usaha, trabalho com intenção e disciplina',
  },
  {
    fase: 'Lua Cheia',
    estado: 'Expansão áurica máxima, magnetismo, êxtase.',
    janela: 'Das 18:00 às 00:00 (Ascensão da Lua).',
    ritual: 'Alta magia de atração, consagração de patuás, boris, rituais de amor e cura de Ori.',
    orixas: 'Oxalá, Oxum, Iemanjá',
    cartas: 'Casa 16 (A Estrela) / Casa 31 (O Sol)',
    praticas: 'Rituais de alta magia, cura, amor, consagrações',
  },
  {
    fase: 'Lua Minguante',
    estado: 'Desapego, austeridade, banimento consciente.',
    janela: 'Das 12:00 às 18:00 (Ocaso Solar).',
    ritual: 'Quebra de energias paradas, ebós de descarrego pesado, cura de vícios e doenças.',
    orixas: 'Omolu, Nanã, Iansã',
    cartas: 'Casa 8 (O Caixão) / Casa 10 (A Foice)',
    praticas: 'Descargo, ebós, cura de vícios e doenças',
  },
];

// ============================================================
// UTILITÁRIOS
// ============================================================

function getDiaSemanaAtual(): DiaSemanaData {
  const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const hoje = new Date().getDay();
  const diaKey = dias[hoje];
  return diasSemana[diaKey];
}

function getOrixasDoDia(): OrixaData[] {
  const diaAtual = getDiaSemanaAtual();
  return orixas.filter((o) =>
    diaAtual.orixas.some((orixa) => o.nome.includes(orixa.split('/')[0].trim()))
  );
}

/**
 * Mudra data module
 * Provides sacred hand gestures and their properties for the Cabala dos Caminhos system
 */

// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// deno-lint-ignore-file no-explicit-any

export interface MudraProperties {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  sanskrit: string;
  description: string;
  descriptionPt: string;
  meaning: string;
  meaningPt: string;
  usage: string[];
  benefits: string[];
  element: string;
  chakra: string;
  fingers: {
    thumb: 'left' | 'right' | 'both' | 'none';
    index: 'left' | 'right' | 'both' | 'none';
    middle: 'left' | 'right' | 'both' | 'none';
    ring: 'left' | 'right' | 'both' | 'none';
    pinky: 'left' | 'right' | 'both' | 'none';
  };
  position: string;
  duration: string;
  contraindications: string[];
  sequence: number;
}

export interface MudraData {
  [key: string]: MudraProperties;
}

const mudras: MudraData = {
  "gyan-mudra": {
    id: "gyan-mudra",
    name: "Gyan Mudra",
    namePt: "Selo do Conhecimento",
    nameEn: "Knowledge Seal",
    sanskrit: "ज्ञान mudra",
    description: "A join a ponta do polegar com a ponta do indicador, enquanto mantém os outros três dedos estendidos. Conhecida como o selo do conhecimento e da sabedoria.",
    descriptionPt: "A join a ponta do polegar com a ponta do indicador, enquanto mantém os outros três dedos estendidos. Conhecida como o selo do conhecimento e da sabedoria.",
    meaning: "Representa a união do individual com o universal, o despertar da consciência suprema.",
    meaningPt: "Representa a união do individual com o universal, o despertar da consciência suprema.",
    usage: [
      "Sente-se em posição de lótus ou sukhasana",
      "Mantenha a coluna ereta",
      "Junte as pontas do polegar e indicador",
      "Mantenha os outros dedos relaxados e estendidos",
      "Coloque as mãos sobre os joelhos com as palmas voltadas para cima"
    ],
    benefits: [
      "Melhora a concentração e a memória",
      "Estimula a glândula pituitária",
      "Reduz o estresse e a ansiedade",
      "Melhora a digestão",
      "Promove a clareza mental"
    ],
    element: "akasha",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "none"
    },
    position: "hands on knees, palms up",
    duration: "15-45 minutes",
    contraindications: [
      "Não recomendado para pessoas com problemas no polegar",
      "Evitar se houver inflamação nas articulações"
    ],
    sequence: 1
  },
  "chin-mudra": {
    id: "chin-mudra",
    name: "Chin Mudra",
    namePt: "Selo da Consciência",
    nameEn: "Consciousness Seal",
    sanskrit: "चिन mudra",
    description: "Semelhante ao gyan mudra, mas com as palmas voltadas para baixo sobre os joelhos. Este mudra representa a封印 da consciência e a dissolução do ego.",
    descriptionPt: "Semelhante ao gyan mudra, mas com as palmas voltadas para baixo sobre os joelhos. Este mudra representa a封印 da consciência e a dissolução do ego.",
    meaning: "Simboliza a unidade entre Purusha (consciência) e Prakriti (natureza), promovendo a transcendência do eu.",
    meaningPt: "Simboliza a unidade entre Purusha (consciência) e Prakriti (natureza), promovendo a transcendência do eu.",
    usage: [
      "Sente-se em posição confortável",
      "Junte as pontas do polegar e indicador",
      "Vire as palmas para baixo sobre os joelhos",
      "Mantenha os dedos mindinho, médio e anelar estendidos",
      "Relaxe os ombros e feche os olhos"
    ],
    benefits: [
      "Promove a meditação profunda",
      "Ajuda a superar a depressão",
      "Melhora a capacidade de concentração",
      "Acalma o sistema nervoso",
      "Facilita a conexão espiritual"
    ],
    element: "vayu",
    chakra: "vishuddha",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "none"
    },
    position: "hands on knees, palms down",
    duration: "15-60 minutes",
    contraindications: [
      "Pode causar sonolência em algumas pessoas"
    ],
    sequence: 2
  },
  "adi-mudra": {
    id: "adi-mudra",
    name: "Adi Mudra",
    namePt: "Primeiro Selo",
    nameEn: "First Seal",
    sanskrit: "आदि mudra",
    description: "O polegar envolve os dedos indicador e médio, que estão curvados para dentro. É o mudra de entrada para muitas práticas de yoga.",
    descriptionPt: "O polegar envolve os dedos indicador e médio, que estão curvados para dentro. É o mudra de entrada para muitas práticas de yoga.",
    meaning: "Representa o início do caminho espiritual e a preparação para a prática avançada.",
    meaningPt: "Representa o início do caminho espiritual e a preparação para a prática avançada.",
    usage: [
      "Curve os dedos indicador e médio para dentro",
      "Envolva-os com o polegar",
      "Mantenha os dedos anelar e mindinho estendidos",
      "Coloque as mãos sobre os joelhos",
      "Mantenha a respiração calma e profunda"
    ],
    benefits: [
      "Calma a mente",
      "Melhora a circulação cerebral",
      "Reduz dores de cabeça",
      "Promove o equilíbrio emocional",
      "Auxilia no tratamento de insônia"
    ],
    element: "prithvi",
    chakra: "muladhara",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "none",
      pinky: "none"
    },
    position: "hands on knees",
    duration: "10-30 minutes",
    contraindications: [
      "Não recomendado durante a gravidez"
    ],
    sequence: 3
  },
  "jnana-mudra": {
    id: "jnana-mudra",
    name: "Jnana Mudra",
    namePt: "Selo da Sabedoria",
    nameEn: "Wisdom Seal",
    sanskrit: "ज्ञान mudra",
    description: "Variante do gyan mudra onde o polegar e o indicador formam um círculo, indicando sabedoria perfeita e iluminação.",
    descriptionPt: "Variante do gyan mudra onde o polegar e o indicador formam um círculo, indicando sabedoria perfeita e iluminação.",
    meaning: "O círculo representa o ciclo infinito da vida e a sabedoria que transcende o tempo.",
    meaningPt: "O círculo representa o ciclo infinito da vida e a sabedoria que transcende o tempo.",
    usage: [
      "Forme um círculo com polegar e indicador",
      "Mantenha os outros dedos estendidos",
      "Coloque as mãos em posição de meditação ou sobre os joelhos",
      "Sente-se com a coluna alinhada",
      "Concentre-se no ponto entre as sobrancelhas"
    ],
    benefits: [
      "Desenvolve a intuição",
      "Melhora a capacidade analítica",
      "Promove a clareza mental",
      "Auxilia no autoconhecimento",
      "Fortalece a memória"
    ],
    element: "agni",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "none"
    },
    position: "meditation pose or hands on knees",
    duration: "20-45 minutes",
    contraindications: [],
    sequence: 4
  },
  "varun-mudra": {
    id: "varun-mudra",
    name: "Varun Mudra",
    namePt: "Selo da Água",
    nameEn: "Water Seal",
    sanskrit: "वरुण mudra",
    description: "A ponta do polegar toca a ponta do dedo mindinho. Este mudra está associado ao elemento água e às suas qualidades purificadoras.",
    descriptionPt: "A ponta do polegar toca a ponta do dedo mindinho. Este mudra está associado ao elemento água e às suas qualidades purificadoras.",
    meaning: "Representa a fluidez, a adaptabilidade e a purificação interior.",
    meaningPt: "Representa a fluidez, a adaptabilidade e a purificação interior.",
    usage: [
      "Junte a ponta do polegar com a ponta do mindinho",
      "Mantenha os outros dedos estendidos",
      "Pratique com as palmas voltada para cima ou para baixo",
      "Sente-se em posição confortável",
      "Beba água durante a prática"
    ],
    benefits: [
      "Equilibra o elemento água no corpo",
      "Melhora a elasticidade da pele",
      "Reduz a retenção de líquidos",
      "Promove a hidratação celular",
      "Auxilia no tratamento de ressecamento e desidratação"
    ],
    element: "jala",
    chakra: "svadhisthana",
    fingers: {
      thumb: "both",
      index: "none",
      middle: "none",
      ring: "none",
      pinky: "both"
    },
    position: "hands on knees or prayer position",
    duration: "15-30 minutes",
    contraindications: [
      "Não recomendado para pessoas com problemas renais"
    ],
    sequence: 5
  },
  "prithvi-mudra": {
    id: "prithvi-mudra",
    name: "Prithvi Mudra",
    namePt: "Selo da Terra",
    nameEn: "Earth Seal",
    sanskrit: "पृथ्वी mudra",
    description: "A ponta do dedo médio e do anular tocam a ponta do polegar, enquanto os outros dedos permanecem estendidos. Este mudra fortalece o elemento terra.",
    descriptionPt: "A ponta do dedo médio e do anular tocam a ponta do polegar, enquanto os outros dedos permanecem estendidos. Este mudra fortalece o elemento terra.",
    meaning: "Simboliza estabilidade, força e conexão com a natureza.",
    meaningPt: "Simboliza estabilidade, força e conexão com a natureza.",
    usage: [
      "Dobre os dedos médio e anular para tocar o polegar",
      "Mantenha o indicador e mindinho estendidos",
      "Pratique com as palmas voltadas para cima ou para baixo",
      "Visualize a energia da terra subindo pelo corpo",
      "Mantenha os pés firmes no chão"
    ],
    benefits: [
      "Aumenta a energia vital",
      "Fortalece ossos e músculos",
      "Melhora a concentração",
      "Promove a sensação de enraizamento",
      "Auxilia no tratamento de fadiga crônica"
    ],
    element: "prithvi",
    chakra: "muladhara",
    fingers: {
      thumb: "both",
      index: "none",
      middle: "both",
      ring: "both",
      pinky: "none"
    },
    position: "hands on knees",
    duration: "20-45 minutes",
    contraindications: [
      "Pode causar fome excessiva se praticado por muito tempo"
    ],
    sequence: 6
  },
  "agni-mudra": {
    id: "agni-mudra",
    name: "Agni Mudra",
    namePt: "Selo do Fogo",
    nameEn: "Fire Seal",
    sanskrit: "अग्नि mudra",
    description: "O dedo anelar toca a ponta do polegar, enquanto os outros dedos permanecem estendidos. Este mudra desperta o elemento fogo e o metabolismo.",
    descriptionPt: "O dedo anelar toca a ponta do polegar, enquanto os outros dedos permanecem estendidos. Este mudra desperta o elemento fogo e o metabolismo.",
    meaning: "Representa a transformação, a digestão e a capacidade de queimar impurezas.",
    meaningPt: "Representa a transformação, a digestão e a capacidade de queimar impurezas.",
    usage: [
      "Dobre o dedo anelar para tocar a ponta do polegar",
      "Mantenha os outros dedos estendidos",
      "Pratique com as palmas voltadas para baixo",
      "Sente-se com a coluna ereta",
      "Visualize uma chama na região do umbigo"
    ],
    benefits: [
      "Acelera o metabolismo",
      "Melhora a digestão",
      "Aumenta a energia corporal",
      "Auxilia no controle de peso",
      "Promove a termogênese"
    ],
    element: "agni",
    chakra: "manipura",
    fingers: {
      thumb: "both",
      index: "none",
      middle: "none",
      ring: "both",
      pinky: "none"
    },
    position: "hands on knees, palms down",
    duration: "15-30 minutes",
    contraindications: [
      "Não recomendado para pessoas com febre",
      "Evitar durante a gravidez",
      "Cuidado com praticantes de hipertireoidismo"
    ],
    sequence: 7
  },
  "vayu-mudra": {
    id: "vayu-mudra",
    name: "Vayu Mudra",
    namePt: "Selo do Ar",
    nameEn: "Air Seal",
    sanskrit: "वायु mudra",
    description: "O dedo indicador dobra-se para tocar a base do polegar, que pressiona a segunda falange do indicador. Os outros dedos permanecem estendidos.",
    descriptionPt: "O dedo indicador dobra-se para tocar a base do polegar, que pressiona a segunda falange do indicador. Os outros dedos permanecem estendidos.",
    meaning: "Representa o elemento ar, a comunicação e a liberdade.",
    meaningPt: "Representa o elemento ar, a comunicação e a liberdade.",
    usage: [
      "Dobre o dedo indicador para tocar a base do polegar",
      "Pressione a segunda falange do indicador com o polegar",
      "Mantenha os outros dedos estendidos",
      "Pratique em ambiente com boa ventilação",
      "Respire profundamente durante a prática"
    ],
    benefits: [
      "Alivia dores nas articulações",
      "Reduz gases e inchaço",
      "Melhora a circulação",
      "Auxilia no tratamento de artrite",
      "Promove a flexibilidade"
    ],
    element: "vayu",
    chakra: "vishuddha",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "none"
    },
    position: "hands on knees",
    duration: "15-40 minutes",
    contraindications: [
      "Pode causar tontura em pessoas sensíveis"
    ],
    sequence: 8
  },
  "akash-mudra": {
    id: "akash-mudra",
    name: "Akash Mudra",
    namePt: "Selo do Éter",
    nameEn: "Ether Seal",
    sanskrit: "आकाश mudra",
    description: "O dedo mindinho dobra-se para tocar a base do polegar, que pressiona a terceira falange. Este mudra conecta com o elemento éter.",
    descriptionPt: "O dedo mindinho dobra-se para tocar a base do polegar, que pressiona a terceira falange. Este mudra conecta com o elemento éter.",
    meaning: "Simboliza a expansão da consciência e a conexão com o espaço infinito.",
    meaningPt: "Simboliza a expansão da consciência e a conexão com o espaço infinito.",
    usage: [
      "Dobre o dedo mindinho para tocar a base do polegar",
      "Pressione a terceira falange com o polegar",
      "Mantenha os outros dedos relaxados",
      "Pratique em ambiente tranquilo",
      "Concentre-se no som do silêncio"
    ],
    benefits: [
      "Promove a abertura dos canais de comunicação",
      "Melhora a audição",
      "Reduz zumbido no ouvido",
      "Auxilia no tratamento de sinusite",
      "Promove clareza de pensamento"
    ],
    element: "akasha",
    chakra: "vishuddha",
    fingers: {
      thumb: "both",
      index: "none",
      middle: "none",
      ring: "none",
      pinky: "both"
    },
    position: "hands on knees",
    duration: "15-45 minutes",
    contraindications: [
      "Pode causar sensações intensas de expansão em algumas pessoas"
    ],
    sequence: 9
  },
  "surya-mudra": {
    id: "surya-mudra",
    name: "Surya Mudra",
    namePt: "Selo do Sol",
    nameEn: "Sun Seal",
    sanskrit: "सूर्य mudra",
    description: "O dedo anelar toca a base do polegar, que pressiona sua segunda falange. Este mudra fortalece a energia solar e a confiança.",
    descriptionPt: "O dedo anelar toca a base do polegar, que pressiona sua segunda falange. Este mudra fortalece a energia solar e a confiança.",
    meaning: "Representa o sol, a energia Yang e a vitalidade.",
    meaningPt: "Representa o sol, a energia Yang e a vitalidade.",
    usage: [
      "Dobre o dedo anelar para tocar a base do polegar",
      "Pressione a segunda falange do polegar sobre o anelar",
      "Mantenha os outros dedos estendidos",
      "Pratique preferencialmente pela manhã",
      "Visualize a luz solar entrando pelo topo da cabeça"
    ],
    benefits: [
      "Aumenta a energia vital",
      "Melhora a digestão",
      "Fortalece a autoestima",
      "Auxilia no tratamento de diabetes",
      "Promove a perda de peso"
    ],
    element: "agni",
    chakra: "manipura",
    fingers: {
      thumb: "both",
      index: "none",
      middle: "none",
      ring: "both",
      pinky: "none"
    },
    position: "hands on knees",
    duration: "15-40 minutes",
    contraindications: [
      "Não recomendado durante tempestades",
      "Evitar exposição solar excessiva após a prática"
    ],
    sequence: 10
  },
  "shunya-mudra": {
    id: "shunya-mudra",
    name: "Shunya Mudra",
    namePt: "Selo do Silêncio",
    nameEn: "Silence Seal",
    sanskrit: "शून्य mudra",
    description: "O dedo médio dobra-se para tocar a base do polegar, que pressiona sua segunda falange. Este mudra promove o silêncio interior.",
    descriptionPt: "O dedo médio dobra-se para tocar a base do polegar, que pressiona sua segunda falange. Este mudra promove o silêncio interior.",
    meaning: "Representa o vazio fértil, a quietude e a possibilidade de renovação.",
    meaningPt: "Representa o vazio fértil, a quietude e a possibilidade de renovação.",
    usage: [
      "Dobre o dedo médio para tocar a base do polegar",
      "Pressione a segunda falange com o polegar",
      "Mantenha os outros dedos relaxados",
      "Pratique em ambiente silencioso",
      "Permita que a mente se aquietie naturalmente"
    ],
    benefits: [
      "Reduce a dor física",
      "Alivia a dor de ouvido",
      "Promove o silêncio interior",
      "Auxilia no tratamento de labirintite",
      "Desperta a intuição"
    ],
    element: "akasha",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "none",
      middle: "both",
      ring: "none",
      pinky: "none"
    },
    position: "hands on knees or meditation pose",
    duration: "20-45 minutes",
    contraindications: [
      "Pode усилить depressive symptoms em algumas pessoas"
    ],
    sequence: 11
  },
  "prana-mudra": {
    id: "prana-mudra",
    name: "Prana Mudra",
    namePt: "Selo do Prana",
    nameEn: "Life Force Seal",
    sanskrit: "प्राण mudra",
    description: "Os dedos anelar, mindinho e polegar tocam-se nas pontas, enquanto os indicadores e médios permanecem estendidos. Este é um mudra poderosas para energização.",
    descriptionPt: "Os dedos anelar, mindinho e polegar tocam-se nas pontas, enquanto os indicadores e médios permanecem estendidos. Este é um mudra poderoso para energização.",
    meaning: "Representa a força vital, a energia prânica que permeia todos os seres.",
    meaningPt: "Representa a força vital, a energia prânica que permeia todos os seres.",
    usage: [
      "Junte as pontas do polegar, anelar e mindinho",
      "Mantenha os dedos indicador e médio estendidos",
      "Pratique com as palmas voltadas para cima",
      "Respire profundamente visualizing energia entrando pelo topo da cabeça",
      "Sente-se em local arejado e iluminado"
    ],
    benefits: [
      "Aumenta a energia vital",
      "Fortalece o sistema imunologico",
      "Reduz a fadiga",
      "Melhora a vitalidade geral",
      "Auxilia na recuperação de doenças"
    ],
    element: "akasha",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "none",
      middle: "none",
      ring: "both",
      pinky: "both"
    },
    position: "hands on knees, palms up",
    duration: "15-45 minutes",
    contraindications: [
      "Não recomendado para pessoas com hipomania ou mania"
    ],
    sequence: 12
  },
  "apana-mudra": {
    id: "apana-mudra",
    name: "Apana Mudra",
    namePt: "Selo da Eliminação",
    nameEn: "Elimination Seal",
    sanskrit: "अपान mudra",
    description: "Os dedos médio, anelar e mindinho tocam a ponta do polegar, enquanto o indicador permanece estendido. Este mudra favorece a eliminação e a desintoxicação.",
    descriptionPt: "Os dedos médio, anelar e mindinho tocam a ponta do polegar, enquanto o indicador permanece estendido. Este mudra favorece a eliminação e a desintoxicação.",
    meaning: "Simboliza a energia descendente, responsável pela eliminação e purificação.",
    meaningPt: "Simboliza a energia descendente, responsável pela eliminação e purificação.",
    usage: [
      "Junte as pontas dos dedos médio, anelar e mindinho com o polegar",
      "Mantenha o dedo indicador estendido",
      "Pratique sentado com a coluna ereta",
      "Visualize a energia de eliminação descendo pelo corpo",
      "Mantenha uma hidratação adequada durante a prática"
    ],
    benefits: [
      "Favorece a digestão e eliminação",
      "Auxilia no tratamento de prisão de ventre",
      "Promove a desintoxicação",
      "Regula o ciclo menstrual",
      "Reduz gases e inchaço"
    ],
    element: "jala",
    chakra: "muladhara",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "both",
      pinky: "both"
    },
    position: "hands on knees",
    duration: "15-40 minutes",
    contraindications: [
      "Não recomendado para pessoas com diarreia"
    ],
    sequence: 13
  },
  "apan-vayu-mudra": {
    id: "apan-vayu-mudra",
    name: "Apan Vayu Mudra",
    namePt: "Selo da Digestão",
    nameEn: "Digestion Seal",
    sanskrit: "अपान वायु mudra",
    description: "Combinação do apana mudra com a posição do dedo indicador do vayu mudra. Este é um mudra poderoso para problemas digestivos e cardíacos.",
    descriptionPt: "Combinação do apana mudra com a posição do dedo indicador do vayu mudra. Este é um mudra poderoso para problemas digestivos e cardíacos.",
    meaning: "Representa o equilíbrio entre as energias descendentes (apana) e do ar (vayu), promovendo a digestão e a saúde cardíaca.",
    meaningPt: "Representa o equilíbrio entre as energias descendentes (apana) e do ar (vayu), promovendo a digestão e a saúde cardíaca.",
    usage: [
      "Forme a posição do apana mudra (médio, anelar e mindinho tocando o polegar)",
      "Dobre o indicador para tocar a base do polegar como no vayu mudra",
      "Mantenha os polegares sobre os dedos indicadores",
      "Pratique após as refeições",
      "Mantenha uma respiração calma e regulares"
    ],
    benefits: [
      "Melhora significativamente a digestão",
      "Alivia problemas cardíacos",
      "Reduz azia e refluxo",
      "Auxilia no tratamento de hemorroidas",
      "Promove a saúde geral do sistema digestivo"
    ],
    element: "agni",
    chakra: "manipura",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "both",
      pinky: "both"
    },
    position: "hands on knees",
    duration: "15-45 minutes",
    contraindications: [
      "Não recomendado para pessoas com pressão arterial baixa"
    ],
    sequence: 14
  },
  "linga-mudra": {
    id: "linga-mudra",
    name: "Linga Mudra",
    namePt: "Selo da Criatividade",
    nameEn: "Creative Seal",
    sanskrit: "लिंग mudra",
    description: "Os dedos indicador entrelaçam-se com os polegares, que ficam voltados para cima. As mãos formam um \"V\" invertido. Este mudra estimula a criatividade e o poder.",
    descriptionPt: "Os dedos indicador entrelaçam-se com os polegares, que ficam voltados para cima. As mãos formam um \"V\" invertido. Este mudra estimula a criatividade e o poder.",
    meaning: "Representa a energia criativa Shiva, o princípio masculino e a capacidade de criar realidade.",
    meaningPt: "Representa a energia criativa Shiva, o princípio masculino e a capacidade de criar realidade.",
    usage: [
      "Entrelaça os dedos indicadores com os polegares",
      "Levante os polegares para cima formando um V invertido",
      "Mantenha os cotovelos afastados do corpo",
      "Respire profundamente e visualize energia subindo",
      "Pratique quando precisar de criatividade ou poder"
    ],
    benefits: [
      "Aumenta a energia criativa",
      "Fortalece a vontade",
      "Melhora a capacidade de manifestacao",
      "Auxilia no tratamento de problemas pulmonares",
      "Promove a autoconfiança"
    ],
    element: "agni",
    chakra: "manipura",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "none"
    },
    position: "hands raised, interlaced fingers forming V",
    duration: "15-30 minutes",
    contraindications: [
      "Não recomendado para pessoas com hipertensão",
      "Evitar antes de dormir"
    ],
    sequence: 15
  },
  "mrudang-mudra": {
    id: "mrudang-mudra",
    name: "Mrudang Mudra",
    namePt: "Selo do Tambor",
    nameEn: "Drum Seal",
    sanskrit: "मृदंग mudra",
    description: "As palmas das mãos estão voltadas uma para a outra, levemente separadas, com os dedos médios tocando-se. É usado em práticas de música e meditação.",
    descriptionPt: "As palmas das mãos estão voltadas uma para a outra, levemente separadas, com os dedos médios tocando-se. É usado em práticas de música e meditação.",
    meaning: "Representa o ritmo cósmico, a batida do coração divino que sustenta toda a existência.",
    meaningPt: "Representa o ritmo cósmico, a batida do coração divino que sustenta toda a existência.",
    usage: [
      "Junte as palmas das mãos suavemente",
      "Deixe os dedos médios tocarem-se",
      "Mantenha os outros dedos ligeiramente separados",
      "Coloque as mãos na altura do coração",
      "Concentre-se no ritmo da sua respiração"
    ],
    benefits: [
      "Melhora a coordenação motora",
      "Promove o ritmo e a musicalidade",
      "Harmoniza os hemisférios cerebrais",
      "Auxilia no tratamento de tremores",
      "Desperta a criatividade musical"
    ],
    element: "vayu",
    chakra: "anahata",
    fingers: {
      thumb: "none",
      index: "none",
      middle: "both",
      ring: "none",
      pinky: "none"
    },
    position: "hands at heart level, palms facing",
    duration: "10-30 minutes",
    contraindications: [],
    sequence: 16
  },
  "haki-mudra": {
    id: "haki-mudra",
    name: "Haki Mudra",
    namePt: "Selo da Escuta",
    nameEn: "Listening Seal",
    sanskrit: "हाकि mudra",
    description: "Os dedos indicador e médio curvam-se para baixo, tocando as palmas. Os polegares tocam os dedos mindinhos. É usado para aumentar a capacidade de ouvir.",
    descriptionPt: "Os dedos indicador e médio curvam-se para baixo, tocando as palmas. Os polegares tocam os dedos mindinhos. É usado para aumentar a capacidade de ouvir.",
    meaning: "Representa a escuta profunda, a capacidade de ouvir os sons sutis do universo.",
    meaningPt: "Representa a escuta profunda, a capacidade de ouvir os sons sutis do universo.",
    usage: [
      "Curve os dedos indicador e médio para tocar as palmas",
      "Junte os polegares com os dedos mindinhos",
      "Mantenha os dedos anelares estendidos",
      "Pratique em silêncio, focando nos sons ambiente",
      "Mantenha os olhos fechados"
    ],
    benefits: [
      "Melhora a audição",
      "Aumenta a capacidade de escuta ativa",
      "Desenvolve a sensibilidade aos sons sutis",
      "Auxilia no tratamento de zumbido",
      "Promove a conexão com os mantras"
    ],
    element: "akasha",
    chakra: "vishuddha",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "none",
      pinky: "both"
    },
    position: "hands at chest level",
    duration: "15-40 minutes",
    contraindications: [],
    sequence: 17
  },
  "ankush-mudra": {
    id: "ankush-mudra",
    name: "Ankush Mudra",
    namePt: "Selo do Controle",
    nameEn: "Control Seal",
    sanskrit: "अंकुश mudra",
    description: "Os polegares pressionam os dedos indicadores enquanto os outros dedos estão cerrados. Este mudra representa controle e dominio sobre os sentidos.",
    descriptionPt: "Os polegares pressionam os dedos indicadores enquanto os outros dedos estão cerrados. Este mudra representa controle e domínio sobre os sentidos.",
    meaning: "Simboliza o controle do elephant (ancush), a capacidade de-dominar os desejos e apegos.",
    meaningPt: "Simboliza o controle do elephant (ankush), a capacidade de dominar os desejos e apegos.",
    usage: [
      "Feche os punhos com os polegares sobre os indicadores",
      "Mantenha os polegares pressionando os indicadores",
      "Sente-se com a coluna ereta",
      "Visualize o controle da mente sobre os sentidos",
      "Pratique quando sentir impulso excessivo"
    ],
    benefits: [
      "Promove autocontrole",
      "Reduz impulsos e vícios",
      "Fortalece a disciplina",
      "Auxilia no tratamento de ansiedade",
      "Desenvolve a capacidade de concentração"
    ],
    element: "agni",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "none"
    },
    position: "fists with thumbs over index fingers",
    duration: "10-20 minutes",
    contraindications: [
      "Pode усилить чувство контроля em pessoas obsessivas"
    ],
    sequence: 18
  },
  "mahakar-mudra": {
    id: "mahakar-mudra",
    name: "Mahakar Mudra",
    namePt: "Selo da Grande Ação",
    nameEn: "Great Action Seal",
    sanskrit: "महाकर mudra",
    description: "As mãos estão unidas em pranam mudra, mas os polegares pressionam os dedos mindinhos. Este é um mudra poderoso para a ação transformadora.",
    descriptionPt: "As mãos estão unidas em pranam mudra, mas os polegares pressionam os dedos mindinhos. Este é um mudra poderoso para a ação transformadora.",
    meaning: "Representa a união da intenção (Íshvara) com a ação (Karma), produzindo resultados extraordinários.",
    meaningPt: "Representa a união da intenção (Íshvara) com a ação (Karma), produzindo resultados extraordinários.",
    usage: [
      "Junte as palmas das mãos em pranam mudra (oração)",
      "Pressione os polegares contra os dedos mindinhos",
      "Mantenha os indicadores e médios pressionados entre si",
      "Levante as mãos ao nível do terceiro olho",
      "Visualize sua intenção mais elevada manifestando-se"
    ],
    benefits: [
      "Amplifica a intenção de cura",
      "Fortalece a capacidade de ação",
      "Promove a manifestação criativa",
      "Auxilia na resolução de conflitos",
      "Desperta o poder pessoal"
    ],
    element: "agni",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "none",
      pinky: "both"
    },
    position: "prayer position with thumbs pressing pinkies",
    duration: "15-30 minutes",
    contraindications: [],
    sequence: 19
  },
  "yoni-mudra": {
    id: "yoni-mudra",
    name: "Yoni Mudra",
    namePt: "Selo do Nascimento",
    nameEn: "Womb Seal",
    sanskrit: "योनि mudra",
    description: "As mãos entrelaçam-se com os dedos formando um \"V\" invertido. É usado para meditação profunda e conexão com a energia criativa primordial.",
    descriptionPt: "As mãos entrelaçam-se com os dedos formando um \"V\" invertido. É usado para meditação profunda e conexão com a energia criativa primordial.",
    meaning: "Representa o útero cósmico, a fonte de toda a criação, onde as possibilidades infinitas habitam.",
    meaningPt: "Representa o útero cósmico, a fonte de toda a criação, onde as possibilidades infinitas habitam.",
    usage: [
      "Entrelaça os dedos das duas mãos",
      "Vire as mãos para que as palmas fiquem voltadas para cima",
      "Levante os polegares para cima",
      "Descanse as mãos sobre o colo",
      "Visualize um espaço vazio em forma de triângulo invertido entre as palmas"
    ],
    benefits: [
      "Promove a meditação profunda",
      "Desperta a energia criativa",
      "Auxilia no tratamento de infertilidade",
      "Conecta com a energia feminina divina",
      "Promove a sensação de proteção e segurança"
    ],
    element: "jala",
    chakra: "svadhisthana",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "both",
      pinky: "both"
    },
    position: "hands interlaced, palms up, thumbs raised",
    duration: "20-45 minutes",
    contraindications: [
      "Mulheres durante a menstruação devem evitar este mudra"
    ],
    sequence: 20
  },
  "matrika-mudra": {
    id: "matrika-mudra",
    name: "Matrika Mudra",
    namePt: "Selo das Mães",
    nameEn: "Mothers Seal",
    sanskrit: "मातृका mudra",
    description: "As pontas dos polegares pressionam as bases das unhas dos dedos indicadores, enquanto os dedos médio, anelar e mindinho estão curvados para fora.",
    descriptionPt: "As pontas dos polegares pressionam as bases das unhas dos dedos indicadores, enquanto os dedos médio, anelar e mindinho estão curvados para fora.",
    meaning: "Representa as letras sagradas (matrikas) e a energia da fala divina.",
    meaningPt: "Representa as letras sagradas (matrikas) e a energia da fala divina.",
    usage: [
      "Dobre os polegares para pressionar a base das unhas dos indicadores",
      "Curve os dedos médio, anelar e mindinho para fora",
      "Mantenha os polegares estáveis e relaxados",
      "Visualize as letras do alfabeto sagrado emanando de suas mãos",
      "Pratique antes de falar ou cantar"
    ],
    benefits: [
      "Fortalece a voz e a fala",
      "Desenvolve a capacidade de expressão",
      "Melhora a qualidade do canto",
      "Auxilia no tratamento de problemas de tireoide",
      "Promove a comunicação clara"
    ],
    element: "akasha",
    chakra: "vishuddha",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "none"
    },
    position: "hands at throat level",
    duration: "10-30 minutes",
    contraindications: [],
    sequence: 21
  },
  "bhairava-mudra": {
    id: "bhairava-mudra",
    name: "Bhairava Mudra",
    namePt: "Selo do Terrível",
    nameEn: "Fierce Seal",
    sanskrit: "भैरव mudra",
    description: "O polegar pressiona o dedo mindinho, enquanto os indicadores pressionam os polegares. Este mudra representa a energia feroz da transformação.",
    descriptionPt: "O polegar pressiona o dedo mindinho, enquanto os indicadores pressionam os polegares. Este mudra representa a energia feroz da transformação.",
    meaning: "Simboliza Bhairava, o senhor da destruição e transformação, que limpa todos os obstáculos.",
    meaningPt: "Simboliza Bhairava, o senhor da destruição e transformação, que limpa todos os obstáculos.",
    usage: [
      "Pressione os polegares contra os mindinhos",
      "Curve os indicadores para pressionar os polegares por cima",
      "Mantenha os dedos médio e anelar estendidos",
      "Sente-se em postura firme e determinada",
      "Visualize a energia de transformação queimando obstáculos"
    ],
    benefits: [
      "Dissolve obstáculos kármicos",
      "Remove bloqueios energéticos",
      "Promove a transformação pessoal",
      "Auxilia no tratamento de fobias",
      "Fortalece a coragem"
    ],
    element: "agni",
    chakra: "manipura",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "both"
    },
    position: "hands on knees",
    duration: "15-40 minutes",
    contraindications: [
      "Não recomendado para pessoas com tendência à agressividade"
    ],
    sequence: 22
  },
  "durga-mudra": {
    id: "durga-mudra",
    name: "Durga Mudra",
    namePt: "Selo da Deusa Protetora",
    nameEn: "Protective Goddess Seal",
    sanskrit: "दुर्गा mudra",
    description: "As mãos estão em pranam mudra (oração), mas os polegares estão voltados para fora, pressionando os dedos mindinhos.",
    descriptionPt: "As mãos estão em pranam mudra (oração), mas os polegares estão voltados para fora, pressionando os dedos mindinhos.",
    meaning: "Representa a proteção divina, a energia de Durga que protege seus devotos de todo mal.",
    meaningPt: "Representa a proteção divina, a energia de Durga que protege seus devotos de todo mal.",
    usage: [
      "Junte as palmas em pranam mudra",
      "Vire os polegares para fora",
      "Pressione os polegares contra os mindinhos",
      "Levante as mãos ao nível do coração",
      "Visualize uma aura protetora ao seu redor"
    ],
    benefits: [
      "Proporciona proteção energética",
      "Dissipa medos e ansiedades",
      "Fortalece a sensação de segurança",
      "Auxilia na recuperação de trauma",
      "Promove a estabilidade emocional"
    ],
    element: "prithvi",
    chakra: "anahata",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "both",
      pinky: "both"
    },
    position: "prayer position with thumbs out",
    duration: "15-30 minutes",
    contraindications: [],
    sequence: 23
  },
  "shakti-mudra": {
    id: "shakti-mudra",
    name: "Shakti Mudra",
    namePt: "Selo do Poder Divino",
    nameEn: "Divine Power Seal",
    sanskrit: "शक्ति mudra",
    description: "As palmas estão voltadas para cima, os dedos médio, anelar e mindinho estão estendidos e unidos, os polegares pressionam os indicadores.",
    descriptionPt: "As palmas estão voltadas para cima, os dedos médio, anelar e mindinho estão estendidos e unidos, os polegares pressionam os indicadores.",
    meaning: "Representa o poder divino feminino (Shakti), a energia criativa do universo.",
    meaningPt: "Representa o poder divino feminino (Shakti), a energia criativa do universo.",
    usage: [
      "Volte as palmas para cima",
      "Una os dedos médio, anelar e mindinho",
      "Pressione os polegares contra os indicadores",
      "Levante as mãos ao nível do coração",
      "Visualize energia brilhante descendo pelo topo da cabeça"
    ],
    benefits: [
      "Desperta o poder pessoal",
      "Fortalece a feminilidade divina",
      "Promove a autocura",
      "Aumenta a criatividade",
      "Fortalece a intuição"
    ],
    element: "jala",
    chakra: "svadhisthana",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "both",
      pinky: "both"
    },
    position: "hands raised at heart level, palms up",
    duration: "15-40 minutes",
    contraindications: [],
    sequence: 24
  },
  "eka-mudra": {
    id: "eka-mudra",
    name: "Eka Mudra",
    namePt: "Selo da Unidade",
    nameEn: "Unity Seal",
    sanskrit: "एक mudra",
    description: "Os polegares estão voltados para baixo, pressionando os dedos mindinhos, enquanto os indicadores curvam-se sobre os polegares.",
    descriptionPt: "Os polegares estão voltados para baixo, pressionando os dedos mindinhos, enquanto os indicadores curvam-se sobre os polegares.",
    meaning: "Representa a unidade de todos os opostos, a síntese do existir.",
    meaningPt: "Representa a unidade de todos os opostos, a síntese do existir.",
    usage: [
      "Volte os polegares para baixo",
      "Pressione os polegares contra os mindinhos",
      "Curve os indicadores sobre os polegares",
      "Mantenha os dedos médio e anelar estendidos",
      "Sente-se em meditação profunda"
    ],
    benefits: [
      "Promove a integração dos opostos",
      "Harmoniza as polaridades do corpo",
      "Auxilia no tratamento de bipolaridade",
      "Promove o equilíbrio interno",
      "Desenvolve a capacidade de síntese"
    ],
    element: "akasha",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "both"
    },
    position: "hands on knees",
    duration: "20-45 minutes",
    contraindications: [],
    sequence: 25
  },
  "dvi-mudra": {
    id: "dvi-mudra",
    name: "Dvi Mudra",
    namePt: "Selo da Dualidade",
    nameEn: "Duality Seal",
    sanskrit: "द्वि mudra",
    description: "Os polegares pressionam os dedos mindinhos, os indicadores pressionam os polegares, e os dedos médio e anelar curvam-se para fora.",
    descriptionPt: "Os polegares pressionam os dedos mindinhos, os indicadores pressionam os polegares, e os dedos médio e anelar curvam-se para fora.",
    meaning: "Representa a experiência da dualidade, o mundo dos opostos que é necessário transcender.",
    meaningPt: "Representa a experiência da dualidade, o mundo dos opostos que é necessário transcender.",
    usage: [
      "Pressione os polegares contra os mindinhos",
      "Curve os indicadores sobre os polegares",
      "Dobre os dedos médio e anelar para fora",
      "Mantenha as palmas voltadas para cima",
      "Observe os opostos existindo em equilíbrio"
    ],
    benefits: [
      "Ajuda a compreender a natureza dual da realidade",
      "Promove a tolerância",
      "Desenvolve a sabedoria",
      "Auxilia na superação de conflitos internos",
      "Promove a aceitação"
    ],
    element: "vayu",
    chakra: "vishuddha",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "none",
      ring: "none",
      pinky: "both"
    },
    position: "hands on knees, palms up",
    duration: "20-45 minutes",
    contraindications: [],
    sequence: 26
  },
  " OM-mudra": {
    id: "om-mudra",
    name: "Om Mudra",
    namePt: "Selo do Som Cósmico",
    nameEn: "Cosmic Sound Seal",
    sanskrit: "ॐ mudra",
    description: "As mãos formam a letra \"Om\" (ॐ) com os dedos. Os polegares representam a parte superior do Om, os indicadores o segundo arco, e os dedos médio e anelar o terceiro.",
    descriptionPt: "As mãos formam a letra \"Om\" (ॐ) com os dedos. Os polegares representam a parte superior do Om, os indicadores o segundo arco, e os dedos médio e anelar o terceiro.",
    meaning: "Representa o som sagrado Om, a vibração primordial do universo.",
    meaningPt: "Representa o som sagrado Om, a vibração primordial do universo.",
    usage: [
      "Curve os dedos médio e anelar para dentro",
      "Junte as pontas dos polegares e indicadores",
      "Forme a silhueta do Om com as mãos",
      "Visualize o símbolo brilhando em sua mente",
      "Cante ou visualize o som Om durante a prática"
    ],
    benefits: [
      "Promove a conexão com a energia cósmica",
      "Acalma a mente",
      "Desperta a consciência espiritual",
      "Harmoniza os chakras",
      "Auxilia na meditação profunda"
    ],
    element: "akasha",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "both",
      pinky: "none"
    },
    position: "hands forming Om shape",
    duration: "15-45 minutes",
    contraindications: [],
    sequence: 27
  },
  "jal-sphaerika-mudra": {
    id: "jal-sphaerika-mudra",
    name: "Jal Sphaerika Mudra",
    namePt: "Selo da Esfera de Água",
    nameEn: "Water Sphere Seal",
    sanskrit: "जल स्फेरिका mudra",
    description: "As palmas estão voltadas para cima, os dedos médio e anelar curvam-se para formar esferas, os polegares tocam os dedos mindinhos.",
    descriptionPt: "As palmas estão voltadas para cima, os dedos médio e anelar curvam-se para formar esferas, os polegares tocam os dedos mindinhos.",
    meaning: "Representa a água em sua forma pura, a essência da vida e da purificação.",
    meaningPt: "Representa a água em sua forma pura, a essência da vida e da purificação.",
    usage: [
      "Volte as palmas para cima",
      "Curve os dedos médio e anelar para formar pequenas esferas",
      "Junte os polegares com os mindinhos",
      "Mantenha os indicadores relaxados",
      "Visualize uma esfera de água pura entre suas mãos"
    ],
    benefits: [
      "Purifica energeticamente",
      "Promove a limpeza emocional",
      "Equilibra o elemento água no corpo",
      "Auxilia no tratamento de pele seca",
      "Promove a suavidade interior"
    ],
    element: "jala",
    chakra: "svadhisthana",
    fingers: {
      thumb: "both",
      index: "none",
      middle: "both",
      ring: "both",
      pinky: "both"
    },
    position: "hands raised, palms up",
    duration: "15-40 minutes",
    contraindications: [],
    sequence: 28
  },
  "nasikagra-mudra": {
    id: "nasikagra-mudra",
    name: "Nasikagra Mudra",
    namePt: "Selo da Ponta do Nariz",
    nameEn: "Nose Tip Seal",
    sanskrit: "नासिकाग्र mudra",
    description: "O indicador e o médio curvam-se para tocar a base do polegar, que está curvado. A ponta do nariz toca as pontas dos dedos curvados.",
    descriptionPt: "O indicador e o médio curvam-se para tocar a base do polegar, que está curvado. A ponta do nariz toca as pontas dos dedos curvados.",
    meaning: "Representa a concentração da mente no ponto de respiração mais sutil.",
    meaningPt: "Representa a concentração da mente no ponto de respiração mais sutil.",
    usage: [
      "Curve os dedos indicador e médio para tocar a base do polegar",
      "Mantenha os dedos anelar e mindinho estendidos",
      "Toque a ponta do nariz com as pontas dos dedos curvados",
      "Feche os olhos",
      "Concentre-se na respiração no ponto do nariz"
    ],
    benefits: [
      "Promove a concentração profunda",
      "Acalma a mente",
      "Auxilia no tratamento de sinusite",
      "Melhora a respiração",
      "Promove a meditação"
    ],
    element: "vayu",
    chakra: "ajna",
    fingers: {
      thumb: "both",
      index: "both",
      middle: "both",
      ring: "none",
      pinky: "none"
    },
    position: "fingers to nose tip",
    duration: "10-30 minutes",
    contraindications: [
      "Não recomendado para pessoas com desvio de septo"
    ],
    sequence: 29
  },
  "khechari-mudra": {
    id: "khechari-mudra",
    name: "Khechari Mudra",
    namePt: "Selo do Espaço Celestial",
    nameEn: "Celestial Space Seal",
    sanskrit: "खेचरी mudra",
    description: "A língua é curvada para trás e para cima, tocando o palato. Este é um mudra avançado de yoga que controla a energia sexual.",
    descriptionPt: "A língua é curvada para trás e para cima, tocando o palato. Este é um mudra avançado de yoga que controla a energia sexual.",
    meaning: "Representa a inversão da língua cósmica, bloqueando o fluxo descendente de energia e transformando-a em espiritual.",
    meaningPt: "Representa a inversão da língua cósmica, bloqueando o fluxo descendente de energia e transformando-a em espiritual.",
    usage: [
      "Curvar a língua para trás e para cima",
      "Tentar tocar o palato com a ponta da língua",
      "Manter os olhos fechados",
      "Respirar pelo nariz",
      "Começar com segundos e aumentar gradualmente"
    ],
    benefits: [
      "Controla a energia sexual (apana vayu)",
      "Promove a elevação da kundalini",
      "Desperta o shamadi",
      "Melhora a produção de amrita",
      "Promove a samadhi"
    ],
    element: "akasha",
    chakra: "sahasrara",
    fingers: {
      thumb: "none",
      index: "none",
      middle: "none",
      ring: "none",
      pinky: "none"
    },
    position: "padmasana or siddhasana",
    duration: "5-30 minutes",
    contraindications: [
      "Requer preparação avançada",
      "Não recomendado para iniciantes",
      "Deve ser aprendido com um professor qualificado"
    ],
    sequence: 30
  }
};

export function getData(): MudraData {
  return mudras;
}

export default mudras;
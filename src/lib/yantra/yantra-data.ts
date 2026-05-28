/**
 * Yantra data module
 * Provides sacred yantra geometric instruments for the Cabala dos Caminhos system
 */

// @ts-nocheck

export interface YantraProperties {
  id: string;
  name: string;
  namePt: string;
  type: string;
  origin: string;
  triangles: number;
  circles: number;
  petals: number;
  bindu: boolean;
  symmetry: number;
  chakra: string;
  element: string;
  planets: string[];
  colors: string[];
  mantras: string[];
  benefits: string[];
  meditation: string[];
  visualization: string[];
  creation: string[];
  symbolism: string;
  description: string;
}

export interface YantraData {
  [key: string]: YantraProperties;
}

const yantras: YantraData = {
  "sri-yantra": {
    id: "sri-yantra",
    name: "Sri Yantra",
    namePt: "Sri Yantra",
    type: "principal",
    origin: "Tradição Hindú Tântrica",
    triangles: 43,
    circles: 4,
    petals: 9,
    bindu: true,
    symmetry: 4,
    chakra: "Sahasrara",
    element: "Éter",
    planets: ["Sol", "Lua"],
    colors: ["Amarelo", "Ouro", "Azul"],
    mantras: ["Om", "So Hum", "Om Shanti"],
    benefits: [
      "Expansão da consciência",
      "Alinhamento dos chakras",
      "Realização divina",
      "Equilíbrio masculino-feminino"
    ],
    meditation: [
      "Focalização no bindu central",
      "Visualização dos triângulos",
      "Expansão para todos os lados",
      "Integração cósmica"
    ],
    visualization: [
      "Triângulos se expandindo",
      "Bindu irradiando luz",
      "Energia shiva-shakti"
    ],
    creation: [
      "Desenhar círculo exterior",
      "Adicionar círculos internos",
      "Inserir 4 pétalas",
      "Desenhar 9 triângulos",
      "Centralizar bindu"
    ],
    symbolism: "Integração das energias shiva-shakti, expansão cósmica e conexão com o divino"
  },
  "muladhara-yantra": {
    id: "muladhara-yantra",
    name: "Muladhara Yantra",
    namePt: "Yantra do Muladhara",
    type: "chakra",
    origin: "Tradição Hindú",
    triangles: 4,
    circles: 3,
    petals: 4,
    bindu: true,
    symmetry: 4,
    chakra: "Muladhara",
    element: "Terra",
    planets: ["Saturno"],
    colors: ["Vermelho", "Marrom"],
    mantras: ["Lam", "Om Lam Muladharaya Namaha"],
    benefits: [
      "Enraizamento",
      "Estabilidade",
      "Conexão com a terra",
      "Força e vitalidade"
    ],
    meditation: [
      "Visualização vermelha",
      "Descida da consciência",
      "Conexão com raiz",
      "Enraizamento profundo"
    ],
    visualization: [
      "Quadrado amarelo-vermelho",
      "Quatro pétalas vermelhas",
      "Triângulo invertida verde"
    ],
    creation: [
      "Círculo terrestre marrom",
      "Quadrado de terra",
      "Triângulos elemento",
      "Bindu raiz"
    ],
    symbolism: "Estabilidade terrena, conexão com o reino físico e força vital"
  },
  "svadhisthana-yantra": {
    id: "svadhisthana-yantra",
    name: "Svadhisthana Yantra",
    namePt: "Yantra do Svadhisthana",
    type: "chakra",
    origin: "Tradição Hindú",
    triangles: 6,
    circles: 2,
    petals: 6,
    bindu: true,
    symmetry: 6,
    chakra: "Svadhisthana",
    element: "Água",
    planets: ["Lua"],
    colors: ["Laranja", "Branco"],
    mantras: ["Vam", "Om Vam Svadhisthanaya Namaha"],
    benefits: [
      "Criatividade",
      "Fluidez emocional",
      "Sexualidade sagrada",
      "Purificação"
    ],
    meditation: [
      "Visualização lunar",
      "Fluxo de água",
      "Ondas emocionais",
      "Purificação líquida"
    ],
    visualization: [
      "Círculo lunar crescente",
      "Seis pétalas laranjas",
      "lua crescente sagrada"
    ],
    creation: [
      "Meia lua prata",
      "Seis pétalas",
      "Círculo de água",
      "Bindu lunar"
    ],
    symbolism: "Fluidez, criatividade, transformação液态 e pureza emocional"
  },
  "manipura-yantra": {
    id: "manipura-yantra",
    name: "Manipura Yantra",
    namePt: "Yantra do Manipura",
    type: "chakra",
    origin: "Tradição Hindú",
    triangles: 10,
    circles: 3,
    petals: 10,
    bindu: true,
    symmetry: 10,
    chakra: "Manipura",
    element: "Fogo",
    planets: ["Sol", "Marte"],
    colors: ["Amarelo", "Vermelho"],
    mantras: ["Ram", "Om Ram Manipuraya Namaha"],
    benefits: [
      "Poder pessoal",
      "Disciplina",
      "Transformação",
      "Capacitação"
    ],
    meditation: [
      "Foco no plexo solar",
      "Chama interior",
      "Digestão de energia",
      "Capacitação interna"
    ],
    visualization: [
      "Triângulo invertido amarelo",
      "Chama dourada",
      "Plexo solar irradiando"
    ],
    creation: [
      "Triângulo amarelo central",
      "Dez pétalas azuis",
      "Triângulos de fogo",
      "Bindu solar"
    ],
    symbolism: "Poder metabolic,Digestão de pensamientos e transformação, fuego personal"
  },
  "anahata-yantra": {
    id: "anahata-yantra",
    name: "Anahata Yantra",
    namePt: "Yantra do Anahata",
    type: "chakra",
    origin: "Tradição Hindú",
    triangles: 12,
    circles: 4,
    petals: 12,
    bindu: true,
    symmetry: 12,
    chakra: "Anahata",
    element: "Ar",
    planets: ["Vênus"],
    colors: ["Verde", "Rosa"],
    mantras: ["Yam", "Om Yam Anahathaya Namaha"],
    benefits: [
      "Amor incondicional",
      "Compaixão",
      "Perdão",
      "Harmonia"
    ],
    meditation: [
      "Corações se abrindo",
      "Respiração amorosa",
      "Expansão peito",
      "Perdão completo"
    ],
    visualization: [
      "Hexagrama verde",
      "Doze pétalas rosas",
      "Corações irradiando luz"
    ],
    creation: [
      "Hexagrama shiva-shakti",
      "Doze pétalas",
      "Estrelas de quatro pontas",
      "Bindu coração"
    ],
    symbolism: "Amor, compaixão, perdão e harmonização do coração com o divino"
  },
  "vishuddha-yantra": {
    id: "vishuddha-yantra",
    name: "Vishuddha Yantra",
    namePt: "Yantra do Vishuddha",
    type: "chakra",
    origin: "Tradição Hindú",
    triangles: 16,
    circles: 3,
    petals: 16,
    bindu: true,
    symmetry: 16,
    chakra: "Vishuddha",
    element: "Éter",
    planets: ["Mercúrio"],
    colors: ["Azul Claro", "Branco"],
    mantras: ["Ham", "Om Ham Vishuddhanaya Namaha"],
    benefits: [
      "Comunicação clara",
      "Expressão autêntica",
      "Purificação verbal",
      "Criação sagrada"
    ],
    meditation: [
      "Som primordial",
      "Abertura da garganta",
      "Fluxo de luz azul",
      "Comunicação clara"
    ],
    visualization: [
      "Círculo de som",
      "16 pétalas claras",
      "Garganta irradiando"
    ],
    creation: [
      "Círculo de akasha",
      "16 pétalas brancos",
      "Triângulos etéreos",
      "Bindu som"
    ],
    symbolism: "Purificação verbal, expressão auténtica e criação através da palavra"
  },
  "ajna-yantra": {
    id: "ajna-yantra",
    name: "Ajna Yantra",
    namePt: "Yantra do Ajna",
    type: "chakra",
    origin: "Tradição Hindú",
    triangles: 2,
    circles: 2,
    petals: 2,
    bindu: true,
    symmetry: 2,
    chakra: "Ajna",
    element: "Luz",
    planets: ["Júpiter"],
    colors: ["Índigo", "Roxo"],
    mantras: ["Om", "Om Ajnanaaya Namaha"],
    benefits: [
      "Intuição",
      "Visão clara",
      "Discernimento",
      "Alinhamento superior"
    ],
    meditation: [
      "Foco no terceiro olho",
      "Luz penetrante",
      "Intuição expandida",
      "Clareza visionária"
    ],
    visualization: [
      "Dois triângulos brancos",
      "Luz índigo",
      "Terceiro olho abrindo"
    ],
    creation: [
      "Dois triângulos convergentes",
      "2 pétalas",
      "Círculos de luz",
      "Bindu central"
    ],
    symbolism: "Comando, intuição, visão além do véu e alinhamento com o EU superior"
  },
  "sahasrara-yantra": {
    id: "sahasrara-yantra",
    name: "Sahasrara Yantra",
    namePt: "Yantra do Sahasrara",
    type: "chakra",
    origin: "Tradição Hindú",
    triangles: 1000,
    circles: 1,
    petals: 1000,
    bindu: true,
    symmetry: 1000,
    chakra: "Sahasrara",
    element: "Consciência",
    planets: ["Netuno"],
    colors: ["Branco", "Ouro", "Violeta"],
    mantras: ["Om silêncio", "So Hum Sat Namam"],
    benefits: [
      "Iluminação",
      "Unicidade",
      "Libertação",
      "Consciência cósmica"
    ],
    meditation: [
      "Dissolução do ego",
      "Silêncio profundo",
      "Vaziofúlfill",
      "União cósmica"
    ],
    visualization: [
      "Mil pétalas douradas",
      "Lótus abrir",
      "Consciência expandida"
    ],
    creation: [
      "Círculo divino dourado",
      "1000 pétalas",
      "Bindu infinito",
      "Expansão sem limites"
    ],
    symbolism: "Iluminação, samadhi, retorno à fonte e consciência universal"
  },
  "triquetra": {
    id: "triquetra",
    name: "Triquetra",
    namePt: "Triquetra",
    type: "proteção",
    origin: "Tradição Celta",
    triangles: 3,
    circles: 1/3,
    petals: 0,
    bindu: false,
    symmetry: 3,
    chakra: "Muladhara",
    element: "Êxito",
    planets: ["Saturno", "Júpiter"],
    colors: ["Verde", "Ouro"],
    mantras: ["Om Gam Ganapataye Namaha"],
    benefits: [
      "Proteção",
      "Conexão tríplice",
      "Unicidade",
      "Força ancestral"
    ],
    meditation: [
      "Três mundos conectados",
      "Ciclos de vida",
      "Nó de proteção",
      "Armadura energética"
    ],
    visualization: [
      "Três círculos entrelaçados",
      "Nó celta",
      "Proteção tríplice"
    ],
    creation: [
      "Primeiro círculo",
      "Segundo entrelaçando",
      "Terceiro completando",
      "Centro protegido"
    ],
    symbolism: "Três realms da existência, proteção三口 e força da tradição ancestral"
  },
  "mer-ka-ba": {
    id: "mer-ka-ba",
    name: "Merkaba",
    namePt: "Merkaba",
    type: "ascensão",
    origin: "Tradição Hebraica Antiga",
    triangles: 8,
    circles: 2,
    petals: 0,
    bindu: true,
    symmetry: 6,
    chakra: "Sahasrara",
    element: "Luz",
    planets: ["Sol"],
    colors: ["Azul", "Rosa", "Branco"],
    mantras: ["Metatron", "Om Metatron"],
    benefits: [
      "Ascensão dimensional",
      "Mediúnia",
      "Transporte interestelar",
      "Expansão da consciência"
    ],
    meditation: [
      "Estrelas de Merkaba",
      "Rotação simultânea",
      "Aceleração luz",
      "Deslocamento dimensional"
    ],
    visualization: [
      "Dois tetraedros girando",
      "Campo de luz",
      "Estrela de 8 pontas"
    ],
    creation: [
      "Primeiro tetraedro azul",
      "Segundo tetraedro rosa",
      "Giro opostos",
      "Ativação central"
    ],
    symbolism: "Veículo de luz, ascensão, veículos de luz para outros reinos dimensionales"
  },
  "seed-of-life": {
    id: "seed-of-life",
    name: "Seed of Life",
    namePt: "Semente da Vida",
    type: "criação",
    origin: "Geometria Sagrada",
    triangles: 0,
    circles: 7,
    petals: 0,
    bindu: true,
    symmetry: 6,
    chakra: "Muladhara",
    element: "Terra",
    planets: ["Sol"],
    colors: ["Azul", "Branco"],
    mantras: ["Om"],
    benefits: [
      "Conexão com a vida",
      "Purificação",
      "Proteção",
      "Renovação"
    ],
    meditation: [
      "Visualização da criação",
      "Fluxo de vida",
      "Semente plantada",
      "Crescimento natural"
    ],
    visualization: [
      "Sete círculos",
      "Padrão de flor",
      "Criação emergindo"
    ],
    creation: [
      "Círculo central",
      "Seis ao redor",
      "Sobreposição perfeita",
      "Padrão completo"
    ],
    symbolism: "Sete dias da criação, fluxo de vida universal, padrão primordial da existência"
  },
  "flower-of-life": {
    id: "flower-of-life",
    name: "Flower of Life",
    namePt: "Flor da Vida",
    type: "criação",
    origin: "Geometria Sagrada",
    triangles: 0,
    circles: 19,
    petals: 0,
    bindu: true,
    symmetry: 6,
    chakra: "Anahata",
    element: "Luz",
    planets: ["Sol"],
    colors: ["Azul", "Ouro", "Branco"],
    mantras: ["Om", "So Hum"],
    benefits: [
      "Harmonização completa",
      "Proteção multidimensional",
      "Ativação do DNA",
      "Expansão espiritual"
    ],
    meditation: [
      "Flor se abrindo",
      "Padrão cells",
      "DNA ativando",
      "Luz fluindo"
    ],
    visualization: [
      "Flor de 19 círculos",
      "Padrão cell",
      "Conhecimento antigo"
    ],
    creation: [
      "Seed of Life",
      "Expansão circles",
      "Sobreposição cells",
      "Padrão completo"
    ],
    symbolism: "Padrão da vida, conhecimento ancestral, presença divina em toda creación"
  },
  "metatron-cube": {
    id: "metatron-cube",
    name: "Metatron Cube",
    namePt: "Cubo de Metatron",
    type: "platônico",
    origin: "Tradição Hebraica",
    triangles: 13,
    circles: 13,
    petals: 0,
    bindu: true,
    symmetry: 6,
    chakra: "Sahasrara",
    element: "Luz",
    planets: ["Sol", "Netuno"],
    colors: ["Azul", "Branco", "Ouro"],
    mantras: ["Metatron", "Om Metatron"],
    benefits: [
      "Integração dos sólidos platônicos",
      "Proteção angélica",
      "Canalização superior",
      "Expansão dimensional"
    ],
    meditation: [
      "13 círculos",
      "Sólidos platônicos",
      "Metatron اتصال",
      "Campos superiores"
    ],
    visualization: [
      "Cubo geométrico",
      "Sólidos dentro",
      "Arcanjo Metatron"
    ],
    creation: [
      "Flower of Life",
      "Connections central",
      "Sólidos platônicos",
      "Cubo completo"
    ],
    symbolism: "Guardião dos portais dimensionais, integração de toda geometria sagrada, conhecimento arcangélico"
  },
  "torus": {
    id: "torus",
    name: "Torus",
    namePt: "Toro",
    type: "fluxo",
    origin: "Geometria Sagrada",
    triangles: 0,
    circles: 1,
    petals: 0,
    bindu: true,
    symmetry: 360,
    chakra: "Muladhara",
    element: "Energia",
    planets: ["Sol", "Lua"],
    colors: ["Azul", "Verde", "Ouro"],
    mantras: ["Om", "So Hum"],
    benefits: [
      "Fluxo energético",
      "Vitalidade",
      "Conexão vital",
      "Movimento eterno"
    ],
    meditation: [
      "Spiral infinito",
      "Fluxo sem resistência",
      "Energia vital",
      "Movimento eterno"
    ],
    visualization: [
      "Donut energético",
      "Spiral infinito",
      "Fluxo contínuo"
    ],
    creation: [
      "Círculo central",
      "Espessura forming",
      "Infinito loop",
      "Energia fluindo"
    ],
    symbolism: "Fluxo de energia vital, donut cósmico, padrão fundamental do universo"
  }
};

export function getData(): YantraData {
  return yantras;
}

export default yantras;

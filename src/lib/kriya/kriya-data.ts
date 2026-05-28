/**
 * Kriya data module
 * Provides sacred kriya practices and their properties for the Cabala dos Caminhos system
 */

// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// deno-lint-ignore-file no-explicit-any

export interface KriyaProperties {
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
  category: string;
  level: string;
  duration: string;
  breathing: string;
  contraindications: string[];
  sequence: number;
}

export interface KriyaData {
  [key: string]: KriyaProperties;
}

const kriyas: KriyaData = {
  "shambavi-mudra": {
    id: "shambavi-mudra",
    name: "Shambavi Mudra",
    namePt: "Selo Shambavi",
    nameEn: "Shambavi Seal",
    sanskrit: "शांभवी mudra",
    description: "Uma prática de olhar interno onde os olhos são direcionados para o ponto entre as sobrancelhas. Esta técnica desbloqueia a percepção superior e ativa o terceiro olho.",
    descriptionPt: "Uma prática de olhar interno onde os olhos são direcionados para o ponto entre as sobrancelhas. Esta técnica desbloqueia a percepção superior e ativa o terceiro olho.",
    meaning: "Shambavi representa a energia da realização e o estado de ser que existe além da mente.",
    meaningPt: "Shambavi representa a energia da realização e o estado de ser que existe além da mente.",
    usage: [
      "Sente-se em uma posição confortável com a coluna ereta",
      "Feche os olhos suavemente",
      "Sem forçar, dirija o olhar para o ponto entre as sobrancelhas",
      "Mantenha a respiração natural",
      "Permaneça pelo tempo desejado, mantendo a atenção internalizada"
    ],
    benefits: [
      "Ativa o terceiro olho e desperta a intuição",
      "Melhora a capacidade de visualização",
      "Promove a clareza mental e a concentração",
      "Equilibra os hemisférios cerebrais",
      "Acelera a evolução espiritual"
    ],
    category: "eye",
    level: "intermediate",
    duration: "15-30 minutes",
    breathing: "natural",
    contraindications: [
      "Não recomendado para pessoas com glaucoma",
      "Evitar se houver condições oculares graves"
    ],
    sequence: 1
  },
  "trikuti-mudra": {
    id: "trikuti-mudra",
    name: "Trikuti Mudra",
    namePt: "Selo dos Três Portais",
    nameEn: "Three Portals Seal",
    sanskrit: "त्रिकूटी mudra",
    description: "Uma prática que trabalha com o ponto entre as sobrancelhas, as têmporas e o topo da cabeça, criando uma triangulação de energia espiritual.",
    descriptionPt: "Uma prática que trabalha com o ponto entre as sobrancelhas, as têmporas e o topo da cabeça, criando uma triangulação de energia espiritual.",
    meaning: "Trikuti representa os três portais de percepção: passado, presente e futuro, unificados na consciência suprema.",
    meaningPt: "Trikuti representa os três portais de percepção: passado, presente e futuro, unificados na consciência suprema.",
    usage: [
      "Sente-se em meditação",
      "Visualize uma linha de energia conectando o ponto entre as sobrancelhas",
      "Visualize linhas até as têmporas de ambos os lados",
      "Visualize uma linha até o topo da cabeça",
      "Sinta a energia formar um triângulo invertido de energia"
    ],
    benefits: [
      "Desperta a visão espiritual",
      "Harmoniza os três tempos",
      "Estimula a glândula pineal",
      "Promove a integração dos corpos sutis",
      "Facilita a comunicação com o eu superior"
    ],
    category: "visualization",
    level: "advanced",
    duration: "20-45 minutes",
    breathing: "slow and deep",
    contraindications: [
      "Pessoas com tendências psicóticas devem praticar com supervisão",
      "Não recomendado durante crises de ansiedade intensa"
    ],
    sequence: 2
  },
  "trataka": {
    id: "trataka",
    name: "Trataka",
    namePt: "Olhar Fixo",
    nameEn: "Steady Gaze",
    sanskrit: "त्राटक",
    description: "Uma prática yogue de olhar fixo em um ponto ou objeto, desenvolvendo concentração profunda e purificando a mente através do foco visual sustentado.",
    descriptionPt: "Uma prática yogue de olhar fixo em um ponto ou objeto, desenvolvendo concentração profunda e purificando a mente através do foco visual sustentado.",
    meaning: "Trataka representa a chama da atenção que queima todas as impurezas da mente, iluminando a consciência.",
    meaningPt: "Trataka representa a chama da atenção que queima todas as impurezas da mente, iluminando a consciência.",
    usage: [
      "Sente-se confortavelmente em frente a uma vela ou objeto pontudo",
      "Mantenha os olhos abertos, fixando o olhar no ponto central",
      "Não pisque enquanto puder manter o foco",
      "Quando os olhos começarem a lacrimejar, feche-os suavemente",
      "Visualize a imagem na mente o maior tempo possível"
    ],
    benefits: [
      "Desenvolve concentração e foco extraordinários",
      "Fortalece os músculos oculares",
      "Purifica a mente de pensamentos repetitivos",
      "Ativa a glândula pineal",
      "Prepara a mente para estados superiores de meditação"
    ],
    category: "eye",
    level: "beginner",
    duration: "10-20 minutes",
    breathing: "natural with awareness",
    contraindications: [
      "Não recomendado para pessoas com epilepsia fotossensível",
      "Evitar se houver inflamação ocular ativa"
    ],
    sequence: 3
  },
  "vipassana-breath": {
    id: "vipassana-breath",
    name: "Vipassana Breathing",
    namePt: "Respiração Vipassana",
    nameEn: "Vipassana Breathing",
    sanskrit: "विपस्सना",
    description: "A técnica de respiração Vipassana observa as sensações físicas e mentais com equanimidade, desenvolvendo a sabedoria através da atenção plena à realidade presente.",
    descriptionPt: "A técnica de respiração Vipassana observa as sensações físicas e mentais com equanimidade, desenvolvendo a sabedoria através da atenção plena à realidade presente.",
    meaning: "Vipassana significa ver as coisas como elas realmente são, não como desejamos que sejam.",
    meaningPt: "Vipassana significa ver as coisas como elas realmente são, não como desejamos que sejam.",
    usage: [
      "Sente-se em uma postura ereta e confortável",
      "Observe a respiração natural sem controlá-la",
      "Nota onde você sente a respiração no corpo",
      "Permaneça com equanimidade, observando todas as sensações",
      "Retorne sempre que a mente divagar, sem julgamento"
    ],
    benefits: [
      "Desenvolve a capacidade de observar sem reação",
      "Reduz o sofrimento através da compreensão profunda",
      "Dissolve processos mentais obsessivos",
      "Promove estados de clareza e paz interior",
      "Cultiva a sabedoria da impermanência"
    ],
    category: "breath",
    level: "intermediate",
    duration: "30-60 minutes",
    breathing: "natural observation",
    contraindications: [
      "Pessoas com trauma severo devem praticar com orientação adequada",
      "Não recomendado durante episódios agudos de ansiedade"
    ],
    sequence: 4
  },
  "kriya-yoga-breath": {
    id: "kriya-yoga-breath",
    name: "Kriya Yoga Breath",
    namePt: "Respiração Kriya Yoga",
    nameEn: "Kriya Yoga Breath",
    sanskrit: "क्रिया yoga",
    description: "Uma respiração rápida e rítmica que purifica o sistema nervoso e acelera a subida da kundalini, limpando os canais de energia.",
    descriptionPt: "Uma respiração rápida e rítmica que purifica o sistema nervoso e acelera a subida da kundalini, limpando os canais de energia.",
    meaning: "Kriya significa ação sagrada, e esta respiração é a ação que limpa a consciência, preparando-a para a experiência do infinito.",
    meaningPt: "Kriya significa ação sagrada, e esta respiração é a ação que limpa a consciência, preparando-a para a experiência do infinito.",
    usage: [
      "Sente-se em uma postura confortável com a coluna ereta",
      "Inspire profundamente e expire completamente",
      "Faça respirações curtas e rítmicas pelo nariz",
      "Mantenha o ritmo consistente por vários minutos",
      "Termine com uma inspiração profunda e retenha por alguns segundos"
    ],
    benefits: [
      "Purifica o sangue e o sistema nervoso",
      "Acelera a progressão espiritual",
      "Reduz a reactividade emocional",
      "Aumenta a energia vital no corpo",
      "Prepara para experiências meditativas profundas"
    ],
    category: "breath",
    level: "advanced",
    duration: "15-45 minutes",
    breathing: "rapid rhythmic",
    contraindications: [
      "Não recomendado para pessoas com pressão alta",
      "Evitar durante a gravidez",
      "Pessoas com problemas cardíacos devem consultar um médico"
    ],
    sequence: 5
  },
  "nadi-sodhana": {
    id: "nadi-sodhana",
    name: "Nadi Shodhana",
    namePt: "Purificação dos Canais",
    nameEn: "Channel Purification",
    sanskrit: "नाडी शोधन",
    description: "A respiração alternada pelas narinas que equilibra os canais de energia ida e pingala, purificando o nadis e preparando para práticas mais elevadas.",
    descriptionPt: "A respiração alternada pelas narinas que equilibra os canais de energia ida e pingala, purificando o nadis e preparando para práticas mais elevadas.",
    meaning: "Nadi Shodhana significa purificação dos canais sutis de energia, preparando o corpo para a recepção da graça divina.",
    meaningPt: "Nadi Shodhana significa purificação dos canais sutis de energia, preparando o corpo para a recepção da graça divina.",
    usage: [
      "Sente-se confortavelmente com a coluna ereta",
      "Faça um gesto mudra: polegar no lado direito do nariz, dedos juntos para cima",
      "Feche a narina direita e inspire pela esquerda",
      "Feche a narina esquerda e expire pela direita",
      "Continue alternando por vários ciclos"
    ],
    benefits: [
      "Equilibra os hemisférios cerebrais",
      "Purifica os canais de energia sutil",
      "Calma o sistema nervoso",
      "Prepara para práticas de meditação profundas",
      "Promove a harmonia entre masculino e feminino"
    ],
    category: "breath",
    level: "beginner",
    duration: "10-20 minutes",
    breathing: "alternate nostril",
    contraindications: [
      "Evitar imediatamente após refeições",
      "Pessoas com sinusite aguda devem ter cautela"
    ],
    sequence: 6
  },
  "chakravakian": {
    id: "chakravakian",
    name: "Chakravakian",
    namePt: "Roda de Energia",
    nameEn: "Wheel of Energy",
    sanskrit: "चक्रवाक्यन",
    description: "Uma técnica avançada de rotação ocular que ativa todos os chakras em sequência, elevando a consciência através do eixo central da coluna.",
    descriptionPt: "Uma técnica avançada de rotação ocular que ativa todos os chakras em sequência, elevando a consciência através do eixo central da coluna.",
    meaning: "Chakravakian representa o movimento da consciência através de todas as rodas de energia, do muladhara ao sahasrara.",
    meaningPt: "Chakravakian representa o movimento da consciência através de todas as rodas de energia, do muladhara ao sahasrara.",
    usage: [
      "Sente-se com as costas retas, relaxe os ombros",
      "Feche os olhos e relaxe todo o rosto",
      "Gire os olhos para a direita em um círculo completo, sentindo o movimento",
      "Complete 20 rotações no sentido horário",
      "Inverta o sentido, fazendo 20 rotações no sentido anti-horário"
    ],
    benefits: [
      "Ativa e equilibra todos os chakras",
      "Estimula o sistema nervoso central",
      "Melhora a saúde ocular",
      "Prepara o corpo para a elevação da kundalini",
      "Desperta estados superiores de consciência"
    ],
    category: "eye",
    level: "advanced",
    duration: "15-30 minutes",
    breathing: "natural",
    contraindications: [
      "Não recomendado para iniciantes",
      "Pessoas com condições oculares devem consultar um médico",
      "Evitar se sentir tontura excessiva"
    ],
    sequence: 7
  },
  "talandu": {
    id: "talandu",
    name: "Talandu",
    namePt: "Alongamento da Coluna",
    nameEn: "Spinal Column Stretch",
    sanskrit: "तालंडु",
    description: "Um exercício físico que simultaneamente contrai os músculos do esfíncter e estende a coluna, ativando as correntes de energia ascendente e descendente.",
    descriptionPt: "Um exercício físico que simultaneamente contrai os músculos do esfíncter e estende a coluna, ativando as correntes de energia ascendente e descendente.",
    meaning: "Talandu representa a união da energia da terra com a energia do céu através do corpo, criando um canal de comunicação entre os mundos.",
    meaningPt: "Talandu representa a união da energia da terra com a energia do céu através do corpo, criando um canal de comunicação entre os mundos.",
    usage: [
      "Fique em pé com os pés na largura dos ombros",
      "Inspire profundamente contraindo o esfíncter e o baixo abdômen",
      "Ao mesmo tempo, eleve os calcanhares e estenda os braços para cima",
      "Segure a posição por alguns segundos",
      "Expire ao retornar à posição inicial"
    ],
    benefits: [
      "Ativa o muladhara e desperta a kundalini",
      "Fortalece a coluna vertebral",
      "Melhora a postura e o equilíbrio",
      "Aumenta a energia vital no corpo",
      "Prepara para práticas de elevação espiritual"
    ],
    category: "physical",
    level: "beginner",
    duration: "5-10 minutes",
    breathing: "coordinated with movement",
    contraindications: [
      "Pessoas com problemas na coluna devem consultar um instrutor",
      "Não recomendado durante a gravidez"
    ],
    sequence: 8
  },
  "yoni-mudra": {
    id: "yoni-mudra",
    name: "Yoni Mudra",
    namePt: "Selo do Elemento Original",
    nameEn: "Original Element Seal",
    sanskrit: "योनि mudra",
    description: "Uma prática de selamento dos sentidos externos através de uma posição específica das mãos, criando um estado de escuridão interior que favorece a meditação profunda.",
    descriptionPt: "Uma prática de selamento dos sentidos externos através de uma posição específica das mãos, criando um estado de escuridão interior que favorece a meditação profunda.",
    meaning: "Yoni representa o elemento original, o womb do universo, onde todas as possibilidades existem em potencial.",
    meaningPt: "Yoni representa o elemento original, o womb do universo, onde todas as possibilidades existem em potencial.",
    usage: [
      "Sente-se em meditação com os olhos fechados",
      "Cruze os braços sobre o peito, segurando os ombros opostos",
      "Dobre os cotovelos para que os antebraços fiquem paralelos ao chão",
      "Deixe a cabeça pender levemente para frente",
      "Permaneça nesta posição, fechando os sentidos externos"
    ],
    benefits: [
      "Cria um estado de escuridão interior sagrada",
      "Auxilia na entrada em estados meditativos profundos",
      "Reduz a sobrecarga sensorial",
      "Promove a introspecção e a auto-observação",
      "Desperta a memória do estado original"
    ],
    category: "mudra",
    level: "beginner",
    duration: "15-30 minutes",
    breathing: "natural",
    contraindications: [
      "Pessoas com claustrofobia devem começar com períodos curtos",
      "Não recomendado em ambientes muito frios"
    ],
    sequence: 9
  },
  "shunya-mudra": {
    id: "shunya-mudra",
    name: "Shunya Mudra",
    namePt: "Selo do Vazio",
    nameEn: "Void Seal",
    sanskrit: "शून्य mudra",
    description: "Uma posição das mãos que ativa o elemento espaço e cria uma abertura para a experiência do vazio consciente, o espaço onde a criação surge.",
    descriptionPt: "Uma posição das mãos que ativa o elemento espaço e cria uma abertura para a experiência do vazio consciente, o espaço onde a criação surge.",
    meaning: "Shunya significa vazio, mas não o vazio da ausência - sim o vazio lleno de potencial, o espaço infinito de onde tudo emerge.",
    meaningPt: "Shunya significa vazio, mas não o vazio da ausência - sim o vazio cheio de potencial, o espaço infinito de onde tudo emerge.",
    usage: [
      "Sente-se em meditação com as mãos sobre os joelhos",
      "Dobre o dedo médio para tocar a base da palma",
      "Mantenha os outros dedos estendidos",
      "Pressione suavemente o dedo médio com o polegar",
      "Mantenha a posição enquanto medita"
    ],
    benefits: [
      "Ativa o elemento espaço no corpo",
      "Reduz a ansiedade e o medo",
      "Promove a sensação de espaço interior",
      "Abre portas para experiências de vazio consciente",
      "Facilita a compreensão da natureza da realidade"
    ],
    category: "mudra",
    level: "intermediate",
    duration: "20-45 minutes",
    breathing: "deep and slow",
    contraindications: [
      "Pessoas em crise existencial devem praticar com orientação",
      "Não recomendado durante episódios depressivos sem supervisão"
    ],
    sequence: 10
  }
};

export function getData(): KriyaData {
  return kriyas;
}

export default kriyas;